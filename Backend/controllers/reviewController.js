import reviewModel from "../models/reviewModel.js";
import orderModel from "../models/orderModel.js";
import userModel from "../models/userSchema.js";

// POST /api/review/list   { productId }  (public)
const listReviews = async (req, res) => {
    try {
        const { productId } = req.body;
        if (!productId) {
            return res.json({ success: false, message: "productId is required" });
        }

        const reviews = await reviewModel.find({ productId }).sort({ date: -1 });
        const count = reviews.length;
        const average = count === 0 ? 0 : reviews.reduce((sum, r) => sum + r.rating, 0) / count;

        // simple 5/4/3/2/1 breakdown for a rating bar chart on the frontend
        const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        reviews.forEach((r) => {
            breakdown[r.rating] = (breakdown[r.rating] || 0) + 1;
        });

        res.json({ success: true, reviews, count, average: Math.round(average * 10) / 10, breakdown });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// POST /api/review/add   { orderId, productId, rating, comment }  (authUser)
const addReview = async (req, res) => {
    try {
        const { userId, orderId, productId, rating, comment } = req.body;

        if (!orderId || !productId || !rating || !comment || !comment.trim()) {
            return res.json({ success: false, message: "orderId, productId, rating and comment are required" });
        }
        const numericRating = Number(rating);
        if (!numericRating || numericRating < 1 || numericRating > 5) {
            return res.json({ success: false, message: "Rating must be between 1 and 5" });
        }

        // Verify this order belongs to the user and actually contains the product
        const order = await orderModel.findOne({ _id: orderId, userId });
        if (!order) {
            return res.json({ success: false, message: "Order not found" });
        }
        const purchasedItem = order.items.find((item) => item._id === productId);
        if (!purchasedItem) {
            return res.json({ success: false, message: "This product wasn't part of that order" });
        }

        // One review per (order, product) — no duplicates
        const existing = await reviewModel.findOne({ orderId, productId, userId });
        if (existing) {
            return res.json({ success: false, message: "You've already reviewed this item for this order" });
        }

        const user = await userModel.findById(userId);

        const review = new reviewModel({
            productId,
            userId,
            orderId,
            name: (user && user.name) || "Anonymous",
            rating: numericRating,
            comment: comment.trim(),
            verifiedPurchase: true,
            date: Date.now(),
        });
        await review.save();

        res.json({ success: true, message: "Review submitted", review });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// POST /api/review/pending   {}  (authUser)
// Returns purchased items that don't have a review yet, so the frontend can pop the review modal.
const pendingReviews = async (req, res) => {
    try {
        const { userId } = req.body;

        const orders = await orderModel.find({ userId });
        const reviewed = await reviewModel.find({ userId }, "orderId productId");
        const reviewedKeys = new Set(reviewed.map((r) => `${r.orderId}:${r.productId}`));

        const pending = [];
        orders.forEach((order) => {
            order.items.forEach((item) => {
                const key = `${order._id}:${item._id}`;
                if (!reviewedKeys.has(key)) {
                    pending.push({
                        orderId: order._id,
                        productId: item._id,
                        name: item.name,
                        image: (item.images && item.images[0]) || null,
                    });
                }
            });
        });

        res.json({ success: true, pending });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

export { listReviews, addReview, pendingReviews };
