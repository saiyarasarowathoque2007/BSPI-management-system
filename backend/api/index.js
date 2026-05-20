const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

const Routes = require("../routes/route.js");

app.use(express.json({ limit: "10mb" }));
app.use(cors());

const MONGO_URL = process.env.MONGO_URL;

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = {
    conn: null,
    promise: null,
  };
}

async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGO_URL, {
      bufferCommands: false,
      serverSelectionTimeoutMS: 30000,
    });
  }

  cached.conn = await cached.promise;

  console.log("MongoDB Connected");

  return cached.conn;
}

app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error(err);
    res.status(500).send("Database connection failed");
  }
});

app.use("/api", Routes);
app.get("/", (req, res) => {
  res.send("Backend Running Successfully");
});



module.exports = app;
