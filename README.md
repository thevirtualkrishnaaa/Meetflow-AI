<div align="center">
  <h1>🎙️ MeetingFlow AI</h1>
  <p><strong>Executive B2B Meeting Intelligence & Team Accountability Engine</strong></p>

  <p>
    <a href="http://localhost:3000"><strong>🌐 Open Live Localhost Preview: http://localhost:3000</strong></a>
  </p>

  <p>
    <img src="https://img.shields.io/badge/Gemini-3.8_Flash-4285F4?style=flat-square&logo=google" alt="Gemini 3.8 Flash" />
    <img src="https://img.shields.io/badge/React-19.0-61DAFB?style=flat-square&logo=react" alt="React 19" />
    <img src="https://img.shields.io/badge/TypeScript-5.0+-3178C6?style=flat-square&logo=typescript" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Vite-8.3-646CFF?style=flat-square&logo=vite" alt="Vite" />
    <img src="https://img.shields.io/badge/TailwindCSS-v4-38B2AC?style=flat-square&logo=tailwindcss" alt="Tailwind CSS" />
  </p>
</div>

---

## 📌 What is MeetingFlow AI?

**MeetingFlow AI** is a real-time meeting intelligence platform engineered for fast-moving startups and enterprise teams. It eliminates the post-meeting chaos of lost action items and relitigated decisions by turning spoken conversations directly into structured, verified commitments.

### Key Capabilities:
- 🎙️ **Live Audio Recording & Diarization**: Record directly from your microphone with audio level meters, upload pre-recorded meetings (`.mp3`, `.wav`, `.m4a`, `.webm`), or paste meeting notes.
- ⚡ **Automated Action & Decision Extraction**: Powered by Google's **Gemini 3.8 Flash**, MeetingFlow automatically extracts:
  - 📝 **Executive Summary**: 2–3 sentence consensus brief.
  - 🎯 **Concrete Key Decisions**: Logged in an audit-ready, searchable decision registry.
  - ✅ **Action Items**: Prioritized deliverables assigned to real colleagues with due dates and confidence scores.
- 👥 **Team Workload & Accountability**: Add colleagues to your workspace, balance individual task capacity, and prevent burnout.
- 🔒 **AI Verification Gate (`ai_review`)**: Human-in-the-loop review to calibrate, edit, reassign, or dismiss extracted items before syncing to team boards.
- 🔗 **Dependency Graph & Sub-task Tracking**: Track blocked tasks and prerequisites across cross-functional projects.
- 📊 **Executive Analytics**: Real-time completion rates, team follow-through velocity, and overdue warnings.

---

## 🌐 Live Localhost URL

When the dev server is running, access the live application directly in your browser:

### 👉 **[http://localhost:3000](http://localhost:3000)**

*(If you are running the app on a remote server or container, substitute `localhost` with your machine's host IP).*

---

## 🚀 Quickstart Guide

### Prerequisites
- **Node.js**: v20 or newer (`node -v`)
- **npm**: v10 or newer (`npm -v`)
- **Gemini API Key**: Obtain a free API key from [Google AI Studio](https://aistudio.google.com/)

### 1. Clone the Repository
```bash
git clone https://github.com/thevirtualkrishnaaa/Meetflow-AI.git
cd Meetflow-AI
```

### 2. Install Dependencies
```bash
npm install --legacy-peer-deps
```

### 3. Configure Environment Variables
Create or edit your `.env` file in the project root:
```env
GEMINI_API_KEY=your_gemini_api_key_here
PORT=3000
```

### 4. Run the Application
```bash
npm run dev
```

### 5. Open in Your Browser
Visit **[http://localhost:3000](http://localhost:3000)** to start using MeetingFlow AI!

---

## 🔑 Authentication & Workspace Access

MeetingFlow AI includes full multi-user authentication with persistent local workspace storage:

| Account Type | Description | Credentials |
| :--- | :--- | :--- |
| **New Clean Workspace** | Create your own organization, invite your real team, and start with an empty slate | Sign up via the **"Create New Workspace"** tab |
| **Instant Demo Access** | Pre-loaded scenario (Alex Morgan · Founder) to explore pre-filled meetings and tasks | Click **"Instant Demo Access"** on the login screen or use:<br>`admin@meetingflow.ai` / `password123` |

---

## 🛠️ Tech Stack & Architecture

- **Frontend**:
  - React 19 (Hooks, Context API)
  - Vite 8 (Ultra-fast HMR and bundling)
  - Tailwind CSS v4 (Modern styling & layout)
  - Lucide React (Icons)
  - HTML5 Web Audio API & MediaStream Recording
- **Backend & Middleware**:
  - Express.js (Node / TSX)
  - `@google/genai` SDK (`gemini-3.8-flash` & `gemini-3.5-transcribe`)
  - Resilient Fallback Semantic NLP Extractor
  - In-memory & LocalStorage sync persistence
- **Developer Tools**:
  - TypeScript 5+ (`tsc --noEmit` linting)
  - TSX for zero-build TypeScript server execution

---

## 📂 Project Directory Structure

```text
MeetingFlow-AI/
├── src/
│   ├── components/
│   │   ├── auth/
│   │   │   └── AuthScreen.tsx          # Dual-panel Sign In & Create Workspace
│   │   ├── layout/
│   │   │   ├── Header.tsx              # Top navigation, global search, user menu
│   │   │   ├── Sidebar.tsx             # Workspace switcher & navigation items
│   │   │   └── CommandPalette.tsx      # Cmd+K quick actions launcher
│   │   ├── screens/
│   │   │   ├── OverviewScreen.tsx      # Dynamic KPI metrics & attention queue
│   │   │   ├── MeetingsScreen.tsx      # Meetings list & search filters
│   │   │   ├── MeetingDetailScreen.tsx # Transcript view & meeting outcomes
│   │   │   ├── ActionItemsScreen.tsx   # Task board & dependency blocker tree
│   │   │   ├── DecisionsScreen.tsx     # Searchable decision registry
│   │   │   ├── TeamScreen.tsx          # Team directory, workload & capacity
│   │   │   ├── ReportsScreen.tsx       # Execution analytics & velocity charts
│   │   │   ├── SettingsScreen.tsx      # Workspace settings & clean slate reset
│   │   │   ├── StartMeetingModal.tsx   # Live mic recording & transcript import
│   │   │   ├── ProcessingScreen.tsx    # Multi-stage AI pipeline progress
│   │   │   ├── AiReviewScreen.tsx      # Verification gate before publishing
│   │   │   └── AddTeamMemberModal.tsx  # Add/Invite team members
│   │   └── ui/
│   │       ├── Avatar.tsx              # Dynamic initials and color avatars
│   │       ├── StatusBadge.tsx         # Priority and task status chips
│   │       └── TaskEditModal.tsx       # Full task editing & dependency linking
│   ├── context/
│   │   └── MeetingFlowContext.tsx      # Global state, persistence & API dispatcher
│   ├── types/
│   │   └── index.ts                    # TypeScript interfaces & domain models
│   ├── App.tsx                         # Top-level screen router & auth guard
│   └── main.tsx                        # React application bootstrap
├── server.ts                           # Express server with Vite middleware & Gemini API
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

---

## ⌨️ Helpful Keyboard Shortcuts

- <kbd>Cmd</kbd> + <kbd>K</kbd> / <kbd>Ctrl</kbd> + <kbd>K</kbd>: Open Global Command Palette & Search.
- <kbd>Esc</kbd>: Close active modal or drawer.

---

## 📄 License

This project is licensed under the MIT License.