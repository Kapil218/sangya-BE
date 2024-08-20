import mongoose, { isValidObjectId } from "mongoose";
import { User } from "../models/user.model.js";
import { Subscription } from "../models/subscription.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  if (!channelId || !isValidObjectId(channelId)) {
    throw new ApiError(400, "Invalid or missing channelId");
  }

  const subscriberId = req.user._id;

  if (subscriberId.toString() === channelId) {
    throw new ApiError(400, "You cannot subscribe to your own channel");
  }

  // Check if the subscription already exists
  const existingSubscription = await Subscription.findOne({
    subscriber: subscriberId,
    channel: channelId,
  });

  if (existingSubscription) {
    // Remove the subscription (unsubscribe)
    await Subscription.findByIdAndDelete(existingSubscription._id);
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Unsubscribed successfully"));
  } else {
    // Create a new subscription
    await Subscription.create({
      subscriber: subscriberId,
      channel: channelId,
    });
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Subscribed successfully"));
  }
});

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  if (!channelId) {
    throw new ApiError(400, "Invalid or missing channelId");
  }

  const subscriptions = await Subscription.find({
    channel: channelId,
  });

  const subscribers = subscriptions;

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { subscribers },
        "Subscribers retrieved successfully"
      )
    );
});

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { subscriberId } = req.params;

  if (!subscriberId || !isValidObjectId(subscriberId)) {
    throw new ApiError(400, "Invalid or missing subscriberId");
  }

  const subscriptions = await Subscription.find({
    subscriber: subscriberId,
  });

  const channels = subscriptions;

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { channels },
        "Subscribed channels retrieved successfully"
      )
    );
});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };
