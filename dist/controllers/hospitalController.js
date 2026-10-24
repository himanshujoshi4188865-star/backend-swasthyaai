"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HospitalController = void 0;
const hospitalService_js_1 = require("../services/hospitalService.js");
class HospitalController {
    /**
     * Search and filter public and empanelled hospitals
     * GET /api/hospitals
     */
    static async listHospitals(req, res, next) {
        try {
            const { search, state, district, pincode, type, specialty, isPmjayEmpanelled, has24x7Emergency, latitude, longitude, maxDistanceKm } = req.query;
            const hospitals = hospitalService_js_1.HospitalService.findHospitals({
                search: search,
                state: state,
                district: district,
                pincode: pincode,
                type: type,
                specialty: specialty,
                isPmjayEmpanelled: isPmjayEmpanelled !== undefined ? isPmjayEmpanelled === 'true' : undefined,
                has24x7Emergency: has24x7Emergency !== undefined ? has24x7Emergency === 'true' : undefined,
                latitude: latitude ? parseFloat(latitude) : undefined,
                longitude: longitude ? parseFloat(longitude) : undefined,
                maxDistanceKm: maxDistanceKm ? parseFloat(maxDistanceKm) : undefined
            });
            res.status(200).json({
                success: true,
                count: hospitals.length,
                data: hospitals
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Get single hospital by ID
     * GET /api/hospitals/:id
     */
    static async getHospital(req, res, next) {
        try {
            const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
            const hospital = hospitalService_js_1.HospitalService.getHospitalById(id);
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
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Get hospitals sorted by GPS distance
     * GET /api/hospitals/nearby
     */
    static async getNearby(req, res, next) {
        try {
            const { lat, lng, radius = '25' } = req.query;
            if (!lat || !lng) {
                res.status(400).json({
                    success: false,
                    error: 'Missing required query parameters: "lat" and "lng" are required'
                });
                return;
            }
            const hospitals = hospitalService_js_1.HospitalService.findHospitals({
                latitude: parseFloat(lat),
                longitude: parseFloat(lng),
                maxDistanceKm: parseFloat(radius)
            });
            res.status(200).json({
                success: true,
                count: hospitals.length,
                radiusKm: parseFloat(radius),
                data: hospitals
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Get list of all available medical specialties
     * GET /api/hospitals/departments
     */
    static async getDepartments(_req, res, next) {
        try {
            const departments = hospitalService_js_1.HospitalService.getAllDepartments();
            res.status(200).json({
                success: true,
                count: departments.length,
                data: departments
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.HospitalController = HospitalController;
