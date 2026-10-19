# ♻️ Smart Recycling Guide

> **Recycle Smarter, Live Greener!**  
> An interactive, AI-powered web platform designed to make recycling intuitive, educational, and engaging through generative AI, computer vision waste scanning, interactive gamification, and comprehensive disposal guides.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Vercel-success?style=for-the-badge&logo=vercel)](https://smart-recycle-guide.vercel.app)
[![GitHub Repository](https://img.shields.io/badge/GitHub-Repository-181717?style=for-the-badge&logo=github)](https://github.com/kumarshubham9678-afk/smart-recycle-guide)
[![AI Powered](https://img.shields.io/badge/AI-Google%20Gemini%203.5-4285F4?style=for-the-badge&logo=google)](https://ai.google.dev/)

---

## 🌐 Live Website
- **Live Deployment:** [https://smart-recycle-guide.vercel.app](https://smart-recycle-guide.vercel.app)
- **Source Code:** [https://github.com/kumarshubham9678-afk/smart-recycle-guide](https://github.com/kumarshubham9678-afk/smart-recycle-guide)

---

## ✨ Features

### 1. 🤖 AI Eco-Buddy Chatbot (`assistant.html`)
- Powered by **Google Gemini 3.5 Flash** via serverless API (`/api/chat`).
- Answers questions about recycling, composting, e-waste, hazardous materials, and reuse.
- Provides actionable steps: exact bin classification, preparation tips (rinsing, removing lids/caps), and handling safety.
- Graceful offline fallback: if offline or without an API key, it seamlessly falls back to a built-in local educational knowledge base.

### 2. 📸 Smart AI Waste Scanner (`scanner.html`)
- Multimodal computer vision analysis via `/api/scan`.
- Snap a photo or upload an image of any waste item: Gemini AI analyzes the picture, identifies the material, and categorizes it instantly.
- Returns detailed preparation instructions (e.g. *rinse thoroughly, flatten*) and safety precautions.

### 3. 🎯 Waste Quest Challenge (`game.html`)
- 60-second fast-paced waste sorting arcade game.
- Tests sorting skills across 5 categories: Organic, Paper & Cardboard, Plastic & Metal, Glass, and E-waste.
- Supports keyboard shortcuts (`1` to `5`) and mouse/touch controls.
- Real-time scoring, accuracy rating, personal best records, and unlockable achievement badges.

### 4. 📚 Comprehensive Recycling Guide (`guide.html`)
- Searchable and category-filterable directory of everyday household items.
- Clear disposal instructions, preparation guidelines, and environmental impact notes.

### 5. 🌱 My Eco Dashboard (`dashboard.html`)
- Tracks user learning progress, waste sorting statistics, high scores, eco-points, and unlocked badges.
- Data is saved securely in the browser's `localStorage` — no sign-up or tracking needed.

### 6. 🌙 Dark / Light Theme
- Fully responsive theme toggle with smooth transitions and persistent state across all pages.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | HTML5, CSS3 (Modern Flexbox & Grid, CSS Variables), Vanilla JavaScript (ES6+) |
| **AI Integration** | Google Gemini 3.5 Flash (`@google/genai` SDK) with multi-model fallback |
| **Serverless Backend** | Vercel Serverless Functions (`/api/chat`, `/api/scan`, `/api/health`) |
| **Local Development** | Node.js, Express 5, CORS, Dotenv |
| **Deployment** | Vercel (`smart-recycle-guide.vercel.app`) |

---

## 📂 Project Structure

```text
smart-recycle-guide/
├── api/
│   ├── chat.js              # Vercel Serverless function: AI Chatbot (Gemini)
│   ├── scan.js              # Vercel Serverless function: Image Vision Scanner (Gemini)
│   └── health.js            # Health check endpoint
├── server/
│   ├── server.js            # Express server for local development
│   └── .env.example         # Environment template
├── index.html               # Homepage & overview
├── assistant.html           # AI Eco-Buddy chat interface
├── scanner.html             # Smart camera / image waste scanner
├── game.html                # 60-second Waste Quest sorting game
├── guide.html               # Searchable recycling reference directory
├── dashboard.html           # User stats, points, and achievement badges
├── about.html               # Project background and team information
├── styles.css               # Core responsive stylesheet with theme variables
├── app.js                   # Client-side routing, AI assistant & scanner logic
├── vercel.json              # Vercel deployment configuration
└── package.json             # Node dependencies and scripts
```

---

## 🚀 Getting Started Locally

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- A Google Gemini API key from [Google AI Studio](https://aistudio.google.com/)

### 1. Clone the repository
```bash
git clone https://github.com/kumarshubham9678-afk/smart-recycle-guide.git
cd smart-recycle-guide
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure your API key
Create a `.env` file in the project root or inside `server/.env`:
```env
GEMINI_API_KEY=your_gemini_api_key_here
PORT=3000
```

### 4. Start the local server
```bash
npm start
```
Open your browser and navigate to:
```text
http://localhost:3000
```

---

## ☁️ Deployment on Vercel

This repository is pre-configured for one-click deployment on [Vercel](https://vercel.com):

1. Import this repository in Vercel:
   - **Root Directory:** `./` (leave default project root)
   - **Framework Preset:** `Other`
2. Add your Environment Variable:
   - `GEMINI_API_KEY` = *your Gemini API key*
3. Click **Deploy**. Vercel will host:
   - All static pages at `https://your-domain.vercel.app/`
   - All AI serverless functions at `/api/chat`, `/api/scan`, and `/api/health`.

---

## 👥 Project Team

- **Raghavi Chaudhary**
- **Shubham Dubey**
- **Ashish Kumar**

---

## 📄 License & Disclaimer
This project is an educational initiative. Recycling rules and capabilities can differ significantly depending on your city or waste management provider. Always verify with your local municipal guidelines for specialized disposal.
