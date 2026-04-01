import { query } from '../services/database.js';

export const getScores= async (req, res) => {
    const userId = req.user.userId;
    try {
        const scores = await query(
            'SELECT id, value, played_at, created_at FROM scores WHERE user_id = $1 ORDER BY played_at DESC, id DESC',
            [userId]
        );
        res.json(scores.rows);
    }catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error." });
    }
};

export const addScore = async (req, res) => {
    const userId = req.user.userId;
    const score = Number(req.body?.score ?? req.body?.value);
    const { played_at } = req.body;
    if(score === undefined){
        return res.status(400).json({ message: "Score is required." });
    }
     if(score<1 || score > 45){
        return res.status(400).json({ message: "Score must be between 1 and 45." });
    }
    
    const existing = await query('SELECT id FROM scores WHERE user_id = $1 ORDER BY played_at ASC, id ASC', [userId]);
    if(existing.rows.length >= 5){
        await query('DELETE FROM scores WHERE id = $1', [existing.rows[0].id]);
    }
    try {
        const inserted = await query(
            'INSERT INTO scores (user_id, value, played_at) VALUES ($1, $2, COALESCE($3::date, CURRENT_DATE)) RETURNING id, value, played_at',
            [userId, score, played_at || null]
        );
        res.status(201).json({ message: "Score added successfully.", score: inserted.rows[0] });
    }catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error." });
    }
};

export const updateScore = async (req, res) => {
    const userId = req.user.userId;
    const { scoreId } = req.params;
    const score = Number(req.body?.score ?? req.body?.value);
    const { played_at } = req.body;
    if(score === undefined){
        return res.status(400).json({ message: "Score is required." });
    }
     if(score<1 || score > 45){
        return res.status(400).json({ message: "Score must be between 1 and 45." });
    }
    try {
        const existing = await query('SELECT id FROM scores WHERE id = $1 AND user_id = $2', [scoreId, userId]);
        if(existing.rows.length === 0){
            return res.status(404).json({ message: "Score not found." });
        }
        const updated = await query(
            'UPDATE scores SET value = $1, played_at = COALESCE($2::date, played_at), admin_override = false WHERE id = $3 RETURNING id, value, played_at',
            [score, played_at || null, scoreId]
        );
        res.json({ message: "Score updated successfully.", score: updated.rows[0] });
    }catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error." });
    }
};

export const deleteScore = async (req, res) => {
    const userId = req.user.userId;
    const { scoreId } = req.params;
    try {
        const existing = await query('SELECT id FROM scores WHERE id = $1 AND user_id = $2', [scoreId, userId]);
        if(existing.rows.length === 0){
            return res.status(404).json({ message: "Score not found." });
        }
        await query('DELETE FROM scores WHERE id = $1', [scoreId]);
        res.json({ message: "Score deleted successfully." });
    }catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error." });
    }
};


// ADMIN CONTROLLERS

export const editscorebyadmin = async (req, res) => {
    const { scoreId } = req.params;
    const score = Number(req.body?.score ?? req.body?.value);
    const { played_at } = req.body;
    if(score === undefined){
        return res.status(400).json({ message: "Score is required." });
    }
    if(score<1 || score > 45){
        return res.status(400).json({ message: "Score must be between 1 and 45." });
    }
    try {
        const existing = await query('SELECT id FROM scores WHERE id = $1', [scoreId ]);
        if(existing.rows.length === 0){
            return res.status(404).json({ message: "Score not found." });
        }
        const updated = await query(
            'UPDATE scores SET value = $1, played_at = COALESCE($2::date, played_at), admin_override = true WHERE id = $3 RETURNING id, value, played_at, admin_override',
            [score, played_at || null, scoreId]
        );
        res.json({ message: "Score updated successfully.", score: updated.rows[0] });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error." });
    }
};

export const listScoresByUserAdmin = async (req, res) => {
    const { userId } = req.params;
    try {
        const scores = await query(
            `SELECT id, user_id, value, played_at, admin_override, created_at
             FROM scores
             WHERE user_id = $1
             ORDER BY played_at DESC, id DESC
             LIMIT 5`,
            [userId]
        );
        res.json({ data: scores.rows });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error." });
    }
};
