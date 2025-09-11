import { onRequest } from "firebase-functions/v2/https";
import express from "express";
import cors from "cors";
import { GoogleGenerativeAI } from "@google/generative-ai";
import functions from "firebase-functions";

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

// API Key Gemini dari environment
const genAI = new GoogleGenerativeAI(functions.config().gemini.key);

app.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(message);
    const responseText = result.response.text();

    res.json({ text: responseText });
  } catch (error) {
    console.error("Error Gemini:", error);
    res.status(500).json({ error: "Failed to connect to Gemini" });
  }
});

export const api = onRequest(app);
