import { Router } from 'express';
import { SchemeController } from '../controllers/schemeController.js';

const router = Router();

// List all Indian public health schemes
router.get('/', SchemeController.listSchemes);

// Check user eligibility for health schemes (PM-JAY, ABHA, PMMVY, etc.)
router.post('/check-eligibility', SchemeController.checkEligibility);

// Single scheme details by ID or code
router.get('/:id', SchemeController.getScheme);

export default router;
