import { prisma } from '../lib/prisma';
import { analysisCache, CacheKeys } from '../lib/cache';
import { UserInsightsResult } from '../types/schemas';
import { JournalEntry, EmotionAnalysis } from '@prisma/client';

type JournalEntryWithAnalysis = JournalEntry & { analysis: EmotionAnalysis | null };

// Calculate and cache user insights
export async function calculateUserInsights(userId: string): Promise<UserInsightsResult> {
  // Check memory cache first
  const cacheKey = CacheKeys.userInsights(userId);
  const cached = analysisCache.get<UserInsightsResult>(cacheKey);
  if (cached) {
    return cached;
  }

  // Get all entries with analysis
  const entries: JournalEntryWithAnalysis[] = await prisma.journalEntry.findMany({
    where: { userId },
    include: { analysis: true },
    orderBy: { createdAt: 'desc' },
  });

  if (entries.length === 0) {
    return {
      totalEntries: 0,
      topEmotion: null,
      mostUsedAmbience: null,
      recentKeywords: [],
    };
  }

  // Calculate emotion distribution
  const emotionCounts: Record<string, number> = {};
  const allKeywords: string[] = [];

  entries.forEach((entry: JournalEntryWithAnalysis) => {
    if (entry.analysis) {
      const emotion = entry.analysis.emotion;
      emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
      
      try {
        const keywords = JSON.parse(entry.analysis.keywords);
        allKeywords.push(...keywords);
      } catch (e) {
        // Ignore parse errors
      }
    }
  });

  // Find top emotion
  const topEmotion = Object.entries(emotionCounts)
    .sort((a, b) => b[1] - a[1])[0]?.[0] || null;

  // Calculate ambience distribution
  const ambienceCounts: Record<string, number> = {};
  entries.forEach((entry: JournalEntryWithAnalysis) => {
    ambienceCounts[entry.ambience] = (ambienceCounts[entry.ambience] || 0) + 1;
  });

  const mostUsedAmbience = Object.entries(ambienceCounts)
    .sort((a, b) => b[1] - a[1])[0]?.[0] || null;

  // Get recent keywords (deduplicated, from last 10 entries)
  const recentEntries = entries.slice(0, 10);
  const recentKeywordsSet = new Set<string>();
  recentEntries.forEach((entry: JournalEntryWithAnalysis) => {
    if (entry.analysis) {
      try {
        const keywords = JSON.parse(entry.analysis.keywords);
        keywords.forEach((kw: string) => recentKeywordsSet.add(kw.toLowerCase()));
      } catch (e) {
        // Ignore parse errors
      }
    }
  });

  // Calculate entries over time (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const entriesOverTime: Record<string, number> = {};
  entries
    .filter((e: JournalEntryWithAnalysis) => e.createdAt >= thirtyDaysAgo)
    .forEach((entry: JournalEntryWithAnalysis) => {
      const date = entry.createdAt.toISOString().split('T')[0];
      entriesOverTime[date] = (entriesOverTime[date] || 0) + 1;
    });

  const insights: UserInsightsResult = {
    totalEntries: entries.length,
    topEmotion,
    mostUsedAmbience,
    recentKeywords: Array.from(recentKeywordsSet).slice(0, 10),
    emotionDistribution: emotionCounts,
    ambienceDistribution: ambienceCounts,
    entriesOverTime: Object.entries(entriesOverTime)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date)),
  };

  // Cache for 5 minutes
  analysisCache.set(cacheKey, insights, 300);

  // Update database cache
  await prisma.userInsight.upsert({
    where: { userId },
    create: {
      userId,
      totalEntries: insights.totalEntries,
      topEmotion: insights.topEmotion,
      emotionCounts: JSON.stringify(insights.emotionDistribution),
      mostUsedAmbience: insights.mostUsedAmbience,
      ambienceCounts: JSON.stringify(insights.ambienceDistribution),
      recentKeywords: JSON.stringify(insights.recentKeywords),
    },
    update: {
      totalEntries: insights.totalEntries,
      topEmotion: insights.topEmotion,
      emotionCounts: JSON.stringify(insights.emotionDistribution),
      mostUsedAmbience: insights.mostUsedAmbience,
      ambienceCounts: JSON.stringify(insights.ambienceDistribution),
      recentKeywords: JSON.stringify(insights.recentKeywords),
      lastUpdated: new Date(),
    },
  });

  return insights;
}

// Invalidate user insights cache
export function invalidateUserInsights(userId: string): void {
  const cacheKey = CacheKeys.userInsights(userId);
  analysisCache.del(cacheKey);
}
