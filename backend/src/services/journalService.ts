import { prisma } from '../lib/prisma';
import { CreateJournalEntryInput, PaginationInput } from '../types/schemas';
import { analyzeEmotions } from './llmService';
import { invalidateUserInsights } from './insightsService';
import { generateTextHash } from '../lib/cache';
import { NotFoundError } from '../middleware/errorHandler';

// Create a new journal entry
export async function createJournalEntry(input: CreateJournalEntryInput) {
  // Ensure user exists (create if not)
  await prisma.user.upsert({
    where: { id: input.userId },
    create: { id: input.userId },
    update: {},
  });

  // Create journal entry
  const entry = await prisma.journalEntry.create({
    data: {
      userId: input.userId,
      ambience: input.ambience,
      text: input.text,
    },
  });

  // Analyze emotions asynchronously and store results
  const textHash = generateTextHash(input.text);
  
  // Check if analysis already exists for this text
  const existingAnalysis = await prisma.emotionAnalysis.findFirst({
    where: { textHash },
  });

  if (existingAnalysis) {
    // Reuse existing analysis
    await prisma.emotionAnalysis.create({
      data: {
        journalEntryId: entry.id,
        emotion: existingAnalysis.emotion,
        keywords: existingAnalysis.keywords,
        summary: existingAnalysis.summary,
        confidence: existingAnalysis.confidence,
        textHash,
      },
    });
  } else {
    // Perform new analysis
    try {
      const analysis = await analyzeEmotions(input.text);
      await prisma.emotionAnalysis.create({
        data: {
          journalEntryId: entry.id,
          emotion: analysis.emotion,
          keywords: JSON.stringify(analysis.keywords),
          summary: analysis.summary,
          confidence: analysis.confidence,
          textHash,
        },
      });
    } catch (error) {
      console.error('Failed to analyze entry:', error);
      // Entry is still created, analysis can be done later
    }
  }

  // Invalidate user insights cache
  invalidateUserInsights(input.userId);

  // Return entry with analysis
  return prisma.journalEntry.findUnique({
    where: { id: entry.id },
    include: { analysis: true },
  });
}

// Get all journal entries for a user
export async function getJournalEntries(
  userId: string,
  pagination?: PaginationInput
) {
  const page = pagination?.page || 1;
  const limit = pagination?.limit || 20;
  const skip = (page - 1) * limit;

  // Check if user exists
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new NotFoundError('User');
  }

  const [entries, total] = await Promise.all([
    prisma.journalEntry.findMany({
      where: { userId },
      include: {
        analysis: {
          select: {
            emotion: true,
            keywords: true,
            summary: true,
            confidence: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.journalEntry.count({ where: { userId } }),
  ]);

  // Transform entries to include parsed keywords
  const transformedEntries = entries.map((entry: (typeof entries)[number]) => ({
    ...entry,
    analysis: entry.analysis
      ? {
          ...entry.analysis,
          keywords: JSON.parse(entry.analysis.keywords),
        }
      : null,
  }));

  return {
    entries: transformedEntries,
    pagination: {
      page,
      limit,
      total,
      hasMore: skip + entries.length < total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

// Get a single journal entry
export async function getJournalEntry(entryId: string) {
  const entry = await prisma.journalEntry.findUnique({
    where: { id: entryId },
    include: {
      analysis: true,
    },
  });

  if (!entry) {
    throw new NotFoundError('Journal entry');
  }

  return {
    ...entry,
    analysis: entry.analysis
      ? {
          ...entry.analysis,
          keywords: JSON.parse(entry.analysis.keywords),
        }
      : null,
  };
}

// Delete a journal entry
export async function deleteJournalEntry(entryId: string, userId: string) {
  const entry = await prisma.journalEntry.findFirst({
    where: { id: entryId, userId },
  });

  if (!entry) {
    throw new NotFoundError('Journal entry');
  }

  await prisma.journalEntry.delete({
    where: { id: entryId },
  });

  // Invalidate user insights cache
  invalidateUserInsights(userId);

  return { deleted: true };
}
