const prisma = require('../config/db');
const { hashPassword } = require('../utils/password');
const crypto = require('crypto');

const CURRICULUM = [
  { week: 1, title: 'Python Fundamentals', category: 'Python' },
  { week: 2, title: 'SQL & Databases', category: 'SQL' },
  { week: 3, title: 'Statistics & Probability', category: 'Statistics' },
  { week: 4, title: 'Data Analysis & EDA', category: 'Data Analysis' },
  { week: 5, title: 'Machine Learning Basics', category: 'ML' },
  { week: 6, title: 'ML Algorithms', category: 'ML' },
  { week: 7, title: 'Advanced ML', category: 'ML' },
  { week: 8, title: 'Deep Learning', category: 'Deep Learning' },
  { week: 9, title: 'NLP Essentials', category: 'NLP' },
  { week: 10, title: 'LLMs & Generative AI', category: 'GenAI' },
  { week: 11, title: 'Agentic AI & Automation', category: 'GenAI' },
  { week: 12, title: 'Data Engineering', category: 'Data Engineering' },
  { week: 13, title: 'Deployment & APIs', category: 'Deployment' },
  { week: 14, title: 'Capstone Project', category: 'Capstone' },
];

async function seed() {
  console.log('Seeding database...');

  // Generate random temporary password for admin
  const tempPassword = process.env.ADMIN_PASSWORD || crypto.randomBytes(12).toString('hex');
  const adminPasswordHash = await hashPassword(tempPassword);

  console.log('\n⚠️  IMPORTANT: ADMIN TEMPORARY PASSWORD');
  console.log('─'.repeat(50));
  console.log(`📧 Email: admin@lms.com`);
  console.log(`🔐 Temporary Password: ${tempPassword}`);
  console.log('─'.repeat(50));
  console.log('⚠️  Change this password immediately after first login!');
  console.log('    Go to Settings → Change Password\n');

  const admin = await prisma.user.upsert({
    where: { email: 'admin@lms.com' },
    update: {},
    create: {
      email: 'admin@lms.com',
      name: 'Admin',
      role: 'ADMIN',
      passwordHash: adminPasswordHash,
      status: 'ACTIVE',
      forcePasswordChange: true,
    },
  });
  console.log(`✅ Admin created: ${admin.email}`);

  for (const c of CURRICULUM) {
    await prisma.course.upsert({
      where: { id: `week-${c.week}` },
      update: {},
      create: {
        id: `week-${c.week}`,
        title: c.title,
        description: `Week ${c.week}: ${c.title}`,
        category: c.category,
        weekNumber: c.week,
        order: c.week,
        createdBy: admin.id,
      },
    });
  }
  console.log('14-week curriculum seeded');

  const batch = await prisma.batch.upsert({
    where: { id: 'batch-1' },
    update: {},
    create: {
      id: 'batch-1',
      name: 'Batch 1 - 2026',
      startDate: new Date('2026-07-01'),
      endDate: new Date('2026-10-08'),
    },
  });
  console.log(`Batch created: ${batch.name}`);

  console.log('Seed complete!');
}

seed()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
