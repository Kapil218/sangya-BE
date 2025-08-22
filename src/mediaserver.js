// const NodeMediaServer = require("node-media-server");
import NodeMediaServer from "node-media-server";
// import ffmpegPath from "ffmpeg-static"; // for transcoding
import ffmpegPath from "ffmpeg-static";
console.log(ffmpegPath);
const config = {
  rtmp: {
    port: 1935,
    chunk_size: 60000,
    gop_cache: true,
    ping: 30,
    ping_timeout: 60,
  },
  http: {
    port: 8001,
    mediaroot: "./media",
    allow_origin: "*",
  },
  trans: {
    ffmpeg: "./ffmpeg.exe",
    tasks: [
      {
        app: "live",
        hls: true,
        hlsFlags: "[hls_time=2:hls_list_size=3:hls_flags=delete_segments]",
        hlsKeep: true, // to prevent hls file delete after end the stream
        dash: true,
        dashFlags: "[f=dash:window_size=3:extra_window_size=5]",
        dashKeep: true, // to prevent dash file delete after end the stream
      },
    ],
  },
};
const nms = new NodeMediaServer(config);
nms.run();

nms.on("donePublish", (id, StreamPath, args) => {
  console.log("[Event] donePublish", id, StreamPath, args);
});
