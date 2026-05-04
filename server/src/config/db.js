const { PrismaClient } = require('@prisma/client');

// Use a singleton Prisma Client instance
const prisma = new PrismaClient({});

// Pipe Prisma events into Winston
// prisma.$on('query', (e) => {
//     logger.debug('Prisma Query', {
//         query: e.query,
//         params: e.params,
//         duration: `${e.duration}ms`,
//     });
// });

// prisma.$on('error', (e) => {
//     logger.error('Prisma Error', { message: e.message });
// });

// prisma.$on('warn', (e) => {
//     logger.warn('Prisma Warning', { message: e.message });
// });

module.exports = prisma;
