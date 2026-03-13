import { PrismaClient } from '@prisma/client';
import { isDevelopment } from '../config/env';

// Singleton pattern for Prisma Client
declare global {
  var __prisma: PrismaClient | undefined;
}

// Create Prisma client with logging in development
export const prisma =
  global.__prisma ||
  new PrismaClient({
    log: isDevelopment ? ['query', 'error', 'warn'] : ['error'],
  });

// Prevent multiple instances in development
if (isDevelopment) {
  global.__prisma = prisma;
}

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});
