# LMS Portal - Basic Start

## What You Need
1. Node.js 18+ (https://nodejs.org)
2. PostgreSQL (free at https://neon.com or install locally)

## Quick Steps

### 1. Server Setup
```bash
cd server
npm install
```

Create `.env` file in `server` folder:
```
DATABASE_URL="your-postgresql-connection-string"
JWT_SECRET="any-random-secret-key"
JWT_REFRESH_SECRET="another-random-secret"
PORT=5001
CLIENT_URL="http://localhost:3000"
```

Then run:
```bash
npx prisma migrate deploy
npm run db:seed
npm run dev
```

✅ Should see: `Server running on port 5001`

### 2. Client Setup (New Terminal)
```bash
cd client
npm install
```

Create `.env.local` file in `client` folder:
```
NEXT_PUBLIC_API_URL="http://localhost:5001/api"
```

Then run:
```bash
npm run dev
```

### 3. Open Browser
Go to: **http://localhost:3000**

Login:
- Email: `admin@lms.com`
- Password: `Admin@123`

**Done!** Change your password after first login.
