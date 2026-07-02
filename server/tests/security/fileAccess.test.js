const request = require('supertest');
const app = require('../../src/index');
const prisma = require('../../src/config/db');
const { hashPassword } = require('../../src/utils/password');

describe('File Upload Security Tests', () => {
  let adminToken;
  let internToken;
  let internId;

  beforeAll(async () => {
    // Create admin
    const adminHash = await hashPassword('Admin123!');
    const admin = await prisma.user.upsert({
      where: { email: 'admin@filetest.com' },
      update: {},
      create: {
        email: 'admin@filetest.com',
        name: 'Admin',
        passwordHash: adminHash,
        role: 'ADMIN',
        status: 'ACTIVE',
      },
    });

    // Create intern
    const internHash = await hashPassword('Intern123!');
    const intern = await prisma.user.upsert({
      where: { email: 'intern@filetest.com' },
      update: {},
      create: {
        email: 'intern@filetest.com',
        name: 'Intern',
        passwordHash: internHash,
        role: 'INTERN',
        status: 'ACTIVE',
      },
    });
    internId = intern.id;

    // Get tokens
    const adminRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@filetest.com',
        password: 'Admin123!',
      });
    adminToken = adminRes.body.data.accessToken;

    const internRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'intern@filetest.com',
        password: 'Intern123!',
      });
    internToken = internRes.body.data.accessToken;
  });

  afterAll(async () => {
    // Cleanup
    await prisma.user.deleteMany({
      where: {
        email: { in: ['admin@filetest.com', 'intern@filetest.com'] },
      },
    });
  });

  describe('File Access Control', () => {
    test('should deny access to /uploads without authentication', async () => {
      const response = await request(app).get('/uploads/test.pdf');

      expect(response.status).toBe(401);
      expect(response.body.error).toContain('Authentication');
    });

    test('should deny access with invalid token', async () => {
      const response = await request(app)
        .get('/uploads/test.pdf')
        .set('Authorization', 'Bearer invalid.token.here');

      expect(response.status).toBe(401);
      expect(response.body.error).toContain('Invalid');
    });

    test('should deny access with malformed authorization header', async () => {
      const response = await request(app)
        .get('/uploads/test.pdf')
        .set('Authorization', 'InvalidFormat');

      expect(response.status).toBe(401);
    });

    test('INTERN should not access other user files', async () => {
      const response = await request(app)
        .get(`/uploads/other-user-id/file.pdf`)
        .set('Authorization', `Bearer ${internToken}`);

      expect(response.status).toBe(403);
      expect(response.body.error).toContain('own files');
    });

    test('INTERN can access own files', async () => {
      // Will return 404 (file not found) but NOT 401/403
      const response = await request(app)
        .get(`/uploads/${internId}/myfile.pdf`)
        .set('Authorization', `Bearer ${internToken}`);

      // 404 is expected (file doesn't exist), but authentication succeeded
      expect([200, 404]).toContain(response.status);
      expect(response.status).not.toBe(401);
      expect(response.status).not.toBe(403);
    });

    test('ADMIN can access any file', async () => {
      // Will return 404 but authentication should succeed
      const response = await request(app)
        .get(`/uploads/any-path/any-file.pdf`)
        .set('Authorization', `Bearer ${adminToken}`);

      // 404 is expected (file doesn't exist), but permission is OK
      expect([200, 404]).toContain(response.status);
      expect(response.status).not.toBe(401);
      expect(response.status).not.toBe(403);
    });
  });
});
