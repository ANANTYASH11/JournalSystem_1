import { Request, Response } from 'express';
import { asyncHandler, NotFoundError } from '../middleware/errorHandler';
import { ApiResponse, UserInsightsResult } from '../types/schemas';
import { calculateUserInsights } from '../services/insightsService';
import { prisma } from '../lib/prisma';

// GET /api/journal/insights/:userId - Get user insights
export const getUserInsights = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.params;

  // Check if user exists
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new NotFoundError('User');
  }

  const insights = await calculateUserInsights(userId);

  const response: ApiResponse<UserInsightsResult> = {
    success: true,
    data: insights,
  };

  res.json(response);
});
