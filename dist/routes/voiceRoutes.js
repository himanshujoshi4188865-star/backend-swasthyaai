"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const voiceController_js_1 = require("../controllers/voiceController.js");
const router = (0, express_1.Router)();
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});
// Speech-to-Text: accepts audio multipart file OR base64 in body
router.post('/stt', upload.single('audio'), voiceController_js_1.VoiceController.transcribe);
// Text-to-Speech: synthesizes vernacular audio
router.post('/tts', voiceController_js_1.VoiceController.synthesize);
// Status: check Gnani API integration readiness
router.get('/status', voiceController_js_1.VoiceController.status);
exports.default = router;
