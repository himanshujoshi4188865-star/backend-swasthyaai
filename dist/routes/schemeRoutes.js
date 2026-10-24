"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const schemeController_js_1 = require("../controllers/schemeController.js");
const router = (0, express_1.Router)();
// List all Indian public health schemes
router.get('/', schemeController_js_1.SchemeController.listSchemes);
// Check user eligibility for health schemes (PM-JAY, ABHA, PMMVY, etc.)
router.post('/check-eligibility', schemeController_js_1.SchemeController.checkEligibility);
// Single scheme details by ID or code
router.get('/:id', schemeController_js_1.SchemeController.getScheme);
exports.default = router;
