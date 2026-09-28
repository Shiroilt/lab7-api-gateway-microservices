require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = Number(process.env.USER_SERVICE_PORT || process.env.PORT || 3001);
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://user-db:27017/userdb";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

app.get("/", (_req, res) => {
  res.json({ service: "user-service", status: "running" });
});

app.get("/users", async (_req, res) => {
  try {
    const users = await User.find().sort({ _id: 1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

app.get("/users/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({ error: "User not found" });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

app.post("/users", async (req, res) => {
  try {
    const { name, email } = req.body;

    if (!name || !email) {
      return res.status(400).json({ error: "name and email are required" });
    }

    const user = await User.create({ name, email });
    res.status(201).json(user);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ error: "Email already exists" });
    }
    res.status(500).json({ error: "Failed to create user" });
  }
});

app.put("/users/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({ error: "User not found" });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name: req.body.name, email: req.body.email },
      { new: true, runValidators: true }
    );

    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ error: "Email already exists" });
    }
    res.status(500).json({ error: "Failed to update user" });
  }
});

app.delete("/users/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({ error: "User not found" });
    }

    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    res.json({ message: "User deleted", id: user._id });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete user" });
  }
});

async function seedUsers() {
  const count = await User.countDocuments();
  if (count > 0) return;

  await User.insertMany([
    { name: "Aarav Patel", email: "aarav@example.com" },
    { name: "Diya Shah", email: "diya@example.com" },
  ]);

  console.log("User service: sample users inserted");
}

async function start() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("User service: MongoDB connected");

    await seedUsers();

    app.listen(PORT, () => {
      console.log(`User service listening on port ${PORT}`);
    });
  } catch (err) {
    console.error("User service startup failed:", err.message);
    process.exit(1);
  }
}

start();
