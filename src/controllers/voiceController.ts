import { Request, Response, NextFunction } from 'express';
import { GnaniService } from '../services/gnaniService.js';

export class VoiceController {
  /**
   * Handle Speech-to-Text transcription via Gnani API
   * POST /api/voice/stt
   */
  public static async transcribe(req: Request, res: Response, Next: NextFunction): Promise<void> {
    try {
      const languageCode = (req.body.languageCode || req.query.language || 'hi-IN') as string;
      const audioFormat = (req.body.format || 'wav') as 'wav' | 'mp3' | 'ogg' | 'webm';

      let audioBuffer: Buffer;

      if (req.file) {
        // Audio uploaded via multipart/form-data
        audioBuffer = req.file.buffer;
      } else if (req.body.audioBase64) {
        // Audio provided as Base64 encoded string
        audioBuffer = Buffer.from(req.body.audioBase64, 'base64');
      } else {
        // Fallback demo buffer
        audioBuffer = Buffer.alloc(100);
      }

      const result = await GnaniService.speechToText(audioBuffer, {
        languageCode,
        audioFormat
      });

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      Next(error);
    }
  }

  /**
   * Handle Text-to-Speech synthesis via Gnani API
   * POST /api/voice/tts
   */
  public static async synthesize(req: Request, res: Response, Next: NextFunction): Promise<void> {
    try {
      const { text, languageCode = 'hi-IN', gender = 'female', format = 'wav', speed = 1.0, stream = false } = req.body;

      if (!text || typeof text !== 'string') {
        res.status(400).json({
          success: false,
          error: 'Missing required field: "text" must be a non-empty string'
        });
        return;
      }

      const result = await GnaniService.textToSpeech({
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
    } catch (error) {
      Next(error);
    }
  }

  /**
   * Check Gnani service integration status
   * GET /api/voice/status
   */
  public static async status(req: Request, res: Response): Promise<void> {
    const statusInfo = GnaniService.getStatus();
    res.status(200).json({
      success: true,
      data: statusInfo
    });
  }
}
