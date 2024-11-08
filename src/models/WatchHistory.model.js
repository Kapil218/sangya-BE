// models/WatchHistory.js
import { Schema, model } from "mongoose";

const watchHistorySchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  videoId: {
    type: Schema.Types.ObjectId,
    ref: "Video",
    required: true,
  },
  watchedAt: {
    type: Date,
    default: Date.now,
  },
});

export default model("WatchHistory", watchHistorySchema);
