import express from "express";
import { listReviews, addReview, pendingReviews } from "../controllers/reviewController.js";
import authUser from "../middleware/auth.js";

const reviewRouter = express.Router();

// Public: view reviews for a product
reviewRouter.post("/list", listReviews);

// Logged-in user: submit a review, check which purchased items still need one
reviewRouter.post("/add", authUser, addReview);
reviewRouter.post("/pending", authUser, pendingReviews);

export default reviewRouter;
