import { Request, Response, NextFunction } from 'express';
import { QuestionService } from '../services/questionService.js';
import { SafetyService } from '../services/safetyService.js';
import { SupportedLanguage } from '../types/index.js';

export class ChatController {
  /**
   * Process patient questions with full guardrails, specialty mapping & voice
   * POST /api/chat/query
   */
  public static async handleQuery(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { query, language = 'en', userLocation, synthesizeVoice = false } = req.body;

      if (!query || typeof query !== 'string' || query.trim().length === 0) {
        res.status(400).json({
          success: false,
          error: 'Missing required field: "query" must be a non-empty string'
        });
        return;
      }

      const validLanguages: SupportedLanguage[] = ['en', 'hi', 'mr', 'ta', 'te', 'kn', 'bn', 'gu'];
      const validatedLanguage = validLanguages.includes(language) ? language : 'en';

      const response = await QuestionService.processQuestion({
        query: query.trim(),
        language: validatedLanguage,
        userLocation,
        synthesizeVoice: Boolean(synthesizeVoice)
      });

      res.status(200).json({
        success: true,
        data: response
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Dedicated endpoint for safety evaluation, PII scrubbing and red-flag checking
   * POST /api/chat/safety-check
   */
  public static async checkSafety(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { text, language = 'en' } = req.body;

      if (!text || typeof text !== 'string') {
        res.status(400).json({
          success: false,
          error: 'Missing required field: "text" must be a non-empty string'
        });
        return;
      }

      const result = SafetyService.evaluateQuerySafety(text, language);

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }
}
