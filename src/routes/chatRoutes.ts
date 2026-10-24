import { Router } from 'express';
import { ChatController } from '../controllers/chatController.js';

const router = Router();

// Process conversational question with safety guardrails & recommendations
router.post('/query', ChatController.handleQuery);

// Run standalone safety, PII scrubbing, and red-flag triage
router.post('/safety-check', ChatController.checkSafety);

export default router;
