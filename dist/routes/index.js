"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const voiceRoutes_js_1 = __importDefault(require("./voiceRoutes.js"));
const chatRoutes_js_1 = __importDefault(require("./chatRoutes.js"));
const hospitalRoutes_js_1 = __importDefault(require("./hospitalRoutes.js"));
const schemeRoutes_js_1 = __importDefault(require("./schemeRoutes.js"));
const router = (0, express_1.Router)();
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
router.use('/voice', voiceRoutes_js_1.default);
router.use('/chat', chatRoutes_js_1.default);
router.use('/hospitals', hospitalRoutes_js_1.default);
router.use('/schemes', schemeRoutes_js_1.default);
exports.default = router;
