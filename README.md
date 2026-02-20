# 🚀 SkillSwap

**The Currency of Knowledge. Stop Paying. Start Swapping.**

![SkillSwap Banner](https://via.placeholder.com/1200x400/0f172a/ffffff?text=SkillSwap:+Peer-to-Peer+Learning+Economy)

## 📖 The Vision

**The Problem:** I wanted to learn Spanish, but tutors were expensive. I offered to teach coding in exchange, but finding a reliable partner was a nightmare. 
**The Solution:** SkillSwap is a decentralized, peer-to-peer learning platform that eliminates the financial barrier to education. We believe that everyone is an expert at something and a beginner at something else. Instead of paying $50/hour, SkillSwap uses a smart matching algorithm and a barter economy to connect learners directly.

## ✨ The "Wow" Features

* **🧠 Smart-Match Engine:** Actively finds your perfect partner. If you want to learn Python and teach Guitar, SkillSwap instantly surfaces users who want to learn Guitar and teach Python, ranked by compatibility.
* **🛡️ The Karma Economy:** You start with 5 Karma. You spend 1 Karma to book a session to learn. You earn 1 Karma when you teach a session. This prevents "leechers" and rewards knowledge sharing.
* **⚡ The Live Dojo:** An immersive, in-browser learning environment. No need for external Zoom links. Features integrated WebRTC video chat, a real-time messaging system, and a toggleable workspace (Monaco Code Editor for tech skills, Shared Notes for languages/arts).
* **📅 Frictionless Scheduling:** Users set their weekly availability. When booking, the app dynamically pulls the peer's available slots and handles the Karma transaction automatically.
* **💬 Real-Time Inbox:** Continue the conversation outside the Dojo with an instant, Firestore-powered messaging system.

## 🛠️ The Tech Stack

Built for speed, scale, and a premium user experience.

* **Frontend:** React (Vite) for blazing-fast performance.
* **Styling:** Tailwind CSS for a clean, modern, minimalist aesthetic.
* **Icons:** Lucide-React for professional, consistent iconography.
* **Backend & Auth:** Firebase (Authentication, Firestore Database, Real-time Listeners).
* **IDE Integration:** `@monaco-editor/react` (The engine behind VS Code).
* **Video Integration:** `react-webcam` for local media stream handling.

## 🚀 Getting Started (Local Development)

Want to run SkillSwap on your own machine? Follow these steps:

### 1. Clone the repository
```bash
git clone [https://github.com/YOUR_USERNAME/skillswap.git](https://github.com/YOUR_USERNAME/skillswap.git)
cd skillswap
npm install
npm run dev