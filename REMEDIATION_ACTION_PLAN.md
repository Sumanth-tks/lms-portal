# LMS Portal - Remediation Action Plan

## 🎯 Executive Summary

**Security Status:** CRITICAL ⚠️  
**Risk Level:** HIGH  
**Recommended Action:** IMMEDIATE - Fix before production deployment

### Key Findings
- ❌ Real database credentials exposed in repository
- ❌ Weak JWT secrets that can be forged
- ❌ Hardcoded admin password in seed file
- ❌ Unprotected upload directory (anyone can download files)
- ❌ Zero test coverage - no regression testing capability

### Impact
- **Confidentiality Risk:** HIGH - Database accessible to anyone with repo access
- **Integrity Risk:** HIGH - Can modify/delete data in database
- **Availability Risk:** HIGH - Can drop tables, destroy data
- **Authentication Risk:** CRITICAL - Can forge any user token

---

## 🚨 CRITICAL ACTIONS (Do Today)

### 1. ROTATE DATABASE CREDENTIALS
**Status:** 🔴 CRITICAL - DO THIS FIRST  
**Time Required:** 10 minutes

#### Steps:
1. Go to your Supabase dashboard
2. Navigate to Settings → Database → Password
3. Generate new password
4. Copy new connection string
5. Update `.env.local` (git-ignored) with new credentials
6. Test connection: `npm run db:studio`
7. **IMPORTANT:** Delete old credentials from git history:
   ```bash
   # Option 1: Using git filter-branch (careful!)
   git filter-branch --tree-filter 'sed -i "s/Lav6MqtV5jJqIE3O/REDACTED/g"' HEAD
   
   # Option 2: Using BFG Repo-Cleaner (recommended)
   # https://rtyley.github.io/bfg-repo-cleaner/
   ```

**Verification:**
```bash
cd server
cat .env  # Should show placeholder
cat .env.local  # Should show real credentials (not in git)
git log -p | grep "Lav6MqtV5" # Should be empty after cleanup
```

---

### 2. GENERATE NEW JWT SECRETS
**Status:** 🔴 CRITICAL  
**Time Required:** 5 minutes

#### Steps:
1. Generate secure random secrets:
   ```bash
   node -e "console.log('JWT_SECRET=', require('crypto').randomBytes(32).toString('hex'))"
   node -e "console.log('JWT_REFRESH_SECRET=', require('crypto').randomBytes(32).toString('hex'))"
   ```
2. Copy outputs to `.env.local` (git-ignored):
   ```
   JWT_SECRET=your-generated-secret-here
   JWT_REFRESH_SECRET=your-generated-secret-here
   ```
3. Never commit these to repository
4. Invalidate existing tokens (users will need to re-login)

**Verification:**
```bash
grep "JWT_SECRET" server/.env  # Should be PLACEHOLDER
grep "JWT_SECRET" server/.env.local  # Should be real secret (if exists)
git log -p | grep "JWT_SECRET=" # Should not contain actual secrets
```

---

### 3. SECURE /UPLOADS DIRECTORY
**Status:** 🔴 CRITICAL  
**Time Required:** 20 minutes

#### Current Issue:
```javascript
// VULNERABLE: Anyone can download any file
app.use('/uploads', express.static(require('path').join(__dirname, '../uploads')));
```

#### Fix Option A: Add Authentication (Recommended)
Create `server/src/middleware/uploadAuth.js`:
```javascript
const { authenticate } = require('./auth');
const { error } = require('../utils/apiResponse');
const prisma = require('../config/db');

async function authorizeFileAccess(req, res, next) {
  try {
    await authenticate(req, res, () => {});
    
    if (!req.user) {
      return error(res, 'Authentication required', 401);
    }

    const filename = req.params[0];
    const userId = req.user.id;
    
    // Check if user owns this file or is ADMIN/MENTOR
    if (req.user.role !== 'ADMIN' && req.user.role !== 'MENTOR') {
      // INTERN can only access their own files
      if (!filename.startsWith(userId)) {
        return error(res, 'Access denied', 403);
      }
    }

    next();
  } catch (err) {
    return error(res, 'Access denied', 403);
  }
}

module.exports = { authorizeFileAccess };
```

Update `server/src/index.js`:
```javascript
const { authorizeFileAccess } = require('./middleware/uploadAuth');

// BEFORE: app.use('/uploads', express.static(...));
// AFTER:
app.use('/uploads', authorizeFileAccess, express.static(...));
```

#### Fix Option B: Use Cloud Storage (Better Long-term)
- AWS S3 with presigned URLs
- Google Cloud Storage
- Azure Blob Storage
- Cloudinary (managed service)

**Benefit:** Removes file serving from application layer, better security, scalability

#### Testing the Fix:
```bash
# Should return 401 (no auth)
curl http://localhost:5001/uploads/test.pdf

# Should return 401 (invalid token)
curl -H "Authorization: Bearer invalid" \
  http://localhost:5001/uploads/test.pdf

# Should return 403 (other user's file as INTERN)
curl -H "Authorization: Bearer intern_token" \
  http://localhost:5001/uploads/other_user_file.pdf

# Should return 200 (own file as INTERN or any file as ADMIN)
curl -H "Authorization: Bearer token" \
  http://localhost:5001/uploads/my_file.pdf
```

---

## 🟠 HIGH PRIORITY ACTIONS (This Week)

### 4. REMOVE HARDCODED ADMIN PASSWORD FROM SEED
**Status:** 🟠 HIGH  
**Time Required:** 15 minutes  
**File:** `server/src/seeds/seed.js`

#### Current Issue:
```javascript
const adminPassword = await hashPassword('Admin@123');
```

#### Solution A: Environment Variables
```javascript
const adminPassword = await hashPassword(
  process.env.ADMIN_PASSWORD || 'TempPassword@123'
);
```

Update `.env.example`:
```
# Database Seeding (Development Only)
ADMIN_PASSWORD="your-temporary-password-here"
```

#### Solution B: Generate Random Password
```javascript
const crypto = require('crypto');
const tempPassword = crypto.randomBytes(12).toString('hex');
console.log(`Admin password: ${tempPassword}`);
const adminPassword = await hashPassword(tempPassword);
```

**Documentation:**
Add comment to seed file:
```javascript
/**
 * IMPORTANT: After running seed, change the admin password:
 * 1. Login with temp credentials
 * 2. Go to Settings → Change Password
 * 3. Use a strong, unique password
 * 4. Store in password manager
 */
```

---

### 5. IMPLEMENT COMPREHENSIVE TESTING SUITE
**Status:** 🟠 HIGH  
**Time Required:** 4 hours  
**Already Created:** Test infrastructure files

#### What's Been Set Up:
- ✅ Jest configuration (`jest.config.js`)
- ✅ Test setup file (`tests/setup.js`)
- ✅ Smoke test template (`tests/smoke.test.js`)
- ✅ Security test template (`tests/security.test.js`)
- ✅ Package.json updated with test scripts

#### Next Steps:
```bash
# Install test dependencies
cd server
npm install

# Run tests
npm test
npm run test:smoke
npm run test:security
npm run test:coverage
```

#### Test Implementation Checklist:
- [ ] Complete smoke.test.js with actual tests
- [ ] Complete security.test.js validating each issue
- [ ] Write auth flow tests (auth.test.js)
- [ ] Write route access control tests (routes.test.js)
- [ ] Write integration tests
- [ ] Achieve 50%+ code coverage
- [ ] Set up CI/CD to run tests on every commit

---

### 6. FIX ERROR MESSAGE LEAKAGE
**Status:** 🟠 HIGH  
**Time Required:** 30 minutes

#### Current Issue:
```javascript
// BAD: Exposes internal error details
res.status(500).json({ success: false, error: err.message });
```

#### Solution:
Create centralized error handler:

`server/src/utils/errorHandler.js`:
```javascript
function formatError(err, isDevelopment = false) {
  const baseError = {
    success: false,
    error: 'Internal server error'
  };

  // Only send detailed errors in development
  if (isDevelopment) {
    baseError.details = {
      message: err.message,
      stack: err.stack,
    };
  }

  // Log full error server-side
  console.error('[Error]', err);

  return baseError;
}

module.exports = { formatError };
```

Update all controllers:
```javascript
// BEFORE:
catch (err) {
  res.status(500).json({ success: false, error: err.message });
}

// AFTER:
catch (err) {
  const isDev = process.env.NODE_ENV === 'development';
  res.status(500).json(formatError(err, isDev));
}
```

---

## 🟡 MEDIUM PRIORITY ACTIONS (This Month)

### 7. ADD MORE GRANULAR RATE LIMITING
**Status:** 🟡 MEDIUM  
**Time Required:** 2 hours

#### Current:
- Login: 5/15 minutes
- General API: 100/minute

#### Recommended Additions:
```javascript
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  keyGenerator: (req) => req.user?.id || req.ip, // Per-user after auth
});

const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3, // 3 requests per hour
});

const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20, // 20 uploads per hour
});

app.use('/api/auth/change-password', passwordResetLimiter);
app.use('/api/files/upload', uploadLimiter);
```

---

### 8. CREATE PRE-COMMIT GIT HOOKS
**Status:** 🟡 MEDIUM  
**Time Required:** 1 hour

#### Install Husky:
```bash
npm install husky --save-dev
npx husky install
```

#### Create hook to prevent credential commits:
Create `.husky/pre-commit`:
```bash
#!/bin/bash

# Prevent committing actual secrets
if grep -r "Lav6MqtV5" . --exclude-dir=node_modules --exclude-dir=.git; then
  echo "ERROR: Found exposed credentials in code!"
  echo "Never commit real credentials to git."
  exit 1
fi

# Prevent committing .env file
if git diff --cached --name-only | grep -E "\.env$"; then
  echo "ERROR: Attempting to commit .env file!"
  echo "Use .env.local instead (add to .gitignore)"
  exit 1
fi

exit 0
```

Make executable:
```bash
chmod +x .husky/pre-commit
```

---

## 📋 VERIFICATION CHECKLIST

### Security Verification
- [ ] No real credentials in git history
- [ ] All secrets use strong random values
- [ ] .env file is git-ignored
- [ ] Database password rotated in Supabase
- [ ] /uploads directory requires authentication
- [ ] JWT secrets are unguessable
- [ ] Error messages are generic in production

### Code Verification
- [ ] No hardcoded passwords
- [ ] No API keys in code
- [ ] No database URLs in code
- [ ] All external credentials use environment variables
- [ ] .env.example documents all required variables

### Test Verification
- [ ] npm test runs without errors
- [ ] npm run test:smoke passes
- [ ] npm run test:security passes
- [ ] npm run test:coverage shows 50%+ coverage
- [ ] All critical paths tested

### Deployment Verification
- [ ] .env.local not committed (check .gitignore)
- [ ] NODE_ENV=production on server
- [ ] All environment variables set in production
- [ ] Health check endpoint responds
- [ ] Database connection works
- [ ] User can login and access courses
- [ ] /uploads directory blocked for anonymous users

---

## 📊 Timeline & Priorities

### TODAY (Critical - 2 hours)
1. Rotate database credentials
2. Generate new JWT secrets
3. Secure /uploads directory

### THIS WEEK (High - 4 hours)
4. Remove hardcoded admin password
5. Complete test suite setup
6. Fix error message leakage

### THIS MONTH (Medium - 3 hours)
7. Add granular rate limiting
8. Set up pre-commit git hooks
9. Full test implementation

### NEXT QUARTER (Optional)
- Professional penetration testing
- Cloud storage migration for files
- API versioning
- Advanced monitoring/alerting

---

## 🚀 DEPLOYMENT CHECKLIST

**Before going to production, verify:**
- [ ] All critical issues fixed
- [ ] Tests passing
- [ ] .env properly configured on server
- [ ] Database backed up
- [ ] SSL certificate installed
- [ ] Monitoring/logging configured
- [ ] Backup strategy in place
- [ ] Incident response plan ready

---

## 📞 Support & Questions

### For Database Issues
- Supabase Dashboard: https://supabase.com/dashboard
- Documentation: https://supabase.com/docs

### For Security Concerns
- OWASP Top 10: https://owasp.org/www-project-top-ten/
- Node.js Security: https://nodejs.org/en/docs/guides/security/

### For Testing Help
- Jest: https://jestjs.io/docs/getting-started
- Supertest: https://github.com/visionmedia/supertest

---

**Report Generated:** July 2, 2026  
**Next Review:** July 9, 2026  
**Status:** Action Required - Do not deploy to production
