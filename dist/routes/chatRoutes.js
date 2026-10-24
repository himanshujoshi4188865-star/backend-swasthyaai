"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const chatController_js_1 = require("../controllers/chatController.js");
const router = (0, express_1.Router)();
// Process conversational question with safety guardrails & recommendations
router.post('/query', chatController_js_1.ChatController.handleQuery);
// Run standalone safety, PII scrubbing, and red-flag triage
router.post('/safety-check', chatController_js_1.ChatController.checkSafety);
exports.default = router;
