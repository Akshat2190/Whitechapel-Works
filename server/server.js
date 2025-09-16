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

// Stripe Webhooks - needs raw body parsing before JSON middleware
app.post(
  "/api/stripe",
  express.raw({ type: "application/json" }),
  stripeWebhooks
);

// CORS Configuration
const allowedOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(",")
  : ["http://localhost:5173", "https://whitechapel-works.vercel.app"];

// Enable CORS for API routes; the cors package will handle OPTIONS preflights
app.use(
  "/api",
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
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

// Middleware to parse JSON bodies
app.use(express.json());

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
