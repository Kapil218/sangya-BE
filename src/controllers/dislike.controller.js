import { Dislike } from "../models/dislike.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from "../models/video.model.js";
import { Comment } from "../models/comment.model.js";

const toggleVideoDislike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!videoId?.trim()) {
    throw new ApiError(400, "videoId is missing");
  }

  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  const existingDislike = await Dislike.findOne({
    video: videoId,
    dislikedBy: req.user._id,
  });

  if (existingDislike) {
    // Remove the like (unlike)
    await Dislike.findByIdAndDelete(existingDislike._id);
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Video undisliked successfully"));
  } else {
    // Create a new like
    const dislikedVideo = await Dislike.create({
      video: videoId,
      dislikedBy: req.user._id,
    });
    return res
      .status(200)
      .json(new ApiResponse(200, dislikedVideo, "Video disliked successfully"));
  }
});

// const toggleCommentLike = asyncHandler(async (req, res) => {
//   const { commentId } = req.params;

//   if (!commentId?.trim()) {
//     throw new ApiError(400, "commentId is missing");
//   }

//   const comment = await Comment.findById(commentId);
//   if (!comment) {
//     throw new ApiError(404, "Comment not found");
//   }

//   const existingLike = await Like.findOne({
//     comment: commentId,
//     likedBy: req.user._id,
//   });

//   if (existingLike) {
//     // Remove the like (unlike)
//     await Like.findByIdAndDelete(existingLike._id);
//     return res
//       .status(200)
//       .json(new ApiResponse(200, {}, "Comment unliked successfully"));
//   } else {
//     // Create a new like
//     const likedComment = await Like.create({
//       comment: commentId,
//       likedBy: req.user._id,
//     });
//     return res
//       .status(200)
//       .json(new ApiResponse(200, likedComment, "Comment liked successfully"));
//   }
// });

const getDislikedVideos = asyncHandler(async (req, res) => {
  //TODO: get all liked videos

  const dislikedVideos = await Dislike.aggregate([
    {
      $lookup: {
        from: "users",
        localField: "dislikedBy",
        foreignField: "_id",
        as: "dislikedBy",
      },
    },

    {
      $unwind: "$dislikedBy",
    },
    {
      $match: {
        "dislikedBy._id": req.user._id,
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
    {
      $project: {
        "dislikedBy.username": 1,
        "dislikedBy.avatar": 1,
        "dislikedBy.fullName": 1,
        video: 1,
      },
    },
  ]);

  return res
    .status(200)
    .json(
      new ApiResponse(200, likedVideos, "disliked videos fetched successfully")
    );
});
export const isVideoDisiked = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const f = await Dislike.findOne({ dislikedBy: req.user._id, video: videoId });

  return res.status(200).json({ isDisliked: f ? true : false });
});
export { toggleVideoDislike, getDislikedVideos };
