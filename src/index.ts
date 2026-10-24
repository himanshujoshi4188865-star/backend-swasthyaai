import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from './config/env.js';
import apiRoutes from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

// CORS middleware
app.use(cors({
  origin: config.corsOrigin === '*' ? true : config.corsOrigin.split(','),
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key'],
  credentials: true
}));

// Request parsing
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Logging
if (config.nodeEnv !== 'test') {
  app.use(morgan('dev'));
}

// Root landing route
app.get('/', (_req, res) => {
  res.status(200).json({
    service: 'SwasthyaSathi Healthcare Backend API',
    version: '1.0.0',
    description: 'Multilingual Public Health Guidance, Gnani Voice AI, Safety Guardrails & Scheme Checker',
    docs: {
      health: '/api/health',
      chatQuery: 'POST /api/chat/query',
      safetyCheck: 'POST /api/chat/safety-check',
      voiceSTT: 'POST /api/voice/stt',
      voiceTTS: 'POST /api/voice/tts',
      voiceStatus: 'GET /api/voice/status',
      hospitals: 'GET /api/hospitals',
      schemes: 'GET /api/schemes',
      schemeEligibility: 'POST /api/schemes/check-eligibility'
    }
  });
});

// API Routes
app.use('/api', apiRoutes);

// Centralized error handler
app.use(errorHandler);

// Start server only when run directly
let server: any;
if (process.env.NODE_ENV !== 'test') {
  server = app.listen(config.port, () => {
    console.log(`====================================================`);
    console.log(`🚀 SwasthyaSathi Backend running on port ${config.port}`);
    console.log(`🌐 Base URL: http://localhost:${config.port}`);
    console.log(`🩺 Health check: http://localhost:${config.port}/api/health`);
    console.log(`🎙️  Gnani AI Mode: ${config.gnani.apiKey ? 'LIVE' : 'RESILIENT FALLBACK'}`);
    console.log(`====================================================`);
  });
}

// Graceful shutdown handling
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});

export default app;
