import express, { Request, Response } from "express";
import mongoose from "mongoose";
import cors from "cors";
import bcrypt from "bcrypt";
import bodyParser from "body-parser";
import generateToken from "./generateToken";
import User from "./Schema/User";
import verifyToken from "./verifyToken";
import translateText from "./translate";
import getUsernameFromToken from "./usernameFromToken";
import "dotenv/config";

const app = express();
app.use(cors());
app.use(bodyParser.json());

mongoose
  .connect(process.env.MONGODB_CONNECTION_STRING as string)
  .then(() => console.log("Connected to database"))
  .catch((error) => console.error("Database connection error:", error));

app.post("/signup", async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, email, password: hashedPassword });
    await user.save();
    return res.status(200).json({ message: "User created successfully" });
  } catch (error) {
    console.error("Signup error:", error);
    return res.status(500).json({ message: "Error signing up user" });
  }
});

app.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({message: "Invalid password" });
    }
    const token = generateToken(user.username);
    return res.status(200).json({ token, message: "Login successful" });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Error logging in" });
  }
});

app.post("/translate", verifyToken, async (req: Request, res: Response) => {
  const { inputText, sourceLang, targetLang } = req.body;
  if (!inputText || !sourceLang || !targetLang) {
    console.error("Missing required fields")
    return res.status(400).json({ "error": "Missing required fields" });
  }

  const username = req.body.userId;
  console.log(username)
  try {
    const translatedText = await translateText({ inputText, sourceLang, targetLang });
    const user = await User.findOne({ username });
    
    if (!user) {
      console.error("User not found")
      res.status(404).json({ "error": "User not found" });
      return ;
    }

    user.translations.push({ inputText, translatedText, sourceLang, targetLang });
    await user.save();

    return res.status(200).json({
      ok: true,
      inputText,
      translatedText,
      sourceLang,
      targetLang,
      message: "Translation saved to user's document successfully",
    });
  } catch (error) {
    console.error("Translation error:", error);
    return res.status(500).json({ "error": "Internal server error" });
  }
});

app.get("/checkHistory", verifyToken, async (req: Request, res: Response) => {
  try {
    const username = req.body.userId;
    const user = await User.findOne({ username });

    if (!user) {
      console.error("User not found")
      return res.status(404).json({ error: "User not found" });
    }

    const translationHistory = user.translations;
    // console.log(translationHistory)
    return res.status(200).json({ translationHistory });
  } catch (error) {
    console.error("History check error");
    return res.status(500).json({ "error": "Internal server error" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
