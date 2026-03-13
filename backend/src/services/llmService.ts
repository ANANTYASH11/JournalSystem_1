import Groq from 'groq-sdk';
import { config } from '../config/env';
import { EmotionAnalysisResult } from '../types/schemas';
import { analysisCache, generateTextHash, CacheKeys } from '../lib/cache';
import { prisma } from '../lib/prisma';
import { LLMServiceError } from '../middleware/errorHandler';

// Initialize Groq client (free tier available)
const groq = config.GROQ_API_KEY ? new Groq({ apiKey: config.GROQ_API_KEY }) : null;

// System prompt for emotion analysis
const EMOTION_ANALYSIS_PROMPT = `You are an expert psychologist and emotion analyst. Analyze the given journal entry and extract:
1. The primary emotion (single word like: calm, anxious, happy, sad, peaceful, stressed, grateful, frustrated, hopeful, content, etc.)
2. Key keywords that capture the essence (3-5 words)
3. A brief summary of the user's mental state (1-2 sentences)

Respond ONLY with valid JSON in this exact format:
{
  "emotion": "string",
  "keywords": ["string", "string", "string"],
  "summary": "string",
  "confidence": 0.0
}

Be empathetic and insightful. The confidence should be between 0.0 and 1.0 based on how clear the emotions are in the text.`;

// Analyze text using LLM
export async function analyzeEmotions(text: string): Promise<EmotionAnalysisResult> {
  const textHash = generateTextHash(text);
  
  // Check in-memory cache first
  const cacheKey = CacheKeys.analysis(textHash);
  const cached = analysisCache.get<EmotionAnalysisResult>(cacheKey);
  if (cached) {
    console.log('✅ Cache hit for analysis');
    return { ...cached, cached: true };
  }

  // Check database cache
  const dbCached = await prisma.emotionAnalysis.findFirst({
    where: { textHash },
    orderBy: { createdAt: 'desc' },
  });

  if (dbCached) {
    console.log('✅ Database cache hit for analysis');
    const result: EmotionAnalysisResult = {
      emotion: dbCached.emotion,
      keywords: JSON.parse(dbCached.keywords),
      summary: dbCached.summary,
      confidence: dbCached.confidence ?? undefined,
      cached: true,
    };
    // Store in memory cache for faster access
    analysisCache.set(cacheKey, result);
    return result;
  }

  // Call LLM for fresh analysis
  const result = await callLLM(text);
  
  // Store in memory cache
  analysisCache.set(cacheKey, result);
  
  return result;
}

// Call the LLM API
async function callLLM(text: string): Promise<EmotionAnalysisResult> {
  if (!groq) {
    console.warn('⚠️ No LLM API key configured, using fallback analysis');
    return fallbackAnalysis(text);
  }

  try {
    console.log('🤖 Calling Groq LLM for analysis...');
    
    const completion = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant', // Fast and free
      messages: [
        { role: 'system', content: EMOTION_ANALYSIS_PROMPT },
        { role: 'user', content: `Analyze this journal entry:\n\n"${text}"` }
      ],
      temperature: 0.3,
      max_tokens: 300,
      response_format: { type: 'json_object' },
    });

    const responseText = completion.choices[0]?.message?.content;
    
    if (!responseText) {
      throw new Error('Empty response from LLM');
    }

    const parsed = JSON.parse(responseText);
    
    // Validate response structure
    const result: EmotionAnalysisResult = {
      emotion: String(parsed.emotion || 'unknown').toLowerCase(),
      keywords: Array.isArray(parsed.keywords) 
        ? parsed.keywords.map(String).slice(0, 5) 
        : [],
      summary: String(parsed.summary || 'Analysis not available'),
      confidence: typeof parsed.confidence === 'number' 
        ? Math.min(1, Math.max(0, parsed.confidence)) 
        : 0.8,
    };

    console.log('✅ LLM analysis complete:', result.emotion);
    return result;

  } catch (error) {
    console.error('❌ LLM API error:', error);
    
    // Fallback to basic analysis if LLM fails
    return fallbackAnalysis(text);
  }
}

// Streaming LLM response (bonus feature)
export async function* analyzeEmotionsStream(text: string): AsyncGenerator<string> {
  if (!groq) {
    yield JSON.stringify(fallbackAnalysis(text));
    return;
  }

  try {
    const stream = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [
        { role: 'system', content: EMOTION_ANALYSIS_PROMPT },
        { role: 'user', content: `Analyze this journal entry:\n\n"${text}"` }
      ],
      temperature: 0.3,
      max_tokens: 300,
      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        yield content;
      }
    }
  } catch (error) {
    console.error('❌ Streaming error:', error);
    yield JSON.stringify(fallbackAnalysis(text));
  }
}

// Fallback analysis when LLM is unavailable
function fallbackAnalysis(text: string): EmotionAnalysisResult {
  const lowercaseText = text.toLowerCase();
  
  // Simple keyword-based emotion detection
  const emotionKeywords: Record<string, string[]> = {
    calm: ['calm', 'peaceful', 'relaxed', 'serene', 'tranquil', 'soothing'],
    happy: ['happy', 'joy', 'excited', 'wonderful', 'great', 'amazing', 'love'],
    sad: ['sad', 'depressed', 'down', 'unhappy', 'lonely', 'grief'],
    anxious: ['anxious', 'worried', 'nervous', 'stressed', 'overwhelmed'],
    grateful: ['grateful', 'thankful', 'blessed', 'appreciate'],
    peaceful: ['peace', 'quiet', 'still', 'meditat'],
    hopeful: ['hope', 'optimistic', 'looking forward', 'excited about'],
    content: ['content', 'satisfied', 'fulfilled', 'good'],
    frustrated: ['frustrat', 'annoyed', 'irritat', 'angry'],
  };

  let detectedEmotion = 'neutral';
  let maxMatches = 0;

  for (const [emotion, keywords] of Object.entries(emotionKeywords)) {
    const matches = keywords.filter(kw => lowercaseText.includes(kw)).length;
    if (matches > maxMatches) {
      maxMatches = matches;
      detectedEmotion = emotion;
    }
  }

  // Extract keywords from text
  const words = text.toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 4);
  
  const wordFreq: Record<string, number> = {};
  words.forEach(word => {
    wordFreq[word] = (wordFreq[word] || 0) + 1;
  });

  const sortedWords = Object.entries(wordFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([word]) => word);

  return {
    emotion: detectedEmotion,
    keywords: sortedWords.length > 0 ? sortedWords : ['nature', 'experience', 'session'],
    summary: `User appears to be experiencing ${detectedEmotion} feelings based on their journal entry.`,
    confidence: maxMatches > 0 ? 0.6 : 0.4,
  };
}

// Batch analysis for multiple entries
export async function analyzeMultipleEntries(
  entries: Array<{ id: string; text: string }>
): Promise<Map<string, EmotionAnalysisResult>> {
  const results = new Map<string, EmotionAnalysisResult>();
  
  // Process in parallel with concurrency limit
  const batchSize = 3;
  for (let i = 0; i < entries.length; i += batchSize) {
    const batch = entries.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map(async (entry) => ({
        id: entry.id,
        result: await analyzeEmotions(entry.text),
      }))
    );
    
    batchResults.forEach(({ id, result }) => {
      results.set(id, result);
    });
  }

  return results;
}
