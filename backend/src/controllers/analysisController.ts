import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { AnalyzeTextSchema, ApiResponse, EmotionAnalysisResult } from '../types/schemas';
import { analyzeEmotions, analyzeEmotionsStream } from '../services/llmService';

// POST /api/journal/analyze - Analyze text for emotions
export const analyzeText = asyncHandler(async (req: Request, res: Response) => {
  const validated = AnalyzeTextSchema.parse(req.body);
  const result = await analyzeEmotions(validated.text);

  const response: ApiResponse<EmotionAnalysisResult> = {
    success: true,
    data: result,
    message: result.cached ? 'Analysis retrieved from cache' : 'Analysis completed',
  };

  res.json(response);
});

// POST /api/journal/analyze/stream - Stream analysis response (bonus feature)
export const analyzeTextStream = asyncHandler(async (req: Request, res: Response) => {
  const validated = AnalyzeTextSchema.parse(req.body);

  // Set up SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');

  try {
    let fullResponse = '';
    
    for await (const chunk of analyzeEmotionsStream(validated.text)) {
      fullResponse += chunk;
      res.write(`data: ${JSON.stringify({ chunk })}\n\n`);
    }

    // Send completion event
    res.write(`data: ${JSON.stringify({ done: true, fullResponse })}\n\n`);
    res.end();
  } catch (error) {
    res.write(`data: ${JSON.stringify({ error: 'Analysis failed' })}\n\n`);
    res.end();
  }
});
