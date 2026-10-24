"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SchemeController = void 0;
const schemeService_js_1 = require("../services/schemeService.js");
class SchemeController {
    /**
     * List all public healthcare schemes
     * GET /api/schemes
     */
    static async listSchemes(_req, res, next) {
        try {
            const schemes = schemeService_js_1.SchemeService.getAllSchemes();
            res.status(200).json({
                success: true,
                count: schemes.length,
                data: schemes
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Get scheme by ID or Code
     * GET /api/schemes/:id
     */
    static async getScheme(req, res, next) {
        try {
            const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
            const scheme = schemeService_js_1.SchemeService.getSchemeById(id);
            if (!scheme) {
                res.status(404).json({
                    success: false,
                    error: `Healthcare scheme with identifier '${id}' not found`
                });
                return;
            }
            res.status(200).json({
                success: true,
                data: scheme
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Evaluate user's healthcare scheme eligibility
     * POST /api/schemes/check-eligibility
     */
    static async checkEligibility(req, res, next) {
        try {
            const input = {
                age: req.body.age !== undefined ? parseInt(req.body.age, 10) : undefined,
                annualIncome: req.body.annualIncome !== undefined ? parseFloat(req.body.annualIncome) : undefined,
                rationCardType: req.body.rationCardType,
                isBPL: Boolean(req.body.isBPL),
                state: req.body.state,
                gender: req.body.gender,
                isPregnantOrLactating: Boolean(req.body.isPregnantOrLactating),
                hasChronicCondition: Boolean(req.body.hasChronicCondition),
                occupation: req.body.occupation
            };
            const result = schemeService_js_1.SchemeService.evaluateEligibility(input);
            res.status(200).json({
                success: true,
                data: result
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.SchemeController = SchemeController;
