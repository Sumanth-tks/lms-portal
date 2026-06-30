# LMS Platform — Setup & Run Guide

A Learning Management System for running a Data Science Residency program.
Admins, mentors, and interns log in to manage courses, attendance, assignments,
quizzes, leave requests, capstones, and more.

The app has two parts that run together:
- **server** — the backend "brain" (Node.js + Express + PostgreSQL database)
- **client** — the website people see (Next.js + React)

---

## What you need before starting

1. **Node.js** version 18 or newer — https://nodejs.org (download the "LTS" version)
2. **A PostgreSQL database** — the app stores everything here. The easiest free
   option is **Neon** (https://neon.com). Sign up, create a project, and copy the
   connection string (a long line starting with `postgresql://...`).
3. A terminal (Command Prompt, PowerShell, or Mac/Linux Terminal).

---

## Step 1 — Start the backend (server)

Open a terminal and run these one at a time:

```bash
cd server
npm install
```

Now create a settings file. Make a new file called `.env` inside the `server`
folder and paste this into it, replacing the values with your own:

```
DATABASE_URL="postgresql://paste-your-neon-connection-string-here"
JWT_SECRET="any-long-random-text-you-make-up"
JWT_REFRESH_SECRET="another-different-long-random-text"
PORT=5001
CLIENT_URL="http://localhost:3000"
```

- `DATABASE_URL` — your Neon (or other PostgreSQL) connection string.
- `JWT_SECRET` and `JWT_REFRESH_SECRET` — any long random gibberish. Make them
  different from each other. These keep logins secure.
- `CLIENT_URL` — the website's address (for production, your real website URL).

Then set up the database and start the server:

```bash
npx prisma generate        # prepares the database tools
npx prisma migrate deploy  # creates all the tables in your database
npm run db:seed            # creates the first admin login
npm run dev                # starts the server
```

Leave this terminal running. You should see "Server running on port 5001".

---

## Step 2 — Start the website (client)

Open a **second** terminal and run:

```bash
cd client
npm install
```

Make a new file called `.env.local` inside the `client` folder with this line:

```
NEXT_PUBLIC_API_URL="http://localhost:5001/api"
```

(This tells the website where to find the backend.)

Then start it:

```bash
npm run dev
```

Leave this terminal running too.

---

## Step 3 — Open and log in

Open your browser to **http://localhost:3000**

Log in with the default admin account:
- **Email:** admin@lms.com
- **Password:** Admin@123

**Change this password immediately** after your first login.

---

## First things to do as admin

1. Go to **Users** → create your mentors and interns.
2. On each mentor's row, click **Assign Interns** to link interns to them.
   (Mentors only see interns assigned to them.)
3. Go to **Curriculum** → **Add Course** → open a course → **Add Module** →
   **Add Google Drive Link** to share slides, material, and assignments.
4. Add your Discord invite link in `client/src/app/(protected)/discord/page.tsx`
   (one line near the top).

---

## Going to production (real deployment)

This guide runs the app on your own machine. To put it online for real users:

1. **Database:** keep using Neon (or any managed PostgreSQL). It's already
   production-ready. Never share your `DATABASE_URL`.

2. **Backend (server):** deploy to a host like Render, Railway, or Fly.io.
   - Set the same `.env` values there (DATABASE_URL, JWT secrets, PORT).
   - Set `CLIENT_URL` to your real website address.
   - Run `npx prisma migrate deploy` once on first deploy.
   - Make sure the line `app.set('trust proxy', 1);` stays in
     `server/src/index.js` — hosts use proxies, and this prevents errors.

3. **Frontend (client):** deploy to Vercel (made for Next.js) or Netlify.
   - Set `NEXT_PUBLIC_API_URL` to your live backend address + `/api`.
   - Build command: `npm run build`, start command: `npm start`.

4. **Security checklist:**
   - Change the admin password.
   - Use long, random JWT secrets (never the examples above).
   - Keep all `.env` files private — never commit them to GitHub.
   - Use HTTPS everywhere (Vercel/Render do this automatically).

---

## Common problems

- **"Login failed" but password is right** → the website can't reach the
  backend. Check `NEXT_PUBLIC_API_URL` points to the running server, and restart
  the client after changing it.
- **"Invalid credentials"** → the admin account wasn't created. Run
  `npm run db:seed` again in the `server` folder.
- **Database connection errors** → your `DATABASE_URL` is wrong or the database
  is asleep. Double-check the Neon string (in quotes).
- **Changes to `.env` don't take effect** → stop the server/website
  (Ctrl+C) and start it again. These files are only read at startup.

---

## Default ports

- Website: `http://localhost:3000`
- Backend API: `http://localhost:5001`