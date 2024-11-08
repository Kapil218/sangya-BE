import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from "../models/video.model.js";
import { Comment } from "../models/comment.model.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!videoId?.trim()) {
    throw new ApiError(400, "videoId is missing");
  }

  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  const existingLike = await Like.findOne({
    video: videoId,
    likedBy: req.user._id,
  });

  if (existingLike) {
    // Remove the like (unlike)
    await Like.findByIdAndDelete(existingLike._id);
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Video unliked successfully"));
  } else {
    // Create a new like
    const likedVideo = await Like.create({
      video: videoId,
      likedBy: req.user._id,
    });
    return res
      .status(200)
      .json(new ApiResponse(200, likedVideo, "Video liked successfully"));
  }
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  if (!commentId?.trim()) {
    throw new ApiError(400, "commentId is missing");
  }

  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new ApiError(404, "Comment not found");
  }

  const existingLike = await Like.findOne({
    comment: commentId,
    likedBy: req.user._id,
  });

  if (existingLike) {
    // Remove the like (unlike)
    await Like.findByIdAndDelete(existingLike._id);
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Comment unliked successfully"));
  } else {
    // Create a new like
    const likedComment = await Like.create({
      comment: commentId,
      likedBy: req.user._id,
    });
    return res
      .status(200)
      .json(new ApiResponse(200, likedComment, "Comment liked successfully"));
  }
});

const getLikedVideos = asyncHandler(async (req, res) => {
  //TODO: get all liked videos

  const likedVideos = await Like.aggregate([
    {
      $lookup: {
        from: "users",
        localField: "likedBy",
        foreignField: "_id",
        as: "likedBy",
      },
    },
    {
      $unwind: "$likedBy",
    },
    {
      $match: {
        "likedBy._id": req.user._id,
        video: { $type: "objectId" },
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "video",
        foreignField: "_id",
        as: "video",
      },
    },
    {
      $unwind: "$video",
    },
    // New lookup to populate the video owner
    {
      $lookup: {
        from: "users", // same collection as before
        localField: "video.owner", // field in video document
        foreignField: "_id", // reference to user _id
        as: "video.owner", // alias for populated field
      },
    },
    {
      $unwind: {
        path: "$video.owner",
        preserveNullAndEmptyArrays: true, // optional: handle cases where there's no owner
      },
    },
    {
      $project: {
        "likedBy.username": 1,
        "likedBy.avatar": 1,
        "likedBy.fullName": 1,
        video: 1, // Include the entire video object
      },
    },
  ]);

  return res
    .status(200)
    .json(
      new ApiResponse(200, likedVideos, "liked videos fetched successfully")
    );
});

export const isVideoLiked = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const f = await Like.findOne({
    likedBy: req.user._id,
    video: videoId,
  });

  return res.status(200).json({ isLiked: f ? true : false });
});
export { toggleCommentLike, toggleVideoLike, getLikedVideos };
