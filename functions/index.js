import { onCall } from "firebase-functions/v2/https";
import { GoogleGenerativeAI } from "@google/generative-ai";
import * as functions from "firebase-functions";

// API Key Gemini dari env (dotenv atau functions.config)
const genAI = new GoogleGenerativeAI(functions.config().gemini.key);

export const chiboAssistant = onCall(async (request) => {
  try {
    const message = request.data.message;
    if (!message) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Message is required"
      );
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(message);
    const responseText = result.response.text();

    return { response: responseText };
  } catch (error) {
    console.error("Error Gemini:", error);
    throw new functions.https.HttpsError(
      "internal",
      "Failed to connect to Gemini"
    );
  }
});
