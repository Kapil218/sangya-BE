// models/WatchHistory.js
import mongoose, { Schema, model } from "mongoose";

const StreamSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  isLive: {
    type: Boolean,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },

  streamKey: {
    type: Schema.Types.String,
    required: true,
  },
});

export const Stream = mongoose.model("Stream", StreamSchema);
