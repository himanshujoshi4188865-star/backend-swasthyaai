"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatController = void 0;
const questionService_js_1 = require("../services/questionService.js");
const safetyService_js_1 = require("../services/safetyService.js");
class ChatController {
    /**
     * Process patient questions with full guardrails, specialty mapping & voice
     * POST /api/chat/query
     */
    static async handleQuery(req, res, next) {
        try {
            const { query, language = 'en', userLocation, synthesizeVoice = false } = req.body;
            if (!query || typeof query !== 'string' || query.trim().length === 0) {
                res.status(400).json({
                    success: false,
                    error: 'Missing required field: "query" must be a non-empty string'
                });
                return;
            }
            const validLanguages = ['en', 'hi', 'mr', 'ta', 'te', 'kn', 'bn', 'gu'];
            const validatedLanguage = validLanguages.includes(language) ? language : 'en';
            const response = await questionService_js_1.QuestionService.processQuestion({
                query: query.trim(),
                language: validatedLanguage,
                userLocation,
                synthesizeVoice: Boolean(synthesizeVoice)
            });
            res.status(200).json({
                success: true,
                data: response
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Dedicated endpoint for safety evaluation, PII scrubbing and red-flag checking
     * POST /api/chat/safety-check
     */
    static async checkSafety(req, res, next) {
        try {
            const { text, language = 'en' } = req.body;
            if (!text || typeof text !== 'string') {
                res.status(400).json({
                    success: false,
                    error: 'Missing required field: "text" must be a non-empty string'
                });
                return;
            }
            const result = safetyService_js_1.SafetyService.evaluateQuerySafety(text, language);
            res.status(200).json({
                success: true,
                data: result
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.ChatController = ChatController;
