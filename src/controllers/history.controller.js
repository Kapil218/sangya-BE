import WatchHistory from "../models/WatchHistory.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const addToHistory = asyncHandler(async (req, res) => {
  const { videoId } = req.body;
  const userId = req.user._id;
  await WatchHistory.create({ userId, videoId });
  res
    .status(201)
    .json({ message: "Video added to watch history successfully" });
});

export const getHistory = asyncHandler(async (req, res) => {
  //   console.log(userId);

  const history = await WatchHistory.aggregate([
    {
      $lookup: {
        from: "videos", // Name of the video collection
        localField: "videoId", // Field in WatchHistory
        foreignField: "_id", // Field in Videos
        as: "video", // Renaming `videoId` to `video`
      },
    },
    // lookup to popluate video owner
    { $unwind: "$video" },
    {
      $lookup: {
        from: "users",
        localField: "video.owner",
        foreignField: "_id",
        as: "video.owner",
      },
    },
    {
      $unwind: {
        path: "$video.owner",
      },
    },
    // Convert array result from `$lookup` to an object
    { $match: { userId: req.user._id } },
    {
      $project: {
        userId: 1,
        watchedAt: 1,
        video: 1, // Only include the `video` field
      },
    },
  ]);

  res.status(200).json({ history });
});

export const deleteWatchHistory = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  await WatchHistory.deleteMany({ userId });
  res.status(200).json({ message: "Watch history cleared" });
});
