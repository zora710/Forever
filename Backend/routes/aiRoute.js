import express from "express";
import { search, chat, generateProductDescription } from "../controllers/aiController.js";
import adminAuth from "../middleware/adminAuth.js";

const aiRouter = express.Router();

// Public: customer-facing smart search & chatbot
aiRouter.post("/search", search);
aiRouter.post("/chat", chat);

// Admin only: auto-generate a product description
aiRouter.post("/generate-description", adminAuth, generateProductDescription);

export default aiRouter;
