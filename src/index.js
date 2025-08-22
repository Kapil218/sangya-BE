import dotenv from "dotenv";
import connectDB from "./db/index.js";
import { app } from "./app.js";
import http from "http";
import cors from "cors";
import { Server as SocketIOServer } from "socket.io";
import initSockets from "./sockets/index.js";

app.use(
  cors({
    origin: ["http://localhost:5173", "http://192.168.0.101:5173"],
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Create an HTTP server to work alongside Express app
const server = http.createServer(app);
// const io = new SocketIOServer(server);
const io = new SocketIOServer(server, {
  cors: {
    origin: "http://localhost:5173", // your frontend
    methods: ["GET", "POST"],
    credentials: true, // if using cookies/auth
  },
});
initSockets(io);

connectDB()
  .then(() => {
    server.listen(process.env.PORT || 8000, "0.0.0.0", () => {
      console.log(`⚙️ Server is running at port : ${process.env.PORT}`);
    });
    // startNodeMediaServer();
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
