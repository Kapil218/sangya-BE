import ffmpegPath from "ffmpeg-static"; // Add this line
import dotenv from "dotenv";
import connectDB from "./db/index.js";
import { app } from "./app.js";
import http from "http";
import cors from "cors";
import NodeMediaServer from "node-media-server";

// Check if ffmpegPath is resolved
// if (!ffmpegPath) {
//   console.error(
//     "❌ Could not find ffmpeg. Make sure ffmpeg-static is installed."
//   );
//   process.exit(1);
// }
// console.log(`🔍 FFmpeg is located at: ${ffmpegPath}`);

// Load environment variables
dotenv.config({
  path: "./.env",
});

// Configuration for NodeMediaServer
const httpConfig = {
  port: 8080,
  allow_origin: "*",
  mediaroot: "./media",
};

const rtmpConfig = {
  port: 1935,
  chunk_size: 60000,
  gop_cache: true,
  ping: 10,
  ping_timeout: 60,
};

const transformationConfig = {
  ffmpeg: ffmpegPath, // Use the resolved ffmpeg-static path
  // ffmpeg: "./ffmpeg/ffmpeg.exe",
  tasks: [
    {
      app: "live",
      hls: true,
      hlsFlags: "[hls_time=2:hls_list_size=3:hls_flags=delete_segments]",
      hlsKeep: false,
    },
  ],
  MediaRoot: "./media",
};

const config = {
  http: httpConfig,
  rtmp: rtmpConfig,
  trans: transformationConfig,
};

// Enable CORS for localhost:5173
app.use(
  cors({
    origin: ["http://localhost:5173", "http://192.168.0.101:5173"],
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Create an HTTP server to work alongside Express app
const server = http.createServer(app);

connectDB()
  .then(() => {
    server.listen(process.env.PORT || 8000, "0.0.0.0", () => {
      console.log(`⚙️ Server is running at port : ${process.env.PORT}`);
    });
    const nms = new NodeMediaServer(config);
    nms.run();
  })
  .catch((err) => {
    console.log("MONGO db connection failed !!! ", err);
  });

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.log(err);

  console.log("Unhandled Rejection, shutting down ..............😢😢😢😢");
  console.log(err.name, err.message);

  // server.close(() => {
  //   process.exit(1);
  // });
});
