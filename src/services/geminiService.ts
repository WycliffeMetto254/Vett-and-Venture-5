import { GoogleGenerativeAI } from "@google/generative-ai";

// Accessing the secret key you'll put in Vercel
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(API_KEY);

export const askGemini = async (prompt: string) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error("Gemini Error:", error);
    return "AI Studio connection error. Please verify your Vercel API key.";
  }
};
