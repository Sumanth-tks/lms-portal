# LMS Portal - Quick Start (5 Minutes)

## ⚡ Super Quick Version

### Prerequisites
- **Node.js 18+** from https://nodejs.org
- **PostgreSQL** or **Neon** account (free at https://neon.com)

### Do This:

#### 1️⃣ Get Database Connection String
- Option A (Easiest): Sign up for Neon.com, create project, copy connection string
- Option B: Use local PostgreSQL: `postgresql://postgres:yourpassword@localhost:5432/lms_portal`

#### 2️⃣ Setup Everything (Windows)
```bash
cd C:\Projects\lms-portal
setup.bat
```

**When prompted, edit `server\.env` and paste your database connection string.**

#### 3️⃣ Start Backend
```bash
cd server
npm run dev
```
✓ Should see: `Server running on port 5001`

#### 4️⃣ Start Frontend (New Terminal)
```bash
cd client
npm run dev
```
✓ Should see: `▲ Next.js`

#### 5️⃣ Open Browser
Go to: **http://localhost:3000**

**Login:**
- Email: `admin@lms.com`
- Password: `Admin@123`

**Change password immediately!**

---

## 🎯 What is This?

A **Learning Management System** for managing a Data Science education program.

**Features:**
- 📚 Course management
- 📝 Assignments & quizzes
- 📊 Progress tracking
- 🎮 Gamification (points, badges)
- 👥 User management
- 📅 Attendance tracking
- 🔨 Hackathons & capstones
- 💬 Daily standups

---

## 📁 Files I Created For You

| File | Purpose |
|------|---------|
| `SETUP_GUIDE.md` | Detailed setup instructions |
| `PROJECT_OVERVIEW.md` | Full documentation of features & architecture |
| `QUICK_START.md` | This file! Fast reference |
| `setup.bat` | Automated setup script (Windows) |
| `setup.sh` | Automated setup script (Mac/Linux) |
| `start.bat` | Quick start both server & client (Windows) |

---

## 🔧 Manual Setup (If setup.bat doesn't work)

### Server Setup
```bash
cd server
npm install
# Edit .env file with your database connection
npx prisma generate
npx prisma migrate deploy
npm run db:seed
npm run dev
```

### Client Setup
```bash
cd client
npm install
# Create .env.local with: NEXT_PUBLIC_API_URL="http://localhost:5001/api"
npm run dev
```

---

## 🛠️ Troubleshooting

### "Cannot find Node.js"
- Install from https://nodejs.org

### "Database connection failed"
- Update `server/.env` with correct connection string
- Verify database is running (if local PostgreSQL)

### "Login doesn't work"
```bash
cd server
npm run db:seed
npm run dev
```

### "Port already in use"
```bash
npx kill-port 5001   # For server
npx kill-port 3000   # For client
```

---

## 📖 Learn More

- `PROJECT_OVERVIEW.md` — Features, tech stack, database schema
- `SETUP_GUIDE.md` — Detailed step-by-step guide
- `README.md` — Original project documentation

---

## ✅ You're Ready!

1. Run `setup.bat` (Windows) or `setup.sh` (Mac/Linux)
2. Add your database connection string
3. Start backend and frontend
4. Open http://localhost:3000
5. Login and start exploring!

**Any issues?** Check the error messages in the terminal—they're usually very helpful.

---

**Happy learning! 🚀**
