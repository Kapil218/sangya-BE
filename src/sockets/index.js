// sockets/index.js
import chatSocket from "./chat.socket.js";

export default function initSockets(io) {
  io.on("connection", (socket) => {
    console.log("⚡ Socket connected:", socket.id);

    // register all socket modules
    chatSocket(io, socket);

    socket.on("disconnect", () => {
      console.log("❌ Socket disconnected:", socket.id);
    });
  });
}
