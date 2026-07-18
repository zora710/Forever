/**
 * reviewGenerator.js
 * ------------------------------------------------------------------
 * Local, offline generator for realistic-looking demo reviews:
 * Indian reviewer names (70% female / 30% male) + templated comments
 * that reference the actual product/category, at 4-5 star ratings.
 * No external API, no network calls.
 * ------------------------------------------------------------------
 */

const FEMALE_FIRST_NAMES = [
  "Priya", "Ananya", "Isha", "Neha", "Pooja", "Kavya", "Riya", "Sneha", "Divya", "Aditi",
  "Shreya", "Nisha", "Anjali", "Meera", "Tanvi", "Kritika", "Simran", "Aarohi", "Ishita", "Sanya",
  "Deepika", "Rashi", "Swati", "Vidya", "Ritu", "Manisha", "Sakshi", "Bhavna", "Radhika", "Nikita",
  "Payal", "Komal", "Yamini", "Charu", "Pallavi", "Lavanya", "Sonal", "Aishwarya", "Kirti", "Namrata",
  "Preeti", "Juhi", "Megha", "Vaishnavi", "Harshita", "Ruchi", "Shalini", "Akansha", "Gauri", "Tanya",
];

const MALE_FIRST_NAMES = [
  "Rohan", "Arjun", "Aman", "Vikram", "Rahul", "Aditya", "Karan", "Nikhil", "Siddharth", "Rajesh",
  "Amit", "Sandeep", "Manoj", "Vivek", "Ankit", "Suresh", "Deepak", "Anil", "Gaurav", "Vishal",
  "Abhishek", "Harsh", "Yash", "Sameer", "Naveen", "Kunal", "Varun", "Tarun", "Mohit", "Akash",
  "Rajat", "Pranav", "Ashish", "Ravi", "Sunil", "Nitin", "Rakesh", "Saurabh", "Arnav", "Dev",
];

const SURNAMES = [
  "Sharma", "Verma", "Gupta", "Iyer", "Nair", "Reddy", "Patel", "Mehta", "Singh", "Kapoor",
  "Chatterjee", "Bose", "Menon", "Rao", "Joshi", "Malhotra", "Kulkarni", "Desai", "Agarwal", "Bhatt",
  "Chopra", "Pillai", "Naidu", "Shetty", "Ghosh", "Mukherjee", "Trivedi", "Saxena", "Bansal", "Chauhan",
];

const FEMALE_RATIO = 0.7; // 70% female, 30% male

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickOne(arr) {
  return arr[randInt(0, arr.length - 1)];
}

/** Returns { name, gender } for one generated reviewer, respecting the 70/30 split. */
export function generateReviewerIdentity() {
  const gender = Math.random() < FEMALE_RATIO ? "female" : "male";
  const first = gender === "female" ? pickOne(FEMALE_FIRST_NAMES) : pickOne(MALE_FIRST_NAMES);
  const last = pickOne(SURNAMES);
  return { name: `${first} ${last}`, gender };
}

const FIVE_STAR_TEMPLATES = [
  "Absolutely loved this {thing}! The fit is perfect and the quality feels premium.",
  "Great purchase — {thing} exceeded my expectations. Highly recommend!",
  "Superb quality and really comfortable. Will definitely buy again.",
  "Exactly as shown in the pictures. Very happy with this buy.",
  "Amazing product for the price, the fabric quality is top notch.",
  "One of the best purchases I've made here. Fits perfectly and looks great.",
  "Really impressed with the quality — feels much more expensive than it is.",
  "Perfect fit, perfect fabric, fast delivery. Couldn't ask for more.",
  "This has become my favourite {thing}. Great value for money.",
  "Loved the material and stitching, everything about it feels well made.",
];

const FOUR_STAR_TEMPLATES = [
  "Good quality {thing}, fits well. Delivery was a little delayed though.",
  "Nice product overall, comfortable to wear. Colour is slightly different from the pictures.",
  "Decent purchase, good value for money. Would buy again.",
  "Quality is good but sizing runs a little small — I'd suggest ordering one size up.",
  "Happy with the product, would recommend it to others.",
  "Comfortable and looks good, just wish it came in more colours.",
  "Solid buy for the price, a couple of loose threads but nothing major.",
  "Fits true to size and feels durable. Packaging could be better.",
  "Good quality, took a bit long to arrive but worth the wait.",
  "Nice fabric and fit, satisfied with the purchase overall.",
];

function subjectWord(product) {
  const sub = (product && product.subCategory) || "";
  const map = {
    Topwear: "top",
    Bottomwear: "piece",
    Winterwear: "jacket",
  };
  return map[sub] || "product";
}

/** Generates one review comment string for a given rating (4 or 5) and product. */
export function generateReviewComment(rating, product) {
  const thing = subjectWord(product);
  const pool = rating >= 5 ? FIVE_STAR_TEMPLATES : FOUR_STAR_TEMPLATES;
  return pickOne(pool).replace("{thing}", thing);
}

/** Rating 4 or 5 only, weighted towards 5 stars (60% five-star, 40% four-star) for a realistic-but-positive spread. */
export function generateRating() {
  return Math.random() < 0.6 ? 5 : 4;
}

/** Random past timestamp within the last `days` days. */
export function randomPastDate(days = 180) {
  const now = Date.now();
  const past = now - randInt(0, days) * 24 * 60 * 60 * 1000;
  return past;
}

export function randomReviewCount(min = 30, max = 100) {
  return randInt(min, max);
}
