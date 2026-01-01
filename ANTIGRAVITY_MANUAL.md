# Fantastic Creature Forger - Antigravity Export

**Version:** 1.0.0  
**Export Date:** 2024  
**Target Environment:** Antigravity IDE / Modern React + AI Stack

---

## 1. Project Description

**Fantastic Creature Forger** is a dual-mode web application designed to create unique, 3D-printable mythical creatures based on personality analysis. 

It features two distinct user experiences:
1.  **Standard Mode:** A witty, text-based personality quiz for adults/teens.
2.  **Toddler Mode:** A highly visual, voice-guided experience with large touch targets, simplified questions, and read-aloud functionality (using the Web Speech API).

**Core Loop:**
1.  **Quiz:** User answers questions (Text or Visual).
2.  **Concept Generation (AI):** Answers are sent to **Gemini 3 Pro** to invent a creature and write a descriptive prompt.
3.  **Visual Generation (AI):** The prompt is sent to **Gemini 3 Pro Image** to generate a high-contrast orthogonal view of the creature.
4.  **3D Forging (Client-Side):** The application uses **Three.js** to mathematically convert the 2D image pixel data into a 3D heightmap mesh (Lithophane) directly in the browser.
5.  **Export:** Users can download the STL file for 3D printing (Flat Relief or Cylindrical Lamp mode).

---

## 2. The "Antigravity" Reconstruction Prompt

To rebuild this project in an AI-driven IDE, use the following System Prompt:

> **Role:** Expert Frontend Engineer & Creative Technologist.
> **Stack:** React 18, Vite, Tailwind CSS, Three.js (@react-three/fiber), Lucide-React, @google/genai SDK.
>
> **Task:** Build "Fantastic Creature Forger", a 3D printing generator.
>
> **Key Features & Requirements:**
>
> 1.  **App State Manager:** Handle states: `WELCOME`, `QUIZ`, `GENERATING`, `RESULT`, `ERROR`.
> 2.  **Toddler Mode:**
>     -   Toggle in Welcome screen.
>     -   Use `speechSynthesis` to read questions/options on hover.
>     -   UI: Large cards, icons (Lucide), bright colors (Orange/Green/Blue themes).
>     -   Audio Guide: A character component that "speaks" text.
> 3.  **Quiz Engine:**
>     -   Support text-only options and `VisualOption` (Text + Icon + Color).
>     -   Store answers for the AI prompt.
> 4.  **AI Services (`geminiService.ts`):**
>     -   **Step 1 (Concept):** Use `gemini-3-pro-preview` with structured JSON output (`name`, `description`, `imagePrompt`) based on quiz answers.
>     -   **Step 2 (Image):** Use `gemini-3-pro-image-preview` to generate a 2D image.
> 5.  **3D Viewer & Forger (`Viewer3D.tsx`):**
>     -   Use `@react-three/fiber`.
>     -   **Algorithm:** Create a custom function `generateSolidSTLGeometry`. Read image pixel data (Canvas 2D), map brightness to Z-depth (Heightmap).
>     -   **Modes:** "Flat" (Relief) and "Cylinder" (Lamp shade).
>     -   **Export:** Use `STLExporter` to save the mesh.
> 6.  **Environment:**
>     -   API Key must come from `process.env.API_KEY` or a user input dialog (`window.aistudio`).
> 7.  **Styling:**
>     -   Fonts: 'Nunito' (Body), 'Fredoka' (Headers/Playful).
>     -   Theme: Slate/Blue for Standard, Orange/Playful for Toddler.

---

## 3. Technical Breakdown

### A. Directory Structure
```
/
├── index.html          # Entry point, Tailwind CDN, Fonts
├── src/
│   ├── App.tsx         # Main State Machine
│   ├── constants.ts    # Question Sets (Adult & Toddler)
│   ├── types.ts        # Interfaces (VisualOption, CreatureData)
│   ├── hooks/
│   │   └── useSpeech.ts # Wrapper for window.speechSynthesis
│   ├── services/
│   │   └── geminiService.ts # Google GenAI SDK implementation
│   └── components/
│       ├── Welcome.tsx
│       ├── Quiz.tsx    # Supports Text & Icon grids
│       ├── Result.tsx  # Layout for 3D Viewer & Details
│       ├── Viewer3D.tsx # The heavy lifter (Mesh Generation)
│       └── ...
```

### B. Key Algorithms

**1. Lithophane Generation (`Viewer3D.tsx`)**
Instead of using AI to generate a 3D mesh (which is slow/expensive), we use AI to generate a *perfect 2D image*, and then use a deterministic algorithm to extrude it.
*   **Input:** `ImageData` (RGBA) from the AI generated image.
*   **Process:** Iterate through pixels -> Calculate luminance -> Map to Z-coordinate.
*   **Meshing:** Construct a standard `BufferGeometry` with vertices and indices.
*   **Watertightness:** The algorithm explicitly stitches the front face to a flat back face to ensure the model is a solid volume printable by slicers.

**2. Audio Interaction (`useSpeech.ts`)**
*   Utilizes the browser's native `SpeechSynthesis` API.
*   Includes logic to cancel overlapping utterances.
*   Selects "Google US English" or friendly voices where available.

### C. AI Configuration
*   **Model 1:** `gemini-3-pro-preview`
    *   **Config:** `responseMimeType: "application/json"`, `responseSchema` used to enforce strict output format.
*   **Model 2:** `gemini-3-pro-image-preview`
    *   **Prompting Strategy:** Prompts are engineered to ask for "isometric view", "white background", and "high contrast" to aid the heightmap algorithm.

---

## 4. Integration & Rebuild Instructions

### Prerequisites
*   Node.js v18+
*   A Google Cloud Project with Gemini API enabled.

### Installation
1.  **Initialize Project:**
    ```bash
    npm create vite@latest fantastic-forger -- --template react-ts
    cd fantastic-forger
    npm install
    ```

2.  **Install Dependencies:**
    ```bash
    npm install @google/genai lucide-react three @react-three/fiber @react-three/drei three-stdlib
    ```

3.  **Environment Setup:**
    Create a `.env` file in the root:
    ```env
    API_KEY=your_gemini_api_key_here
    ```
    *Note: The app also supports user-provided keys via the `window.aistudio` interface if embedded in AI Studio.*

4.  **Run Development Server:**
    ```bash
    npm run dev
    ```

5.  **Build for Production:**
    ```bash
    npm run build
    ```

### Exporting for Antigravity IDE
If importing this repository into Antigravity:
1.  Ensure `metadata.json` lists required permissions (Camera/Mic not strictly needed, but `speechSynthesis` requires user interaction on some browsers).
2.  Paste the **Reconstruction Prompt** (Section 2) into the main chat interface to modify or expand functionality.
