import { Router } from 'express';
import multer from 'multer';
import { VoiceController } from '../controllers/voiceController.js';

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Speech-to-Text: accepts audio multipart file OR base64 in body
router.post('/stt', upload.single('audio'), VoiceController.transcribe);

// Text-to-Speech: synthesizes vernacular audio
router.post('/tts', VoiceController.synthesize);

// Status: check Gnani API integration readiness
router.get('/status', VoiceController.status);

export default router;
