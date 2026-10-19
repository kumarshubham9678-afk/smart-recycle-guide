# Smart Recycling Guide

A responsive, multi-page educational website prototype made with HTML5, CSS3 and vanilla JavaScript. No build step or paid dependency is required.

## Pages
- `index.html` — Home
- `assistant.html` — Eco-Buddy local knowledge-base chatbot
- `game.html` — 60-second waste sorting challenge
- `scanner.html` — image preview and user-confirmed demo classification
- `guide.html` — searchable, filterable recycling guide
- `dashboard.html` — locally saved activity, points and achievements
- `about.html` — project description and team

## Run locally
1. Extract the ZIP file.
2. Open the folder in VS Code.
3. Open `index.html` in your browser, or use VS Code's Live Server extension.
4. No npm install or build command is needed.

For the most reliable local testing, use Live Server so all pages run under the same local origin and `localStorage` is shared.

## Deploy to Netlify
1. Go to Netlify and choose **Add new site** / manual deploy.
2. Drag the extracted project folder (or deploy it from a Git repository).
3. Publish directory is the project root (`.`); `netlify.toml` already declares this.
4. No build command is required.

## Prototype behavior and honest limitations
- Eco-Buddy uses keyword matching against a local educational knowledge base. It is not a live AI model.
- Scanner image preview is local; the result comes from the user's selected item type, not image recognition.
- Recycling rules differ by municipality and provider. The guide gives typical educational advice, not a universal guarantee.
- Progress is stored in the current browser using `localStorage`; it is not an account or cloud sync.
- The game has a 60-second timer, shuffled items, five category buttons, keyboard shortcuts (1–5), score, accuracy, best score and achievements.
- Theme preference is saved locally.

## Adding a real AI service later
Do not put secret API keys in browser JavaScript. Create a server-side endpoint (for example a Netlify Function) and store credentials in Netlify environment variables. The browser should call only your own endpoint. Validate file size/type and user input server-side, and show users when AI is unavailable or uncertain.
