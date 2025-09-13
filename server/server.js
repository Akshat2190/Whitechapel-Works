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

await connectDB();

// CORS
const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:5173",
  "http://localhost:3000",
].filter(Boolean);

const isAllowedOrigin = (origin) => {
  if (!origin) return true; // server-to-server, curl, etc.
  if (allowedOrigins.includes(origin)) return true;
  // Allow Vercel preview/prod frontends
  if (/^https?:\/\/([a-z0-9-]+\.)*vercel\.app$/i.test(origin)) return true;
  return false;
};

const corsOptions = {
  origin: (origin, cb) => {
    if (isAllowedOrigin(origin)) return cb(null, true);
    return cb(new Error(`Not allowed by CORS: ${origin || "unknown"}`));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Stripe-Signature"],
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions)); // preflight

// Stripe Webhooks (raw body BEFORE JSON parser)
app.post(
  "/api/stripe",
  express.raw({ type: "application/json" }),
  stripeWebhooks
);

// JSON parser AFTER webhook
app.use(express.json());

// Routes
app.get("/", (req, res) => res.send("Server is Live!"));
app.get("/api/health", (req, res) => res.json({ ok: true }));
app.use("/api/user", userRouter);
app.use("/api/chat", chatRouter);
app.use("/api/message", messageRouter);
app.use("/api/credit", creditRouter);

// Export the Express app for Vercel
export default app;
