# LMS — Full Stack Data Science Residency Platform

## Overview

- **Purpose**: Internal LMS for 100-day (14 weeks) Full Stack Data Science Residency Program
- **Users**: Admin, Mentors, Interns
- **Stack**: Next.js + Node/Express + PostgreSQL + Supabase Storage + Redis
- **Auth**: Email/password, JWT with refresh tokens, mentor creates intern accounts, no self-registration
- **API**: REST (JSON)
- **Real-time**: WebSockets (Socket.io) for notifications, chat, activity feed
- **Live Sessions**: Static Discord invite page

---

## Program Structure

- **Duration**: 100 days, 14 weeks
- **Schedule**: Mon–Sat, 10:00 AM – 5:00 PM
- **Saturday**: Learning Day (concepts, live demos, weekly briefing)
- **Mon–Fri**: Execution Days (build, code, submit)
- **80/20 Rule**: 80% building, 20% learning
- **Multi-batch**: System supports multiple concurrent batches (Batch 1 in week 8 while Batch 2 in week 2)

### Daily Schedule

| Time | Activity |
|------|----------|
| 10:00 AM – 12:00 PM | Mentor Time (standup, progress review, code review, doubt clearing, sprint planning) |
| 12:00 PM – 1:00 PM | Focus Work |
| 1:00 PM – 2:00 PM | Lunch Break |
| 2:00 PM – 5:00 PM | Deep Work (assignments, features, research, git commits, team collaboration) |

### 14-Week Curriculum

| Week | Days | Topic | Mini Project |
|------|------|-------|-------------|
| 1 | 1–7 | Python Fundamentals | Python mini project |
| 2 | 8–14 | SQL & Databases | SQL mini project |
| 3 | 15–21 | Statistics & Probability | Stats mini project |
| 4 | 22–28 | Data Analysis & EDA | EDA mini project |
| 5 | 29–35 | Machine Learning Basics | ML basics mini project |
| 6 | 36–42 | ML Algorithms | ML algorithms mini project |
| 7 | 43–49 | Advanced ML | Advanced ML mini project |
| 8 | 50–56 | Deep Learning | DL mini project |
| 9 | 57–63 | NLP Essentials | NLP mini project |
| 10 | 64–70 | LLMs & Generative AI | GenAI mini project |
| 11 | 71–77 | Agentic AI & Automation | Agents mini project |
| 12 | 78–84 | Data Engineering | Data pipeline mini project |
| 13 | 85–90 | Deployment & APIs | Deployment mini project |
| 14 | 91–100 | Capstone Project | Final capstone |

### Tools & Technologies Tracked

Python, Pandas, NumPy, SQL, Git & GitHub, TensorFlow, PyTorch, Docker, Jupyter, VS Code, LangChain, OpenAI/LLMs, Vector DB, Streamlit, FastAPI, scikit-learn

### Assessments Schedule

- **Alternate Week Tests**: Every 2nd Saturday (MCQ, Coding, SQL, Case Study, Viva, Code Quality Review)
- **Hackathon 1** (Day 30): EDA & Insights
- **Hackathon 2** (Day 60): ML Product with deployment & monitoring
- **Hackathon 3** (Day 85): GenAI/Agentic AI (LLMs, Vector DB, Agents)
- **Final Capstone** (Days 91–100): Problem → Solution → Deployment → Documentation → Presentation

### Weekly Deliverables

- Working code on GitHub
- Documentation & README
- Weekly demo & presentation
- Reflection report
- Mini project submission (end of each week)

### Evaluation Weights

| Component | Weight |
|-----------|--------|
| Attendance & Professionalism | 10% |
| Daily Progress | 15% |
| Weekly Assignments | 20% |
| Alternate Week Tests | 15% |
| Hackathons | 20% |
| Capstone Project | 20% |

---

## Roles & Permissions

### Mentor-Intern Mapping

- Many-to-many: one mentor can oversee multiple interns, one intern can have multiple mentors
- Primary mentor assigned per intern (main grader, reviewer)
- Mentor scoped to their assigned interns only (cannot see other mentors' interns unless admin)

### Admin

- Full platform control
- Create/manage mentor accounts
- Assign mentors to batches and interns
- Org branding and settings (logo, colors, name)
- View all data and analytics across all batches
- Audit logs (who did what, when)
- Role management (promote intern to mentor, deactivate accounts)
- Data export (CSV/PDF)
- Backup/restore
- Batch/cohort management (create, archive, configure)

### Mentor

- Create intern accounts (no self-registration)
- Create/edit courses, modules, lessons
- Upload content (videos, PDFs, docs, code snippets)
- Lock/unlock content per intern (modules, lessons, individual files)
- Assign daily tasks with due times
- Grade assignments with rubrics
- Review code (GitHub commits)
- Write per-assignment feedback
- View assigned interns' progress and attendance
- Manually override attendance (mark present/absent)
- Post announcements
- Schedule assessments and viva
- Write periodic performance reviews
- Flag underperforming interns (auto-highlight + manual)
- Bulk assign modules to multiple interns
- Use quick feedback presets (saved snippets)
- Create reusable course/module templates
- Create and manage mini project assignments

### Intern

- View only unlocked/assigned content
- Watch videos, read docs, download PDFs
- Mark attendance daily (window: 9:30 AM – 10:30 AM)
- Complete daily assigned tasks
- Submit assignments and mini projects (file upload)
- Take quizzes and tests
- Submit hackathon and capstone work
- Write weekly reflection reports
- Log daily standups (yesterday, today, blockers)
- Take personal notes within lessons
- Bookmark lessons
- Raise doubt/help requests
- View own progress, XP, badges, streak
- View calendar (deadlines, sessions, milestones)
- Search across accessible content
- View profile page (skills, scores, badges, portfolio)
- DM mentor

---

## Intern Lifecycle

| State | Description |
|-------|------------|
| **Invited** | Mentor creates account, welcome email sent with login credentials |
| **Onboarding** | First login → password change → profile setup → starter content auto-assigned |
| **Active** | In-program, full access to unlocked content |
| **Paused** | Temporarily inactive (illness, leave) — mentor pauses, progress preserved |
| **Completed** | Finished program — account becomes read-only, can view own data |
| **Converted** | Offered full-time — flagged in system |
| **Removed** | Dropped from program — account deactivated, data archived |

---

## Features

### 1. Authentication & Accounts

- Email + password login
- No public signup — mentor creates intern accounts, admin creates mentor accounts
- JWT access tokens (15 min expiry) + refresh tokens (7 day expiry)
- Password reset via email
- Password requirements: min 8 chars, 1 uppercase, 1 number
- Force password change on first login
- Session management (single or multi-device configurable)
- Role-based access control (admin > mentor > intern)
- Account deactivation (soft delete, data preserved)
- Rate limiting on login: 5 attempts per 15 minutes

### 2. Course & Content Management

- 14-week structured curriculum baked into platform
- Hierarchy: Courses → Modules → Lessons
- Content types:
  - Video (with resume — remember playback position per intern)
  - Text / Markdown
  - PDF (viewable + downloadable)
  - Code snippets (syntax highlighted)
  - Jupyter Notebooks (.ipynb — rendered in-browser with outputs: charts, tables, markdown cells)
- Estimated duration per lesson and module
- Resource library (shared links, docs, tools across all courses)
- Version history on content edits (last 10 versions)
- Course categories/tags mapped to Tools & Technologies list
- Prerequisites/dependencies (Module B locked until Module A completed)
- Saturday learning mode vs weekday execution mode (different content flow)
- Static Discord invite page for live sessions
- Mini project template per week
- Jupyter notebook submissions (view .ipynb in-browser with cell outputs)

### 2a. Dataset Management

- Shared dataset library per module (CSV, JSON, Parquet, SQL dumps)
- Mentor uploads datasets, links to modules
- Interns download datasets for assignments and mini projects
- External dataset links (Kaggle, UCI, HuggingFace, etc.)
- Dataset metadata: name, description, format, size, source
- Version tracking on dataset updates

### 2b. Environment Setup Guides

- Per-week setup checklist (install X, configure Y, verify Z)
- Step-by-step instructions with screenshots/commands
- Verification steps: intern runs check command, confirms setup done
- Mentor tracks which interns completed setup per week
- Common troubleshooting tips per tool

### 3. Access Control

- Mentor locks/unlocks at 3 levels: module, lesson, individual file
- Interns see only assigned/unlocked content — no browsing full syllabus
- Easy toggle UI (lock/unlock switch) for mentor
- Bulk assign/unlock modules to multiple interns at once
- Auto-unlock based on prerequisite completion (optional, mentor can override)
- Default: all content locked for new interns. Mentor unlocks as program progresses

### 4. Progress Tracking

- Module status tags: **Not Started** → **In Progress (X% done)** → **Completed**
- Lesson-level completion tracking
- Video position tracking (resume from where left off)
- Time spent per lesson and module
- Daily progress logging
- Weekly progress summary
- Overall course completion percentage
- Streak tracker (consecutive active days)
- 80/20 ratio tracking (building vs learning time in analytics)

### 5. Daily Workflow

- **Attendance**:
  - Intern marks attendance daily within window: 9:30 AM – 10:30 AM
  - Late marking (10:30 AM – 11:00 AM) = marked as "Late"
  - After 11:00 AM = cannot mark, auto-absent unless mentor overrides
  - Once marked present, must complete all daily assigned tasks by 5:00 PM — otherwise status changes to "Incomplete"
  - Mentor can manually override attendance (mark present/absent/excused)
  - Weekend (Saturday) has separate attendance for learning day
- **Daily standup log**: What did yesterday, doing today, blockers
- **Daily task assignments**: Mentor assigns tasks with due time, intern checks off completion
- **Mentor attendance view**: See attendance records + what each intern is doing/completed today

### 6. Assignments

- Mentor creates assignments with:
  - Description
  - Rubrics (grading criteria with point breakdown)
  - Deadline (date + time)
  - Max score
  - File type requirements (e.g., .py, .ipynb, .pdf)
  - File size limit (configurable, default 50MB)
- File upload submissions via Supabase Storage
- Mentor reviews and grades against rubric
- Written feedback per assignment
- Quick feedback presets (saved common snippets for reuse)
- Peer review: interns review each other's work before mentor grades
- Plagiarism detection: cosine similarity comparison across submissions (flag >80% similarity)
- Resubmission allowed (configurable per assignment, max resubmits)
- Mini project submissions follow same flow

### 7. Quizzes & Tests

- Alternate week assessments (every 2nd Saturday):
  - MCQ + Concept Test
  - Coding Test (Python)
  - SQL Test
  - Case Study / Problem Solving
  - Viva / Technical Discussion (mentor schedules slot, records score)
  - Code Quality Review (mentor reviews, records score)
- Timed quizzes with auto-submit on timeout
- Auto-grading for MCQ (compare answers)
- Coding test execution via Judge0 API (sandboxed, run against test cases)
- SQL test execution against test database
- Retake policy: configurable number of retakes, best or last score (configurable)
- Question types: MCQ (single/multi select), code (Python/SQL), free text

### 8. GitHub Integration

- Intern links their GitHub repo(s) via GitHub OAuth or manual URL
- Track commits and pushes per intern per day via GitHub API webhooks
- Code review workflow: mentor reviews specific commits, leaves inline comments
- Coding playground: embedded Monaco editor for in-platform practice
- Code execution in playground via Judge0 API (Python, SQL support)
- Portfolio page: showcase all repos, mini projects, hackathon submissions

### 9. Hackathons

- 3 hackathon events built into curriculum:
  - **Day 30**: EDA & Insights — build data analysis project with visualization
  - **Day 60**: ML Product — end-to-end ML app with deployment & monitoring
  - **Day 85**: GenAI/Agentic AI — AI solution using LLMs, Vector DB, Agents
- Timed submission window (configurable start and end time)
- Judging and scoring by mentors with rubric
- Per-hackathon leaderboard
- Team or individual (configurable per hackathon)

### 10. Capstone Project (Days 91–100)

- Problem statement submission and mentor approval
- Phase tracker:
  1. Problem Statement
  2. End-to-End Solution
  3. Deployment
  4. Documentation
  5. Presentation
  6. Final Evaluation
- Primary mentor assigned as capstone reviewer
- Mentor feedback at each phase
- Final scoring against capstone rubric

### 11. Weekly Deliverables Tracking

- Working code on GitHub (link submission)
- Documentation & README (link or file submission)
- Weekly demo/presentation (schedule slot + recording/link)
- Reflection report (intern writes weekly, mentor reviews)
- Mini project submission (end of each week)
- Mentor marks each deliverable as received/missing

### 12. Evaluation & Scoring

- Weighted scoring system:
  - Attendance & Professionalism: 10%
  - Daily Progress: 15%
  - Weekly Assignments: 20%
  - Alternate Week Tests: 15%
  - Hackathons: 20%
  - Capstone Project: 20%
- Auto-calculate overall score per intern
- Score normalization within batch
- Performance-to-conversion tracking: flag top performers for full-time offer consideration
- Threshold configurable: e.g., >85% = "Recommend for conversion"

### 13. Gamification

- **XP system**: Earn points for completing lessons (10 XP), quizzes (25 XP), assignments (50 XP), mini projects (75 XP), hackathons (100 XP)
- **Badges/achievements**: "First Quiz Aced", "7-Day Streak", "Speed Learner", "Bug Hunter", "Early Bird", etc.
- **Levels**: Intern levels up based on accumulated XP (Level 1: 0-500, Level 2: 500-1500, etc.)
- **Leaderboard**: Rank interns by XP, scores, or completion (filterable by batch)
- **Weekly challenges**: Mentor posts optional challenge with bonus XP
- **Daily streak tracker**: Consecutive days of activity

### 14. Communication

- **Direct messaging**: Intern ↔ Mentor DMs within platform (real-time via WebSocket)
- **Discussion threads**: Per-module Q&A between interns and mentors
- **Doubt/help requests**: Intern raises hand on specific lesson, mentor gets notified, tracks resolution time
- **Announcements**: Mentor broadcasts messages to all interns in batch or all batches
- **Activity feed**: Timeline of recent actions (submissions, completions, announcements)

### 15. Notifications (Basic in Phase 2, Full in Phase 9)

- **In-app notifications** (from Phase 2):
  - New daily task assigned
  - Attendance reminder (9:30 AM)
  - Deadline approaching (2 hours before)
- **Email notifications** (from Phase 5+):
  - Account created / welcome email
  - Feedback received
  - New announcement
  - Hackathon starting
  - Weekly summary digest
- **Real-time** via WebSocket (from Phase 7):
  - New message received
  - Doubt response received
  - Live activity feed updates
- Email provider: Resend (or Nodemailer + SMTP)
- Scheduled reminders ("Assignment due in 2 hours")

### 16. Intern Dashboard

- Today's assigned tasks with status
- Attendance status for today
- Progress ring (overall completion %)
- Upcoming deadlines (next 7 days)
- Current streak and XP/level
- Calendar view (deadlines, live sessions, milestones)
- Profile page (skills earned, courses completed, badges, XP, scores)
- Portfolio page (all GitHub repos, mini projects, hackathon submissions)
- Personal notes
- Bookmarks (saved lessons)
- Search across all accessible content (PostgreSQL full-text search)

### 17. Mentor Dashboard

- All assigned interns' progress at a glance
- Intern comparison view (side-by-side progress)
- Attendance records and daily activity for today
- Workload view (pending reviews, ungraded assignments count)
- Underperformer auto-flagging (interns falling behind configurable threshold, e.g., <60% weekly completion)
- Quick feedback presets management
- Sprint/task board view (kanban: To Do → In Progress → Done per intern)

### 18. Admin Dashboard

- Analytics: completion rates, average scores, time spent trends, 80/20 ratio
- Audit logs (who did what, when — logins, changes, deletions)
- Data export (CSV, PDF) for progress, attendance, grades
- Batch/cohort management (create, configure, archive batches)
- Role management (create/edit/promote/deactivate users)
- Mentor-intern assignments
- Org branding (custom logo, colors, platform name)
- System health (storage usage, active users)

### 19. Performance & Reviews

- Periodic reviews: mentor writes weekly or monthly performance summary per intern
- Skill matrix: visual map of skills learned vs required (mapped to Tools & Technologies list)
- Goals/milestones: set targets per intern, track progress against them
- Conversion tracking: performance score → full-time offer eligibility
- Performance history: track trajectory over weeks

### 20. Certificates

- Auto-generate on program completion
- Org branded with custom template
- Mentor signed (primary mentor name)
- PDF download
- Customizable design
- Includes: intern name, batch name, completion date, overall score, skills acquired

### 21. Intern Feedback on Content

- Interns rate lessons and modules: 1–5 stars
- Optional written comment per rating
- Aggregate ratings visible to mentor and admin
- "Was this helpful?" prompt after completing each lesson
- Feedback analytics: which lessons rated lowest, which need improvement
- Mentor can respond to feedback

### 22. Batch Comparison (Admin)

- Compare performance across batches (Batch 1 vs Batch 2)
- Metrics: average scores, completion rates, attendance, time spent
- Per-week comparison: which batch struggled more on which topic
- Identify curriculum improvements based on cross-batch patterns
- Visual charts: bar, line, radar comparison

### 23. Pre-Program Assessment

- Entry test before Day 1 to gauge baseline
- Covers: Python basics, SQL basics, math/stats fundamentals
- Auto-graded (MCQ + simple coding)
- Results help mentor plan pacing per intern
- Stored as baseline — compare with final scores to show growth
- Not counted in evaluation weights — diagnostic only

### 24. UI/UX

- Dark mode support
- Mobile responsive (Tailwind CSS)
- Clean, modern design
- Fast, intuitive navigation
- Loading states and skeleton screens
- Error boundaries with user-friendly messages

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router) |
| Backend | Node.js + Express |
| Database | PostgreSQL |
| Cache | Redis (sessions, leaderboard, rate limiting) |
| File Storage | Supabase Storage (CDN-backed for video streaming) |
| Auth | Custom JWT (access + refresh tokens) |
| Real-time | Socket.io (WebSocket) |
| Styling | Tailwind CSS + shadcn/ui |
| Search | PostgreSQL full-text search (tsvector) |
| Code Execution | Judge0 API (sandboxed Python, SQL) |
| Email | Resend |
| Code Editor | Monaco Editor (embedded) |
| Notebook Rendering | nbconvert / custom React renderer for .ipynb |
| Plagiarism | Cosine similarity (custom) |
| Live Sessions | Static Discord invite page |
| Deployment | TBD |

### File Size Limits

| Type | Max Size |
|------|----------|
| Video | 500 MB |
| PDF | 50 MB |
| Assignment submission | 50 MB |
| Avatar | 2 MB |

---

## Build Phases

| Phase | Focus | Key Deliverables |
|-------|-------|-----------------|
| **0** | Pre-Program | Pre-program baseline assessment (auto-graded entry test), intern account creation, onboarding flow |
| **1** | Core Platform | Auth (JWT + refresh), roles, user CRUD, 14-week curriculum structure, module/lesson CRUD, content delivery (video/text/PDF/notebook), lock/unlock access (module + lesson + file level), dataset library, environment setup guides, basic in-app notifications |
| **2** | Daily Workflow | Attendance system (time windows, override, late), daily standup logs, daily task assignments with due times, calendar view, Discord page, attendance + task reminder notifications |
| **3** | Assignments & Assessment | Weekly assignments with rubrics + max score, mini projects, alternate week tests (MCQ/coding/SQL/case study), auto-grading (MCQ + Judge0), retakes, submissions, peer review, plagiarism detection |
| **4** | GitHub & Code | GitHub integration (OAuth + webhooks), commit tracking, code review workflow, coding playground (Monaco + Judge0), portfolio page |
| **5** | Hackathons & Capstone | Hackathon events (timed, rubric-judged, leaderboard), capstone project tracker (6 phases), final evaluation, email notifications |
| **6** | Progress & Evaluation | Weighted scoring system (auto-calculate), progress tracking, weekly deliverables (demo, reflection, mini project, docs), intern comparison, video position tracking, 80/20 ratio analytics |
| **7** | Gamification & Engagement | XP, badges, levels, streaks, leaderboard, weekly challenges, discussions, DMs (WebSocket), doubt requests, real-time activity feed |
| **8** | Dashboards & Admin | Intern/mentor/admin dashboards, sprint board, analytics, audit logs, batch management, batch comparison, data export, branding, mentor-intern assignment UI, system health |
| **9** | Polish | Certificates (PDF gen), skill matrix, performance reviews, conversion tracking, intern content feedback, email digest notifications, dark mode, mobile responsive, search (full-text) |

---

## Data Model (High-Level)

### Core Entities

- **User** (id, email, password_hash, name, role, avatar_url, batch_id, primary_mentor_id, status [invited|onboarding|active|paused|completed|converted|removed], first_login, created_at, updated_at)
- **Batch** (id, name, start_date, end_date, status [active|completed|archived], created_at)
- **MentorIntern** (id, mentor_id, intern_id, is_primary, assigned_at)
- **Course** (id, title, description, category, week_number, order, created_by)
- **Module** (id, course_id, title, description, order, estimated_duration, prerequisite_module_id)
- **Lesson** (id, module_id, title, content_type [video|text|pdf|code|notebook], content, file_url, duration, order)
- **Resource** (id, title, url, type, module_id, shared, created_by)
- **ContentVersion** (id, lesson_id, content, edited_by, created_at)

### Access Control

- **InternAccess** (id, intern_id, entity_type [module|lesson|file], entity_id, locked, unlocked_by, unlocked_at)

### Progress

- **LessonProgress** (id, intern_id, lesson_id, status [not_started|in_progress|completed], progress_pct, time_spent_seconds, started_at, completed_at)
- **ModuleProgress** (id, intern_id, module_id, status [not_started|in_progress|completed], progress_pct, started_at, completed_at)
- **VideoProgress** (id, intern_id, lesson_id, position_seconds, updated_at)

### Daily Workflow

- **Attendance** (id, intern_id, date, marked_at, status [present|late|incomplete|absent|excused], override_by, override_reason, tasks_completed_count, tasks_total_count)
- **DailyStandup** (id, intern_id, date, yesterday, today, blockers)
- **DailyTask** (id, intern_id, date, title, description, assigned_by, due_time, status [pending|in_progress|completed], completed_at)

### Assignments & Assessment

- **Assignment** (id, module_id, title, description, rubric_json, max_score, deadline, file_types, max_file_size, allow_resubmit, max_resubmits, is_mini_project, created_by)
- **Submission** (id, assignment_id, intern_id, file_url, submitted_at, grade, feedback, graded_by, graded_at, resubmit_count)
- **Quiz** (id, module_id, title, type [mcq|coding|sql|case_study], time_limit_minutes, max_retakes, score_policy [best|last], max_score, week_number)
- **QuizQuestion** (id, quiz_id, question_type [mcq_single|mcq_multi|code_python|code_sql|free_text], question, options_json, correct_answer, test_cases_json, points)
- **QuizAttempt** (id, quiz_id, intern_id, answers_json, score, attempt_number, started_at, submitted_at)
- **PeerReview** (id, submission_id, reviewer_id, feedback, rating, created_at)

### GitHub

- **GitHubLink** (id, intern_id, repo_url, repo_name, linked_at)
- **CommitLog** (id, intern_id, github_link_id, commit_hash, message, files_changed, date)
- **CodeReview** (id, commit_log_id, reviewer_id, comments_json, status [pending|reviewed], reviewed_at)

### Hackathons & Capstone

- **Hackathon** (id, title, description, day_number, start_time, end_time, rubric_json, max_score, team_or_individual, batch_id)
- **HackathonSubmission** (id, hackathon_id, intern_id, repo_url, demo_url, submitted_at, score, feedback, judged_by)
- **CapstoneProject** (id, intern_id, mentor_id, problem_statement, phase [statement|solution|deployment|documentation|presentation|evaluation], repo_url, deployed_url, final_score, feedback_json)

### Evaluation

- **WeeklyDeliverable** (id, intern_id, week_number, github_url, docs_url, demo_url, reflection, mini_project_submission_id, submitted_at, mentor_reviewed, mentor_notes)
- **EvaluationScore** (id, intern_id, batch_id, attendance_score, daily_progress_score, assignment_score, test_score, hackathon_score, capstone_score, overall_score, calculated_at)
- **PerformanceReview** (id, intern_id, mentor_id, period [weekly|monthly], week_number, summary, rating, strengths, improvements, created_at)

### Gamification

- **XPLog** (id, intern_id, action, entity_type, entity_id, points, earned_at)
- **Badge** (id, name, description, criteria_json, icon_url)
- **InternBadge** (id, intern_id, badge_id, earned_at)
- **Streak** (id, intern_id, current_streak, longest_streak, last_active_date)
- **WeeklyChallenge** (id, title, description, bonus_xp, deadline, created_by, batch_id)
- **WeeklyChallengeSubmission** (id, challenge_id, intern_id, submission_url, submitted_at, score, feedback)

### Communication

- **Message** (id, sender_id, receiver_id, content, read, sent_at)
- **Discussion** (id, module_id, author_id, title, content, created_at)
- **DiscussionReply** (id, discussion_id, author_id, content, created_at)
- **DoubtRequest** (id, intern_id, lesson_id, question, status [open|in_progress|resolved], responded_by, response, responded_at, resolution_time_minutes)
- **Announcement** (id, author_id, title, content, batch_id, target [batch|all], created_at)

### Notifications

- **Notification** (id, user_id, type, title, message, read, link, channel [in_app|email|both], created_at)

### Admin

- **AuditLog** (id, user_id, action, entity_type, entity_id, details_json, ip_address, timestamp)
- **Certificate** (id, intern_id, batch_name, intern_name, mentor_name, overall_score, skills_json, template, issued_at, pdf_url)
- **OrgSettings** (id, name, logo_url, primary_color, secondary_color, favicon_url)
- **SkillMatrix** (id, intern_id, skill, category, level [beginner|intermediate|advanced], updated_at)

### Datasets

- **Dataset** (id, module_id, name, description, format [csv|json|parquet|sql], file_url, size_bytes, source, version, uploaded_by, created_at)

### Feedback

- **LessonFeedback** (id, intern_id, lesson_id, rating, comment, created_at)
- **ModuleFeedback** (id, intern_id, module_id, rating, comment, created_at)

### Pre-Program Assessment

- **BaselineAssessment** (id, intern_id, quiz_id, score, completed_at)

### Environment Setup

- **SetupChecklist** (id, week_number, title, steps_json, tools, created_by)
- **SetupCompletion** (id, intern_id, checklist_id, completed, verified_at)

### Notes & Bookmarks

- **Note** (id, intern_id, lesson_id, content, created_at, updated_at)
- **Bookmark** (id, intern_id, lesson_id, created_at)

---

## Security

- JWT with short-lived access tokens (15 min) + refresh tokens (7 days, stored in httpOnly cookie)
- Password hashing: bcrypt (12 rounds)
- Rate limiting: 5 login attempts per 15 min, 100 API requests per min per user
- Input validation on all endpoints (express-validator / zod)
- SQL injection prevention via parameterized queries (ORM)
- XSS prevention via React's built-in escaping + Content-Security-Policy headers
- CORS configured for frontend domain only
- File upload validation (type + size)
- Audit logging on all sensitive operations

---

*Generated: 2026-06-27*
*Updated: 2026-06-27 — Gap analysis pass: resolved 31 gaps + 6 new features (Jupyter, datasets, setup guides, feedback, batch comparison, baseline assessment)*
