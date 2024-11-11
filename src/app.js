import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { limiter } from "./middlewares/rateLimit.middleware.js";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";
import xss from "xss-clean";
import hpp from "hpp";
import userRouter from "./routes/user.routes.js";
import videoRoute from "./routes/video.routes.js";
import commentRouter from "./routes/comment.routes.js";
import likeRoute from "./routes/like.routes.js";
import dislikeRoute from "./routes/dislike.route.js";
import subscriptionRoute from "./routes/subscription.routes.js";
import playlistRoute from "./routes/playlist.routes.js";
import historyRoute from "./routes/history.routes.js";
import streamRouter from "./routes/videoStream.route.js";
import bodyParser from "body-parser";

const app = express();

// Adds security headers
app.use(helmet());

// Rate limits API requests
app.use("/api", limiter);

// Enables CORS with specified origin and credentials
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:5173",
      "http://192.168.0.101:5173",
      "https://sangya.web.app",
    ],
    credentials: true,
  })
);

// Middleware to add custom headers for CORS
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", req.headers.origin);
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Credentials", "true");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

// Parses JSON requests (limit: 16kb)
app.use(express.json({ limit: "16kb" }));

// Parses URL-encoded data (limit: 16kb, no nested objects)
app.use(express.urlencoded({ limit: "16kb", extended: false }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// Sanitizes data to prevent NoSQL injection
app.use(mongoSanitize());

// Prevents XSS attacks by cleaning user input
app.use(xss());

// Prevents HTTP Parameter Pollution
app.use(
  hpp({
    whitelist: [], // Specify allowed duplicate params here
  })
);

// Serves static files from "public"
app.use(express.static("public"));

// Parses cookies from requests
app.use(cookieParser());

// routes import

// Declares routes for users, videos, and comments
app.use("/api/v1/users", userRouter);
app.use("/api/v1/videos", videoRoute);
app.use("/api/v1/comments", commentRouter);
app.use("/api/v1/likes", likeRoute);
app.use("/api/v1/dislikes", dislikeRoute);
app.use("/api/v1/subscriptions", subscriptionRoute);
app.use("/api/v1/playlists", playlistRoute);
app.use("/api/v1/watchHistory", historyRoute);
app.use("/api/v1/stream", streamRouter);

// unhandled routes
app.all("*", (req, res, next) => {
  return res.status(404).json({
    success: "fail",
    message: `Can't find the ${req.originalUrl} page on this server`,
  });
});

export { app };
