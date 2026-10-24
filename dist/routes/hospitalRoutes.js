"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const hospitalController_js_1 = require("../controllers/hospitalController.js");
const router = (0, express_1.Router)();
// Retrieve hospitals with filters (search, district, specialty, PM-JAY, emergency)
router.get('/', hospitalController_js_1.HospitalController.listHospitals);
// Medical departments / specialties catalogue
router.get('/departments', hospitalController_js_1.HospitalController.getDepartments);
// Geolocation proximity search
router.get('/nearby', hospitalController_js_1.HospitalController.getNearby);
// Individual hospital details by ID
router.get('/:id', hospitalController_js_1.HospitalController.getHospital);
exports.default = router;
