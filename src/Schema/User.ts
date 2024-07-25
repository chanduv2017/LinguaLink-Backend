// models/User.js

import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  translations: [
    {
      inputText: { type: String, required: true },
      translatedText: { type: String, required: true },
      sourceLang: { type: String, required: true },
      targetLang: { type: String, required: true },
      createdAt: { type: Date, default: Date.now },
    },
  ],
});

const User = mongoose.model("User", userSchema);

export default User;
