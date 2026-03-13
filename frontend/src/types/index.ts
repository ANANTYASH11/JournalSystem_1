// API Types

export type AmbienceType = 'forest' | 'ocean' | 'mountain';
export type Ambience = AmbienceType;

export interface JournalEntry {
  id: string;
  userId: string;
  ambience: AmbienceType;
  text: string;
  createdAt: string;
  updatedAt: string;
  analysis: EmotionAnalysis | null;
}

export interface EmotionAnalysis {
  emotion: string;
  keywords: string[];
  summary: string;
  confidence?: number;
  cached?: boolean;
}

export interface UserInsights {
  totalEntries: number;
  topEmotion: string | null;
  mostUsedAmbience: string | null;
  recentKeywords: string[];
  emotionDistribution?: Record<string, number>;
  ambienceDistribution?: Record<string, number>;
  entriesOverTime?: Array<{ date: string; count: number }>;
}

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
    totalPages?: number;
  };
}

export interface CreateJournalInput {
  userId: string;
  ambience: AmbienceType;
  text: string;
}

export interface AnalyzeTextInput {
  text: string;
}
