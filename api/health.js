export default function handler(req, res) {
  const apiKey = (process.env.GEMINI_API_KEY || "").trim();
  const configured = Boolean(apiKey && !apiKey.startsWith("YOUR_") && apiKey !== ".");
  res.status(200).json({
    status: "ok",
    apiKeyConfigured: configured,
    message: configured
      ? "Smart Recycling Guide AI backend is ready with Gemini."
      : "Backend is running on Vercel, but GEMINI_API_KEY is missing in Environment Variables."
  });
}
