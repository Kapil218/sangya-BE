import mongoose from "mongoose";
import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from "../models/video.model.js";

const getVideoComments = asyncHandler(async (req, res) => {
  //TODO: get all comments for a video
  const { videoId } = req.params;
  const { page = 1, itemsPerPage = 10 } = req.query;

  const comments = await Comment.aggregate([
    {
      $match: {
        video: new mongoose.Types.ObjectId(videoId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
      },
    },
    {
      $project: {
        content: 1,
        "owner.username": 1,
        "owner.avatar": 1,
        "owner.fullName": 1,
        totalComments: 1,
      },
    },
    {
      $skip: (page - 1) * itemsPerPage,
    },
    {
      $limit: itemsPerPage,
    },
  ]);

  if (!comments?.length) {
    throw new ApiError(404, "no comments have found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { totalComments: comments.length, data: comments },
        "comments fetched successfully"
      )
    );
});

const addComment = asyncHandler(async (req, res) => {
  // TODO: add a comment to a video
  const { videoId } = req.params;
  const { content } = req.body;

  if (content.trim() == "") {
    throw new ApiError(400, "comment field can not be empty");
  }
  if (videoId.trim() == "") {
    throw new ApiError(400, "video id required");
  }
  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(401, "video can't be fetched");
  }

  const comment = await Comment.create({
    owner: req.user._id,
    content: content,
    video: video._id,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, comment, "commented successfully"));
});

const updateComment = asyncHandler(async (req, res) => {
  // TODO: update a comment
  const { commentId } = req.params;
  const { content } = req.body;

  const comment = await Comment.findById(commentId);
  if (comment.owner._id.toString() == req.user._id.toString()) {
    var updatedComment = await Comment.findByIdAndUpdate(
      commentId,
      {
        $set: {
          content: content,
        },
      },
      { new: true }
    );
  }

  return res
    .status(200)
    .json(new ApiResponse(200, updatedComment, "comment updated successFully"));
});

const deleteComment = asyncHandler(async (req, res) => {
  // TODO: delete a comment
  const { commentId } = req.params;

  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new ApiError(404, "comment not found");
  }
  if (comment.owner._id.toString() == req.user._id.toString()) {
    await Comment.deleteOne({ _id: commentId });
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "comment deleteted successfully"));
});

export { getVideoComments, addComment, updateComment, deleteComment };
