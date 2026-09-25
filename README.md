<div align="center">
  <img src="public/logo.svg" width="64" height="64" alt="Foundermatcha Logo" />
  <h1>Foundermatcha | Executive Meeting & Video Call Engine</h1>
  <p><strong>Google Meet-Style Video Calling, Real-Time AI Call Reports, Task & Goal Assignment, and Weekly Analytics</strong></p>

  <p>
    <a href="http://localhost:3000"><strong>🌐 Open Live Localhost Preview: http://localhost:3000</strong></a>
  </p>

  <p>
    <img src="https://img.shields.io/badge/Brand-Foundermatcha-78c452?style=flat-square" alt="Foundermatcha" />
    <img src="https://img.shields.io/badge/Video_Suite-Google_Meet_Style-black?style=flat-square" alt="Video Suite" />
    <img src="https://img.shields.io/badge/Gemini-3.8_Flash-4285F4?style=flat-square&logo=google" alt="Gemini 3.8 Flash" />
    <img src="https://img.shields.io/badge/React-19.0-61DAFB?style=flat-square&logo=react" alt="React 19" />
    <img src="https://img.shields.io/badge/TypeScript-5.0+-3178C6?style=flat-square&logo=typescript" alt="TypeScript" />
    <img src="https://img.shields.io/badge/TailwindCSS-v4-38B2AC?style=flat-square&logo=tailwindcss" alt="Tailwind CSS" />
  </p>
</div>

---

## 🍵 What is Foundermatcha?

**Foundermatcha** is the clean, focused operational engine designed for internal company workshops, executive alignment, and engineering execution.

All heavy, confusing bloat and simulated demo data have been removed in favor of a pure, clean workspace where you can:
- Run instant or group video meetings just like **Google Meet**.
- Let **AI record and transcribe** your meetings in real-time.
- Automatically receive an **AI post-call report** detailing **what was talked about** and **what needs to be done today**.
- Assign **goals and tasks** directly to real team members with due dates and priorities.
- Track **weekly reports** and **follow-up accountability** to ensure deliverables get shipped on time.

---

### 🌟 Core Capabilities

1. 📹 **Google Meet-Style Video Calling (`LiveVideoRoom.tsx`)**:
   - **Camera & Mic**: Direct WebRTC preview via `navigator.mediaDevices.getUserMedia` with simple 1-click toggles.
   - **Screen Share Engine**: Instant display capture (`navigator.mediaDevices.getDisplayMedia`) for architecture and deck walk-throughs.
   - **Live AI Call Recorder**: Continuous speech-to-text transcription captures conversation notes in real-time.
   - **Post-Call AI Summary & Action Report**: Automatically synthesizes what was discussed, lists things to be done today, and enables 1-click assignment to team members.

2. 📋 **Tasks & Goals Management (`ActionItemsScreen.tsx`)**:
   - Create, edit, and complete tasks with 1-click checkboxes.
   - Assign goals to real team members with specific roles.
   - Filter by **"Due Today"**, **"Assigned to Me"**, **"Active"**, or **"Completed"**.
   - Direct attribution back to the video meeting where the task originated.

3. 📊 **Weekly Reports & Analytics (`ReportsScreen.tsx`)**:
   - **Weekly Completion Rate**: Track tasks completed this week vs open deliverables.
   - **Team Member Follow-Up Tracker**: Accountability table showing who has open tasks, tasks due today, and follow-up status (**Needs Follow-up**, **On Track**, **All Clear**).
   - **1-Click Follow-Up Nudge**: Fast reminder action for deliverables due today.

4. 👥 **Team & Roles Management (`TeamScreen.tsx` & `AddTeamMemberModal.tsx`)**:
   - Add real team members (Name, Email, Assigned Company Role, Department).
   - Assign company roles: Founder & CEO, Tech Co-Founder & CTO, Lead Software Engineer, UI/UX Designer, Product Manager, or custom titles.
   - Track each member's individual deliverables and follow-up health.

5. 📝 **Meeting Summaries & History (`MeetingsScreen.tsx`)**:
   - Complete archive of all past video workshops and AI generated reports.

---

## 🌐 Live Localhost URL

When the server is running, access the application in your browser:

### 👉 **[http://localhost:3000](http://localhost:3000)**

---

## 🔑 Access Credentials

| Account | Role | Credentials | Workspace |
| :--- | :--- | :--- | :--- |
| **Krishna (Founder)** | Founder & CEO | `krishna@foundermatcha.com` / `password123` | Foundermatcha Core |
| **New Team Member** | Custom Role | Sign up on the **"Join Company Workspace"** tab or add via **Team & Roles** | Custom Workspace |

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install --legacy-peer-deps
```

### 2. Configure Environment Variables
Create or verify `.env` in the root:
```env
GEMINI_API_KEY=your_gemini_api_key_here
PORT=3000
```

### 3. Run Development Server
```bash
npm run dev
```

### 4. Build for Production
```bash
npm run build
```

---

## 🎨 Foundermatcha Design System

- **Brand Primary Accent**: `#78c452` (Matcha Green), `#67b342` (Hover)
- **Backgrounds**: Clean, modern dark video room (`#0a0a0a`), crisp high-contrast cards (`#ffffff`, `#f8fafc`)
- **Typography**: `Montserrat`, `JetBrains Mono`
- **Official Production Site**: [foundermatcha.com](https://foundermatcha.com)

---

<div align="center">
  <p>© 2026 Foundermatcha. Pure Executive & Team Meeting Suite.</p>
</div>