/**
 * seedReviews.js
 * ------------------------------------------------------------------
 * One-off script: generates 30-100 demo reviews per product.
 *   - Reviewer names are Indian, 70% female / 30% male
 *   - Ratings are 4 or 5 stars only
 *   - Comments are templated (no external API / no cost)
 *
 * Run from the Backend folder:
 *   node seed/seedReviews.js
 * or:
 *   npm run seed:reviews
 *
 * Safe to re-run: it only clears previously-seeded reviews (ones with
 * no orderId) before inserting new ones, so real customer reviews
 * (which always have an orderId) are never touched.
 * ------------------------------------------------------------------
 */

import 'dotenv/config';
import mongoose from 'mongoose';
import connectDB from '../config/mongodb.js';
import productModel from '../models/productModel.js';
import reviewModel from '../models/reviewModel.js';
import {
  generateReviewerIdentity,
  generateReviewComment,
  generateRating,
  randomPastDate,
  randomReviewCount,
} from '../services/reviewGenerator.js';

const run = async () => {
  console.log('Connecting to database...');
  await connectDB();

  const products = await productModel.find({});
  if (products.length === 0) {
    console.log('No products found — add some products first, then re-run this script.');
    await mongoose.disconnect();
    return;
  }

  console.log(`Found ${products.length} product(s). Clearing previously-seeded reviews...`);
  const deleted = await reviewModel.deleteMany({ orderId: { $exists: false } });
  console.log(`Removed ${deleted.deletedCount} old seeded review(s).`);

  let totalCreated = 0;
  const bulkDocs = [];

  for (const product of products) {
    const count = randomReviewCount(30, 100);
    for (let i = 0; i < count; i++) {
      const { name, gender } = generateReviewerIdentity();
      const rating = generateRating(); // 4 or 5 only
      bulkDocs.push({
        productId: product._id.toString(),
        name,
        gender,
        rating,
        comment: generateReviewComment(rating, product),
        verifiedPurchase: true,
        date: randomPastDate(180),
      });
    }
    console.log(`  ${product.name}: ${count} reviews queued`);
    totalCreated += count;
  }

  console.log(`Inserting ${totalCreated} reviews...`);
  await reviewModel.insertMany(bulkDocs);

  console.log(`Done! Seeded ${totalCreated} reviews across ${products.length} products.`);
  await mongoose.disconnect();
};

run().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
