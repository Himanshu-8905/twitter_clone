import express from "express";
import { subscribeUser, confirmSubscription } from "../controllers/subscription.controller.js";

const router = express.Router();

// Route to subscribe a user
router.post("/subscribe", subscribeUser);

// ✅ Route to confirm subscription
router.post("/confirm-subscription", confirmSubscription);

export default router;
