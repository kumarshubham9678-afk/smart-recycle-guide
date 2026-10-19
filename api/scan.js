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

  const { image, mimeType } = req.body || {};
  if (!image) {
    return res.status(400).json({ error: "No image data provided." });
  }

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

  const ai = new GoogleGenAI({ apiKey });
  let lastError;
  for (const model of CANDIDATE_MODELS) {
    try {
      const response = await ai.models.generateContent({
        model,
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
      text = text.replace(/^```json\s*/i, "").replace(/^```\s*/, "").replace(/```$/, "").trim();

      try {
        const parsed = JSON.parse(text);
        return res.status(200).json(parsed);
      } catch {
        return res.status(200).json({
          name: "Identified Waste Item",
          category: "Check Local Rules",
          detail: text,
          prep: "Clean and sort according to local waste guidelines.",
          safe: "Handle carefully and avoid contamination."
        });
      }
    } catch (err) {
      console.warn(`Model ${model} failed, trying fallback:`, err.message);
      lastError = err;
    }
  }

  return res.status(500).json({
    error: lastError?.message || "Failed to analyze image with AI."
  });
}
