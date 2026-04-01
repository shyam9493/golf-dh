import express from 'express';
import { authMiddleware,subsMiddleware,adminMiddleware } from '../middleware/index.js';
import { getScores,addScore,updateScore,deleteScore,editscorebyadmin,listScoresByUserAdmin } from '../controllers/scoreController.js';

const scoreRouter = express.Router();

scoreRouter.get("/", authMiddleware, getScores);
scoreRouter.post("/", [authMiddleware,subsMiddleware], addScore);
scoreRouter.put("/:scoreId", [authMiddleware,subsMiddleware], updateScore);
scoreRouter.delete("/:scoreId", [authMiddleware,subsMiddleware], deleteScore);



// AAdmin Routes
scoreRouter.get('/admin/user/:userId', [authMiddleware,adminMiddleware], listScoresByUserAdmin);
scoreRouter.put("/admin/:scoreId", [authMiddleware,adminMiddleware] ,editscorebyadmin);



export default scoreRouter;