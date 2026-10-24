import { Router } from 'express';
import { HospitalController } from '../controllers/hospitalController.js';

const router = Router();

// Retrieve hospitals with filters (search, district, specialty, PM-JAY, emergency)
router.get('/', HospitalController.listHospitals);

// Medical departments / specialties catalogue
router.get('/departments', HospitalController.getDepartments);

// Geolocation proximity search
router.get('/nearby', HospitalController.getNearby);

// Individual hospital details by ID
router.get('/:id', HospitalController.getHospital);

export default router;
