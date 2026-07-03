const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: ['error', 'warn'],
});

// Test connection on startup
prisma.$connect()
  .then(() => console.log('Prisma connected to database'))
  .catch((err) => console.error('PRISMA_CONNECTION_ERROR:', err.message));

module.exports = prisma;
