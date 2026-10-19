import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { GoogleGenAI } from "@google/genai";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Try loading server/.env first, then root .env
dotenv.config({ path: path.join(__dirname, ".env") });
dotenv.config({ path: path.join(__dirname, "..", ".env") });

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// High-availability candidate models for 2026 Gemini API
const CANDIDATE_MODELS = [
  process.env.GEMINI_MODEL,
  "gemini-3.5-flash",
  "gemini-3.8-flash",
  "gemini-3.5-flash-lite"
].filter(Boolean);

// Enable CORS for all origins (allows Live Server, localhost, etc.)
app.use(cors());

// Parse JSON bodies (up to 10MB to support image uploads for scanning)
app.use(express.json({ limit: "10mb" }));

// Serve frontend static files from public or project root
app.use(express.static(path.join(__dirname, "..", "public")));
app.use(express.static(path.join(__dirname, "..")));

function getGeminiClient() {
  const apiKey = (process.env.GEMINI_API_KEY || "").trim();
  if (!apiKey || apiKey.startsWith("YOUR_") || apiKey === ".") {
    return null;
  }
  return new GoogleGenAI({ apiKey });
}

async function generateWithFallback(ai, options) {
  let lastError;
  for (const model of CANDIDATE_MODELS) {
    try {
      return await ai.models.generateContent({
        ...options,
        model
      });
    } catch (err) {
      console.warn(`Model ${model} failed (${err.status || err.message?.slice(0, 70)}). Trying fallback...`);
      lastError = err;
    }
  }
  throw lastError;
}

// Health check endpoint
app.get("/api/health", (req, res) => {
  const apiKey = (process.env.GEMINI_API_KEY || "").trim();
  const configured = Boolean(apiKey && !apiKey.startsWith("YOUR_") && apiKey !== ".");
  res.json({
    status: "ok",
    apiKeyConfigured: configured,
    primaryModel: CANDIDATE_MODELS[0],
    models: CANDIDATE_MODELS,
    message: configured
      ? "Smart Recycling Guide AI backend is ready with Gemini."
      : "Backend is running, but GEMINI_API_KEY is missing or invalid in server/.env."
  });
});

// AI Chatbot endpoint
app.post("/api/chat", async (req, res) => {
  try {
    const message = req.body?.message;

    if (typeof message !== "string" || !message.trim()) {
      return res.status(400).json({ error: "Please enter a message." });
    }

    if (message.length > 4000) {
      return res.status(400).json({ error: "Message must be under 4000 characters." });
    }

    const ai = getGeminiClient();
    if (!ai) {
      return res.status(503).json({
        error: "GEMINI_API_KEY is not configured or invalid in server/.env. Please update server/.env with your valid Gemini API key and restart the server."
      });
    }

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

    const response = await generateWithFallback(ai, {
      contents: systemPrompt
    });

    res.json({
      reply: response.text || "I was unable to generate a response. Please try asking again."
    });
  } catch (error) {
    console.error("Gemini API error in /api/chat:", error);
    res.status(500).json({
      error: error.message || "AI request failed. Please check your Gemini API key and quota."
    });
  }
});

// AI Waste Scanner endpoint (Vision analysis)
app.post("/api/scan", async (req, res) => {
  try {
    const { image, mimeType } = req.body || {};

    if (!image) {
      return res.status(400).json({ error: "No image data provided." });
    }

    const ai = getGeminiClient();
    if (!ai) {
      return res.status(503).json({
        error: "GEMINI_API_KEY is not configured or invalid in server/.env. Please configure your key to use AI image scanning."
      });
    }

    // Clean base64 data if it contains data URI prefix
    const cleanBase64 = image.replace(/^data:[^;]+;base64,/, "");
    const type = mimeType || "image/jpeg";

    const prompt = [
      "Analyze this image of a waste or recyclable item.",
      "Identify the item and classify its disposal method.",
      "Respond strictly in valid JSON matching this schema with no markdown code fences:",
      "{",
      '  "name": "Short item name with emoji, e.g. 🧴 Plastic Water Bottle",',
      '  "category": "One of: Organic, Paper & Cardboard, Plastic & Metal, Glass, E-waste & Special, Household Hazardous, or Check Local Rules",',
      '  "detail": "1-2 sentence description of what the item is and its typical recyclability.",',
      '  "prep": "Preparation steps (e.g., rinse thoroughly, flatten, remove sticker/lid).",',
      '  "safe": "Safety precautions (e.g., handle sharp edges, keep away from fire, do not inhale fumes)."',
      "}"
    ].join("\n");

    const response = await generateWithFallback(ai, {
      contents: [
        {
          inlineData: {
            mimeType: type,
            data: cleanBase64
          }
        },
        prompt
      ]
    });

    let text = (response.text || "").trim();
    // Strip markdown code block if present
    text = text.replace(/^```json\s*/i, "").replace(/^```\s*/, "").replace(/```$/, "").trim();

    try {
      const parsed = JSON.parse(text);
      res.json(parsed);
    } catch {
      // Fallback if AI didn't return strict JSON
      res.json({
        name: "Identified Waste Item",
        category: "Check Local Rules",
        detail: text,
        prep: "Clean and sort according to local waste guidelines.",
        safe: "Handle carefully and avoid contamination."
      });
    }
  } catch (error) {
    console.error("Gemini API error in /api/scan:", error);
    res.status(500).json({
      error: error.message || "Failed to analyze image with AI."
    });
  }
});

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`\n======================================================`);
    console.log(`  Smart Recycling Guide Backend`);
    console.log(`  Running on: http://localhost:${PORT}`);
    console.log(`  Health check: http://localhost:${PORT}/api/health`);
    console.log(`======================================================\n`);
  });
}

export default app;

