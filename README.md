# 🏦 CreditIQ — Credit Score Prediction System

> **Full-Stack ML Web App** · FastAPI + React + PostgreSQL + RandomForest + SHAP

[![Backend: FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?style=flat-square)](https://fastapi.tiangolo.com/)
[![Frontend: React](https://img.shields.io/badge/Frontend-React_18-61DAFB?style=flat-square)](https://react.dev/)
[![ML: scikit-learn](https://img.shields.io/badge/ML-scikit--learn-F7931E?style=flat-square)](https://scikit-learn.org/)
[![DB: PostgreSQL](https://img.shields.io/badge/DB-PostgreSQL-4169E1?style=flat-square)](https://www.postgresql.org/)

---

## 📋 Table of Contents

1. [Project Overview](#-project-overview)
2. [Tech Stack](#-tech-stack)
3. [Folder Structure](#-folder-structure)
4. [Local Setup (Step-by-Step)](#-local-setup-step-by-step)
5. [Database Setup (Neon.tech FREE)](#-database-setup-neontech-free)
6. [Deploy Backend to Render](#-deploy-backend-to-render-free)
7. [Deploy Frontend to Vercel](#-deploy-frontend-to-vercel-free)
8. [Make it Live 24×7](#-make-it-live-247)
9. [API Documentation](#-api-documentation)
10. [Features Checklist](#-features-checklist)

---

## 🎯 Project Overview

CreditIQ is a **production-ready, full-stack Credit Score Prediction System** built as a college project demonstrating:

- 🤖 Machine Learning (Random Forest, 95%+ accuracy)
- 🔍 Explainable AI (SHAP values)
- 🔐 JWT Authentication with Role-Based Access
- 📊 Interactive Dashboard with Charts
- 📄 PDF Report Generation
- ☁️ Free cloud deployment (Render + Vercel + Neon)

---

## 🛠 Tech Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Frontend   | React 18, Vite, Tailwind CSS, Chart.js |
| Backend    | Python 3.11, FastAPI, Uvicorn       |
| ML         | scikit-learn, SHAP, pandas, numpy   |
| Database   | PostgreSQL (Neon.tech - FREE)       |
| Auth       | JWT (python-jose), bcrypt           |
| ORM        | SQLAlchemy 2.0                      |
| PDF        | ReportLab                           |
| Deployment | Render (backend), Vercel (frontend) |

---

## 📁 Folder Structure

```
credit-score-system/
├── backend/
│   ├── app/
│   │   ├── main.py              ← FastAPI app + CORS
│   │   ├── api/
│   │   │   ├── auth.py          ← Login, Signup endpoints
│   │   │   ├── predictions.py   ← Predict + history + PDF
│   │   │   ├── admin.py         ← Admin-only stats
│   │   │   └── users.py         ← /me endpoint
│   │   ├── core/
│   │   │   ├── config.py        ← Settings from .env
│   │   │   └── security.py      ← JWT + bcrypt helpers
│   │   ├── db/
│   │   │   └── database.py      ← SQLAlchemy engine + session
│   │   ├── models/
│   │   │   ├── user.py          ← User table
│   │   │   └── prediction.py    ← Predictions table
│   │   ├── schemas/
│   │   │   └── schemas.py       ← Pydantic request/response models
│   │   ├── services/
│   │   │   └── ml_service.py    ← Load model, predict, SHAP
│   │   └── ml/
│   │       └── train_model.py   ← Train RandomForest + save
│   ├── models/                  ← Saved .pkl files (auto-generated)
│   ├── requirements.txt
│   ├── Dockerfile
│   ├── build.sh
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx              ← Routes
│   │   ├── main.jsx             ← Entry point
│   │   ├── index.css            ← Tailwind + custom styles
│   │   ├── context/
│   │   │   ├── AuthContext.jsx  ← JWT + user state
│   │   │   └── ThemeContext.jsx ← Dark/light mode
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── SignupPage.jsx
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── PredictPage.jsx
│   │   │   ├── HistoryPage.jsx
│   │   │   └── AdminPage.jsx
│   │   ├── components/ui/
│   │   │   └── Layout.jsx       ← Sidebar + nav
│   │   └── utils/
│   │       └── api.js           ← Axios + interceptors
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── vercel.json
│
└── README.md
```

---

## 💻 Local Setup (Step-by-Step)

### Prerequisites

You need these installed on your computer:
- **Python 3.11+** → Download from https://python.org
- **Node.js 18+** → Download from https://nodejs.org
- **Git** → Download from https://git-scm.com

### Step 1 — Clone the project

```bash
# Open your terminal / command prompt
git clone https://github.com/YOUR_USERNAME/credit-score-system.git
cd credit-score-system
```

### Step 2 — Set up the Backend

```bash
# Go into backend folder
cd backend

# Create a Python virtual environment (like a sandbox)
python -m venv venv

# Activate it:
# On Windows:
venv\Scripts\activate
# On Mac/Linux:
source venv/bin/activate

# Install all required packages
pip install -r requirements.txt
```

### Step 3 — Create your .env file

```bash
# Copy the example file
cp .env.example .env
```

Now open the `.env` file in any text editor (like Notepad or VS Code) and fill in:

```env
SECRET_KEY=any_random_long_string_here_like_this_abc123xyz
DATABASE_URL=postgresql://user:password@host/dbname   ← from Neon (see below)
ALLOWED_ORIGINS=["http://localhost:5173"]
```

### Step 4 — Train the ML model

```bash
# Still in backend folder with venv active
python -m app.ml.train_model
```

You should see output like:
```
📊 Generating synthetic dataset …
🌲 Training RandomForestClassifier …
✅ Accuracy: 0.9521
💾 Model saved to models/
```

### Step 5 — Start the Backend

```bash
uvicorn app.main:app --reload --port 8000
```

Visit http://localhost:8000 — you should see `{"status": "ok"}`
Visit http://localhost:8000/api/docs — Swagger UI! 🎉

### Step 6 — Set up the Frontend

```bash
# Open a NEW terminal window
cd frontend

# Install packages
npm install

# Create .env file
echo "VITE_API_URL=http://localhost:8000" > .env
# (on Windows: create a file called .env with that content)
```

### Step 7 — Start the Frontend

```bash
npm run dev
```

Visit http://localhost:5173 — the app is running! 🚀

### Step 8 — Create admin account

After signing up your first user, run this in the backend terminal to make yourself admin:

```sql
-- Connect to your database and run:
UPDATE users SET role = 'admin' WHERE email = 'your@email.com';
```

Or with the Neon SQL editor (see below).

---

## 🗄 Database Setup (Neon.tech FREE)

Neon gives you a **free PostgreSQL database** that works 24×7.

### Step 1 — Create Neon account
1. Go to https://neon.tech
2. Click **"Sign Up"** (use GitHub login — easiest)
3. Click **"Create a project"**
4. Name it: `credit-score-db`
5. Choose region: **US East** (or closest to you)
6. Click **"Create project"**

### Step 2 — Get your connection string
1. On the dashboard, find **"Connection Details"**
2. Select **"Connection string"** tab
3. Copy the string — looks like:
   ```
   postgresql://username:password@ep-something.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```
4. Paste this as `DATABASE_URL` in your backend `.env` file

### Step 3 — Tables are auto-created
When you run the backend, SQLAlchemy automatically creates all tables. You don't need to write any SQL!

### Step 4 — Make yourself admin (optional)
1. Sign up on the website first
2. Go to Neon dashboard → **SQL Editor**
3. Run:
   ```sql
   UPDATE users SET role = 'admin' WHERE email = 'your@email.com';
   ```

---

## 🚀 Deploy Backend to Render (FREE)

Render hosts your FastAPI backend for free at a permanent URL.

### Step 1 — Push to GitHub
1. Go to https://github.com and create a new repository
2. Name it `credit-score-backend`
3. Upload your entire `backend/` folder contents (not the folder itself)

### Step 2 — Sign up on Render
1. Go to https://render.com
2. Click **"Get Started for Free"**
3. Sign up with GitHub

### Step 3 — Create a Web Service
1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repository
3. Fill in the settings:
   - **Name:** `credit-score-api`
   - **Region:** Oregon (US West)
   - **Branch:** main
   - **Runtime:** Python 3
   - **Build Command:** `pip install -r requirements.txt && python -m app.ml.train_model`
   - **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

### Step 4 — Add Environment Variables
Click **"Environment"** tab, then add each variable:
- `SECRET_KEY` = (generate one: `python -c "import secrets; print(secrets.token_hex(32))"`)
- `DATABASE_URL` = (your Neon connection string)
- `ALLOWED_ORIGINS` = `["https://your-frontend.vercel.app"]` ← fill after Vercel deploy

### Step 5 — Deploy!
Click **"Create Web Service"** and wait ~5 minutes.

Your backend URL will be: `https://credit-score-api.onrender.com`

Test it: Visit `https://credit-score-api.onrender.com/api/docs`

---

## ⚡ Deploy Frontend to Vercel (FREE)

### Step 1 — Push frontend to GitHub
Create a new repo `credit-score-frontend` and push your `frontend/` folder.

### Step 2 — Sign up on Vercel
1. Go to https://vercel.com
2. Click **"Sign Up"** with GitHub

### Step 3 — Import project
1. Click **"New Project"**
2. Import your `credit-score-frontend` repository
3. Vercel auto-detects Vite ✓

### Step 4 — Add environment variable
In Vercel settings before deploying:
- Click **"Environment Variables"**
- Add: `VITE_API_URL` = `https://credit-score-api.onrender.com`

### Step 5 — Deploy!
Click **"Deploy"** and wait ~2 minutes.

Your frontend URL: `https://credit-score-frontend.vercel.app`

### Step 6 — Update backend CORS
Go back to Render → Environment Variables → Update `ALLOWED_ORIGINS`:
```
["https://credit-score-frontend.vercel.app"]
```
Then click **"Save Changes"** — Render will auto-redeploy.

---

## 🔄 Make it Live 24×7

### Render Free Tier Note
Free Render services **"sleep"** after 15 minutes of inactivity (cold start = ~30 seconds).

**To keep it always awake for free:**
1. Go to https://cron-job.org (free)
2. Create a free account
3. Create a new cron job:
   - URL: `https://credit-score-api.onrender.com/health`
   - Schedule: Every 10 minutes
4. This "pings" your backend so it never sleeps!

### Vercel
Vercel frontend is **always live** — no action needed! 🎉

---

## 📖 API Documentation

Once backend is running, visit:
- **Swagger UI:** `http://localhost:8000/api/docs` (interactive, test directly in browser)
- **ReDoc:**      `http://localhost:8000/api/redoc` (beautiful documentation)

### Key Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/signup` | Create account | No |
| POST | `/api/auth/login` | Get JWT token | No |
| GET | `/api/users/me` | Get current user | Yes |
| POST | `/api/predictions/predict` | Run prediction | Yes |
| GET | `/api/predictions/history` | My history | Yes |
| GET | `/api/predictions/history/{id}/pdf` | Download PDF | Yes |
| GET | `/api/admin/stats` | Platform stats | Admin only |
| GET | `/api/admin/users` | All users | Admin only |

---

## ✅ Features Checklist

- [x] User Signup + Login
- [x] JWT Authentication
- [x] Password hashing (bcrypt)
- [x] Role-based access (Admin/User)
- [x] Credit Score Prediction (RandomForest)
- [x] SHAP Explainable AI
- [x] Feature Importance Chart
- [x] User Dashboard with Charts
- [x] Prediction History
- [x] PDF Report Download
- [x] Admin Panel with Analytics
- [x] Dark/Light Mode Toggle
- [x] Responsive Mobile UI
- [x] Swagger API Documentation
- [x] Dockerfile
- [x] Free cloud deployment
- [x] 24×7 uptime

---

## 🔧 Troubleshooting

### "Cannot connect to database"
- Check your `DATABASE_URL` in `.env`
- Make sure Neon project is not paused (free tier pauses after inactivity)
- Go to Neon dashboard and click "Resume"

### "Model not found" error
- Run `python -m app.ml.train_model` first
- Make sure you're running commands from the `backend/` folder

### Frontend shows blank page
- Open browser console (F12) and check for errors
- Make sure `VITE_API_URL` in `.env` is correct
- Check that the backend is running

### CORS error in browser
- Update `ALLOWED_ORIGINS` in backend `.env` to include your frontend URL
- Restart the backend server

---

## 👨‍💻 Author

Built as a college project demonstrating full-stack web development with Machine Learning.

**Tech used:** Python · FastAPI · React · PostgreSQL · scikit-learn · SHAP · JWT · Tailwind CSS
