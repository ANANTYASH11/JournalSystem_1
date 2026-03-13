import { Router, Request, Response } from 'express';
import { getCacheStats, clearCache } from '../lib/cache';
import { prisma } from '../lib/prisma';

const router = Router();

/**
 * @route   GET /api/health
 * @desc    Health check endpoint
 */
router.get('/health', async (req: Request, res: Response) => {
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`;
    
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: 'connected',
      cache: getCacheStats(),
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
    });
  }
});

/**
 * @route   GET /api/stats
 * @desc    Get system statistics
 */
router.get('/stats', async (req: Request, res: Response) => {
  const [userCount, entryCount, analysisCount] = await Promise.all([
    prisma.user.count(),
    prisma.journalEntry.count(),
    prisma.emotionAnalysis.count(),
  ]);

  res.json({
    success: true,
    data: {
      users: userCount,
      entries: entryCount,
      analyses: analysisCount,
      cache: getCacheStats(),
    },
  });
});

/**
 * @route   POST /api/cache/clear
 * @desc    Clear all caches (admin use)
 */
router.post('/cache/clear', (req: Request, res: Response) => {
  clearCache();
  res.json({
    success: true,
    message: 'Cache cleared successfully',
  });
});

export default router;
