import ffmpegPath from "ffmpeg-static"; // Add this line
import NodeMediaServer from "node-media-server";
// Check if ffmpegPath is resolved
if (!ffmpegPath) {
  console.error(
    "❌ Could not find ffmpeg. Make sure ffmpeg-static is installed."
  );
  process.exit(1);
}
console.log(`🔍 FFmpeg is located at: ${ffmpegPath}`);

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
const nms = new NodeMediaServer(config);

export function startNodeMediaServer() {
  nms.run();
}
