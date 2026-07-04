const prisma = require('../config/db');

async function getRiskAlerts(req, res) {
  try {
    // Get all active interns
    const interns = await prisma.user.findMany({
      where: { role: 'INTERN', status: 'ACTIVE' },
      select: { id: true, name: true, email: true, batchId: true },
    });

    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    const alerts = [];

    for (const intern of interns) {
      const internAlerts = [];

      // 1. Attendance check (last 14 days)
      const [attendanceRecords, totalDays] = await Promise.all([
        prisma.attendance.count({
          where: {
            internId: intern.id,
            date: { gte: fourteenDaysAgo },
            status: { in: ['PRESENT', 'LATE'] },
          },
        }),
        prisma.attendance.count({
          where: {
            internId: intern.id,
            date: { gte: fourteenDaysAgo },
          },
        }),
      ]);

      const attendanceRate = totalDays > 0 ? Math.round((attendanceRecords / totalDays) * 100) : 0;
      if (totalDays > 0 && attendanceRate < 75) {
        internAlerts.push({
          type: 'LOW_ATTENDANCE',
          severity: attendanceRate < 50 ? 'critical' : 'warning',
          message: `Attendance at ${attendanceRate}% (last 14 days)`,
          value: attendanceRate,
          threshold: 75,
        });
      }

      // 2. Missed standups (last 7 days)
      const standupCount = await prisma.dailyStandup.count({
        where: {
          internId: intern.id,
          date: { gte: sevenDaysAgo },
        },
      });

      // Expect at least 4 standups in 7 days (weekdays)
      if (standupCount < 3) {
        internAlerts.push({
          type: 'MISSED_STANDUPS',
          severity: standupCount === 0 ? 'critical' : 'warning',
          message: `Only ${standupCount} standup${standupCount !== 1 ? 's' : ''} in the last 7 days`,
          value: standupCount,
          threshold: 3,
        });
      }

      // 3. Stalled capstone
      const capstone = await prisma.capstoneProject.findUnique({
        where: { internId: intern.id },
      });

      if (capstone) {
        const daysSinceUpdate = Math.floor((now.getTime() - new Date(capstone.updatedAt).getTime()) / (24 * 60 * 60 * 1000));
        if (daysSinceUpdate > 7 && capstone.phase !== 'EVALUATION') {
          internAlerts.push({
            type: 'STALLED_CAPSTONE',
            severity: daysSinceUpdate > 14 ? 'critical' : 'warning',
            message: `Capstone in ${capstone.phase} phase, no updates for ${daysSinceUpdate} days`,
            value: daysSinceUpdate,
            threshold: 7,
          });
        }
      }

      // 4. Declining grades (compare last 3 submissions)
      const recentSubmissions = await prisma.submission.findMany({
        where: {
          internId: intern.id,
          status: 'GRADED',
          grade: { not: null },
        },
        orderBy: { submittedAt: 'desc' },
        take: 6,
        include: { assignment: { select: { maxScore: true } } },
      });

      if (recentSubmissions.length >= 4) {
        const recent3 = recentSubmissions.slice(0, 3);
        const prev3 = recentSubmissions.slice(3, 6);

        const recentAvg = recent3.reduce((sum, s) => sum + ((s.grade || 0) / s.assignment.maxScore) * 100, 0) / recent3.length;
        const prevAvg = prev3.length > 0
          ? prev3.reduce((sum, s) => sum + ((s.grade || 0) / s.assignment.maxScore) * 100, 0) / prev3.length
          : recentAvg;

        if (prevAvg - recentAvg > 15) {
          internAlerts.push({
            type: 'DECLINING_GRADES',
            severity: prevAvg - recentAvg > 25 ? 'critical' : 'warning',
            message: `Grade average dropped from ${Math.round(prevAvg)}% to ${Math.round(recentAvg)}%`,
            value: Math.round(recentAvg),
            threshold: Math.round(prevAvg),
          });
        }
      }

      // 5. No commits in 7 days
      const commitCount = await prisma.commitLog.count({
        where: {
          internId: intern.id,
          date: { gte: sevenDaysAgo },
        },
      });

      if (commitCount === 0) {
        internAlerts.push({
          type: 'NO_COMMITS',
          severity: 'warning',
          message: 'No GitHub commits in the last 7 days',
          value: 0,
          threshold: 1,
        });
      }

      // 6. Incomplete daily tasks
      const [completedTasks, totalTasks] = await Promise.all([
        prisma.dailyTask.count({
          where: {
            internId: intern.id,
            date: { gte: sevenDaysAgo },
            status: 'COMPLETED',
          },
        }),
        prisma.dailyTask.count({
          where: {
            internId: intern.id,
            date: { gte: sevenDaysAgo },
          },
        }),
      ]);

      const taskCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 100;
      if (totalTasks > 0 && taskCompletionRate < 50) {
        internAlerts.push({
          type: 'LOW_TASK_COMPLETION',
          severity: taskCompletionRate < 25 ? 'critical' : 'warning',
          message: `Task completion at ${taskCompletionRate}% (${completedTasks}/${totalTasks}) this week`,
          value: taskCompletionRate,
          threshold: 50,
        });
      }

      if (internAlerts.length > 0) {
        const riskScore = internAlerts.reduce((score, alert) => score + (alert.severity === 'critical' ? 3 : 1), 0);
        alerts.push({
          intern: { id: intern.id, name: intern.name, email: intern.email },
          riskScore,
          riskLevel: riskScore >= 6 ? 'high' : riskScore >= 3 ? 'medium' : 'low',
          alerts: internAlerts,
        });
      }
    }

    // Sort by risk score descending
    alerts.sort((a, b) => b.riskScore - a.riskScore);

    res.json({
      success: true,
      data: {
        totalAtRisk: alerts.length,
        highRisk: alerts.filter((a) => a.riskLevel === 'high').length,
        mediumRisk: alerts.filter((a) => a.riskLevel === 'medium').length,
        lowRisk: alerts.filter((a) => a.riskLevel === 'low').length,
        alerts,
      },
    });
  } catch (err) {
    console.error('RISK_ALERTS_ERROR:', err);
    res.status(500).json({ success: false, error: 'Failed to calculate risk alerts' });
  }
}

module.exports = { getRiskAlerts };
