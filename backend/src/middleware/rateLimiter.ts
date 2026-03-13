import rateLimit from 'express-rate-limit';
import { config } from '../config/env';

// General API rate limiter
export const apiLimiter = rateLimit({
  windowMs: config.RATE_LIMIT_WINDOW_MS, // 15 minutes
  max: config.RATE_LIMIT_MAX_REQUESTS, // 100 requests per window
  message: {
    success: false,
    error: 'Too many requests, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Stricter rate limiter for LLM endpoints (expensive operations)
export const llmLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 requests per minute
  message: {
    success: false,
    error: 'Too many analysis requests. Please wait before trying again.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter for journal creation
export const createJournalLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20, // 20 entries per minute
  message: {
    success: false,
    error: 'Too many journal entries. Please slow down.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
