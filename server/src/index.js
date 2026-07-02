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
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
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

app.use('/lms-api/auth', authRoutes);
app.use('/lms-api/users', userRoutes);
app.use('/lms-api/batches', batchRoutes);
app.use('/lms-api/courses', courseRoutes);
app.use('/lms-api/modules', moduleRoutes);
app.use('/lms-api/lessons', lessonRoutes);
app.use('/lms-api/access', accessRoutes);
app.use('/lms-api/attendance', attendanceRoutes);
app.use('/lms-api/standups', standupRoutes);
app.use('/lms-api/daily-tasks', dailyTaskRoutes);
app.use('/lms-api/assignments', assignmentRoutes);
app.use('/lms-api/quizzes', quizRoutes);
app.use('/lms-api/github', githubRoutes);
app.use('/lms-api/hackathons', hackathonRoutes);
app.use('/lms-api/capstones', capstoneRoutes);
app.use('/lms-api/progress', progressRoutes);
app.use('/lms-api/gamification', gamificationRoutes);
app.use('/lms-api/dashboard', dashboardRoutes);

// Protected file uploads - requires authentication
app.use('/uploads', authorizeFileAccess, require('express').static(require('path').join(__dirname, '../uploads')));

app.get('/lms-api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use((err, req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
