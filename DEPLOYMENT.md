# 🚀 AI Gym OS Deployment Guide

This guide will walk you through deploying your AI Gym OS project to the web.

## 1. Database: MongoDB Atlas (Free)
Your project needs a cloud database to store user data, meals, and workouts.

1.  Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2.  Create a free Cluster (Shared).
3.  In **Network Access**, add `0.0.0.0/0` (allows access from anywhere).
4.  In **Database Access**, create a user (keep the username and password).
5.  Click **Connect** -> **Connect your application** and copy the **Connection String**.
    *   It looks like: `mongodb+srv://<username>:<password>@cluster.mongodb.net/gym-os?retryWrites=true&w=majority`

---

## 2. Backend: Render.com (Free)
Render is a great place to host your Node.js API.

1.  Push your code to a **GitHub Repository**.
2.  Go to [Render](https://render.com/) and create a new **Web Service**.
3.  Connect your GitHub repo and select the `backend` folder.
4.  **Runtime**: Node
5.  **Build Command**: `npm install`
6.  **Start Command**: `npm start`
7.  Add the following **Environment Variables**:
    *   `PORT`: `5000`
    *   `MONGO_URI`: (Your MongoDB Atlas string)
    *   `JWT_SECRET`: (A long random string)
    *   `GROQ_API_KEY`: (Your Groq API Key)
8.  Copy your Render URL (e.g., `https://gym-os-api.onrender.com`).

---

## 3. Frontend: Vercel (Free)
Vercel is the best place for Next.js applications.

1.  Go to [Vercel](https://vercel.com/) and create a new project.
2.  Connect your GitHub repo and select the `frontend` folder.
3.  **Framework Preset**: Next.js
4.  Add the following **Environment Variables**:
    *   `NEXT_PUBLIC_API_URL`: `https://your-backend-url.onrender.com/api`
5.  Click **Deploy**.

---

## 4. Final Step: Seeding the Production DB
Once your backend is live on Render, you need to add the initial meals and exercises.

1.  Open your local terminal in the `backend` folder.
2.  Run the following command (replace with your Atlas URI):
    ```bash
    $env:MONGO_URI="your_atlas_uri_here"; node src/utils/seed.js
    ```
    *Note: On Linux/Mac, use `MONGO_URI="..." node src/utils/seed.js`*

---

## ✅ Deployment Checklist
- [ ] MongoDB Atlas cluster is active.
- [ ] Backend environment variables are set correctly on Render.
- [ ] Frontend environment variables point to the production backend URL.
- [ ] Database is seeded.

**Your AI Gym OS is now LIVE!**
