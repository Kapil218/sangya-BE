import ffmpegPath from "ffmpeg-static";
import NodeMediaServer from "node-media-server";

// Check if ffmpegPath is resolved
if (!ffmpegPath) {
  console.error(
    "❌ Could not find ffmpeg. Make sure ffmpeg-static is installed."
  );
  process.exit(1);
}
console.log(`🔍 FFmpeg is located at: ${ffmpegPath}`);

// HTTP config
const httpConfig = {
  port: 8080, // change to 8001 if you want
  allow_origin: "*",
  mediaroot: "./media",
};

// RTMP config
const rtmpConfig = {
  port: 1935,
  chunk_size: 60000,
  gop_cache: true,
  ping: 10,
  ping_timeout: 60,
};

// Transformation / FLV config
const transformationConfig = {
  ffmpeg: ffmpegPath,
  tasks: [
    {
      app: "live",
      flv: true, // 👈 enable FLV
      hls: true, // disable HLS if you only want FLV
      dash: true, // disable DASH
    },
  ],
};

const config = {
  http: httpConfig,
  rtmp: rtmpConfig,
  trans: transformationConfig,
};

const nms = new NodeMediaServer(config);
nms.run();

console.log(
  "Node-Media-Server running on RTMP 1935 and HTTP 8080 (FLV enabled)"
);
