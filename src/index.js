import dotenv from "dotenv";
import connectDB from "./db/index.js";
import { app } from "./app.js";
import http from "http";
import cors from "cors";
import { Server } from "socket.io";

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

const io = new Server(server, {
  cors: {
    origin: ["https://web-apps-732ac.web.app", "http://192.168.0.101:5173"], // Allow your frontend and local network IP
    methods: ["GET", "POST"],
    credentials: true,
  },
});

const streams = {}; // Store stream info

// Handle Socket.IO connections
io.on("connection", (socket) => {
  console.log("New user connected:", socket.id);

  // Handle WebRTC signaling
  socket.on("offer", (offer, room) => {
    console.log(`Offer received from ${socket.id} for room ${room}`);
    console.log("Offer:", offer);
    streams[room] = { offer, socketId: socket.id }; // Store stream info
    console.log(`Stream started by ${socket.id} in room ${room}`); // Log stream info
    socket.to(room).emit("offer", offer);
  });

  socket.on("answer", (answer, room) => {
    console.log(`Answer received from ${socket.id} for room ${room}`);
    console.log("Answer:", answer);
    socket.to(room).emit("answer", answer);
  });

  socket.on("ice-candidate", (candidate, room) => {
    console.log(`ICE candidate received from ${socket.id} for room ${room}`);
    console.log("ICE Candidate:", candidate);
    socket.to(room).emit("ice-candidate", candidate);
  });

  // Room handling
  socket.on("join-room", (room) => {
    socket.join(room);
    console.log(`User ${socket.id} joined room ${room}`);
  });

  socket.on("disconnect", (reason) => {
    console.log(`Socket ${socket.id} disconnected:`, reason);
    // Remove stream info if the streamer disconnects
    for (const room in streams) {
      if (streams[room].socketId === socket.id) {
        delete streams[room];
        socket.to(room).emit("stream-ended", "Streamer has disconnected");
      }
    }
  });
});

connectDB()
  .then(() => {
    server.listen(process.env.PORT || 8000, "0.0.0.0", () => {
      console.log(`⚙️ Server is running at port : ${process.env.PORT}`);
    });
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
