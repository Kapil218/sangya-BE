import { Router } from "express";
import {
  getSubscribedChannels,
  getUserChannelSubscribers,
  toggleSubscription,
} from "../controllers/subscription.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();
router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router.route("/c/:subscriberId").get(getSubscribedChannels);

router.route("/s/:channelId").get(getUserChannelSubscribers);

router.route("/:channelId").post(toggleSubscription);

export default router;

// find subscribers for channel_id---------
//      find document where            channel=channel_id

// find subscribedChannels   for channel_id
//     find document where             subscriber=channel_id
