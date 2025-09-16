import express from "express";
import "dotenv/config";
import cors from "cors";
import connectDB from "./configs/db.js";
import userRouter from "./routes/userRoutes.js";
import chatRouter from "./routes/chatRoutes.js";
import messageRouter from "./routes/messageRoutes.js";
import creditRouter from "./routes/creditRoutes.js";
import { stripeWebhooks } from "./controllers/webhooks.js";

const app = express();

// Connect to database
await connectDB();

// CORS Configuration
const allowedOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(",")
      .map((s) => s.trim())
      .filter(Boolean)
  : ["http://localhost:5173", "https://whitechapel-works.vercel.app"];

const isAllowedOrigin = (origin) => {
  if (!origin) return true; // non-browser requests
  if (allowedOrigins.includes(origin)) return true;
  // Allow any Vercel preview URL for the client project
  try {
    const url = new URL(origin);
    const host = url.hostname; // e.g. whitechapel-works-git-branch-user.vercel.app
    if (host.endsWith(".vercel.app") && host.startsWith("whitechapel-works")) {
      return true;
    }
  } catch (_) {}
  return false;
};

// Apply CORS globally so all routes and preflights receive headers
app.use(
  cors({
    origin: function (origin, callback) {
      if (isAllowedOrigin(origin)) return callback(null, true);
      console.log("Blocked origin:", origin);
      return callback(null, false);
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
    optionsSuccessStatus: 204,
    preflightContinue: false,
  })
);

// Explicit preflight responder to ensure headers on serverless
app.use((req, res, next) => {
  if (req.method === "OPTIONS") {
    const origin = req.headers.origin;
    if (isAllowedOrigin(origin)) {
      res.header("Access-Control-Allow-Origin", origin || "*");
      res.header("Vary", "Origin");
      res.header("Access-Control-Allow-Credentials", "true");
      res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
      res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
      return res.sendStatus(204);
    }
    return res.sendStatus(403);
  }
  next();
});

// Middleware to parse JSON bodies
app.use(express.json());

// Stripe Webhooks - needs raw body parsing before JSON middleware
app.post(
  "/api/stripe",
  express.raw({ type: "application/json" }),
  stripeWebhooks
);

// Optional: Logger to debug requests and origins
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  console.log("Request Origin:", req.headers.origin);
  console.log("Request Body:", req.body);
  next();
});

console.log("Allowed Origins:", allowedOrigins);

// Routes
app.get("/", (req, res) => res.send("Server is Live!"));
app.use("/api/user", userRouter);
app.use("/api/chat", chatRouter);
app.use("/api/message", messageRouter);
app.use("/api/credit", creditRouter);

// Error handling middleware - must be after routes
app.use((err, req, res, next) => {
  console.error("Error handler:", err);
  res
    .status(500)
    .json({ message: "Internal Server Error", error: err.message });
});

// Export the app for serverless platforms like Vercel.
export default app;
