import { Router } from "express";

import { StreamController } from "../controllers/stream.controller.js";
const router = Router();

router.get("/all", StreamController.getAllLiveStreams);
router
  .route("/")
  .get(StreamController.getUserLiveStream)
  .post(StreamController.postUserLiveStream)
  .delete(StreamController.endUserLiveStream);

export default router;
