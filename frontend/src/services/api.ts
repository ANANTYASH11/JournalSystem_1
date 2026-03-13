import axios from 'axios';
import {
  JournalEntry,
  EmotionAnalysis,
  UserInsights,
  ApiResponse,
  CreateJournalInput,
  AnalyzeTextInput,
} from '../types';

// API base URL
const API_URL = import.meta.env.VITE_API_URL || '/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ============================
// Journal API
// ============================

export async function createJournalEntry(
  input: CreateJournalInput
): Promise<JournalEntry> {
  const response = await api.post<ApiResponse<JournalEntry>>('/journal', input);
  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.error || 'Failed to create entry');
  }
  return response.data.data;
}

export async function getJournalEntries(
  userId: string,
  page = 1,
  limit = 20
): Promise<{
  entries: JournalEntry[];
  hasMore: boolean;
  total: number;
}> {
  const response = await api.get<ApiResponse<JournalEntry[]>>(
    `/journal/${userId}`,
    { params: { page, limit } }
  );
  
  if (!response.data.success) {
    throw new Error(response.data.error || 'Failed to fetch entries');
  }
  
  return {
    entries: response.data.data || [],
    hasMore: response.data.metadata?.hasMore || false,
    total: response.data.metadata?.total || 0,
  };
}

export async function deleteJournalEntry(
  userId: string,
  entryId: string
): Promise<void> {
  const response = await api.delete<ApiResponse<null>>(
    `/journal/${userId}/${entryId}`
  );
  
  if (!response.data.success) {
    throw new Error(response.data.error || 'Failed to delete entry');
  }
}

// ============================
// Analysis API
// ============================

export async function analyzeText(
  input: AnalyzeTextInput
): Promise<EmotionAnalysis> {
  const response = await api.post<ApiResponse<EmotionAnalysis>>(
    '/journal/analyze',
    input
  );
  
  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.error || 'Failed to analyze text');
  }
  
  return response.data.data;
}

// Stream analysis (for bonus streaming feature)
export async function analyzeTextStream(
  text: string,
  onChunk: (chunk: string) => void
): Promise<void> {
  const response = await fetch(`${API_URL}/journal/analyze/stream`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });

  const reader = response.body?.getReader();
  const decoder = new TextDecoder();

  if (!reader) {
    throw new Error('Streaming not supported');
  }

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value);
    const lines = chunk.split('\n').filter((line) => line.startsWith('data: '));

    for (const line of lines) {
      try {
        const data = JSON.parse(line.replace('data: ', ''));
        if (data.chunk) {
          onChunk(data.chunk);
        }
      } catch {
        // Ignore parse errors
      }
    }
  }
}

// ============================
// Insights API
// ============================

export async function getUserInsights(userId: string): Promise<UserInsights> {
  const response = await api.get<ApiResponse<UserInsights>>(
    `/journal/insights/${userId}`
  );
  
  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.error || 'Failed to fetch insights');
  }
  
  return response.data.data;
}

// ============================
// System API
// ============================

export async function getHealthStatus(): Promise<{
  status: string;
  database: string;
}> {
  const response = await api.get('/health');
  return response.data;
}

// Convenience wrapper object for API methods
export const journalApi = {
  createEntry: createJournalEntry,
  getEntries: async (userId: string) => {
    const result = await getJournalEntries(userId);
    return result.entries;
  },
  deleteEntry: deleteJournalEntry,
  analyzeText: (text: string) => analyzeText({ text }),
  getInsights: getUserInsights,
  getHealth: getHealthStatus,
};
