# 🌿 GreenLens: Reveal the hidden cost of consumption.

GreenLens is a dark-themed, premium interactive AI carbon footprint auditor built for the modern web. It allows consumers to peel back the surface of everyday items by scanning receipts or uploading product photos to instantly audit and evaluate their carbon footprint, discovering sustainable alternatives in real-time.

---

## 🚀 The Approach & Logic
GreenLens is designed as a **high-fidelity, lightweight Single Page Application (SPA)** utilizing **React 18, Vite, and Tailwind CSS**. 

### Hackathon Architecture Optimization:
- **Zero Server Overhead**: The entire application runs natively on the client, executing OCR and carbon calculation audits directly from the browser. This eliminates the need for expensive backend servers and complex Docker environments.
- **Strict Size Constraint Compliance**: By relying on Vite's asset optimization and directly querying serverless Google APIs, the complete project source bundle is kept **under 10 MB**, fitting the exact single-branch constraints of lightweight, high-performance submissions.
- **Fluid User Interactions**: Spotlight layers use eased cursor linear interpolation (`lerp`) inside a synchronized `requestAnimationFrame` loop, drawing masks on an off-screen HTML5 `<canvas>` in real-time to transition images smoothly without rendering bottlenecks.

---

## ⚡ Google Services & SDK Highlight

### 1. Google AI Studio (Gemini 2.5 Multimodal)
The core scanner OCR and carbon analysis logic runs entirely on **Gemini 2.5 Multimodal models**.
- **Base64 Client-Side Processing**: Uploaded or captured image frames are converted to raw Base64 strings directly in the browser using HTML5 `<canvas>` and `FileReader`.
- **Direct REST API Calls**: Sends Base64 payloads directly to Google AI Studio's content generation endpoint with `responseMimeType: "application/json"`.
- **Fail-Safe Fallback Pipeline**: Built with aTry-Catch waterfall chain: if the primary model (`gemini-2.5-flash`) fails or encounters regional rate limits, the system automatically falls back to `gemini-2.5-pro` to ensure uninterrupted auditing.
- **Prompt Specification**:
  ```text
  Analyze this image. Identify the primary items or activities shown. Estimate their carbon footprint (CO2e in kg) and suggest a simple, greener alternative. Return ONLY a valid JSON object with the following structure: { 'items': [ { 'name': string, 'co2e': number, 'alternative': string } ], 'total_co2e': number }.
  ```

### 2. Firebase Suite
- **Firebase Authentication**: Integrated with Google Sign-In (`signInWithPopup`), allowing frictionless onboarding. Authentication states are bound globally to the navigation layer.
- **Firebase hosting & Auth Deploy**: Configured via local `firebase.json` rules to support SPA routing redirects and enable OAuth credentials programmatically via the Firebase CLI.

---

## 📂 Key Files & Structure
- [App.tsx](file:///e:/hackathons/GreenLens/src/App.tsx) - Root component managing react-router-dom SPA routing and Firebase user authentication states.
- [HeroSection.tsx](file:///e:/hackathons/GreenLens/src/components/HeroSection.tsx) - Responsive landing page featuring z-index accessibility layers and spotlight canvas-masking coordinates.
- [Scanner.tsx](file:///e:/hackathons/GreenLens/src/components/Scanner.tsx) - Dual-input interface (file drop + active `getUserMedia` video camera) communicating with Gemini REST endpoints.
- [Dashboard.tsx](file:///e:/hackathons/GreenLens/src/components/Dashboard.tsx) - Visual showcase of personal carbon tracking data, active offsets, and community rankings.
- [firebase.ts](file:///e:/hackathons/GreenLens/src/lib/firebase.ts) - Initializer utility for Firebase configurations.

---

## 💻 Local Setup Instructions

### 1. Prerequisites
Ensure you have **Node.js** installed on your system.

### 2. Clone and Install Dependencies
```bash
git clone <repository_url>
cd greenlens
npm install
```

### 3. Environment Configuration
Create a `.env` file in the root directory and append your Google AI Studio API key:
```env
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```
*(Refer to [.env.example](file:///e:/hackathons/GreenLens/.env.example) for a template).*

### 4. Run Development Server
Start the local hot-reloading Vite server:
```bash
npm run dev
```
Open **http://localhost:5173/** in your web browser to test.

### 5. Build for Production
To generate optimized production bundles:
```bash
npm run build
```
The build artifacts will be located in the `dist/` directory, ready to be served.
