import { z } from 'zod';

// Valid ambience types
export const AmbienceType = z.enum(['forest', 'ocean', 'mountain']);
export type AmbienceType = z.infer<typeof AmbienceType>;

// Journal Entry schemas
export const CreateJournalEntrySchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  ambience: AmbienceType,
  text: z.string()
    .min(10, 'Journal entry must be at least 10 characters')
    .max(5000, 'Journal entry must not exceed 5000 characters'),
});

export type CreateJournalEntryInput = z.infer<typeof CreateJournalEntrySchema>;

// Analysis schemas
export const AnalyzeTextSchema = z.object({
  text: z.string()
    .min(10, 'Text must be at least 10 characters')
    .max(5000, 'Text must not exceed 5000 characters'),
});

export type AnalyzeTextInput = z.infer<typeof AnalyzeTextSchema>;

// Analysis result
export interface EmotionAnalysisResult {
  emotion: string;
  keywords: string[];
  summary: string;
  confidence?: number;
  cached?: boolean;
}

// User Insights
export interface UserInsightsResult {
  totalEntries: number;
  topEmotion: string | null;
  mostUsedAmbience: string | null;
  recentKeywords: string[];
  emotionDistribution?: Record<string, number>;
  ambienceDistribution?: Record<string, number>;
  entriesOverTime?: Array<{ date: string; count: number }>;
}

// Pagination schema
export const PaginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type PaginationInput = z.infer<typeof PaginationSchema>;

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  metadata?: {
    page?: number;
    limit?: number;
    total?: number;
    hasMore?: boolean;
  };
}
