const bcrypt = require("bcrypt");
const bodyParser = require("body-parser");

import express, { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import cors from "cors";
import generateToken from "./generateToken";
import User from "./Schema/User"
import verifyToken from "./verifyToken";
const translateText = require("./translate");
const getUsernameFromToken = require("./usernameFromToken.ts");

import "dotenv/config";

const app = express();

app.use(cors());

app.use(bodyParser.json());

mongoose
  .connect(process.env.MONGODB_CONNECTION_STRING as string)
  .then(() => console.log("connected to database"));


app.post("/signup", async (req: Request, res: Response) => {
  try {
    const { username,email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username,email, password: hashedPassword });
    await user.save();
    res.status(200).json({ ok: true, message: "User created successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ ok: false, message: "Error signing up user" });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(404).json({ ok: false, message: "User not found" });
    }
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ ok: false, message: "Invalid password" });
    }
    const token = generateToken(user.username); // Generate JWT token
    res
      .status(200)
      .json({ ok: true, token: token, message: "Login successful" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, message: "Error logging in" });
  }
});

app.post("/translate", verifyToken, async (req, res) => {
  // Get input, source, and destination text from the request body
  const { inputText, sourceLang, targetLang } = req.body;

  // Check if all required fields are present
  if (!inputText || !sourceLang || !targetLang) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  const token = req.headers.authorization;
  const username = getUsernameFromToken(token);
  try {
    const translatedText = await translateText(
      inputText,
      sourceLang,
      targetLang
    );

    const user = await User.findOne({ username: username });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    user.translations.push({
      inputText: inputText,
      translatedText: translatedText,
      sourceLang: sourceLang,
      targetLang: targetLang,
    });
    await user.save();

    return res.status(200).json({
      ok: true,
      inputText: inputText,
      translatedText: translatedText,
      sourceLang: sourceLang,
      targetLang: targetLang,
      message: "Translation saved to user's document successfully",
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/checkHistory", verifyToken, async (req, res) => {
  try {
    // Find the user by username
    const token = req.headers.authorization;
    const username = getUsernameFromToken(token);
    const user = await User.findOne({ username: username });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Retrieve translation history from the user document
    const translationHistory = user.translations;

    return res.status(200).json({ translationHistory: translationHistory });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});