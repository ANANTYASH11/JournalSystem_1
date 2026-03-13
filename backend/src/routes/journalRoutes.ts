import { Router } from 'express';
import {
  createEntry,
  getEntries,
  getEntry,
  deleteEntry,
} from '../controllers/journalController';
import { analyzeText, analyzeTextStream } from '../controllers/analysisController';
import { getUserInsights } from '../controllers/insightsController';
import { createJournalLimiter, llmLimiter } from '../middleware/rateLimiter';

const router = Router();

// ============================
// Journal Entry Routes
// ============================

/**
 * @route   POST /api/journal
 * @desc    Create a new journal entry
 * @access  Public
 * @body    { userId: string, ambience: string, text: string }
 */
router.post('/', createJournalLimiter, createEntry);

/**
 * @route   GET /api/journal/:userId
 * @desc    Get all journal entries for a user
 * @access  Public
 * @params  userId - User ID
 * @query   page, limit - Pagination
 */
router.get('/:userId', getEntries);

/**
 * @route   GET /api/journal/entry/:entryId
 * @desc    Get a single journal entry
 * @access  Public
 * @params  entryId - Entry ID
 */
router.get('/entry/:entryId', getEntry);

/**
 * @route   DELETE /api/journal/:userId/:entryId
 * @desc    Delete a journal entry
 * @access  Public
 * @params  userId, entryId
 */
router.delete('/:userId/:entryId', deleteEntry);

// ============================
// Analysis Routes
// ============================

/**
 * @route   POST /api/journal/analyze
 * @desc    Analyze text for emotions using LLM
 * @access  Public
 * @body    { text: string }
 */
router.post('/analyze', llmLimiter, analyzeText);

/**
 * @route   POST /api/journal/analyze/stream
 * @desc    Stream analysis response (SSE)
 * @access  Public
 * @body    { text: string }
 */
router.post('/analyze/stream', llmLimiter, analyzeTextStream);

// ============================
// Insights Routes
// ============================

/**
 * @route   GET /api/journal/insights/:userId
 * @desc    Get user insights and analytics
 * @access  Public
 * @params  userId - User ID
 */
router.get('/insights/:userId', getUserInsights);

export default router;
