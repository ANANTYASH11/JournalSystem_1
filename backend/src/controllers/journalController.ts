import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { 
  CreateJournalEntrySchema, 
  PaginationSchema,
  ApiResponse 
} from '../types/schemas';
import {
  createJournalEntry,
  getJournalEntries,
  getJournalEntry,
  deleteJournalEntry,
} from '../services/journalService';

// POST /api/journal - Create a new journal entry
export const createEntry = asyncHandler(async (req: Request, res: Response) => {
  const validated = CreateJournalEntrySchema.parse(req.body);
  const entry = await createJournalEntry(validated);

  const response: ApiResponse<typeof entry> = {
    success: true,
    data: entry,
    message: 'Journal entry created successfully',
  };

  res.status(201).json(response);
});

// GET /api/journal/:userId - Get all entries for a user
export const getEntries = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.params;
  const pagination = PaginationSchema.parse(req.query);
  
  const result = await getJournalEntries(userId, pagination);

  const response: ApiResponse<typeof result.entries> = {
    success: true,
    data: result.entries,
    metadata: result.pagination,
  };

  res.json(response);
});

// GET /api/journal/entry/:entryId - Get a single entry
export const getEntry = asyncHandler(async (req: Request, res: Response) => {
  const { entryId } = req.params;
  const entry = await getJournalEntry(entryId);

  const response: ApiResponse<typeof entry> = {
    success: true,
    data: entry,
  };

  res.json(response);
});

// DELETE /api/journal/:userId/:entryId - Delete an entry
export const deleteEntry = asyncHandler(async (req: Request, res: Response) => {
  const { userId, entryId } = req.params;
  await deleteJournalEntry(entryId, userId);

  const response: ApiResponse<null> = {
    success: true,
    message: 'Journal entry deleted successfully',
  };

  res.json(response);
});
