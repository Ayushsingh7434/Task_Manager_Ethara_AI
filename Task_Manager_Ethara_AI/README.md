# 🚀 TaskFlow – Team Task Manager

TaskFlow is a simple and efficient web app designed to help teams stay organized and get work done smoothly. Built using **React, Node.js, and MongoDB**, it makes managing projects and tasks easy for both admins and team members.

---

## 🔗 Live Demo

👉 **Try it here:**
[https://taskmanagerea-production-0b5f.up.railway.app](https://taskmanagerea-production-0b5f.up.railway.app)

* **Frontend:** [https://taskmanagerea-production-0b5f.up.railway.app](https://taskmanagerea-production-0b5f.up.railway.app)
* **Backend API:** [https://taskmanagerea-production.up.railway.app/api](https://taskmanagerea-production.up.railway.app/api)

---

## ✨ What You Can Do

* 🔐 Sign up and log in with roles (**Admin** or **Member**)
* 📁 Admins can create projects, assign tasks, and manage team members
* ✅ Members can view their tasks and update their progress
* 📊 Dashboard gives a quick overview of task progress and stats
* 🔍 Easily filter tasks by status, priority, or search by name

---

## 🛠️ Tech Stack

**Frontend**

* React
* TypeScript
* Vite
* React Router
* Axios

**Backend**

* Node.js
* Express
* MongoDB
* JWT Authentication

---

## 💻 Run Locally

### Backend Setup

```bash
cd backend
npm install
npm run dev
```

Create a `.env` file inside `/backend` and add:

```
PORT=5000
MONGO_URI=your_mongodb_url
JWT_SECRET=your_secret
JWT_EXPIRE=7d
NODE_ENV=development
```

---

### Frontend Setup

```bash
npm install
npm run dev
```

Create a `.env` file in the root folder and add:

```
VITE_API_URL=http://localhost:5000/api
```

---

## 🌐 Deployment

Deployed on Railway:
[https://railway.app](https://railway.app)

---

✨ Feel free to explore, use, and improve TaskFlow!
