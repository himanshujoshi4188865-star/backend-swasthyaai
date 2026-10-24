import { Request, Response, NextFunction } from 'express';
import { SchemeService } from '../services/schemeService.js';
import { EligibilityInput } from '../types/index.js';

export class SchemeController {
  /**
   * List all public healthcare schemes
   * GET /api/schemes
   */
  public static async listSchemes(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schemes = SchemeService.getAllSchemes();
      res.status(200).json({
        success: true,
        count: schemes.length,
        data: schemes
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get scheme by ID or Code
   * GET /api/schemes/:id
   */
  public static async getScheme(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const scheme = SchemeService.getSchemeById(id);

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
    } catch (error) {
      next(error);
    }
  }

  /**
   * Evaluate user's healthcare scheme eligibility
   * POST /api/schemes/check-eligibility
   */
  public static async checkEligibility(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const input: EligibilityInput = {
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

      const result = SchemeService.evaluateEligibility(input);

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }
}
