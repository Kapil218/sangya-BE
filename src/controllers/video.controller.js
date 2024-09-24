import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary, generateVideoUrls } from "../utils/cloudinary.js";

const getAllVideos = asyncHandler(async (req, res) => {
  let page = Number(req.query.page) || 1;
  let itemsPerPage = Number(req.query.itemsPerPage) || 10;
  let search = req.query.search || ""; // Capture the search query if available

  let skip = (page - 1) * itemsPerPage;

  // Create a search condition based on the search query
  let searchCondition = {
    $or: [
      { title: { $regex: search, $options: "i" } }, // case-insensitive search in title
      { description: { $regex: search, $options: "i" } }, // case-insensitive search in description
    ],
  };

  // Fetch videos with pagination, sorted by latest updated first
  const videos = await Video.find(searchCondition)
    .populate({ path: "owner", select: "fullName username avatar" })
    .sort({ updatedAt: -1 }) // Sort by latest updated first
    .skip(skip) // Pagination
    .limit(itemsPerPage); // Limit results per page

  // Calculate the total number of videos
  const totalVideos = await Video.countDocuments(searchCondition);

  // Calculate the total number of pages
  const totalPages = Math.ceil(totalVideos / itemsPerPage);

  // Respond with the paginated and filtered results
  res.status(200).json({
    totalVideos,
    page: page,
    itemsPerPage: itemsPerPage,
    totalPages,
    videos,
  });
});

const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  // Validation check
  if ([title, description].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "All fields are required");
  }

  // Uploading video
  const videoLocalPath = req.files?.videoFile?.[0]?.path;
  if (!videoLocalPath) {
    throw new ApiError(400, "Video file is required");
  }
  const videoFile = await uploadOnCloudinary(videoLocalPath, "video");

  // Uploading thumbnail
  const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path;
  if (!thumbnailLocalPath) {
    throw new ApiError(400, "Thumbnail file is required");
  }
  const thumbnail = await uploadOnCloudinary(thumbnailLocalPath, "image");

  // Generate URLs for different video qualities
  const videoUrls = generateVideoUrls(videoFile.public_id);

  // Save video details to the database
  const video = await Video.create({
    videoFile: videoUrls, // Store URLs for different qualities
    thumbnail: thumbnail.url,
    duration: videoFile.duration,
    description,
    title,
    owner: req.user,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, video, "Video posted successfully"));
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!videoId?.trim()) {
    throw new ApiError(400, "videoid is missing");
  }
  const video = await Video.findById(videoId).populate({
    path: "owner",
    select: "fullName username avatar",
  });
  if (!video) {
    throw new ApiError(401, "video can't be fetched");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, video, "video fetched successfully"));
});

const updateVideo = asyncHandler(async (req, res) => {
  //TODO: update video details like title, description, thumbnail
  const { videoId } = req.params;
  if (!videoId?.trim()) {
    throw new ApiError(400, "videoId is missing");
  }
  const { title, description } = req.body;
  if (!title || !description) {
    throw new ApiError(400, "All fields are required");
  }
  const thumbnailLocalPath = req.file?.path;

  if (!thumbnailLocalPath) {
    throw new ApiError(400, "thumbnail file is missing");
  }

  const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

  if (!thumbnail.url) {
    throw new ApiError(400, "Error while uploading on avatar");
  }
  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(401, "Video not found");
  }

  // Fetch the owner document
  const owner = await User.findById(video.owner.toString());
  if (!owner) {
    throw new ApiError(404, "video Owner not found");
  }
  if (owner._id.toString() == req.user._id.toString()) {
    var videoResponse = await Video.findByIdAndUpdate(
      videoId,
      {
        $set: {
          description,
          title,
          thumbnail: thumbnail.url,
        },
      },
      { new: true }
    ).select("-owner -views");
  } else {
    throw new ApiError(403, "current user is not the owner of the video");
  }
  return res
    .status(200)
    .json(new ApiResponse(201, videoResponse, "video updated successfully"));
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!videoId?.trim()) {
    throw new ApiError(400, "videoId is missing");
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(401, "Video not found");
  }

  // Fetch the owner document
  const owner = await User.findById(video.owner.toString());
  if (!owner) {
    throw new ApiError(404, "video Owner not found");
  }
  if (owner._id.toString() == req.user._id.toString()) {
    await Video.deleteOne({ _id: videoId });
  } else {
    throw new ApiError(403, "current user is not the owner of the video");
  }
  return res
    .status(200)
    .json(new ApiResponse(201, {}, "video deleted successfully"));
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!videoId?.trim()) {
    throw new ApiError(400, "videoId is missing");
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(401, "Video not found");
  }

  // Fetch the owner document
  const owner = await User.findById(video.owner.toString());
  if (!owner) {
    throw new ApiError(404, "video Owner not found");
  }
  if (owner._id.toString() == req.user._id.toString()) {
    var videoResponse = await Video.findByIdAndUpdate(
      videoId,
      {
        $set: {
          isPublished: !video.isPublished,
        },
      },
      { new: true }
    ).select("-owner -views");
  } else {
    throw new ApiError(403, "current user is not the owner of the video");
  }
  return res
    .status(200)
    .json(
      new ApiResponse(201, videoResponse, "publish status changed successfully")
    );
});

const myVideosController = asyncHandler(async (req, res) => {
  const { email } = req.query;
  console.log("Requested my videos: ", email);
  const user = await User.findOne({ email: email });
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  const videos = await Video.find({ owner: user._id }).populate({
    path: "owner",
    select: "fullName username avatar",
  });
  res.status(200).json({ data: { videos } });
});
export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
  myVideosController,
};
