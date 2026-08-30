<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js" />
  <img src="https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react" />
  <img src="https://img.shields.io/badge/Tailwind-3.4-38bdf8?style=for-the-badge&logo=tailwindcss" />
  <img src="https://img.shields.io/badge/FortyGuard-API-10b981?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Vercel-Live-black?style=for-the-badge&logo=vercel" />
</p>

<h1 align="center">🌿 VERDANT 360</h1>
<p align="center"><strong>Hyperlocal Eco-Intelligence & Urban Climate Resilience Platform</strong></p>
<p align="center">
  <em>Built by <a href="https://github.com/tayyab38201"><strong>Tayyab</strong></a> for FortyGuard Hackathon '26</em>
</p>

---

## 🏆 Project Overview

**VERDANT 360** is an elite, award-winning climate-tech SaaS dashboard that leverages **FortyGuard's 2-meter precision temperature intelligence** to deliver hyperlocal urban climate resilience insights. Built as a $100M-tier venture-backed platform with Stripe/Vercel-level design polish.

> ⚡ **Live Demo:** [https://verdant-360.vercel.app](https://verdant-360.vercel.app)

---

## ✨ Key Features

| Feature | Description |
|---------|-------------|
| 🗺️ **Thermal Intelligence Map** | Interactive Leaflet map with 144 real-time 2m heat tiles & custom popups |
| 🌡️ **Thermal Telemetry** | Animated radial gauges for apparent temp, heat index & humidity |
| 🚶 **CoolPath™ Route Comparer** | Side-by-side shaded vs direct route with thermal savings |
| 🌳 **Tree Canopy Simulator** | Model urban greening impact (-0.5°C to -3.2°C cooling) in real-time |
| 🛡️ **OSHA Work Safety Matrix** | WBGT risk calculator with live rest/hydration countdown timer |
| 🌬️ **Air Quality Layer** | Real-time PM2.5, PM10, US AQI via Open-Meteo hybrid scoring |
| 🤖 **AI Climate Advisor** | Draggable chatbot with deep project expertise |
| 📄 **Civic Data Exporter** | One-click PDF, CSV & GeoJSON downloads |
| 🌙 **Dark/Light Theme** | Smooth toggle with full responsiveness |
| 📱 **Mobile-First Design** | Touch-friendly with tap-activated effects |

---

## 🤖 AI-Assisted Development

This project was developed with **AI-assisted engineering** using advanced LLM pair programming. The AI served as a **Principal UI/UX Architect and Lead Full-Stack Engineer**, contributing to:

- 🎨 **Award-winning UI/UX design** — $100M-tier SaaS polish (Stripe/Vercel aesthetic)
- 🏗️ **Production-ready architecture** — App Router patterns, SSR safety, Vercel optimization
- 🔌 **Real API integration** — FortyGuard + Open-Meteo with async polling
- 🐛 **Debugging & fixes** — Hydration mismatches, peer dependencies, timeout issues
- 📱 **Responsive engineering** — Mobile-first with touch-optimized interactions
- 📖 **Complete documentation** — This very README was AI-assisted!

> **Why AI pair programming?** Rapid iteration, best-practice patterns, and production-grade code quality in a fraction of the time.

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 16 (App Router) |
| **Language** | JavaScript (React 19) |
| **Styling** | Tailwind CSS 3.4 + Custom glassmorphism |
| **Animations** | Framer Motion 11 |
| **Maps** | Leaflet + react-leaflet v5 |
| **Charts** | Recharts (Radial gauges) |
| **Icons** | Lucide React |
| **PDF Export** | jsPDF + jspdf-autotable |
| **APIs** | FortyGuard (thermal) + Open-Meteo (air quality) |
| **Hosting** | Vercel (Free Hobby Tier) |

---

## 🚀 Complete Terminal Setup Guide

### 📋 Option 1: One-Liner (Fastest Setup)

**Copy-paste this entire block in PowerShell (Windows):**

```powershell
Step 1: Clone & Enter Project
git clone https://github.com/tayyab38201/Verdant-360.git
cd Verdant-360
Step 2: Install Runtime Dependencies
npm install framer-motion recharts leaflet react-leaflet@5 lucide-react jspdf jspdf-autotable
Packages explained:
framer-motion — Smooth animations & micro-interactions
recharts — Radial gauge charts for telemetry
leaflet + react-leaflet@5 — Interactive map (v5 for React 19)
lucide-react — Beautiful icons
jspdf + jspdf-autotable — PDF report generation
Step 3: Install Dev Dependencies (Tailwind)
npm install -D tailwindcss@3.4.1 postcss autoprefixer
Step 4: Initialize Tailwind Configuration
npx tailwindcss init -p
This creates tailwind.config.js and postcss.config.js.
Step 5: Create Environment Variables
Create .env.local file in project root:
New-Item -ItemType File -Path ".env.local" -Force
Then open .env.local and add:
FORTYGUARD_API_KEY=your_fortyguard_api_key_here
Step 6: Start Development Server
npm run dev
🌐 Deploy to Vercel (Free)
Option A: Via Vercel Dashboard (Recommended)
Go to vercel.com → Sign up with GitHub
Click "Add New..." → "Project"
Import Verdant-360 repository
Add Environment Variable:
Name: FORTYGUARD_API_KEY
Value: Your FortyGuard API key
Environments: ✅ Production, ✅ Preview, ✅ Development
Click Deploy
Wait 2-4 minutes → Your site is live!
verdant-360/
├── app/
│   ├── api/
│   │   ├── fortyguard/route.js       # FortyGuard API proxy (Vercel-safe polling)
│   │   └── air-quality/route.js      # Open-Meteo air quality
│   ├── globals.css                   # Global styles + animations
│   ├── layout.js                     # Root layout with fonts
│   └── page.js                       # Main dashboard
├── components/
│   ├── Header.jsx                    # Top navbar with live stats
│   ├── VerdantMap.jsx                # Interactive Leaflet heat map
│   ├── ThermalTelemetry.jsx          # Radial gauges
│   ├── CoolRoutePlanner.jsx          # Route comparer
│   ├── GreeningSimulator.jsx         # Tree canopy impact model
│   ├── HydrationSafetyWidget.jsx     # OSHA WBGT calculator
│   ├── AiAdvisorWidget.jsx           # Draggable AI chatbot
│   └── ReportExporter.jsx            # PDF/CSV/GeoJSON export
├── public/
├── .env.local                        # Environment variables (gitignored)
├── next.config.mjs                   # Next.js configuration
├── tailwind.config.js                # Tailwind theme
└── package.json
🔧 Useful Commands
# Development server
npm run dev

# Production build
npm run build

# Start production server locally
npm start

# Clear Next.js cache
Remove-Item -Recurse -Force .next
npm run dev
# Full setup from scratch
git clone https://github.com/tayyab38201/Verdant-360.git; cd Verdant-360; npm install framer-motion recharts leaflet react-leaflet@5 lucide-react jspdf jspdf-autotable; npm install -D tailwindcss@3.4.1 postcss autoprefixer; npx tailwindcss init -p; npm run dev
