const prisma = require('../config/db');
const { hashPassword, comparePassword } = require('../utils/password');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../utils/jwt');
const { success, error } = require('../utils/apiResponse');

async function login(req, res) {
  try {
    const { email, password } = req.validated;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return error(res, 'Invalid credentials', 401);
    if (user.status === 'REMOVED') return error(res, 'Account deactivated', 401);

    const valid = await comparePassword(password, user.passwordHash);
    if (!valid) return error(res, 'Invalid credentials', 401);

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await prisma.refreshToken.create({
      data: { token: refreshToken, userId: user.id, expiresAt },
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    if (user.status === 'INVITED') {
      await prisma.user.update({
        where: { id: user.id },
        data: { status: 'ONBOARDING' },
      });
    }

    return success(res, {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        status: user.status === 'INVITED' ? 'ONBOARDING' : user.status,
        forcePasswordChange: user.forcePasswordChange,
        avatarUrl: user.avatarUrl,
      },
    });
  } catch (err) {
    console.error('LOGIN_ERROR:', err.message, err.code || '');
    return error(res, 'Login failed', 500);
  }
}

async function refreshAccessToken(req, res) {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) return error(res, 'No refresh token', 401);

    const decoded = verifyRefreshToken(token);

    const stored = await prisma.refreshToken.findUnique({ where: { token } });
    if (!stored || stored.expiresAt < new Date()) {
      return error(res, 'Invalid refresh token', 401);
    }

    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    if (!user) return error(res, 'User not found', 401);

    const accessToken = generateAccessToken(user);
    return success(res, { accessToken });
  } catch (err) {
    return error(res, 'Token refresh failed', 401);
  }
}

async function changePassword(req, res) {
  try {
    const { currentPassword, newPassword } = req.validated;
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });

    const valid = await comparePassword(currentPassword, user.passwordHash);
    if (!valid) return error(res, 'Current password is incorrect', 400);

    const passwordHash = await hashPassword(newPassword);
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        forcePasswordChange: false,
        status: user.status === 'ONBOARDING' ? 'ACTIVE' : user.status,
      },
    });

    return success(res, { message: 'Password changed' });
  } catch (err) {
    return error(res, 'Password change failed', 500);
  }
}

async function logout(req, res) {
  try {
    const token = req.cookies?.refreshToken;
    if (token) {
      await prisma.refreshToken.deleteMany({ where: { token } });
    }
    res.clearCookie('refreshToken');
    return success(res, { message: 'Logged out' });
  } catch (err) {
    return error(res, 'Logout failed', 500);
  }
}

async function me(req, res) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        avatarUrl: true,
        forcePasswordChange: true,
        batchId: true,
        primaryMentorId: true,
        createdAt: true,
      },
    });
    if (!user) return error(res, 'User not found', 404);
    return success(res, user);
  } catch (err) {
    return error(res, 'Failed to get user', 500);
  }
}

module.exports = { login, refreshAccessToken, changePassword, logout, me };
