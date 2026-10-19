import { GoogleGenAI } from "@google/genai";

const CANDIDATE_MODELS = [
  process.env.GEMINI_MODEL,
  "gemini-3.5-flash",
  "gemini-3.8-flash",
  "gemini-3.5-flash-lite"
].filter(Boolean);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed. Use POST." });
  }

  const apiKey = (process.env.GEMINI_API_KEY || "").trim();
  if (!apiKey || apiKey.startsWith("YOUR_") || apiKey === ".") {
    return res.status(503).json({
      error: "GEMINI_API_KEY is not configured in Vercel Environment Variables. Please add it in project settings."
    });
  }

  const message = req.body?.message;
  if (typeof message !== "string" || !message.trim()) {
    return res.status(400).json({ error: "Please enter a message." });
  }

  if (message.length > 4000) {
    return res.status(400).json({ error: "Message must be under 4000 characters." });
  }

  const ai = new GoogleGenAI({ apiKey });
  const systemPrompt = [
    "You are Eco-Buddy, the friendly and knowledgeable AI recycling assistant for Smart Recycling Guide.",
    "Explain recycling, composting, reuse, and safe disposal in simple, engaging, practical language with relevant emojis.",
    "Always include:",
    "1. Category / Bin type (e.g. Organic, Paper & Cardboard, Plastic & Metal, Glass, E-waste & Special, Household Hazardous)",
    "2. Preparation steps (e.g., rinse, flatten, remove caps/batteries)",
    "3. Safety advice (especially for hazardous, electrical, or chemical items)",
    "4. A brief note that local municipal recycling rules may vary.",
    "",
    "User question:",
    message.trim()
  ].join("\n");

  let lastError;
  for (const model of CANDIDATE_MODELS) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: systemPrompt
      });
      return res.status(200).json({
        reply: response.text || "I was unable to generate a response. Please try asking again."
      });
    } catch (err) {
      console.warn(`Model ${model} failed, trying fallback:`, err.message);
      lastError = err;
    }
  }

  return res.status(500).json({
    error: lastError?.message || "AI request failed. Please check your Gemini API key and quota."
  });
}
