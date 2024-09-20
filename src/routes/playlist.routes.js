import { Router } from "express";
import {
  createPlaylist,
  addVideoToPlaylist,
  getUserPlaylists,
  removeVideoFromPlaylist,
  deletePlaylist,
} from "../controllers/playlist.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();
router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

// Create a new playlist
router.route("/").post(createPlaylist);

// Get all playlists for a specific user
router.route("/user/:userId").get(getUserPlaylists);

// Add a video to a playlist
router.route("/:playlistId/videos").post(addVideoToPlaylist);

// Remove a video from a playlist
router.route("/:playlistId/videos/:videoId").delete(removeVideoFromPlaylist);

// Delete a playlist
router.route("/:playlistId").delete(deletePlaylist);

export default router;
