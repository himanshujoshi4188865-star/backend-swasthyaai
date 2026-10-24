"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VoiceController = void 0;
const gnaniService_js_1 = require("../services/gnaniService.js");
class VoiceController {
    /**
     * Handle Speech-to-Text transcription via Gnani API
     * POST /api/voice/stt
     */
    static async transcribe(req, res, Next) {
        try {
            const languageCode = (req.body.languageCode || req.query.language || 'hi-IN');
            const audioFormat = (req.body.format || 'wav');
            let audioBuffer;
            if (req.file) {
                // Audio uploaded via multipart/form-data
                audioBuffer = req.file.buffer;
            }
            else if (req.body.audioBase64) {
                // Audio provided as Base64 encoded string
                audioBuffer = Buffer.from(req.body.audioBase64, 'base64');
            }
            else {
                // Fallback demo buffer
                audioBuffer = Buffer.alloc(100);
            }
            const result = await gnaniService_js_1.GnaniService.speechToText(audioBuffer, {
                languageCode,
                audioFormat
            });
            res.status(200).json({
                success: true,
                data: result
            });
        }
        catch (error) {
            Next(error);
        }
    }
    /**
     * Handle Text-to-Speech synthesis via Gnani API
     * POST /api/voice/tts
     */
    static async synthesize(req, res, Next) {
        try {
            const { text, languageCode = 'hi-IN', gender = 'female', format = 'wav', speed = 1.0, stream = false } = req.body;
            if (!text || typeof text !== 'string') {
                res.status(400).json({
                    success: false,
                    error: 'Missing required field: "text" must be a non-empty string'
                });
                return;
            }
            const result = await gnaniService_js_1.GnaniService.textToSpeech({
                text,
                languageCode,
                gender,
                audioFormat: format,
                speed
            });
            // If client requests raw audio binary stream
            if (stream === true || stream === 'true') {
                const audioBuffer = Buffer.from(result.audioBase64, 'base64');
                res.setHeader('Content-Type', result.mimeType);
                res.setHeader('Content-Length', audioBuffer.length);
                res.send(audioBuffer);
                return;
            }
            res.status(200).json({
                success: true,
                data: result
            });
        }
        catch (error) {
            Next(error);
        }
    }
    /**
     * Check Gnani service integration status
     * GET /api/voice/status
     */
    static async status(req, res) {
        const statusInfo = gnaniService_js_1.GnaniService.getStatus();
        res.status(200).json({
            success: true,
            data: statusInfo
        });
    }
}
exports.VoiceController = VoiceController;
