<<<<<<< HEAD
# ✦ Taskflow — Animated Todo App

> A playful, feature-rich Todo App built with pure **HTML + CSS + JavaScript**. No backend. No Firebase. No frameworks. Just open and go.

---

## 🎬 What Makes It Special?

| Feature | Description |
|---------|-------------|
| 💣 **Bomb Delete** | Deleting a task starts a 5-second countdown. Tap the bomb to cancel! |
| 🌱 **Grass Grows** | Completing a task makes grass and flowers bloom over the card |
| 💥 **Particle Blast** | When the bomb explodes, 70 colorful particles burst across the screen |
| 🔄 **Spin Entry** | New tasks spin in with a 3D rotateY animation |
| 🌙 **Dark / Light Mode** | Toggle with one click. Preference saved. |
| 🔍 **Live Search** | Filter tasks as you type |
| 🔴 **Priority + Due Date** | High / Normal / Low priority with overdue warnings |
| ✏️ **Edit Modal** | Edit task text, priority, and due date any time |

---

## 🔐 Authentication

- **Sign Up** with name, username, password (stored in `localStorage`)
- **Sign In** with username + password
- **Session** lives in `sessionStorage` → clears when browser tab closes → forces login each visit
- No email, no verification, no server needed

---

## 📁 File Structure

```
taskflow/
│
├── 📄 index.html        ← Login + Sign Up page (start here)
├── 📄 app.html          ← Main dashboard (redirects here after login)
│
├── 📁 css/
│   ├── 🎨 login.css     ← Animated login page styles
│   └── 🎨 app.css       ← Full dashboard styles
│
└── 📁 js/
    ├── ⚡ login.js       ← Auth logic (signup, login, session)
    └── ⚡ app.js         ← App logic (tasks, bomb, grass, particles)
```

---

## 🚀 How to Run

### Option 1 — VS Code Live Server (recommended)
1. Install [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) extension
2. Right-click `index.html` → **Open with Live Server**

### Option 2 — Python
```bash
python -m http.server 5500
# Open: http://localhost:5500/index.html
```

### Option 3 — Node.js
```bash
npx serve .
# Open the URL shown in terminal
```

> ⚠️ Do **not** open HTML files directly (`file://`). Use a local server.

---

## 💡 How to Use

1. Open `index.html` → **Sign Up** with your name, username, password
2. You're redirected to Sign In → **Sign In** with your username + password
3. You land on the **dashboard**
4. Type a task → choose **priority** + optional **due date** → press **Enter**
5. Watch it spin in!
6. Click **✔** to complete → grass grows 🌱
7. Click **🗑** to start the bomb 💣 → tap the bomb to cancel, or wait 5 seconds for 💥
8. Click **✏️** to edit a task
9. Use filters and search to find tasks
10. Click **Sign Out** → session ends → you must log in again next visit

---

## 🛠️ Tech Stack

| Layer | Detail |
|-------|--------|
| Structure | HTML5 with semantic tags and full meta tags |
| Styling | CSS3 — custom properties, keyframe animations, clip-path, glassmorphism |
| Logic | Vanilla JavaScript ES5/ES6 — no frameworks |
| Auth | `localStorage` (users) + `sessionStorage` (active session) |
| Database | `localStorage` per user key |
| Fonts | Google Fonts — Righteous (display) + Nunito (body) |
| Graphics | HTML5 Canvas API for particle explosions |

---

## 📌 Key Concepts Used

- **CSS Variables** for instant dark/light theme switching
- **CSS `clip-path` animation** for grass reveal wipe effect
- **HTML `<template>`** element for the grass overlay (cloned per task)
- **Canvas `requestAnimationFrame`** loop for smooth particle physics
- **`sessionStorage`** for one-session-only login
- **`localStorage`** for user accounts and per-user task data
- **`getBoundingClientRect()`** for positioning particle explosion at card center
- **`setInterval`** for bomb countdown with cancel support
- **CSS `::before`** pseudo-element for priority color stripes
- **CSS `rotateY`** 3D perspective for spin-in animation

---

## 🔒 Security Note

This is a **demo/portfolio project**. Passwords are stored in plain text in `localStorage`. For production apps, always use a proper backend with hashed passwords and real authentication (Firebase, Auth0, or custom API).

---

## 🌐 Deploy to GitHub Pages

```bash
git init
git add .
git commit -m "Initial commit — Taskflow"
git remote add origin https://github.com/YOUR_USERNAME/taskflow.git
git push -u origin main
# Go to Settings → Pages → Source: main branch
```

---

## 📄 License

MIT — free to use, learn from, and build on.

---

*Built with ✦ and zero dependencies.*
=======
# taskflow-3d-todo-app
A modern interactive task management app with 3D effects, authentication, animations, dark mode, and task tracking features.
>>>>>>> d8af441d8cc07b6e4d2e53cb5e05263d77a20c42
