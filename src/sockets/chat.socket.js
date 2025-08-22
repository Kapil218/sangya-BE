// sockets/chat.socket.js
const chatStore = new Map(); // { broadcasterId: [messages] }

export default function chatSocket(io, socket) {
  // join a broadcaster’s room
  socket.on("join_chat", ({ broadcasterId }) => {
    socket.join(`room:${broadcasterId}`);

    // send last 100 msgs
    const history = chatStore.get(broadcasterId) || [];
    socket.emit("chat_history", history);
  });

  // handle incoming message
  socket.on("send_message", ({ broadcasterId, userId, text, username }) => {
    const msg = { userId, text, ts: Date.now(), username };
    console.log("new message by ", userId);

    // save in memory (max 100)
    const history = chatStore.get(broadcasterId) || [];
    history.push(msg);
    if (history.length > 100) history.shift();
    chatStore.set(broadcasterId, history);

    // broadcast to all in that room
    io.to(`room:${broadcasterId}`).emit("new_message", msg);
  });
}
