# LMS Portal - Local Setup Guide (No Docker)

## Overview
**LMS Platform** is a Learning Management System for Data Science Residency programs with:
- **Backend:** Node.js + Express + PostgreSQL
- **Frontend:** Next.js + React
- **Features:** Course management, assignments, quizzes, attendance, gamification, and more

---

## Prerequisites

### 1. **Node.js 18+** (Required)
Download from https://nodejs.org (get the LTS version)

**Verify installation:**
```bash
node --version
npm --version
```

### 2. **PostgreSQL Database** (Required)
You have two options:

#### Option A: Use Neon (Easiest - Free Cloud Database)
1. Go to https://neon.com and sign up
2. Create a new project
3. Copy your connection string (looks like: `postgresql://user:pass@host/db`)
4. Keep it safe—you'll paste it in `.env`

#### Option B: Install PostgreSQL Locally
- **Windows:** https://www.postgresql.org/download/windows/
- **Mac:** `brew install postgresql`
- **Linux:** `sudo apt-get install postgresql`

After install, create a database:
```bash
psql -U postgres
CREATE DATABASE lms_portal;
```
Your connection string: `postgresql://postgres:yourpassword@localhost:5432/lms_portal`

---

## Quick Start (5 Steps)

### Step 1: Navigate to Server Directory
```bash
cd C:\Projects\lms-portal\server
```

### Step 2: Create `.env` File in Server Folder
Create a file named `.env` in the `server` folder with:

```env
DATABASE_URL="postgresql://paste-your-neon-connection-string-here"
JWT_SECRET="your-super-secret-random-key-make-it-long-123456789abcdef"
JWT_REFRESH_SECRET="another-different-secret-key-make-it-long-987654321fedcba"
PORT=5001
CLIENT_URL="http://localhost:3000"
```

**Replace:**
- `DATABASE_URL` — your Neon/PostgreSQL connection string
- `JWT_SECRET` & `JWT_REFRESH_SECRET` — generate random strings (make them different and long)

### Step 3: Set Up Database & Start Server
```bash
npm install
npx prisma generate
npx prisma migrate deploy
npm run db:seed
npm run dev
```

✅ You should see: `Server running on port 5001`

**Leave this terminal running!**

---

### Step 4: Start Client (New Terminal)
Open a **second terminal**:

```bash
cd C:\Projects\lms-portal\client
npm install
```

Create a file named `.env.local` in the `client` folder:
```env
NEXT_PUBLIC_API_URL="http://localhost:5001/api"
```

Then start:
```bash
npm run dev
```

✅ You should see: `▲ Next.js 16.2.9`

**Leave this terminal running!**

---

### Step 5: Open in Browser
Go to **http://localhost:3000**

**Default login:**
- Email: `admin@lms.com`
- Password: `Admin@123`

⚠️ **Change this password immediately!**

---

## What You Can Do

### Admin Functions
- **Users** → Create mentors and interns
- **Assign Interns** → Link interns to mentors (mentors only see their assigned interns)
- **Curriculum** → Add courses, modules, lessons with Google Drive links
- **Assignments** → Create and track assignments
- **Quizzes** → Build and grade quizzes
- **Attendance** → Track daily attendance
- **Hackathons & Capstones** → Manage projects and competitions
- **Gamification** → Award points and badges
- **Dashboard** → View analytics and progress

### Mentor Functions
- View assigned interns
- Track progress
- Grade assignments and quizzes
- Manage standups and daily tasks

### Intern Functions
- View courses and materials
- Submit assignments
- Take quizzes
- Track attendance
- View progress and points
- Participate in hackathons

---

## Troubleshooting

### "Cannot find module" or "npm ERR!"
```bash
# Clear and reinstall
rm -r node_modules package-lock.json
npm install
```

### "connect ECONNREFUSED 127.0.0.1:5432"
Your database isn't running or connection string is wrong.
- Check `DATABASE_URL` in `.env`
- If using Neon, verify it's active on their site
- If local PostgreSQL, make sure it's running

### "Invalid credentials" on login
The seed didn't run. In the **server terminal**, press Ctrl+C and run:
```bash
npm run db:seed
npm run dev
```

### Website shows blank or "Cannot reach backend"
- Check `.env.local` in client: `NEXT_PUBLIC_API_URL="http://localhost:5001/api"`
- Restart client (Ctrl+C, then `npm run dev`)
- Make sure server is running on port 5001

### Ports already in use
```bash
# Kill process on port 5001 (server)
npx kill-port 5001

# Kill process on port 3000 (client)
npx kill-port 3000
```

---

## Production Deployment (Later)

When ready to deploy:
1. **Database:** Keep Neon (production-ready)
2. **Server:** Deploy to Render, Railway, or Fly.io
3. **Client:** Deploy to Vercel or Netlify
4. See README.md for detailed steps

---

## File Structure
```
lms-portal/
├── server/          # Node.js backend
│   ├── .env        # Database & secrets (create this)
│   ├── src/
│   └── package.json
├── client/          # Next.js frontend
│   ├── .env.local  # API URL (create this)
│   ├── src/
│   └── package.json
└── README.md
```

---

## Need Help?

- **GitHub Issues:** https://github.com/Sumanth-tks/lms-portal/issues
- Check both terminals for error messages
- Make sure both `.env` and `.env.local` are created correctly
