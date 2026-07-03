const { PrismaClient } = require('@prisma/client');

function getDatabaseUrl() {
  const rawUrl = process.env.DATABASE_URL;
  if (!rawUrl) return undefined;

  try {
    const url = new URL(rawUrl);
    if (!url.searchParams.has('connection_limit')) {
      url.searchParams.set('connection_limit', process.env.PRISMA_CONNECTION_LIMIT || '3');
    }
    if (!url.searchParams.has('pool_timeout')) {
      url.searchParams.set('pool_timeout', process.env.PRISMA_POOL_TIMEOUT || '20');
    }
    return url.toString();
  } catch {
    return rawUrl;
  }
}

const datasourceUrl = getDatabaseUrl();

const prisma = new PrismaClient({
  log: ['error', 'warn'],
  ...(datasourceUrl && {
    datasources: {
      db: { url: datasourceUrl },
    },
  }),
});

// Test connection on startup
prisma.$connect()
  .then(() => console.log('Prisma connected to database'))
  .catch((err) => console.error('PRISMA_CONNECTION_ERROR:', err.message));

module.exports = prisma;
