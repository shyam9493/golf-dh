import { query } from '../services/database.js';
import { sendEmail } from '../services/mailer.js';

const MIN_NUMBER = 1;
const MAX_NUMBER = 45;
const PICK_COUNT = 5;

const pickUniqueRandomNumbers = (count = PICK_COUNT, min = MIN_NUMBER, max = MAX_NUMBER) => {
    const selected = new Set();

    while (selected.size < count) {
        const n = Math.floor(Math.random() * (max - min + 1)) + min;
        selected.add(n);
    }

    return Array.from(selected).sort((a, b) => a - b);
};

const pickWeightedNumbers = async () => {
    const scoreRows = await query(
        `SELECT value, COUNT(*)::int AS freq
         FROM scores
         GROUP BY value
         HAVING value BETWEEN $1 AND $2`,
        [MIN_NUMBER, MAX_NUMBER]
    );

    const weights = new Map();
    for (let n = MIN_NUMBER; n <= MAX_NUMBER; n++) {
        weights.set(n, 1);
    }

    for (const row of scoreRows.rows) {
        const value = Number(row.value);
        const freq = Number(row.freq);
        if (Number.isInteger(value) && value >= MIN_NUMBER && value <= MAX_NUMBER) {
            weights.set(value, Math.max(1, freq));
        }
    }

    const picks = [];
    const available = Array.from(weights.keys());

    while (picks.length < PICK_COUNT && available.length > 0) {
        const totalWeight = available.reduce((sum, n) => sum + (weights.get(n) || 1), 0);
        let threshold = Math.random() * totalWeight;
        let chosenIndex = 0;

        for (let i = 0; i < available.length; i++) {
            threshold -= (weights.get(available[i]) || 1);
            if (threshold <= 0) {
                chosenIndex = i;
                break;
            }
        }

        picks.push(available[chosenIndex]);
        available.splice(chosenIndex, 1);
    }

    return picks.sort((a, b) => a - b);
};

const getConfiguredDrawMode = async () => {
    const config = await query('SELECT mode FROM draw_config ORDER BY updated_at DESC LIMIT 1');
    if (config.rows.length === 0 || !config.rows[0].mode) {
        return 'random';
    }
    return config.rows[0].mode;
};

const generateNumbersByMode = async (mode) => {
    if (mode === 'weighted') {
        return pickWeightedNumbers();
    }
    return pickUniqueRandomNumbers();
};

const getOrCreateDrawConfig = async () => {
    const existing = await query(
        `SELECT id, mode, COALESCE(jackpot_balance, 0)::int AS jackpot_balance, COALESCE(prize_pool_pct, 60)::int AS prize_pool_pct
         FROM draw_config
         ORDER BY updated_at DESC
         LIMIT 1`
    );

    if (existing.rows.length > 0) {
        return existing.rows[0];
    }

    const created = await query(
        `INSERT INTO draw_config (id, mode, jackpot_balance, prize_pool_pct, charity_min_pct, updated_at)
         VALUES (1, 'random', 0, 60, 10, NOW())
         ON CONFLICT (id)
         DO UPDATE SET updated_at = NOW()
         RETURNING id, mode, COALESCE(jackpot_balance, 0)::int AS jackpot_balance, COALESCE(prize_pool_pct, 60)::int AS prize_pool_pct`
    );

    return created.rows[0];
};

const getActiveSubscriberPoolPence = async () => {
    const subs = await query(
        `SELECT COALESCE(SUM(s.amount_pence), 0)::bigint AS total_pence
         FROM (
            SELECT DISTINCT ON (user_id) user_id, status, COALESCE(amount_pence, 0) AS amount_pence
            FROM subscriptions
            ORDER BY user_id, id DESC
         ) s
         WHERE s.status = 'active'`
    );

    return Number(subs.rows[0]?.total_pence || 0);
};

const getCandidateUsersWithLatestScores = async () => {
    const rows = await query(
        `WITH active_users AS (
            SELECT DISTINCT ON (user_id) user_id
            FROM subscriptions
            WHERE status = 'active'
            ORDER BY user_id, id DESC
         ), ranked_scores AS (
            SELECT s.user_id, s.value, s.played_at, s.id,
                   ROW_NUMBER() OVER (PARTITION BY s.user_id ORDER BY s.played_at DESC, s.id DESC) AS rn
            FROM scores s
            JOIN active_users a ON a.user_id = s.user_id
         )
         SELECT user_id, ARRAY_AGG(value ORDER BY played_at DESC, id DESC) AS latest_scores
         FROM ranked_scores
         WHERE rn <= 5
         GROUP BY user_id`
    );

    return rows.rows;
};

const computeMatchType = (scores, drawnNumbers) => {
    const scoreSet = new Set((scores || []).map((n) => Number(n)));
    const drawSet = new Set((drawnNumbers || []).map((n) => Number(n)));
    let hits = 0;

    for (const n of scoreSet) {
        if (drawSet.has(n)) hits += 1;
    }

    if (hits >= 5) return '5_match';
    if (hits === 4) return '4_match';
    if (hits === 3) return '3_match';
    return null;
};

const upsertWinnerRecord = async ({ drawId, userId, matchType, prizePence }) => {
    const existing = await query(
        `SELECT id, proof_url, verify_status, payout_status
         FROM winners
         WHERE draw_id = $1 AND user_id = $2
         LIMIT 1`,
        [drawId, userId]
    );

    if (existing.rows.length > 0) {
        const updated = await query(
            `UPDATE winners
             SET match_type = $1,
                 prize_pence = $2,
                 verify_status = 'pending',
                 payout_status = 'pending'
             WHERE id = $3
             RETURNING id, draw_id, user_id, match_type, prize_pence, verify_status, payout_status`,
            [matchType, prizePence, existing.rows[0].id]
        );
        return updated.rows[0];
    }

    const created = await query(
        `INSERT INTO winners (draw_id, user_id, match_type, prize_pence, verify_status, proof_url, payout_status)
         VALUES ($1, $2, $3, $4, 'pending', NULL, 'pending')
         RETURNING id, draw_id, user_id, match_type, prize_pence, verify_status, payout_status`,
        [drawId, userId, matchType, prizePence]
    );

    return created.rows[0];
};

const applyPrizeLogicForDraw = async ({ drawId, drawnNumbers }) => {
    const config = await getOrCreateDrawConfig();
    const subscriberPoolPence = await getActiveSubscriberPoolPence();
    const prizePoolPct = Number(config.prize_pool_pct || 60);
    const poolTotalPence = Math.floor((subscriberPoolPence * prizePoolPct) / 100);

    const tier3Base = Math.floor(poolTotalPence * 0.25);
    const tier4Base = Math.floor(poolTotalPence * 0.35);
    const tier5Base = poolTotalPence - tier3Base - tier4Base;
    const previousJackpot = Number(config.jackpot_balance || 0);
    const tier5Total = tier5Base + previousJackpot;

    const candidates = await getCandidateUsersWithLatestScores();
    const winnersByTier = {
        '3_match': [],
        '4_match': [],
        '5_match': []
    };

    for (const row of candidates) {
        const matchType = computeMatchType(row.latest_scores, drawnNumbers);
        if (!matchType) continue;
        winnersByTier[matchType].push(Number(row.user_id));
    }

    const share3 = winnersByTier['3_match'].length > 0 ? Math.floor(tier3Base / winnersByTier['3_match'].length) : 0;
    const share4 = winnersByTier['4_match'].length > 0 ? Math.floor(tier4Base / winnersByTier['4_match'].length) : 0;
    const share5 = winnersByTier['5_match'].length > 0 ? Math.floor(tier5Total / winnersByTier['5_match'].length) : 0;

    for (const userId of winnersByTier['3_match']) {
        await upsertWinnerRecord({ drawId, userId, matchType: '3_match', prizePence: share3 });
    }
    for (const userId of winnersByTier['4_match']) {
        await upsertWinnerRecord({ drawId, userId, matchType: '4_match', prizePence: share4 });
    }
    for (const userId of winnersByTier['5_match']) {
        await upsertWinnerRecord({ drawId, userId, matchType: '5_match', prizePence: share5 });
    }

    const nextJackpot = winnersByTier['5_match'].length === 0 ? tier5Total : 0;
    await query(
        `UPDATE draw_config
         SET jackpot_balance = $1, updated_at = NOW()
         WHERE id = $2`,
        [nextJackpot, config.id]
    );

    await query(
        `UPDATE draws
         SET pool_total_pence = $1, jackpot_carried = $2
         WHERE id = $3`,
        [poolTotalPence, nextJackpot, drawId]
    );

    return {
        pool_total_pence: poolTotalPence,
        tier_allocation: {
            three_match_total: tier3Base,
            four_match_total: tier4Base,
            five_match_total: tier5Total,
            five_match_base: tier5Base,
            carried_from_previous: previousJackpot
        },
        winners_count: {
            three_match: winnersByTier['3_match'].length,
            four_match: winnersByTier['4_match'].length,
            five_match: winnersByTier['5_match'].length
        },
        payout_per_winner: {
            three_match: share3,
            four_match: share4,
            five_match: share5
        },
        jackpot_next_month_pence: nextJackpot
    };
};

const notifyDrawResults = async (drawRecord) => {
    try {
        const users = await query('SELECT email, full_name FROM users WHERE email IS NOT NULL');
        if (users.rows.length === 0) {
            return;
        }

        const numbers = (drawRecord.drawn_numbers || []).join(', ');
        const monthText = drawRecord.month ? new Date(drawRecord.month).toISOString().slice(0, 7) : 'this month';

        await Promise.allSettled(
            users.rows.map((user) =>
                sendEmail(
                    user.email,
                    `Draw Results Published - ${monthText}`,
                    `Hi ${user.full_name || 'there'},\n\nThe latest draw has been published.\nWinning numbers: ${numbers}\nMode: ${drawRecord.mode}\n\nGood luck!`,
                    `<p>Hi ${user.full_name || 'there'},</p><p>The latest draw has been published.</p><p><strong>Winning numbers:</strong> ${numbers}<br/><strong>Mode:</strong> ${drawRecord.mode}</p><p>Good luck!</p>`
                )
            )
        );
    } catch (notifyErr) {
        console.error('Draw results email notification failed:', notifyErr);
    }
};

export const getDraws = async (req, res) => {
    try {
        const draws = await query(
            `SELECT id, month, mode, drawn_numbers, pool_total_pence, jackpot_carried, status, published_at, executed_by
             FROM draws
             ORDER BY published_at DESC NULLS LAST, id DESC`
        );
        res.json({ data: draws.rows });
    }catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error." });
    }
};

export const getDrawById = async (req, res) => {
    const { drawId } = req.params;
    try {
        const draw = await query(
            `SELECT id, month, mode, drawn_numbers, pool_total_pence, jackpot_carried, status, published_at, executed_by
             FROM draws
             WHERE id = $1`,
            [drawId]
        );
        if(draw.rows.length === 0){
            return res.status(404).json({ message: "Draw not found." });
        }
        res.json(draw.rows[0]);
    }catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error." });
    }
};

export const currentDraw = async (req, res) => {
    try {
        const draw = await query(
            `SELECT id, month, mode, drawn_numbers, pool_total_pence, jackpot_carried, status, published_at, executed_by
             FROM draws
             WHERE status = $1
             ORDER BY published_at DESC NULLS LAST, id DESC
             LIMIT 1`,
            ['published']
        );
        if(draw.rows.length === 0){
            return res.status(404).json({ message: "No active draw found." });
        }
        res.json(draw.rows[0]);
    }catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error." });
    }
};


// ADMIN CONTROLLERS

export const simulateDraw = async (req, res) => {
    try {
        const mode = await getConfiguredDrawMode();
        const drawnNumbers = await generateNumbersByMode(mode);
        const executor = req.user?.userId || null;

        const simulated = await query(
            `INSERT INTO draws (month, mode, drawn_numbers, pool_total_pence, jackpot_carried, status, published_at, executed_by)
             VALUES (date_trunc('month', NOW())::date, $1, $2, 0, 0, 'simulation', NULL, $3)
             RETURNING id, month, mode, drawn_numbers, pool_total_pence, jackpot_carried, status, published_at, executed_by`,
            [mode, drawnNumbers, executor]
        );

        return res.json({
            message: 'Simulation saved successfully.',
            mode,
            drawn_numbers: drawnNumbers,
            status: 'simulation',
            draw: simulated.rows[0]
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error.' });
    }
};

export const executeDraw = async (req, res) => {
    try {
        const requestedDrawId = req.body?.draw_id;
        const executor = req.user?.userId || null;

        if (requestedDrawId) {
            const existing = await query(
                `SELECT id, month, mode, drawn_numbers, pool_total_pence, jackpot_carried, status, published_at, executed_by
                 FROM draws
                 WHERE id = $1`,
                [requestedDrawId]
            );

            if (existing.rows.length === 0) {
                return res.status(404).json({ message: 'Saved draw not found.' });
            }

            if (existing.rows[0].status !== 'simulation') {
                return res.status(400).json({ message: 'Only simulation draws can be declared.' });
            }

            const published = await query(
                `UPDATE draws
                 SET status = 'published', published_at = NOW(), executed_by = $2
                 WHERE id = $1
                 RETURNING id, month, mode, drawn_numbers, pool_total_pence, jackpot_carried, status, published_at, executed_by`,
                [requestedDrawId, executor]
            );

            const prizeSummary = await applyPrizeLogicForDraw({
                drawId: published.rows[0].id,
                drawnNumbers: published.rows[0].drawn_numbers
            });

            const refreshed = await query(
                `SELECT id, month, mode, drawn_numbers, pool_total_pence, jackpot_carried, status, published_at, executed_by
                 FROM draws
                 WHERE id = $1`,
                [published.rows[0].id]
            );

            await notifyDrawResults(refreshed.rows[0]);

            return res.status(200).json({
                message: 'Saved draw declared and published successfully.',
                draw: refreshed.rows[0],
                prize_summary: prizeSummary
            });
        }

        const mode = await getConfiguredDrawMode();
        const drawnNumbers = await generateNumbersByMode(mode);

        const draw = await query(
            `INSERT INTO draws (month, mode, drawn_numbers, pool_total_pence, jackpot_carried, status, published_at, executed_by)
             VALUES (date_trunc('month', NOW())::date, $1, $2, 0, 0, 'published', NOW(), $3)
             RETURNING id, month, mode, drawn_numbers, status, published_at, executed_by`,
            [mode, drawnNumbers, executor]
        );

        const prizeSummary = await applyPrizeLogicForDraw({
            drawId: draw.rows[0].id,
            drawnNumbers: draw.rows[0].drawn_numbers
        });

        const refreshed = await query(
            `SELECT id, month, mode, drawn_numbers, pool_total_pence, jackpot_carried, status, published_at, executed_by
             FROM draws
             WHERE id = $1`,
            [draw.rows[0].id]
        );

        await notifyDrawResults(refreshed.rows[0]);

        return res.status(201).json({
            message: 'Draw executed and published successfully.',
            draw: refreshed.rows[0],
            prize_summary: prizeSummary
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error.' });
    }
};

export const updateDrawConfig = async (req, res) => {
    const { mode } = req.body;

    if (!mode || !['random', 'weighted'].includes(mode)) {
        return res.status(400).json({ message: "Mode is required and must be either 'random' or 'weighted'." });
    }

    try {
        const updated = await query(
            `INSERT INTO draw_config (id, mode, jackpot_balance, prize_pool_pct, charity_min_pct, updated_at)
             VALUES (1, $1, 0, 60, 10, NOW())
             ON CONFLICT (id)
             DO UPDATE SET mode = EXCLUDED.mode, updated_at = NOW()
             RETURNING id, mode, updated_at`,
            [mode]
        );

        return res.json({
            message: 'Draw config updated successfully.',
            config: updated.rows[0]
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error.' });
    }
};

