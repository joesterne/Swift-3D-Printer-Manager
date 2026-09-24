<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />

# ⚡ SWIFT.STL — Next-Gen 3D Printing & Slicing Suite

[![React 19](https://img.shields.io/badge/React-19.0-61dafb.svg?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178c6.svg?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.2-646cff.svg?style=flat-square&logo=vite)](https://vitejs.dev/)
[![Three.js](https://img.shields.io/badge/Three.js-R3F-black.svg?style=flat-square&logo=three.js)](https://threejs.org/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-v4.1-38bdf8.svg?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![Firebase](https://img.shields.io/badge/Firebase-Firestore_%26_Auth-ffca28.svg?style=flat-square&logo=firebase)](https://firebase.google.com/)

**SWIFT.STL** is a modern, high-performance web dashboard built for 3D printing makers, print labs, and rapid-prototyping engineers. It integrates 3D STL model rendering, AI-assisted slicing estimation, real-time telemetry, Bambu Lab cloud fleet simulation, queue management, and deep print analytics.

[**Launch App in AI Studio**](https://ai.studio/apps/71052853-0b04-4393-8db2-b52a9090c958)
</div>

---

## 🌟 Key Features

### 📊 1. Command Dashboard & Live Analytics
- **Telemetry & Print Activity**: 7-day historical usage trends visualized with a custom gradient Recharts `AreaChart`.
- **Recent Prints Summary Card**:
  - Interactive Recharts visualization comparing **Successful** vs. **Failed** print jobs.
  - **Dual View Modes**: Toggle between an interactive **Ratio Donut** (`PieChart` with central pass rate percentage) and a **Count Bar** (`BarChart` for direct quantity comparisons).
  - Breakdown metrics for total recorded prints, success rates, and live recent print logs.
  - One-click quick navigation linking directly into detailed tracking records.
- **Hardware Telemetry**: Real-time stats on 30-day filament consumption (kg), accumulated print hours, and active printer counts.

### ✂️ 2. Slicer & Print Queue Management
- **Multi-Technology Support**: Seamlessly toggle between **FDM (Filament)** and **SLA (Resin)** configurations.
- **Dynamic Layer Height Visualization**: Real-time SVG graphic that smoothly reacts to layer thickness adjustments, providing intuitive visual feedback of micron and millimeter precision.
- **AI-Powered Parameter Optimization**: Leverages the Gemini API to analyze model geometry, calculate print times, predict filament weight, and recommend optimal infill, layer height, and support structures.
- **Bambu Lab Cloud Integration**:
  - Real-time status simulation for connected printers (e.g., *X1-Carbon*, *P1S*).
  - Dynamic temperature fluctuations (Nozzle & Heated Bed) during active prints.
  - Automated job progression and completion alerts.
- **Custom Printer Profiles**: Create, edit, and persist custom slicer profiles (nozzle diameter, bed temperature, fan speeds) backed by Firestore.
- **Print Queue Execution**: Queue multiple jobs, trigger automated printer dispatching, and monitor job statuses (`queued`, `printing`, `completed`, `failed`).

### 🧊 3. Interactive 3D STL Model Viewer
- **WebGL Geometry Preview**: High-fidelity 3D STL rendering powered by Three.js and `@react-three/fiber`.
- **On-Demand WebGL Pipeline**: Operates with `frameloop="demand"` so frames render exclusively on camera movement or user interaction, saving up to 80% CPU/GPU overhead.
- **Navigation Controls**: Full 360° orbit rotation, fluid panning, and zooming with smooth damping.

### 🔍 4. Explore & Model Discovery
- **Community Models**: Browse curated, high-popularity models from Thingiverse and Printables.
- **Direct STL Downloads**: Download STL files directly from the model preview modal or click through to the original source.
- **Instant Filtering & Sorting**: Filter models by title or author, and sort dynamically by popularity or download volume with zero input latency.

### 📈 5. Print History & Usage Tracking
- **Historical Job Records**: Detailed historical audit log tracking file names, print durations, material weights, and estimated print costs.
- **Multi-Parameter Search & Filters**: Instantly filter logs by name, execution status (`Success`, `Failed`), or custom start and end date ranges.
- **Cumulative Metrics**: Instant tallies of total print hours and filament used across all tracked jobs.

### 🤖 6. AI 3D Printing Assistant
- **Dedicated Sidebar Chat**: Interactive AI co-pilot powered by Gemini to troubleshoot print failures (bed adhesion, stringing, layer shifting), recommend material settings, and optimize slicing parameters.

---

## ⚡ Speed & Performance Architecture

This application was engineered with a strict focus on speed, responsiveness, and minimal resource footprints:

| Optimization | Implementation Details | Impact |
| :--- | :--- | :--- |
| **On-Demand 3D Rendering** | Set `Canvas` `frameloop="demand"`, capped `dpr={[1, 1.5]}`, and high-performance WebGL context. | Prevents constant 60fps GPU/CPU drain while idle. |
| **Route Code Splitting** | Wrapped tabs (`Explore`, `Slicer`, `Tracking`, `Profile`) in `React.lazy()` with lightweight `Suspense` skeletons. | Drastically reduces initial bundle size for near-instant page boot. |
| **Targeted Memoization** | Applied `React.memo` to `STLViewer`, `LayerVisualization`, `InfoCard`, `NavItem`, and `RecentPrintItem`. | Eliminates unnecessary re-renders when tweaking sliders or sidebar tabs. |
| **Memoized Data Operations** | Wrapped search, sort, and date-range filtering in `useMemo` with numeric timestamp calculations. | Guarantees 0ms UI lag when searching or sorting large datasets. |
| **Idle Interval Guards** | Simulated printer polling checks for active print jobs before updating React state. | Eliminates background React state thrashing when printers are idle. |
| **Vendor Chunk Splitting** | Configured Rollup `manualChunks` in `vite.config.ts` for Three.js, Recharts, and Firebase. | Optimizes browser caching and allows parallel resource downloading. |

---

## 🛠️ Tech Stack

- **Frontend Core**: [React 19](https://react.dev/), [TypeScript 5.8](https://www.typescriptlang.org/)
- **Bundler & Tooling**: [Vite 6](https://vitejs.dev/) with `@tailwindcss/vite`
- **Styling & Design System**: [Tailwind CSS v4](https://tailwindcss.com/), [Shadcn UI](https://ui.shadcn.com/), Lucide Icons
- **3D Graphics**: [Three.js](https://threejs.org/), [@react-three/fiber](https://docs.pmnd.rs/react-three-fiber), [@react-three/drei](https://github.com/pmndrs/drei)
- **Data Visualization**: [Recharts 3](https://recharts.org/) (AreaChart, PieChart, BarChart)
- **Cloud Backend & Database**: [Firebase Firestore & Authentication](https://firebase.google.com/)
- **AI Engine**: [@google/genai](https://www.npmjs.com/package/@google/genai) (Gemini Flash)

---

## 📁 Project Structure

```
├── src/
│   ├── components/
│   │   ├── Dashboard.tsx        # Telemetry, print activity, and Recent Prints summary
│   │   ├── Slicer.tsx           # Slicer controls, layer visualizer, queue & profiles
│   │   ├── STLViewer.tsx        # On-demand Three.js WebGL STL model viewer
│   │   ├── Explore.tsx          # Model catalog with direct STL download & source links
│   │   ├── Tracking.tsx         # Filterable print history logs and usage tracking
│   │   ├── ChatAssistant.tsx    # Gemini-powered 3D printing troubleshooting chat
│   │   ├── Profile.tsx          # Account settings & authenticated user management
│   │   ├── InfoCard.tsx         # Memoized metric card component
│   │   ├── NavItem.tsx          # Memoized sidebar navigation item
│   │   ├── RecentPrintItem.tsx  # Memoized print job list item
│   │   └── ui/                  # Accessible UI primitives (dialogs, tabs, buttons, etc.)
│   ├── contexts/
│   │   └── UserContext.tsx      # Firebase Auth provider and user profile state
│   ├── lib/
│   │   ├── firebase.ts          # Firebase SDK client initialization
│   │   ├── gemini.ts            # Gemini API slicing estimates and chat session
│   │   └── error-handling.ts   # Unified error notification handler
│   ├── constants.ts             # Default printer profiles and sample data
│   ├── types.ts                 # TypeScript interfaces and data models
│   ├── App.tsx                  # Root shell with lazy module splitting
│   └── main.tsx                 # Client application entry point
├── server.ts                    # Express development and SSR server
├── vite.config.ts               # Vite configuration with vendor chunking
└── package.json                 # Project dependencies and run scripts
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v18.0.0 or higher)
- **npm** or **bun**

### 1. Installation
Clone the repository and install dependencies:
```bash
npm install
```

### 2. Environment Configuration
Create a `.env.local` file in the root directory:
```env
GEMINI_API_KEY="your_gemini_api_key_here"
```

### 3. Running Locally
Start the development server:
```bash
npm run dev
```
Open your browser and navigate to `http://localhost:3000`.

### 4. Build & Production
To build the application for production with optimized vendor chunks:
```bash
npm run build
```

To run TypeScript verification:
```bash
npm run lint
```
