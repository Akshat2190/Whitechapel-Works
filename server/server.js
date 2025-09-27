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

// --- START: UPDATED CORS CONFIGURATION ---
// Whitelist the specific frontend origin.
const corsOptions = {
  origin: "https://whitechapel-works.vercel.app",
  credentials: true, // Allow cookies to be sent
};

// Use the cors middleware with the specific options
app.use(cors(corsOptions));
// This will now correctly handle OPTIONS preflight requests
// before they reach your other routes.
// --- END: UPDATED CORS CONFIGURATION ---

// Connect to database
await connectDB();

// Stripe Webhooks – must use raw body BEFORE express.json
app.post(
  "/api/stripe",
  express.raw({ type: "application/json" }),
  stripeWebhooks
);

// JSON body for all non-webhook routes
app.use(express.json());

// Optional: Logger to debug requests and origins
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  console.log("Request Origin:", req.headers.origin);
  console.log("Request Body:", req.body);
  next();
});

// Routes
app.get("/", (req, res) => res.send("Server is Live!"));
app.use("/api/user", userRouter);
app.use("/api/chat", chatRouter);
app.use("/api/message", messageRouter);
app.use("/api/credit", creditRouter);

// port number to start backend server
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});