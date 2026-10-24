"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const env_js_1 = require("./config/env.js");
const index_js_1 = __importDefault(require("./routes/index.js"));
const errorHandler_js_1 = require("./middleware/errorHandler.js");
const app = (0, express_1.default)();
// Security middleware
app.use((0, helmet_1.default)({
    crossOriginResourcePolicy: { policy: 'cross-origin' }
}));
// CORS middleware
app.use((0, cors_1.default)({
    origin: env_js_1.config.corsOrigin === '*' ? true : env_js_1.config.corsOrigin.split(','),
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key'],
    credentials: true
}));
// Request parsing
app.use(express_1.default.json({ limit: '15mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '15mb' }));
// Logging
if (env_js_1.config.nodeEnv !== 'test') {
    app.use((0, morgan_1.default)('dev'));
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
app.use('/api', index_js_1.default);
// Centralized error handler
app.use(errorHandler_js_1.errorHandler);
// Start server only when run directly
let server;
if (process.env.NODE_ENV !== 'test') {
    server = app.listen(env_js_1.config.port, () => {
        console.log(`====================================================`);
        console.log(`🚀 SwasthyaSathi Backend running on port ${env_js_1.config.port}`);
        console.log(`🌐 Base URL: http://localhost:${env_js_1.config.port}`);
        console.log(`🩺 Health check: http://localhost:${env_js_1.config.port}/api/health`);
        console.log(`🎙️  Gnani AI Mode: ${env_js_1.config.gnani.apiKey ? 'LIVE' : 'RESILIENT FALLBACK'}`);
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
exports.default = app;
