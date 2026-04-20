# Area Explorer — iPadOS Web App

A Progressive Web App (PWA) for students to practice finding area by counting square units or using the formula A = W × L. Works fully offline once installed.

## Contents of this package

- `index.html` — Main app page
- `styles.css` — Styling (including dark mode and safe area insets)
- `app.js` — App logic with touch-optimized event handling
- `manifest.json` — Web App Manifest (required for PWA install)
- `sw.js` — Service Worker (enables offline use)
- `icon-*.png` — App icons in required sizes
- `splash.png` — Launch screen image

## How to deploy and install on iPad

PWAs must be served from a web server (HTTPS required for full features). You cannot install a PWA from a local file. Pick any of these free hosting options:

### Option 1: Netlify Drop (easiest, ~60 seconds)

1. Go to https://app.netlify.com/drop on any computer
2. Drag the entire folder (not a zip file, the actual folder) onto the page
3. You'll get a URL like `your-site-name.netlify.app`
4. Open that URL in Safari on your iPad

### Option 2: GitHub Pages (free, permanent)

1. Create a free GitHub account at github.com
2. Create a new public repository
3. Upload all files from this folder to the repo
4. Go to Settings → Pages → enable Pages from main branch
5. Your site will be at `username.github.io/repo-name`

### Option 3: Vercel or Cloudflare Pages

Both offer free hosting. Drag the folder into their deploy interface — takes about a minute.

## Installing on iPad (after hosting)

1. Open Safari on your iPad
2. Navigate to the URL where you hosted the app
3. Tap the Share button (square with up arrow)
4. Scroll down and tap "Add to Home Screen"
5. Name it "Area Explorer" and tap Add
6. The icon now appears on your home screen — tap it to launch full-screen
7. Works offline after first load

## Features

- Unlimited randomly generated questions
- Three difficulty levels (Easy up to 5×5, Medium up to 8×8, Hard up to 12×10)
- Two practice modes: Count the squares, or use A = W × L formula
- Immediate feedback with hints for wrong answers
- Score tracking with streak counter
- Touch-optimized with proper 44px minimum tap targets
- Works offline once loaded
- Supports dark mode
- Respects iPad safe areas (works with notch/Dynamic Island)

## Browser requirements

- iPadOS 14 or later (iOS Safari 14+)
- For full offline PWA features: iPadOS 16.4 or later
