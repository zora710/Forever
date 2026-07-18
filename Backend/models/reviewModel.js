import mongoose from 'mongoose'

const reviewSchema = new mongoose.Schema({
    productId: { type: String, required: true, index: true },
    userId: { type: String }, // present for real user-submitted reviews, absent for seeded ones
    orderId: { type: String }, // present for real user-submitted reviews (ties review to a purchase)
    name: { type: String, required: true },
    gender: { type: String, enum: ['female', 'male'] },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
    verifiedPurchase: { type: Boolean, default: false },
    date: { type: Number, required: true }
})

const reviewModel = mongoose.models.review || mongoose.model("review", reviewSchema)

export default reviewModel
