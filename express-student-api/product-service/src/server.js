require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = Number(process.env.PRODUCT_SERVICE_PORT || process.env.PORT || 3002);
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://product-db:27017/productdb";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);

app.get("/", (_req, res) => {
  res.json({ service: "product-service", status: "running" });
});

app.get("/products", async (_req, res) => {
  try {
    const products = await Product.find().sort({ _id: 1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

app.get("/products/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({ error: "Product not found" });
    }

    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });

    res.json(product);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch product" });
  }
});

app.post("/products", async (req, res) => {
  try {
    const { name, price } = req.body;

    if (!name || price === undefined) {
      return res.status(400).json({ error: "name and price are required" });
    }

    const product = await Product.create({ name, price });
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ error: "Failed to create product" });
  }
});

app.put("/products/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({ error: "Product not found" });
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { name: req.body.name, price: req.body.price },
      { new: true, runValidators: true }
    );

    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: "Failed to update product" });
  }
});

app.delete("/products/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({ error: "Product not found" });
    }

    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });

    res.json({ message: "Product deleted", id: product._id });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete product" });
  }
});

async function seedProducts() {
  const count = await Product.countDocuments();
  if (count > 0) return;

  await Product.insertMany([
    { name: "Laptop", price: 55000 },
    { name: "Mechanical Keyboard", price: 4500 },
    { name: "Wireless Mouse", price: 1200 },
  ]);

  console.log("Product service: sample products inserted");
}

async function start() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Product service: MongoDB connected");

    await seedProducts();

    app.listen(PORT, () => {
      console.log(`Product service listening on port ${PORT}`);
    });
  } catch (err) {
    console.error("Product service startup failed:", err.message);
    process.exit(1);
  }
}

start();
