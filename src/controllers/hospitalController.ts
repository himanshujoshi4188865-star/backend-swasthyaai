import { Request, Response, NextFunction } from 'express';
import { HospitalService } from '../services/hospitalService.js';

export class HospitalController {
  /**
   * Search and filter public and empanelled hospitals
   * GET /api/hospitals
   */
  public static async listHospitals(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const {
        search,
        state,
        district,
        pincode,
        type,
        specialty,
        isPmjayEmpanelled,
        has24x7Emergency,
        latitude,
        longitude,
        maxDistanceKm
      } = req.query;

      const hospitals = HospitalService.findHospitals({
        search: search as string,
        state: state as string,
        district: district as string,
        pincode: pincode as string,
        type: type as string,
        specialty: specialty as string,
        isPmjayEmpanelled: isPmjayEmpanelled !== undefined ? isPmjayEmpanelled === 'true' : undefined,
        has24x7Emergency: has24x7Emergency !== undefined ? has24x7Emergency === 'true' : undefined,
        latitude: latitude ? parseFloat(latitude as string) : undefined,
        longitude: longitude ? parseFloat(longitude as string) : undefined,
        maxDistanceKm: maxDistanceKm ? parseFloat(maxDistanceKm as string) : undefined
      });

      res.status(200).json({
        success: true,
        count: hospitals.length,
        data: hospitals
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get single hospital by ID
   * GET /api/hospitals/:id
   */
  public static async getHospital(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const hospital = HospitalService.getHospitalById(id);

      if (!hospital) {
        res.status(404).json({
          success: false,
          error: `Hospital with id '${id}' not found`
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: hospital
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get hospitals sorted by GPS distance
   * GET /api/hospitals/nearby
   */
  public static async getNearby(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { lat, lng, radius = '25' } = req.query;

      if (!lat || !lng) {
        res.status(400).json({
          success: false,
          error: 'Missing required query parameters: "lat" and "lng" are required'
        });
        return;
      }

      const hospitals = HospitalService.findHospitals({
        latitude: parseFloat(lat as string),
        longitude: parseFloat(lng as string),
        maxDistanceKm: parseFloat(radius as string)
      });

      res.status(200).json({
        success: true,
        count: hospitals.length,
        radiusKm: parseFloat(radius as string),
        data: hospitals
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get list of all available medical specialties
   * GET /api/hospitals/departments
   */
  public static async getDepartments(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const departments = HospitalService.getAllDepartments();
      res.status(200).json({
        success: true,
        count: departments.length,
        data: departments
      });
    } catch (error) {
      next(error);
    }
  }
}
