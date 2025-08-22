import mongoose from "mongoose";
import { Stream } from "../models/stream.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import crypto from "crypto";
// import { Video } from "../models/video.model.js";

const getUserLiveStream = asyncHandler(async (req, res) => {
  const { userId } = req.query;

  const stream = await Stream.findOne({ userId });

  if (!stream) {
    return res
      .status(404)
      .json(new ApiResponse(404, {}, "No live stream found"));
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, stream, "Live stream status fetched successfully")
    );
});

const postUserLiveStream = asyncHandler(async (req, res) => {
  const { userId } = req.query;
  const { title } = req.body;
  const streamKey = crypto.randomBytes(8).toString("hex");

  console.log(userId, title);
  const exisitingStream = await Stream.findOne({ userId });
  if (exisitingStream) {
    return res
      .status(200)
      .json(new ApiResponse(200, exisitingStream, "Live stream"));
  }
  const stream = await Stream.create({
    userId,
    isLive: true,
    streamKey,
    title,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, stream, "Live stream created successfully"));
});

const endUserLiveStream = asyncHandler(async (req, res) => {
  const { userId } = req.query;

  // If userId is already a string ObjectId, you can use it directly
  const stream = await Stream.findOne({ userId });
  // console.log(userId);

  // const stream = await Stream.deleteMany({ userId });

  if (!stream) {
    return res
      .status(404)
      .json(new ApiResponse(404, {}, "No live stream found"));
  }
  await stream.deleteOne({ userId });
  return res
    .status(204)
    .json(new ApiResponse(204, {}, "Live stream ended successfully"));
});

const getAllLiveStreams = asyncHandler(async (req, res) => {
  const streams = await Stream.find().populate({
    path: "userId",
    select: "username avatar _id",
    as: "user",
  });
  const transformed = streams.map((s) => ({
    ...s.toObject(),
    user: s.userId, // alias
    userId: undefined,
  }));
  return res
    .status(200)
    .json(
      new ApiResponse(200, transformed, "All live streams fetched successfully")
    );
});

export const StreamController = {
  getUserLiveStream,
  postUserLiveStream,
  endUserLiveStream,
  getAllLiveStreams,
};
