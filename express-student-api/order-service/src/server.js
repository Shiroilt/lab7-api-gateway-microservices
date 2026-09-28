require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = Number(process.env.ORDER_SERVICE_PORT || process.env.PORT || 3003);
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://order-db:27017/orderdb";

const USER_SERVICE_URL =
  process.env.USER_SERVICE_URL || "http://user-service:3001";
const PRODUCT_SERVICE_URL =
  process.env.PRODUCT_SERVICE_URL || "http://product-service:3002";

const orderSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    productId: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    user: {
      id: String,
      name: String,
      email: String,
    },
    product: {
      id: String,
      name: String,
      price: Number,
    },
    total: { type: Number, required: true },
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);

async function getJson(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 3000);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
    });

    let body = null;
    try {
      body = await response.json();
    } catch (_err) {}

    return { response, body };
  } finally {
    clearTimeout(timeout);
  }
}

async function validateUser(userId) {
  try {
    const { response, body } = await getJson(
      `${USER_SERVICE_URL}/users/${encodeURIComponent(userId)}`
    );

    if (response.status === 404) {
      return { type: "not_found" };
    }

    if (!response.ok) {
      return { type: "unavailable" };
    }

    return { type: "ok", data: body };
  } catch (err) {
    return { type: "unavailable", error: err };
  }
}

async function validateProduct(productId) {
  try {
    const { response, body } = await getJson(
      `${PRODUCT_SERVICE_URL}/products/${encodeURIComponent(productId)}`
    );

    if (response.status === 404) {
      return { type: "not_found" };
    }

    if (!response.ok) {
      return { type: "unavailable" };
    }

    return { type: "ok", data: body };
  } catch (err) {
    return { type: "unavailable", error: err };
  }
}

app.get("/", (_req, res) => {
  res.json({ service: "order-service", status: "running" });
});

app.post("/orders", async (req, res) => {
  const { userId, productId, quantity } = req.body;

  if (!userId || !productId || quantity === undefined) {
    return res.status(400).json({
      error: "userId, productId and quantity are required",
    });
  }

  if (!Number.isInteger(quantity) || quantity < 1) {
    return res.status(400).json({
      error: "quantity must be a positive integer",
    });
  }

  const [userResult, productResult] = await Promise.all([
    validateUser(userId),
    validateProduct(productId),
  ]);

  if (userResult.type === "unavailable") {
    return res.status(503).json({
      error: "User service unavailable",
    });
  }

  if (productResult.type === "unavailable") {
    return res.status(503).json({
      error: "Product service unavailable",
    });
  }

  if (userResult.type === "not_found") {
    return res.status(404).json({
      error: "User not found",
    });
  }

  if (productResult.type === "not_found") {
    return res.status(404).json({
      error: "Product not found",
    });
  }

  const total = Number(productResult.data.price) * quantity;

  try {
    const order = await Order.create({
      userId,
      productId,
      quantity,
      user: {
        id: userResult.data._id,
        name: userResult.data.name,
        email: userResult.data.email,
      },
      product: {
        id: productResult.data._id,
        name: productResult.data.name,
        price: productResult.data.price,
      },
      total,
    });

    res.status(201).json(order);
  } catch (err) {
    console.error("Order creation failed:", err.message);
    res.status(500).json({ error: "Failed to create order" });
  }
});

app.get("/orders", async (_req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

app.get("/orders/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({ error: "Order not found" });
    }

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: "Order not found" });

    res.json(order);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch order" });
  }
});

async function start() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Order service: MongoDB connected");

    app.listen(PORT, () => {
      console.log(`Order service listening on port ${PORT}`);
      console.log(`User service URL: ${USER_SERVICE_URL}`);
      console.log(`Product service URL: ${PRODUCT_SERVICE_URL}`);
    });
  } catch (err) {
    console.error("Order service startup failed:", err.message);
    process.exit(1);
  }
}

start();
