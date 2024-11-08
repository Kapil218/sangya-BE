// routes/history.js
import { Router } from "express";

import {
  addToHistory,
  deleteWatchHistory,
  getHistory,
} from "../controllers/history.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();
router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

// Add to watch history
router.post("/add", addToHistory);

// Get watch history
router.get("/", getHistory);

// Clear watch history
router.delete("/clear", deleteWatchHistory);

export default router;
