import productModel from "../models/productModel.js";
import { smartSearch, generateDescription, chatReply } from "../services/aiEngine.js";

// POST /api/ai/search  { query }
const search = async (req, res) => {
  try {
    const { query } = req.body;
    if (!query || !query.trim()) {
      return res.json({ success: false, message: "Query is required" });
    }
    const products = await productModel.find({});
    const { results, filters, relaxed } = smartSearch(query, products);
    res.json({ success: true, results, filters, relaxed });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// POST /api/ai/chat  { message }
const chat = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message || !message.trim()) {
      return res.json({ success: false, message: "Message is required" });
    }
    const products = await productModel.find({});
    const { reply, products: matched } = chatReply(message, products);
    res.json({ success: true, reply, products: matched });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// POST /api/ai/generate-description  { name, category, subCategory, price, sizes } (adminAuth)
const generateProductDescription = async (req, res) => {
  try {
    const { name, category, subCategory, price, sizes } = req.body;
    if (!name || !name.trim()) {
      return res.json({ success: false, message: "Product name is required" });
    }
    let parsedSizes = sizes;
    if (typeof sizes === "string") {
      try {
        parsedSizes = JSON.parse(sizes);
      } catch {
        parsedSizes = [];
      }
    }
    const description = generateDescription({ name, category, subCategory, price, sizes: parsedSizes });
    res.json({ success: true, description });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

export { search, chat, generateProductDescription };
