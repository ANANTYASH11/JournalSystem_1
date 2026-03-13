import NodeCache from 'node-cache';
import { config } from '../config/env';
import crypto from 'crypto';

// In-memory cache for analysis results
// In production, use Redis for distributed caching
export const analysisCache = new NodeCache({
  stdTTL: config.CACHE_TTL_SECONDS,
  checkperiod: 120,
  useClones: true,
});

// Generate hash for text (used for cache lookup)
export function generateTextHash(text: string): string {
  const normalizedText = text.toLowerCase().trim().replace(/\s+/g, ' ');
  return crypto.createHash('sha256').update(normalizedText).digest('hex').slice(0, 16);
}

// Cache statistics
export function getCacheStats() {
  return {
    hits: analysisCache.getStats().hits,
    misses: analysisCache.getStats().misses,
    keys: analysisCache.keys().length,
    hitRate: analysisCache.getStats().hits / 
      (analysisCache.getStats().hits + analysisCache.getStats().misses) || 0,
  };
}

// Clear all cache
export function clearCache(): void {
  analysisCache.flushAll();
}

// Cache key generators
export const CacheKeys = {
  analysis: (hash: string) => `analysis:${hash}`,
  userInsights: (userId: string) => `insights:${userId}`,
  userEntries: (userId: string) => `entries:${userId}`,
};
