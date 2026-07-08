require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const logger = require('./utils/logger');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const batchRoutes = require('./routes/batchRoutes');
const courseRoutes = require('./routes/courseRoutes');
const moduleRoutes = require('./routes/moduleRoutes');
const lessonRoutes = require('./routes/lessonRoutes');
const accessRoutes = require('./routes/accessRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const standupRoutes = require('./routes/standupRoutes');
const dailyTaskRoutes = require('./routes/dailyTaskRoutes');
const assignmentRoutes = require('./routes/assignmentRoutes');
const quizRoutes = require('./routes/quizRoutes');
const githubRoutes = require('./routes/githubRoutes');
const hackathonRoutes = require('./routes/hackathonRoutes');
const capstoneRoutes = require('./routes/capstoneRoutes');
const progressRoutes = require('./routes/progressRoutes');
const gamificationRoutes = require('./routes/gamificationRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const calendarEventRoutes = require('./routes/calendarEventRoutes');
const peerCodeReviewRoutes = require('./routes/peerCodeReviewRoutes');
const riskAlertRoutes = require('./routes/riskAlertRoutes');
const discussionRoutes = require('./routes/discussionRoutes');
const { authorizeFileAccess } = require('./middleware/fileAuth');

const app = express();
app.set('trust proxy', 1);
const PORT = process.env.PORT || 5000;

// Security headers
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Body parsing
app.use(express.json());
app.use(cookieParser());

// Request logging (if Pino is available)
if (logger) {
  app.use((req, res, next) => {
    logger.info({
      method: req.method,
      path: req.path,
      ip: req.ip,
    });
    next();
  });
}

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/batches', batchRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/modules', moduleRoutes);
app.use('/api/lessons', lessonRoutes);
app.use('/api/access', accessRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/standups', standupRoutes);
app.use('/api/daily-tasks', dailyTaskRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/github', githubRoutes);
app.use('/api/hackathons', hackathonRoutes);
app.use('/api/capstones', capstoneRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/gamification', gamificationRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/calendar-events', calendarEventRoutes);
app.use('/api/peer-reviews', peerCodeReviewRoutes);
app.use('/api/risk-alerts', riskAlertRoutes);
app.use('/api/discussions', discussionRoutes);

// Protected file uploads - requires authentication
app.use('/uploads', authorizeFileAccess, require('express').static(require('path').join(__dirname, '../uploads')));

app.get('/api/health', async (req, res) => {
  try {
    const prisma = require('./config/db');
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ok', db: 'connected', timestamp: new Date().toISOString() });
  } catch (err) {
    console.error('HEALTH_DB_ERROR:', err.message);
    res.status(500).json({ status: 'error', db: 'disconnected', error: err.message, timestamp: new Date().toISOString() });
  }
});

app.use((err, req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`DATABASE_URL set: ${!!process.env.DATABASE_URL}`);
  console.log(`JWT_SECRET set: ${!!process.env.JWT_SECRET}`);
  console.log(`NODE_ENV: ${process.env.NODE_ENV}`);
});

module.exports = app;
