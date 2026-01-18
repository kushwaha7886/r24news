import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import userRouter from "./routes/User.route.js";
import articleRouter from "./routes/Article.route.js";
import categoryRouter from "./routes/Category.route.js";
import commentRouter from "./routes/Comment.route.js";
import mediaAssetRouter from "./routes/MediaAsset.route.js";
import broadcastRouter from "./routes/Broadcast.route.js";

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN || ["http://localhost:5173", "http://localhost:5174","http://localhost:5175"], // Allow requests from frontend origin (default to localhost:5173 for Vite dev server)
    credentials: true // Allow credentials (cookies, authorization headers, etc.)
}));

app.use(express.json({ limit: "16kb" })); // Parse JSON bodies with a size limit of 16kb
app.use(express.urlencoded({ extended: true, limit: "16kb" })); // Parse URL-encoded bodies with a size limit of 16kb and extended option for nested objects
app.use(express.static("public")); // Serve static files from the 'public' directory
app.use(cookieParser()); // Parse cookies from incoming requests

// Routes
app.use("/api/v1/users", userRouter); // User-related routes (login, register, etc.)
app.use("/api/v1/articles", articleRouter); // Article-related routes
app.use("/api/v1/categories", categoryRouter); // Category-related routes
app.use("/api/v1/comments", commentRouter); // Comment-related routes
app.use("/api/v1/media-assets", mediaAssetRouter); // Media asset-related routes
app.use("/api/v1/broadcasts", broadcastRouter); // Broadcast-related routes

export { app };
