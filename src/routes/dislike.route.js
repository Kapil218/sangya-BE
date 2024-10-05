import { Router } from "express";
import {
  getDislikedVideos,
  isVideoDisiked,
  //   toggleCommentLike,
  toggleVideoDislike,
} from "../controllers/dislike.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();
router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router.route("/toggle/v/:videoId").post(toggleVideoDislike);
// router.route("/toggle/c/:commentId").post(toggleCommentLike);
router.route("/videos").get(getDislikedVideos);
router.route("/isDisliked/v/:videoId").get(isVideoDisiked);

export default router;
