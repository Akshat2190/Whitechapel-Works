import express from "express";
import {
  getPlans,
  purchasePlan,
  verifySession,
} from "../controllers/creditController.js";
import { protect } from "../middlewares/auth.js"; // fix path + named import

const router = express.Router();

router.get("/plan", getPlans);
router.post("/purchase", protect, purchasePlan); // use protect
router.post("/verify-session", protect, verifySession); // use protect

export default router;
