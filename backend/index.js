const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// importing modules
const userModel = require("./models/userModel");
const foodModel = require("./models/foodModel");
const verifyToken = require("./models/verifyToken");
const trackingModel = require("./models/trackingModel");

// database connection
mongoose.connect("mongodb://localhost:27017/nutrify")
  .then(() => {
    console.log("Database Connection Successful");
  })
  .catch((err) => {
    console.log(err);
  });

const app = express();

app.use(express.json());

// Allow the local Vite frontend to communicate with this API.
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  }

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  next();
});

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET || JWT_SECRET.length < 32) {
  throw new Error("Please set JWT_SECRET in the backend .env file (at least 32 characters).");
}

// Convert the date sent by the frontend into the existing DD/MM/YYYY database format.
function formatEatenDate(dateValue) {
  let day;
  let month;
  let year;

  if (/^\d{4}-\d{1,2}-\d{1,2}$/.test(dateValue)) {
    [year, month, day] = dateValue.split("-").map(Number);
  } else if (/^\d{1,2}-\d{1,2}-\d{4}$/.test(dateValue)) {
    [month, day, year] = dateValue.split("-").map(Number);
  } else {
    const parsedDate = new Date(dateValue);
    if (Number.isNaN(parsedDate.getTime())) return null;
    day = parsedDate.getDate();
    month = parsedDate.getMonth() + 1;
    year = parsedDate.getFullYear();
  }

  const parsedDate = new Date(year, month - 1, day);
  if (
    parsedDate.getFullYear() !== year ||
    parsedDate.getMonth() !== month - 1 ||
    parsedDate.getDate() !== day
  ) {
    return null;
  }

  return `${String(day).padStart(2, "0")}/${String(month).padStart(2, "0")}/${year}`;
}

// Endpoint For User Registeration
app.post("/register", async (req, res) => {
  const user = req.body;

  if (!user.name || !user.email || !user.password || user.age === undefined) {
    return res.status(400).send({ message: "Please provide all required fields" });
  }

  if (Number(user.age) < 18) {
    return res.status(400).send({ message: "Age must be at least 18" });
  }

  try {
    const existingUser = await userModel.findOne({ email: user.email });
    if (existingUser) {
      return res.status(409).send({ message: "Email is already registered" });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
    user.age = Number(user.age);

    await userModel.create(user);
    res.status(201).send({ message: "User Registeration Successful" });
  } catch (err) {
    console.log(err);
    if (err.code === 11000) {
      return res.status(409).send({ message: "Email is already registered" });
    }
    res.status(500).send({ message: "Some Problem Occured" });
  }
});

// Endpoint For User Login
app.post("/login", async (req, res) => {
  const userCred = req.body;

  try {
    const user = await userModel.findOne({ email: userCred.email });

    if (user == null) {
      return res.status(404).send({ message: "User Not Found" });
    }

    const result = await bcrypt.compare(userCred.password || "", user.password);
    if (!result) {
      return res.status(401).send({ message: "Incorrect Password" });
    }

    const token = jwt.sign(
      { userId: user._id.toString(), email: user.email },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.send({
      message: "Login Successful",
      token: token,
      userid: user._id.toString()
    });
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: "Some Problem Occured" });
  }
});

// Endpoint To Fetch All Foods
app.get("/foods", verifyToken, async (req, res) => {
  try {
    const foods = await foodModel.find();
    res.send(foods);
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: "Some Problem Occured" });
  }
});

// Endpoint To Search Food By Name
app.get("/foods/:name", verifyToken, async (req, res) => {
  try {
    const food = await foodModel.find({
      name: { $regex: req.params.name, $options: "i" }
    });

    if (food.length !== 0) {
      res.send(food);
    } else {
      res.status(404).send({ message: "Food Not Found" });
    }
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: "Some Problem Occured" });
  }
});

// Endpoint to track food
app.post("/track", verifyToken, async (req, res) => {
  const { foodId, quantity } = req.body;

  if (!foodId || !mongoose.isValidObjectId(foodId) || !Number.isFinite(Number(quantity)) || Number(quantity) < 1) {
    return res.status(400).send({ message: "Please provide a valid food and quantity" });
  }

  try {
    const food = await foodModel.findById(foodId);
    if (!food) {
      return res.status(404).send({ message: "Food Not Found" });
    }

    // The userId always comes from the verified token, not from the request body.
    await trackingModel.create({
      userId: req.user.userId,
      foodId: foodId,
      quantity: Number(quantity)
    });

    res.status(201).send({ message: "Food Added" });
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: "Some Problem Occured" });
  }
});

// Endpoint to get all foods eaten by a person
app.get("/track/:userid/:date", verifyToken, async (req, res) => {
  const requestedUserId = req.params.userid;

  if (!mongoose.isValidObjectId(requestedUserId)) {
    return res.status(400).send({ message: "Invalid User ID" });
  }

  if (requestedUserId !== req.user.userId) {
    return res.status(403).send({ message: "You cannot access another user's tracking records" });
  }

  const strDate = formatEatenDate(req.params.date);
  if (!strDate) {
    return res.status(400).send({ message: "Invalid date" });
  }

  try {
    const foods = await trackingModel
      .find({ userId: req.user.userId, eatenDate: strDate })
      .populate("foodId");

    res.send(foods);
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: "Some Problem Occured" });
  }
});

app.listen(8000, () => {
  console.log("Server Up and Running");
});
