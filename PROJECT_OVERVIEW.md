# LMS Portal - Project Overview

## 🎯 Purpose
An **LMS (Learning Management System)** built for managing a **Data Science Residency program**. It's like a combination of:
- Course management (like Blackboard)
- Assignment tracking (like GitHub Classroom)
- Team collaboration (like Slack)
- Progress analytics (like a dashboard)

---

## 📊 Core Features

### For Admins
- **User Management:** Create/manage admins, mentors, and interns
- **Batches:** Organize cohorts of students
- **Curriculum:** Create courses with modules and lessons
- **Materials:** Link Google Drive for slides and PDFs
- **Attendance:** Track daily attendance
- **Assignments:** Create, assign, and grade assignments
- **Quizzes:** Build and grade quizzes
- **Standups:** Daily standup notes and updates
- **Daily Tasks:** Assign daily coding tasks
- **Hackathons:** Create and manage hackathon events
- **Capstones:** Track final capstone projects
- **Progress Tracking:** Analytics on student performance
- **Gamification:** Award points, badges, and leaderboards
- **GitHub Integration:** Link GitHub profiles and track code
- **Dashboard:** Real-time metrics and analytics

### For Mentors
- View assigned interns only
- Grade assignments and quizzes
- Track attendance
- Provide feedback on standups
- Monitor capstone progress
- View gamification points

### For Interns/Students
- View enrolled courses and materials
- Submit assignments
- Take quizzes
- Mark attendance
- Submit standup notes
- Participate in hackathons
- View progress and points
- Access portfolio of work

---

## 🏗️ Tech Stack

### Backend
- **Node.js + Express** — REST API server
- **PostgreSQL** — database (managed by Neon or local)
- **Prisma ORM** — database queries and migrations
- **JWT** — authentication/authorization
- **bcryptjs** — password hashing
- **Zod** — data validation

### Frontend
- **Next.js 16** — React framework with server-side rendering
- **React 19** — UI components
- **Tailwind CSS 4** — styling
- **Zustand** — state management
- **Axios** — API requests
- **Lucide React** — icons

---

## 📁 Project Structure

```
lms-portal/
│
├── server/                          # Backend API
│   ├── src/
│   │   ├── index.js                # Server entry point
│   │   ├── config/                 # Database config
│   │   ├── controllers/            # Business logic
│   │   ├── routes/                 # API endpoints
│   │   ├── middleware/             # Auth, validation
│   │   ├── seeds/                  # Database seed data
│   │   └── uploads/                # File storage
│   ├── prisma/
│   │   ├── schema.prisma           # Database schema
│   │   └── migrations/             # Database changes
│   ├── package.json
│   ├── .env                        # (Create this) Secrets
│   └── README.md
│
├── client/                          # Frontend Web App
│   ├── src/
│   │   ├── app/                    # Next.js pages
│   │   │   ├── (protected)/        # Login-required pages
│   │   │   │   ├── dashboard/
│   │   │   │   ├── curriculum/
│   │   │   │   ├── assignments/
│   │   │   │   ├── quizzes/
│   │   │   │   ├── attendance/
│   │   │   │   ├── progress/
│   │   │   │   └── ...
│   │   │   ├── login/              # Login page
│   │   │   └── change-password/
│   │   ├── components/             # Reusable UI components
│   │   ├── stores/                 # Zustand state
│   │   ├── lib/                    # Utilities
│   │   └── types/                  # TypeScript types
│   ├── package.json
│   ├── .env.local                  # (Create this) API URL
│   └── tailwind.config.ts
│
└── docs/                            # Documentation
    └── specs/                       # Design specifications
```

---

## 🔄 Data Flow

```
User (Browser)
    ↓ HTTP Request
Next.js Client (React)
    ↓ API Call (axios)
Node.js Server (Express)
    ↓ Query
PostgreSQL Database
    ↓ Response
Node.js Server
    ↓ JSON Response
Next.js Client
    ↓ Render UI
User (Browser)
```

---

## 🔐 Authentication Flow

1. **Login:** User enters email/password
2. **Validate:** Server checks against database
3. **Token:** Server creates JWT token + refresh token
4. **Store:** Client stores tokens in memory + cookies
5. **Access:** Client sends token with every API request
6. **Verify:** Server verifies token on protected routes
7. **Refresh:** When token expires, use refresh token to get new one

---

## 📚 Database Schema (Key Tables)

- **User** — Admins, mentors, interns
- **Batch** — Cohorts/groups
- **Course** — Subjects/modules
- **Module** — Subdivisions of courses
- **Lesson** — Individual lessons with materials
- **Assignment** — Assignments with due dates
- **Quiz** — Tests with questions
- **Attendance** — Daily attendance records
- **Standup** — Daily standup notes
- **DailyTask** — Daily coding challenges
- **Hackathon** — Hackathon events
- **Capstone** — Capstone projects
- **GamificationPoints** — Points, badges, leaderboard
- **Progress** — Student progress tracking
- **AccessControl** — Mentor-intern assignments

---

## 🚀 Local Development Workflow

### First Time Setup
```bash
# Run the setup script
./setup.bat          # Windows
./setup.sh          # Mac/Linux
```

### Daily Workflow
```bash
# Terminal 1: Start backend
cd server
npm run dev

# Terminal 2: Start frontend
cd client
npm run dev

# Open browser
http://localhost:3000
```

### Making Changes
- **Backend:** Modify files in `server/src/` → Server auto-reloads (nodemon)
- **Frontend:** Modify files in `client/src/` → Browser auto-refreshes
- **Database:** To change schema, edit `server/prisma/schema.prisma` → Run migration

---

## 🔧 Common Commands

### Server (Backend)
```bash
cd server

npm run dev              # Start in development mode
npm start              # Start in production mode
npm run db:migrate     # Create new migration
npm run db:push        # Push schema changes
npm run db:seed        # Reset and seed database
npm run db:studio      # Open Prisma Studio (visual DB editor)
```

### Client (Frontend)
```bash
cd client

npm run dev            # Start dev server
npm run build          # Build for production
npm start             # Start production build
npm run lint          # Check code style
```

---

## 🔐 Security Notes

- ✅ Passwords hashed with bcryptjs
- ✅ JWT tokens for authentication
- ✅ CORS enabled for cross-origin requests
- ✅ Rate limiting on login attempts (5 per 15 min)
- ✅ API rate limiting (100 requests per minute)
- ✅ Environment variables for secrets
- ⚠️ HTTPS required in production
- ⚠️ Change default admin password on first login
- ⚠️ Never commit `.env` files to git

---

## 🐛 Debugging Tips

### Server won't start?
```bash
# Check if port 5001 is already in use
npx kill-port 5001

# Check .env file exists and has DATABASE_URL
cat server/.env

# See detailed error logs
npm run dev
```

### Client won't start?
```bash
# Check if port 3000 is already in use
npx kill-port 3000

# Check .env.local has correct API URL
cat client/.env.local

# Clear Next.js cache
rm -rf client/.next
npm run dev
```

### Database issues?
```bash
# Open Prisma Studio to see data
cd server
npm run db:studio

# Reset database (WARNING: deletes all data!)
npx prisma migrate reset
```

### Login not working?
```bash
# Re-seed the database with default admin
cd server
npm run db:seed
```

---

## 📈 Next Steps After Setup

1. **Change Admin Password** — Go to Settings → Change Password
2. **Create Users** — Admin → Users → Add mentors and interns
3. **Create Batch** — Admin → Batches → New cohort
4. **Build Curriculum** — Admin → Curriculum → Add courses/modules
5. **Add Materials** — Upload Google Drive links to lessons
6. **Invite Discord** — Update Discord link in `client/src/app/(protected)/discord/page.tsx`
7. **Customize** — Modify branding, add your logo, adjust colors

---

## 🌐 Production Deployment

When ready for real users:

1. **Database:** Upgrade Neon plan or use managed PostgreSQL
2. **Backend:** Deploy to Railway, Render, or Fly.io
3. **Frontend:** Deploy to Vercel or Netlify
4. **Domain:** Point custom domain to deployed app
5. **SSL:** Use HTTPS everywhere (auto-handled by most hosts)

See `README.md` for detailed deployment guide.

---

## 📞 Support & Contributions

- **GitHub:** https://github.com/Sumanth-tks/lms-portal
- **Issues:** Report bugs on GitHub Issues
- **Discussions:** Ask questions in GitHub Discussions

---

## 📝 License

Specify your license here (MIT, Apache, etc.)

---

**Built with ❤️ for Data Science Education**
