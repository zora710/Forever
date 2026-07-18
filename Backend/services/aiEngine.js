/**
 * aiEngine.js
 * ------------------------------------------------------------------
 * Lightweight, fully-local "AI" engine for the store.
 * No external API keys, no per-request cost, no network calls at runtime.
 *
 * It combines:
 *  1. Rule-based NLU        -> pulls price ranges / category / type / intent
 *                               out of a natural-language query.
 *  2. TF-IDF + cosine sim.  -> ranks products by how well their text
 *     (via `natural`)          (name + category + description) matches
 *                               the free-text part of the query.
 *  3. Small template engine -> writes product descriptions and
 *                               chatbot replies from structured data.
 * ------------------------------------------------------------------
 */

import natural from "natural";

const { TfIdf } = natural;

/* ============================================================
   1. QUERY UNDERSTANDING (rule-based NLU)
   ============================================================ */

const CATEGORY_MAP = {
  men: "Men", man: "Men", mens: "Men", "men's": "Men", boy: "Men", boys: "Men",
  women: "Women", woman: "Women", womens: "Women", "women's": "Women",
  girl: "Women", girls: "Women", ladies: "Women", lady: "Women",
  kid: "Kids", kids: "Kids", "kid's": "Kids", child: "Kids", children: "Kids",
};

const SUBCATEGORY_MAP = {
  shirt: "Topwear", shirts: "Topwear", top: "Topwear", tops: "Topwear",
  tshirt: "Topwear", "t-shirt": "Topwear", tee: "Topwear", tees: "Topwear",
  hoodie: "Topwear", hoodies: "Topwear", sweater: "Topwear", sweaters: "Topwear",
  blouse: "Topwear",

  jean: "Bottomwear", jeans: "Bottomwear", pant: "Bottomwear", pants: "Bottomwear",
  trouser: "Bottomwear", trousers: "Bottomwear", shorts: "Bottomwear",
  skirt: "Bottomwear", skirts: "Bottomwear", joggers: "Bottomwear",

  jacket: "Winterwear", jackets: "Winterwear", coat: "Winterwear", coats: "Winterwear",
  sweatshirt: "Winterwear", sweatshirts: "Winterwear", winter: "Winterwear",
  hoodiejacket: "Winterwear", puffer: "Winterwear",
};

function parseFilters(rawQuery) {
  const q = ` ${rawQuery.toLowerCase()} `;
  const filters = {
    minPrice: null,
    maxPrice: null,
    category: null,
    subCategory: null,
    bestsellerOnly: false,
    sortHint: null,
  };

  let m;
  if ((m = q.match(/between\s*(?:rs\.?|inr|₹)?\s*(\d+)\s*(?:and|to|-)\s*(?:rs\.?|inr|₹)?\s*(\d+)/))) {
    filters.minPrice = Number(m[1]);
    filters.maxPrice = Number(m[2]);
  } else {
    if ((m = q.match(/(?:under|below|less than)\s*(?:rs\.?|inr|₹)?\s*(\d+)/))) {
      filters.maxPrice = Number(m[1]);
    }
    if ((m = q.match(/(?:over|above|more than)\s*(?:rs\.?|inr|₹)?\s*(\d+)/))) {
      filters.minPrice = Number(m[1]);
    }
  }

  if (/\b(cheap|budget|affordable|inexpensive|low price)\b/.test(q)) filters.sortHint = "low-high";
  if (/\b(premium|expensive|luxury|high[- ]end)\b/.test(q)) filters.sortHint = "high-low";
  if (/\b(best ?seller|bestsellers|popular|trending)\b/.test(q)) filters.bestsellerOnly = true;

  for (const key of Object.keys(CATEGORY_MAP)) {
    if (new RegExp(`\\b${key}\\b`).test(q)) {
      filters.category = CATEGORY_MAP[key];
      break;
    }
  }
  for (const key of Object.keys(SUBCATEGORY_MAP)) {
    if (new RegExp(`\\b${key}\\b`).test(q)) {
      filters.subCategory = SUBCATEGORY_MAP[key];
      break;
    }
  }

  return filters;
}

/* ============================================================
   2. SEMANTIC RANKING (TF-IDF cosine-style scoring)
   ============================================================ */

function productText(p) {
  const cat = Array.isArray(p.category) ? p.category.join(" ") : p.category || "";
  return [p.name, cat, p.subCategory, p.description].filter(Boolean).join(" ");
}

function semanticScores(query, products) {
  const tfidf = new TfIdf();
  products.forEach((p) => tfidf.addDocument(productText(p)));
  const scores = new Array(products.length).fill(0);
  tfidf.tfidfs(query, (i, measure) => {
    scores[i] = measure || 0;
  });
  return scores;
}

function applyHardFilters(products, filters) {
  let out = products;
  if (filters.category) {
    out = out.filter((p) =>
      Array.isArray(p.category) ? p.category.includes(filters.category) : p.category === filters.category
    );
  }
  if (filters.subCategory) out = out.filter((p) => p.subCategory === filters.subCategory);
  if (filters.minPrice != null) out = out.filter((p) => p.price >= filters.minPrice);
  if (filters.maxPrice != null) out = out.filter((p) => p.price <= filters.maxPrice);
  if (filters.bestsellerOnly) out = out.filter((p) => p.bestseller);
  return out;
}

/**
 * Main entry point: natural-language product search.
 * Progressively relaxes filters if nothing matches so the user never
 * gets a hard empty result for a slightly-too-specific query.
 */
export function smartSearch(query, allProducts, { limit = 24 } = {}) {
  const filters = parseFilters(query || "");
  const plain = allProducts.map((p) => (p.toObject ? p.toObject() : p));

  let candidates = applyHardFilters(plain, filters);
  let relaxed = false;

  if (candidates.length === 0) {
    // relax sub-category first, then category, keep price/bestseller
    const relaxedFilters = { ...filters, subCategory: null };
    candidates = applyHardFilters(plain, relaxedFilters);
    if (candidates.length === 0) {
      candidates = applyHardFilters(plain, { ...relaxedFilters, category: null });
    }
    relaxed = candidates.length !== plain.length;
  }
  if (candidates.length === 0) candidates = plain;

  const scores = semanticScores(query || "", candidates);
  let ranked = candidates.map((p, i) => ({ ...p, _score: scores[i] }));

  if (filters.sortHint === "low-high") {
    ranked.sort((a, b) => a.price - b.price);
  } else if (filters.sortHint === "high-low") {
    ranked.sort((a, b) => b.price - a.price);
  } else {
    ranked.sort((a, b) => b._score - a._score);
  }

  return { filters, relaxed, results: ranked.slice(0, limit) };
}

/* ============================================================
   3. AUTO PRODUCT DESCRIPTION GENERATOR (templated NLG)
   ============================================================ */

const OPENERS = [
  "Introducing the {name} — designed to make everyday wear feel effortless.",
  "Meet the {name}, crafted for comfort without compromising on style.",
  "The {name} blends everyday comfort with a look that works anywhere.",
  "Say hello to the {name}, a wardrobe staple built to last.",
  "The {name} is here to prove that comfort and style don't have to compete.",
];

const CATEGORY_LINES = {
  Men: "Tailored with a modern fit that suits the everyday man on the move.",
  Women: "Designed with a flattering silhouette for effortless everyday style.",
  Kids: "Made with soft, durable fabric that's perfect for active little ones.",
};

const SUBCATEGORY_LINES = {
  Topwear: "Breathable fabric keeps you cool while the fit keeps you sharp.",
  Bottomwear: "A relaxed yet tailored fit that moves with you all day long.",
  Winterwear: "Layered for warmth without the bulk, built for the colder days ahead.",
};

const CLOSERS = [
  "Pair it with your favourite basics for an instant style upgrade.",
  "A versatile piece you'll reach for again and again.",
  "Whether it's a casual day out or a quick errand run, this piece has you covered.",
  "Easy to style, easy to love — this one's built to become a fast favourite.",
];

function pick(arr, seed) {
  return arr[Math.abs(seed) % arr.length];
}

function priceLine(price) {
  const n = Number(price);
  if (!n || Number.isNaN(n)) return "";
  if (n <= 499) return "Priced to be an easy, guilt-free addition to your wardrobe.";
  if (n <= 1499) return "Great everyday value without cutting corners on quality.";
  return "A premium pick for anyone who wants quality that lasts.";
}

function sizeLine(sizes) {
  if (!sizes || sizes.length === 0) return "";
  return `Available in sizes ${sizes.join(", ")}, so it's easy to find your perfect fit.`;
}

function seedFrom(str) {
  let h = 0;
  for (let i = 0; i < (str || "").length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return h;
}

export function generateDescription({ name, category, subCategory, price, sizes }) {
  const seed = seedFrom(`${name || ""}${subCategory || ""}`);
  const opener = pick(OPENERS, seed).replace("{name}", name || "this product");
  const catLine = CATEGORY_LINES[category] || "";
  const subLine = SUBCATEGORY_LINES[subCategory] || "";
  const pLine = priceLine(price);
  const sLine = sizeLine(sizes);
  const closer = pick(CLOSERS, seed + 7);

  return [opener, [catLine, subLine].filter(Boolean).join(" "), [sLine, pLine].filter(Boolean).join(" "), closer]
    .filter(Boolean)
    .join(" ");
}

/* ============================================================
   4. CHATBOT (intent rules + smartSearch for product intents)
   ============================================================ */

const GREETING_RE = /\b(hi|hello|hey|good morning|good evening|good afternoon)\b/;
const THANKS_RE = /\b(thanks|thank you|thx|thankyou)\b/;
const SHIPPING_RE = /\b(shipping|delivery|deliver|dispatch)\b/;
const RETURNS_RE = /\b(return|returns|refund|exchange)\b/;
const ORDER_STATUS_RE = /\b(order status|track (my )?order|where is my order)\b/;
const SIZE_HELP_RE = /\b(size guide|which size|size chart|sizing|fits?|fit)\b/;

export function chatReply(message, allProducts) {
  const q = (message || "").toLowerCase().trim();

  if (!q) {
    return { reply: "I didn't quite catch that — what are you looking for today?", products: [] };
  }
  if (GREETING_RE.test(q) && q.length < 40) {
    return {
      reply:
        "Hey there! 👋 I'm your shopping assistant. Try something like \"warm jacket under 2000\" or \"cotton shirts for men\" and I'll find it for you.",
      products: [],
    };
  }
  if (THANKS_RE.test(q)) {
    return { reply: "You're welcome! Let me know if you want help finding anything else. 🙂", products: [] };
  }
  if (SHIPPING_RE.test(q)) {
    return {
      reply:
        "Orders are usually dispatched within 1-2 business days, with delivery taking about 3-7 days depending on your location. A flat delivery fee applies at checkout.",
      products: [],
    };
  }
  if (RETURNS_RE.test(q)) {
    return {
      reply:
        "Items can be returned or exchanged within 7 days of delivery, as long as they're unused and in original packaging. Head to the 'Orders' page to start one.",
      products: [],
    };
  }
  if (ORDER_STATUS_RE.test(q)) {
    return { reply: "You can check the live status of your orders anytime from the 'Orders' page after logging in.", products: [] };
  }
  if (SIZE_HELP_RE.test(q) && !SUBCATEGORY_MAP[q]) {
    return {
      reply:
        "Most of our products run true to size (S–XXL). If you're between sizes, we'd suggest sizing up for a more relaxed fit.",
      products: [],
    };
  }

  // Otherwise: treat it as a product search
  const { results, filters } = smartSearch(q, allProducts, { limit: 5 });
  const meaningful = results.filter(
    (r) => r._score > 0 || filters.category || filters.subCategory || filters.maxPrice != null || filters.minPrice != null
  );

  if (meaningful.length === 0) {
    return {
      reply:
        "I couldn't find anything matching that. Try mentioning a category (men/women/kids), a type (shirt, jacket, jeans) or a budget, like \"jackets for women under 1500\".",
      products: [],
    };
  }

  const bits = [];
  if (filters.category) bits.push(filters.category.toLowerCase());
  if (filters.subCategory) bits.push(filters.subCategory.toLowerCase());
  if (filters.maxPrice != null) bits.push(`under ₹${filters.maxPrice}`);
  if (filters.minPrice != null) bits.push(`above ₹${filters.minPrice}`);

  const reply = bits.length ? `Here's what I found for ${bits.join(" ")}:` : "Here's what I found for you:";

  return {
    reply,
    products: meaningful.map((p) => ({
      _id: p._id,
      name: p.name,
      price: p.price,
      image: (p.images && p.images[0]) || null,
    })),
  };
}
