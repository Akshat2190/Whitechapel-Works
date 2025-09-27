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

// --- CORRECT CORS CONFIGURATION ---
// This explicitly allows your frontend to connect.
const corsOptions = {
  origin: "https://whitechapel-works.vercel.app",
  credentials: true,
};
app.use(cors(corsOptions));
// --- END ---

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

// Logger to debug requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
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