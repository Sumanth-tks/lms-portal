# LMS Portal - Testing & Validation Guide

## Quick Start

### Install Test Dependencies
```bash
cd server
npm install
```

### Run All Tests
```bash
npm test
```

### Run Specific Test Suites
```bash
npm run test:smoke        # Critical path tests
npm run test:security     # Security vulnerability tests
npm run test:coverage     # Coverage report
npm run test:watch       # Watch mode (re-run on changes)
```

---

## Test Structure

### File Organization
```
server/
├── tests/
│   ├── setup.js              # Test configuration and setup
│   ├── smoke.test.js         # Critical path smoke tests
│   ├── security.test.js      # Security vulnerability tests
│   ├── auth.test.js          # Authentication flow tests (TODO)
│   ├── routes.test.js        # API route access control tests (TODO)
│   └── integration.test.js   # End-to-end integration tests (TODO)
├── jest.config.js            # Jest configuration
└── package.json              # Updated with test scripts
```

---

## Smoke Testing - Critical Paths

### What is Smoke Testing?
Quick validation that the application starts and basic functionality works without running full test suite.

### Critical Paths to Test
1. **Health Check** - Server is running
2. **Authentication** - Login, refresh, logout
3. **Data Access** - Read operations
4. **Protected Routes** - Authorization checks
5. **Error Handling** - Proper error responses

### Run Smoke Tests
```bash
npm run test:smoke
```

### Expected Results
All critical endpoints should respond with appropriate status codes:
- ✅ 200 - Success
- ✅ 401 - Missing/invalid token
- ✅ 403 - Insufficient permissions
- ✅ 404 - Not found
- ✅ 500 - Server error (with generic message)

---

## Security Testing

### Security Issues to Test

#### 1. Upload Directory Access Control
**Current Status:** ❌ FAILING
```bash
# This endpoint should require authentication
# Currently anyone can download files
GET /uploads/* 
```

**Test:**
```bash
# Should return 401 (unauthorized)
curl http://localhost:5001/uploads/test.pdf

# Should return 403 if user doesn't own file
curl -H "Authorization: Bearer user_b_token" \
  http://localhost:5001/uploads/user_a_file.pdf
```

#### 2. Authentication Enforcement
**Status:** ✅ PASSING
```bash
# Protected routes should require token
# Should return 401 without token
GET /api/courses

# Should return 401 with invalid token
GET /api/courses -H "Authorization: Bearer invalid"
```

#### 3. Authorization Checks
**Status:** ✅ PASSING (with exceptions)
```bash
# INTERN should not access user management
GET /api/users (as INTERN) → Should return 403

# MENTOR can only see assigned interns
GET /api/users/:id (as MENTOR) → Should filter results

# Users can only modify own data
PATCH /api/users/other_user_id (as INTERN) → Should return 403
```

#### 4. Rate Limiting
**Status:** ✅ IMPLEMENTED
```bash
# Login rate limit: 5 attempts per 15 minutes
# After 5th failed attempt in 15min window
POST /api/auth/login → Should return 429 (Too Many Requests)

# General API rate limit: 100 requests per minute
# After 100th request in 1 minute window
GET /api/courses → Should return 429
```

#### 5. Error Messages
**Status:** 🟡 PARTIALLY FIXED
```bash
# Errors should NOT expose:
# - Stack traces
# - Database schema
# - Internal paths
# - Specific error codes (except validation)

# Should return generic message:
{
  "success": false,
  "error": "Internal server error"
}
```

### Run Security Tests
```bash
npm run test:security
```

---

## Regression Testing

### What is Regression Testing?
Verify that recent changes don't break existing functionality.

### Regression Test Checklist

#### Authentication Flow
- [ ] Admin can login with correct credentials
- [ ] Login fails with wrong password
- [ ] Access token expires after 15 minutes
- [ ] Refresh token extends session
- [ ] Logout clears tokens
- [ ] Password change works and requires current password
- [ ] Invalid tokens return 401

#### User Management (ADMIN only)
- [ ] ADMIN can create users
- [ ] ADMIN can list all users
- [ ] ADMIN can view user details
- [ ] ADMIN can update user information
- [ ] ADMIN can delete users
- [ ] MENTOR cannot create/delete users
- [ ] INTERN cannot access user endpoints

#### Course Management
- [ ] Authenticated users can list courses
- [ ] Authenticated users can view course details
- [ ] Courses include module counts
- [ ] ADMIN/MENTOR can create courses
- [ ] ADMIN/MENTOR can update courses
- [ ] ADMIN/MENTOR can delete courses
- [ ] INTERN cannot modify courses

#### Access Control
- [ ] MENTOR can toggle intern access to courses
- [ ] MENTOR can bulk toggle access
- [ ] INTERN can view their own access info
- [ ] INTERN cannot view other interns' access
- [ ] ADMIN has unrestricted access

#### Data Integrity
- [ ] Course ordering preserved
- [ ] Module counts accurate
- [ ] Lesson counts accurate
- [ ] User roles not modified without permission
- [ ] Timestamps are accurate

### Running Regression Tests
```bash
# Full test suite covers regression scenarios
npm test

# Watch mode for continuous testing during development
npm run test:watch
```

---

## Test Coverage Goals

### Current Coverage
- Unit Tests: 0%
- Integration Tests: 0%
- E2E Tests: 0%
- **Overall: 0%**

### Target Coverage
- Unit Tests: 70%+
- Integration Tests: 50%+
- E2E Tests: 30%+
- **Overall Target: 70%**

### Generate Coverage Report
```bash
npm run test:coverage
```

This generates an HTML report in `./coverage/` directory.

---

## Creating New Tests

### Example: Test Login Endpoint
```javascript
const request = require('supertest');
const app = require('../src/index');

describe('Auth - Login', () => {
  test('POST /api/auth/login with valid credentials should return token', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@lms.com',
        password: 'Admin@123'
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.accessToken).toBeDefined();
  });

  test('POST /api/auth/login with invalid password should return 401', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@lms.com',
        password: 'wrong-password'
      });

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });
});
```

### Example: Test Authorization
```javascript
describe('Authorization', () => {
  test('INTERN should not access /api/users', async () => {
    // Login as INTERN
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({ email: 'intern@lms.com', password: 'password' });

    const token = loginResponse.body.data.accessToken;

    // Try to access admin endpoint
    const response = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(403);
  });
});
```

---

## Continuous Integration (Optional)

### GitHub Actions Example
Create `.github/workflows/test.yml`:

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      
      - run: cd server && npm install
      - run: cd server && npm run test:security
      - run: cd server && npm run test:coverage
      
      - name: Upload coverage
        uses: codecov/codecov-action@v2
```

---

## Manual Testing Checklist

### Before Deploying
- [ ] Run all tests: `npm test`
- [ ] Check coverage: `npm run test:coverage`
- [ ] Test security: `npm run test:security`
- [ ] Manual smoke test (see below)
- [ ] Test on staging environment
- [ ] Verify all credentials are environment variables

### Manual Smoke Test (5 minutes)
1. **Start server:** `npm run dev`
2. **Health check:**
   ```bash
   curl http://localhost:5001/api/health
   ```
3. **Login:**
   ```bash
   curl -X POST http://localhost:5001/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@lms.com","password":"Admin@123"}'
   ```
4. **Get courses (authenticated):**
   ```bash
   curl http://localhost:5001/api/courses \
     -H "Authorization: Bearer YOUR_TOKEN_HERE"
   ```
5. **Test 401 error:**
   ```bash
   curl http://localhost:5001/api/courses
   # Should return 401 Unauthorized
   ```
6. **Test upload access (should fail):**
   ```bash
   curl http://localhost:5001/uploads/any-file.pdf
   # Currently returns file - SECURITY ISSUE
   ```

---

## Troubleshooting

### Tests Won't Run
```bash
# Clear Jest cache
jest --clearCache

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Run with verbose output
npm test -- --verbose
```

### Database Connection Issues
- Ensure `.env` has valid DATABASE_URL
- Test connection: `npm run db:studio`
- Run migrations: `npm run db:migrate`

### Token Expiration in Tests
- Tokens expire after 15 minutes (configurable)
- Use refresh token endpoint
- Or generate new token for each test

### Module Not Found Errors
- Check file paths in require statements
- Ensure relative paths start with `./` or `../`
- Install missing dependencies

---

## Resources

- [Jest Documentation](https://jestjs.io/)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [Express Testing Best Practices](https://expressjs.com/en/advanced/best-practice-testing.html)
- [Security Testing Checklist](https://owasp.org/www-project-top-ten/)

---

**Last Updated:** July 2, 2026
