# BrandBoost AI (HTML/CSS/JavaScript Only)

This version is fully frontend-only and does **not require Node.js/npm** to use.

## Run (No npm needed)
Option 1: Open directly
- Open `public/index.html` in your browser.

Option 2: Use a simple static server (recommended)
```bash
cd public
python3 -m http.server 5500
```
Then open `http://localhost:5500`.

## Features
- Dashboard style UI with logo + loading overlays
- Chat with new chat, clear chat, show history, media upload
- Photo/Video maker modules
- Dedicated Photo Maker page with company info + theme flow
- Ad/video/caption creator flows
- Business analytics charts and report download
- Gallery page for generated outputs

## Storage
All chat history, profile data, and generated gallery items are saved in browser **localStorage**.
