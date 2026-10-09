// CareFlow AI - Gemini Discharge Intelligence Service
import { fetchJson } from '../api/client';
import type { DischargeAnalysisResult } from '../../types';

// In-flight request lock & session cache to prevent duplicate Gemini calls
const analysisCache = new Map<string, DischargeAnalysisResult>();
let activeAnalysisPromise: Promise<DischargeAnalysisResult> | null = null;
let activeDocumentText: string = '';

export const geminiService = {
  /**
   * Analyze synthetic discharge summary with Google Gemini API via secure backend.
   * Includes in-flight deduplication, session caching, and timeout guards.
   */
  analyzeDischarge: async (documentText: string, forceFresh = false): Promise<DischargeAnalysisResult> => {
    const text = (documentText || '').trim();
    if (!text) {
      throw new Error('Please enter or select a synthetic discharge summary.');
    }

    // Check session cache if not forcing fresh request
    const cacheKey = text.length > 200 ? text.slice(0, 200) + '_' + text.length : text;
    if (!forceFresh && analysisCache.has(cacheKey)) {
      return analysisCache.get(cacheKey)!;
    }

    // Return in-flight promise if duplicate request is triggered while analyzing
    if (activeAnalysisPromise && activeDocumentText === text) {
      return activeAnalysisPromise;
    }

    // Set active lock
    activeDocumentText = text;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 35000);

    activeAnalysisPromise = (async () => {
      try {
        const result = await fetchJson<DischargeAnalysisResult>('/api/ai/analyze-discharge', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ documentText: text }),
          signal: controller.signal
        });

        // Store in session cache
        analysisCache.set(cacheKey, result);
        return result;
      } catch (err: any) {
        if (err.name === 'AbortError') {
          throw new Error('Gemini AI analysis timed out. Please try again.');
        }
        throw new Error(err.message || 'Unable to connect to CareFlow AI backend.');
      } finally {
        clearTimeout(timeoutId);
        activeAnalysisPromise = null;
        activeDocumentText = '';
      }
    })();

    return activeAnalysisPromise;
  },

  /**
   * Check Gemini AI service health & safety status.
   */
  getAiStatus: async () => {
    try {
      return await fetchJson<any>('/api/ai/status');
    } catch {
      return {
        status: 'offline',
        service: 'CareFlow AI Discharge Intelligence',
        provider: 'Google Gemini API',
        configured: false,
        safetyBoundaries: 'Active',
        disclaimer: 'Synthetic healthcare data — demonstration only.'
      };
    }
  },

  /**
   * Clear session cache if needed.
   */
  clearCache: () => {
    analysisCache.clear();
  }
};
