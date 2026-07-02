const { hashPassword, comparePassword } = require('../../src/utils/password');

describe('Password Utils', () => {
  const testPassword = 'SecurePassword123!';

  test('should hash password correctly', async () => {
    const hash = await hashPassword(testPassword);

    expect(hash).toBeDefined();
    expect(hash).not.toBe(testPassword);
    expect(hash.length).toBeGreaterThan(20);
  });

  test('should match correct password', async () => {
    const hash = await hashPassword(testPassword);
    const match = await comparePassword(testPassword, hash);

    expect(match).toBe(true);
  });

  test('should not match incorrect password', async () => {
    const hash = await hashPassword(testPassword);
    const match = await comparePassword('WrongPassword123!', hash);

    expect(match).toBe(false);
  });

  test('should generate different hashes for same password', async () => {
    const hash1 = await hashPassword(testPassword);
    const hash2 = await hashPassword(testPassword);

    expect(hash1).not.toBe(hash2);
    // But both should match the original password
    expect(await comparePassword(testPassword, hash1)).toBe(true);
    expect(await comparePassword(testPassword, hash2)).toBe(true);
  });
});
