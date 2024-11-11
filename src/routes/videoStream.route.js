import { Router } from "express";
import {
  createTransport,
  getRtpCapabilities,
  startProduce,
  connectStream,
  createConsumerTransport,
  connectConsumerTransport,
  consume,
  //   consumerController,
} from "../controllers/videoStream.controller.js";

const router = Router();

router.route("/connect").get(getRtpCapabilities);
router.route("/addStream").post(createTransport);
router.route("/connectStream").post(connectStream);
router.route("/createConsumerTransport").post(createConsumerTransport);
router.route("/connectConsumerTransport").post(connectConsumerTransport);
router.route("/consume").post(consume);
router.route("/broadcast").post(startProduce);

// router.route("/consumer").post(consumerController);

export default router;
