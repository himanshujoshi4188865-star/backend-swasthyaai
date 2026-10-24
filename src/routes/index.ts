import { Router } from 'express';
import voiceRoutes from './voiceRoutes.js';
import chatRoutes from './chatRoutes.js';
import hospitalRoutes from './hospitalRoutes.js';
import schemeRoutes from './schemeRoutes.js';

const router = Router();

// Health check endpoint
router.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'OK',
    service: 'SwasthyaSathi Public Health Guidance API',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Mount modular sub-routers
router.use('/voice', voiceRoutes);
router.use('/chat', chatRoutes);
router.use('/hospitals', hospitalRoutes);
router.use('/schemes', schemeRoutes);

export default router;
