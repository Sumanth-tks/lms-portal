# ⚡ PHASE 1: Quick Commands to Execute NOW (2 hours)

**Goal:** Fix 3 critical security issues in ~65 minutes  
**Do not skip any step - these are blocking production deployment**

---

## 📋 Pre-Execution Checklist

```bash
# Make sure you're in the right directory
cd C:\Projects\lms-portal

# Verify git is clean
git status
# Should show: "On branch main" (or your branch)

# Verify Node is installed
node --version
# Should show v18 or higher

# Start with git
git add -A
git commit -m "Checkpoint before security fixes"
```

---

## 🔥 STEP 1: Rotate Database Password (10 minutes)

### Part A: Update Supabase (Manual - 5 min)

```
1. Open https://supabase.com/dashboard
2. Click your project (LMS Portal)
3. Go to: Settings → Database → Password
4. Click "Reset Password"
5. Copy the NEW PostgreSQL connection string
   Format: postgresql://postgres:NEW_PASSWORD@db.xxxxx.supabase.co:5432/postgres
```

### Part B: Create .env.local with New Credentials (5 min)

**Windows Command Prompt:**
```batch
cd server

REM Create .env.local with new database URL
(
echo DATABASE_URL="paste-your-new-connection-string-here"
echo JWT_SECRET="placeholder-for-now"
echo JWT_REFRESH_SECRET="placeholder-for-now"
echo PORT=5001
echo NODE_ENV="development"
echo CLIENT_URL="http://localhost:3000"
) > .env.local

REM Verify it was created
type .env.local
```

**Or use Bash (Git Bash / WSL):**
```bash
cd server

cat > .env.local << 'EOF'
DATABASE_URL="postgresql://postgres:YOUR_NEW_PASSWORD@db.kjadudctpnweailiaeor.supabase.co:5432/postgres"
JWT_SECRET="placeholder"
JWT_REFRESH_SECRET="placeholder"
PORT=5001
NODE_ENV="development"
CLIENT_URL="http://localhost:3000"
EOF

# Verify
cat .env.local
```

### Part C: Verify Connection

```bash
cd server

# Test database connection
npm run db:studio

# Should open Prisma Studio in browser
# If it opens, connection is working ✅
# Press Ctrl+C to close
```

### ✅ STEP 1 VERIFICATION

```bash
# 1. Check .env.local exists and has real password
cat server/.env.local | grep DATABASE_URL

# 2. Check .env has only placeholder
cat server/.env | grep DATABASE_URL
# Should show: DATABASE_URL="postgresql://postgres:CHANGE_ME@..."

# 3. Verify git won't commit .env.local
grep ".env.local" server/.gitignore
# Should show: .env.local

# 4. Check git history is clean
git log --all --oneline | grep -i "password\|secret" | head -5
# Should show: nothing (empty result)
```

---

## 🔐 STEP 2: Generate New JWT Secrets (5 minutes)

### Part A: Generate Secrets

**Windows Command Prompt:**
```batch
cd server

REM Generate first secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
REM Copy the output

REM Generate second secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
REM Copy the output
```

**Or use Bash:**
```bash
cd server

# Generate both secrets
JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
JWT_REFRESH=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")

echo "JWT_SECRET=$JWT_SECRET"
echo "JWT_REFRESH_SECRET=$JWT_REFRESH"
```

### Part B: Update .env.local

**Windows:**
```batch
REM Open .env.local in notepad
notepad .env.local

REM Replace these lines:
REM OLD:
REM JWT_SECRET="placeholder"
REM JWT_REFRESH_SECRET="placeholder"

REM NEW:
REM JWT_SECRET="paste-generated-secret-1-here"
REM JWT_REFRESH_SECRET="paste-generated-secret-2-here"
```

**Or use Bash to update:**
```bash
# Update .env.local with new secrets
sed -i 's/JWT_SECRET=.*/JWT_SECRET='$JWT_SECRET'/' .env.local
sed -i 's/JWT_REFRESH_SECRET=.*/JWT_REFRESH_SECRET='$JWT_REFRESH'/' .env.local

# Verify
grep JWT .env.local
```

### ✅ STEP 2 VERIFICATION

```bash
# 1. Check secrets in .env.local are long (64 chars)
grep JWT server/.env.local | wc -c
# Should be around 100+ characters

# 2. Check .env has only placeholders
grep JWT server/.env
# Should show: "REPLACE_WITH_SECURE_RANDOM..."

# 3. Verify secrets are random hex
node -e "console.log('Valid hex:', /^[a-f0-9]{64}$/.test('paste-secret-here'))"

# 4. Test app still starts
cd server && npm run dev

# Check output doesn't show credential errors
# Press Ctrl+C to stop
```

---

## 🔒 STEP 3: Secure /uploads Directory (20 minutes)

### Part A: Create Auth Middleware

**Windows - Create file server/src/middleware/fileAuth.js:**

```batch
REM Navigate to server directory
cd server

REM Create the file (using echo and redirection)
(
echo const { verifyAccessToken } = require('../utils/jwt');
echo const { error } = require('../utils/apiResponse');
echo.
echo async function authorizeFileAccess(req, res, next) {
echo   try {
echo     const authHeader = req.headers.authorization;
echo     if (!authHeader ^|^| !authHeader.startsWith('Bearer '^) {
echo       return error(res, 'Authentication required to access files', 401^);
echo     }
echo.
echo     try {
echo       const token = authHeader.split(' '^)[1];
echo       const decoded = verifyAccessToken(token^);
echo       req.user = decoded;
echo     } catch (err) {
echo       return error(res, 'Invalid or expired token', 401^);
echo     }
echo.
echo     if (req.user.role === 'INTERN'^) {
echo       const filename = req.params[0];
echo       const isOwnFile = filename.includes(req.user.id^);
echo       if (!isOwnFile^) {
echo         return error(res, 'You can only access your own files', 403^);
echo       }
echo     }
echo.
echo     next(^);
echo   } catch (err) {
echo     console.error('File auth error:', err^);
echo     return error(res, 'Access denied', 403^);
echo   }
echo }
echo.
echo module.exports = { authorizeFileAccess };
) > src\middleware\fileAuth.js

REM Verify it was created
type src\middleware\fileAuth.js
```

**Or use Bash/WSL:**

```bash
cat > server/src/middleware/fileAuth.js << 'EOF'
const { verifyAccessToken } = require('../utils/jwt');
const { error } = require('../utils/apiResponse');

async function authorizeFileAccess(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return error(res, 'Authentication required to access files', 401);
    }

    try {
      const token = authHeader.split(' ')[1];
      const decoded = verifyAccessToken(token);
      req.user = decoded;
    } catch (err) {
      return error(res, 'Invalid or expired token', 401);
    }

    if (req.user.role === 'INTERN') {
      const filename = req.params[0];
      const isOwnFile = filename.includes(req.user.id);
      if (!isOwnFile) {
        return error(res, 'You can only access your own files', 403);
      }
    }

    next();
  } catch (err) {
    console.error('File auth error:', err);
    return error(res, 'Access denied', 403);
  }
}

module.exports = { authorizeFileAccess };
EOF
```

### Part B: Update server/src/index.js

**Find this line (around line 71):**
```javascript
app.use('/uploads', express.static(require('path').join(__dirname, '../uploads')));
```

**Replace with:**
```javascript
const { authorizeFileAccess } = require('./middleware/fileAuth');

// ... other code ...

// Protected uploads directory
app.use('/uploads', authorizeFileAccess, express.static(require('path').join(__dirname, '../uploads')));
```

**Using VS Code or similar:**
1. Open `server/src/index.js`
2. Find the `/uploads` line (Ctrl+F search)
3. Replace the entire line as shown above
4. Save (Ctrl+S)

### Part C: Test the Fix

**Terminal 1 - Start server:**
```bash
cd server
npm run dev

# Should start without errors
# Leave it running, open another terminal
```

**Terminal 2 - Test access control:**

```bash
# Test 1: Unauthorized access should return 401
curl http://localhost:5001/uploads/test.pdf
# Expected: {"error":"Authentication required to access files","statusCode":401}

# Test 2: Invalid token should return 401
curl -H "Authorization: Bearer invalid_token_here" http://localhost:5001/uploads/test.pdf
# Expected: {"error":"Invalid or expired token","statusCode":401}

# Test 3: Valid admin token should work (or return 404 if file doesn't exist)
REM First, login as admin
FOR /F "tokens=*" %A IN ('curl -s -X POST http://localhost:5001/api/auth/login -H "Content-Type: application/json" -d "{\"email\":\"admin@lms.com\",\"password\":\"Admin@123\"}" ^| node -e "const data = require('fs').readFileSync(0, 'utf-8'); console.log(JSON.parse(data).data.accessToken)"') DO SET TOKEN=%A

REM Then try to access a file
curl -H "Authorization: Bearer %TOKEN%" http://localhost:5001/uploads/test.pdf
# Expected: 404 (not found) or 200 (if file exists)
# NOT 401 or 403
```

**Or Bash:**
```bash
# Test 1: Unauthorized (should be 401)
curl http://localhost:5001/uploads/test.pdf 2>/dev/null | jq .

# Test 2: Invalid token (should be 401)
curl -H "Authorization: Bearer invalid" http://localhost:5001/uploads/test.pdf 2>/dev/null | jq .

# Test 3: Get valid token
TOKEN=$(curl -s -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@lms.com","password":"Admin@123"}' | jq -r .data.accessToken)

# Test 4: Access with valid token
curl -H "Authorization: Bearer $TOKEN" http://localhost:5001/uploads/test.pdf
# Should return 404 (file not found) - but NOT 401 ✅
```

### ✅ STEP 3 VERIFICATION

```bash
# Check middleware file exists
ls -la server/src/middleware/fileAuth.js

# Check it's imported in index.js
grep -n "fileAuth" server/src/index.js

# Verify server starts
npm run dev
# Should start successfully

# Verify access control works
curl http://localhost:5001/uploads/test.pdf
# Should return 401 (not 200)
```

---

## 🔐 STEP 4: Update Admin Seed Password (5 minutes)

**Edit server/src/seeds/seed.js:**

Find this line (around line 24):
```javascript
const adminPassword = await hashPassword('Admin@123');
```

Replace with:
```javascript
const crypto = require('crypto');

// Generate random password (about line 22, add to imports)
const adminPassword = process.env.ADMIN_PASSWORD || 
  crypto.randomBytes(12).toString('hex');

// Add logging (before creating admin)
console.log('⚠️  ADMIN TEMPORARY PASSWORD:', adminPassword);
console.log('⚠️  Change this immediately after first login!');
```

Then find where user is created and add `forcePasswordChange`:
```javascript
const admin = await prisma.user.upsert({
  where: { email: 'admin@lms.com' },
  update: {},
  create: {
    email: 'admin@lms.com',
    name: 'Admin',
    role: 'ADMIN',
    passwordHash: adminPasswordHash,
    status: 'ACTIVE',
    forcePasswordChange: true,  // ← Add this line
  },
});
```

### ✅ STEP 4 VERIFICATION

```bash
# Test seed script (don't run it yet, just verify syntax)
cd server
node -c src/seeds/seed.js
# Should show: no errors

# When you do run it:
npm run db:seed
# Should show: ⚠️  ADMIN TEMPORARY PASSWORD: [random-password]
```

---

## 🎯 STEP 5: Final Verification (5 minutes)

### Run All Checks

```bash
cd server

# 1. Check git doesn't track sensitive files
git status
# Should NOT show: .env.local, .env

# 2. Check .env.local is in .gitignore
grep ".env.local" .gitignore
# Should show: .env.local

# 3. Verify .env has only placeholders
cat .env | head -5
# Should show: DATABASE_URL="postgresql://postgres:CHANGE_ME@..."

# 4. Verify .env.local has real values
cat .env.local | head -5
# Should show: DATABASE_URL="postgresql://postgres:REAL_PASSWORD@..."

# 5. Start server and test
npm run dev

# 6. In another terminal, test health
curl http://localhost:5001/api/health
# Should return: {"status":"ok","timestamp":"..."}

# 7. Test login works
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@lms.com","password":"Admin@123"}'
# Should return token

# 8. Test /uploads is protected
curl http://localhost:5001/uploads/test.pdf
# Should return 401 (Unauthorized)
```

### Commit Changes

```bash
# Stop npm run dev (Ctrl+C)

# Add all changes EXCEPT .env.local
git add server/src/middleware/fileAuth.js
git add server/src/index.js
git add server/src/seeds/seed.js
git add server/.env
git add server/.env.example
git add server/.gitignore

# Verify nothing sensitive will be committed
git diff --cached --name-only
# Should NOT include: .env.local

# Commit
git commit -m "🔒 Security hotfix: protect credentials and uploads

- Fix: Rotate database credentials (use .env.local)
- Fix: Generate strong JWT secrets (use .env.local)
- Fix: Protect /uploads directory with authentication
- Fix: Random admin password on seed
- Add: fileAuth middleware for file access control
- Add: forcePasswordChange flag for admin"

# Push to git
git push origin main
```

---

## ✅ PHASE 1 COMPLETE CHECKLIST

When you're done, verify ALL of these:

```
Security Fixes:
  ✅ Database password rotated in Supabase
  ✅ .env.local created with real credentials
  ✅ .env.local added to .gitignore
  ✅ New JWT secrets generated (64 hex characters)
  ✅ /uploads requires Bearer token
  ✅ Admin password is random on seed
  ✅ forcePasswordChange flag set

Git/Repository:
  ✅ git status shows clean
  ✅ No .env.local in git
  ✅ .env has only placeholders
  ✅ Changes committed and pushed
  ✅ git log shows no real credentials

Application:
  ✅ npm run dev starts successfully
  ✅ curl /api/health returns 200
  ✅ curl /uploads/test.pdf returns 401
  ✅ Login works with new JWT secrets
  ✅ No errors in console

Security Score Improved:
  ✅ Before: 4.2/10
  ✅ After: 6/10 (+1.8 points!)
```

---

## 🎉 SUCCESS!

**Time Spent:** ~65 minutes  
**Issues Fixed:** 3 Critical  
**Security Score:** 4.2/10 → 6/10 ✅  
**Production Risk:** Significantly reduced ✅  

### Next Steps:
1. Take a 15-minute break ☕
2. Review what you just fixed
3. When ready, start **PHASE 2** from `IMPLEMENTATION_PLAN_9_10.md`

### If Something Goes Wrong:
1. Check the detailed steps in `IMPLEMENTATION_PLAN_9_10.md`
2. Verify all prerequisites are met
3. Check file paths are correct
4. Review error messages carefully

### Need Help?
- Check: `QUICK_REFERENCE.md` for common commands
- Review: `REMEDIATION_ACTION_PLAN.md` for detailed explanations
- Reference: Code examples in `IMPLEMENTATION_PLAN_9_10.md`

---

**You just fixed critical security issues! 🔒**  
**Congratulations on taking the first step to production-ready code!**

**Next: PHASE 2 - Security Foundation (8 hours, Week 2-3)**
