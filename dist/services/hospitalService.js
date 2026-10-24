"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HospitalService = void 0;
class HospitalService {
    // Curated database of verified public health facilities & PM-JAY empanelled hospitals
    static HOSPITALS = [
        {
            id: 'hosp-001',
            name: 'All India Institute of Medical Sciences (AIIMS)',
            type: 'MedicalCollege',
            state: 'Delhi',
            district: 'New Delhi',
            city: 'New Delhi',
            address: 'Sri Aurobindo Marg, Ansari Nagar, New Delhi',
            pincode: '110029',
            latitude: 28.5672,
            longitude: 77.2100,
            contactNumber: '011-26588500',
            emergencyHelpline: '102 / 011-26594405',
            isPmjayEmpanelled: true,
            has24x7Emergency: true,
            hasBloodBank: true,
            hasICU: true,
            totalBeds: 2478,
            availableBeds: 182,
            departments: [
                { name: 'General Medicine', opdTimings: '8:30 AM - 1:00 PM', isAvailableToday: true },
                { name: 'Cardiology', opdTimings: '9:00 AM - 2:00 PM', isAvailableToday: true },
                { name: 'Emergency & Trauma Care', opdTimings: '24 Hours', isAvailableToday: true },
                { name: 'Pediatrics', opdTimings: '9:00 AM - 1:00 PM', isAvailableToday: true },
                { name: 'Obstetrics & Gynecology', opdTimings: '9:00 AM - 1:00 PM', isAvailableToday: true },
                { name: 'Orthopedics', opdTimings: '9:00 AM - 1:00 PM', isAvailableToday: true },
                { name: 'Pulmonology', opdTimings: '9:00 AM - 1:00 PM', isAvailableToday: true }
            ]
        },
        {
            id: 'hosp-002',
            name: 'District Hospital Aundh (Civil Hospital)',
            type: 'DistrictHospital',
            state: 'Maharashtra',
            district: 'Pune',
            city: 'Pune',
            address: 'Chest Hospital Compound, Aundh, Pune',
            pincode: '411027',
            latitude: 18.5714,
            longitude: 73.8052,
            contactNumber: '020-25881452',
            emergencyHelpline: '108 / 020-25880400',
            isPmjayEmpanelled: true,
            has24x7Emergency: true,
            hasBloodBank: true,
            hasICU: true,
            totalBeds: 450,
            availableBeds: 48,
            departments: [
                { name: 'General Medicine', opdTimings: '9:00 AM - 2:00 PM', isAvailableToday: true },
                { name: 'Pediatrics', opdTimings: '9:00 AM - 1:00 PM', isAvailableToday: true },
                { name: 'Obstetrics & Gynecology', opdTimings: '24 Hours', isAvailableToday: true },
                { name: 'General Surgery', opdTimings: '9:00 AM - 1:00 PM', isAvailableToday: true },
                { name: 'Orthopedics', opdTimings: '9:00 AM - 1:00 PM', isAvailableToday: true },
                { name: 'Ophthalmology', opdTimings: '9:00 AM - 1:00 PM', isAvailableToday: true }
            ]
        },
        {
            id: 'hosp-003',
            name: 'Community Health Centre (CHC) Paud',
            type: 'CHC',
            state: 'Maharashtra',
            district: 'Pune',
            city: 'Paud',
            address: 'Main Road, Mulshi Taluka, Paud, Pune',
            pincode: '412108',
            latitude: 18.5321,
            longitude: 73.6128,
            contactNumber: '02139-223120',
            emergencyHelpline: '108',
            isPmjayEmpanelled: true,
            has24x7Emergency: true,
            hasBloodBank: false,
            hasICU: false,
            totalBeds: 30,
            availableBeds: 9,
            departments: [
                { name: 'General Medicine', opdTimings: '9:00 AM - 4:00 PM', isAvailableToday: true },
                { name: 'Maternal & Child Health', opdTimings: '24 Hours', isAvailableToday: true },
                { name: 'First Aid & Stabilization', opdTimings: '24 Hours', isAvailableToday: true }
            ]
        },
        {
            id: 'hosp-004',
            name: 'Primary Health Centre (PHC) Pirangut',
            type: 'PHC',
            state: 'Maharashtra',
            district: 'Pune',
            city: 'Pirangut',
            address: 'Near Gram Panchayat Office, Pirangut',
            pincode: '412115',
            latitude: 18.5117,
            longitude: 73.6789,
            contactNumber: '02139-222410',
            emergencyHelpline: '108 / 102',
            isPmjayEmpanelled: true,
            has24x7Emergency: false,
            hasBloodBank: false,
            hasICU: false,
            totalBeds: 10,
            availableBeds: 4,
            departments: [
                { name: 'General Outpatient Clinic', opdTimings: '9:00 AM - 1:00 PM, 3:00 PM - 5:00 PM', isAvailableToday: true },
                { name: 'Immunization & Vaccination', opdTimings: 'Wednesdays 9:00 AM - 2:00 PM', isAvailableToday: true },
                { name: 'Antenatal Care (ANC)', opdTimings: 'Daily 9:00 AM - 1:00 PM', isAvailableToday: true }
            ]
        },
        {
            id: 'hosp-005',
            name: 'Sassoon General Hospital & BJ Medical College',
            type: 'MedicalCollege',
            state: 'Maharashtra',
            district: 'Pune',
            city: 'Pune',
            address: 'Near Pune Railway Station, Sangamvadi, Pune',
            pincode: '411001',
            latitude: 18.5284,
            longitude: 73.8742,
            contactNumber: '020-26128000',
            emergencyHelpline: '108 / 020-26127160',
            isPmjayEmpanelled: true,
            has24x7Emergency: true,
            hasBloodBank: true,
            hasICU: true,
            totalBeds: 1296,
            availableBeds: 114,
            departments: [
                { name: 'General Medicine', opdTimings: '8:30 AM - 1:30 PM', isAvailableToday: true },
                { name: 'Cardiology', opdTimings: '9:00 AM - 1:00 PM', isAvailableToday: true },
                { name: 'Neurology', opdTimings: '9:00 AM - 1:00 PM', isAvailableToday: true },
                { name: 'Trauma & Emergency', opdTimings: '24 Hours', isAvailableToday: true },
                { name: 'Pediatrics', opdTimings: '9:00 AM - 1:30 PM', isAvailableToday: true },
                { name: 'Dialysis Unit', opdTimings: '24 Hours', isAvailableToday: true }
            ]
        },
        {
            id: 'hosp-006',
            name: 'King Edward Memorial (KEM) Hospital',
            type: 'MedicalCollege',
            state: 'Maharashtra',
            district: 'Mumbai',
            city: 'Mumbai',
            address: 'Acharya Donde Marg, Parel, Mumbai',
            pincode: '400012',
            latitude: 19.0026,
            longitude: 72.8427,
            contactNumber: '022-24107000',
            emergencyHelpline: '108 / 022-24136051',
            isPmjayEmpanelled: true,
            has24x7Emergency: true,
            hasBloodBank: true,
            hasICU: true,
            totalBeds: 1800,
            availableBeds: 92,
            departments: [
                { name: 'General Medicine', opdTimings: '8:00 AM - 12:30 PM', isAvailableToday: true },
                { name: 'Cardiology', opdTimings: '9:00 AM - 1:00 PM', isAvailableToday: true },
                { name: 'Emergency Casualty', opdTimings: '24 Hours', isAvailableToday: true },
                { name: 'Gastroenterology', opdTimings: '9:00 AM - 1:00 PM', isAvailableToday: true },
                { name: 'Orthopedics', opdTimings: '8:30 AM - 1:00 PM', isAvailableToday: true }
            ]
        },
        {
            id: 'hosp-007',
            name: 'Dr. Ram Manohar Lohia Hospital',
            type: 'DistrictHospital',
            state: 'Delhi',
            district: 'Central Delhi',
            city: 'New Delhi',
            address: 'Baba Kharak Singh Marg, Connaught Place, New Delhi',
            pincode: '110001',
            latitude: 28.6253,
            longitude: 77.2025,
            contactNumber: '011-23365525',
            emergencyHelpline: '102 / 011-23404286',
            isPmjayEmpanelled: true,
            has24x7Emergency: true,
            hasBloodBank: true,
            hasICU: true,
            totalBeds: 1532,
            availableBeds: 120,
            departments: [
                { name: 'General Medicine', opdTimings: '8:30 AM - 1:00 PM', isAvailableToday: true },
                { name: 'Emergency Care', opdTimings: '24 Hours', isAvailableToday: true },
                { name: 'Cardiology', opdTimings: '9:00 AM - 1:00 PM', isAvailableToday: true },
                { name: 'ENT', opdTimings: '9:00 AM - 1:00 PM', isAvailableToday: true },
                { name: 'Dermatology', opdTimings: '9:00 AM - 1:00 PM', isAvailableToday: true }
            ]
        },
        {
            id: 'hosp-008',
            name: 'Sanjeevani PM-JAY Empanelled Multi-Specialty Centre',
            type: 'EmpanelledHospital',
            state: 'Maharashtra',
            district: 'Pune',
            city: 'Pune',
            address: 'Near Swargate Chowk, Pune',
            pincode: '411042',
            latitude: 18.5018,
            longitude: 73.8586,
            contactNumber: '020-24449876',
            emergencyHelpline: '108 / 020-24449900',
            isPmjayEmpanelled: true,
            has24x7Emergency: true,
            hasBloodBank: true,
            hasICU: true,
            totalBeds: 120,
            availableBeds: 24,
            departments: [
                { name: 'Cardiology (Cashless PM-JAY)', opdTimings: '9:00 AM - 5:00 PM', isAvailableToday: true },
                { name: 'Joint Replacement & Ortho', opdTimings: '9:00 AM - 4:00 PM', isAvailableToday: true },
                { name: 'General Surgery', opdTimings: '9:00 AM - 5:00 PM', isAvailableToday: true }
            ]
        }
    ];
    /**
     * Search and filter hospitals based on query parameters
     */
    static findHospitals(options = {}) {
        let results = [...this.HOSPITALS];
        if (options.state) {
            const stateQuery = options.state.toLowerCase();
            results = results.filter(h => h.state.toLowerCase().includes(stateQuery));
        }
        if (options.district) {
            const distQuery = options.district.toLowerCase();
            results = results.filter(h => h.district.toLowerCase().includes(distQuery) || h.city.toLowerCase().includes(distQuery));
        }
        if (options.pincode) {
            results = results.filter(h => h.pincode.startsWith(options.pincode.slice(0, 3)));
        }
        if (options.type) {
            const typeQuery = options.type.toLowerCase();
            results = results.filter(h => h.type.toLowerCase() === typeQuery);
        }
        if (options.isPmjayEmpanelled !== undefined) {
            results = results.filter(h => h.isPmjayEmpanelled === options.isPmjayEmpanelled);
        }
        if (options.has24x7Emergency !== undefined) {
            results = results.filter(h => h.has24x7Emergency === options.has24x7Emergency);
        }
        if (options.specialty) {
            const specQuery = options.specialty.toLowerCase();
            results = results.filter(h => h.departments.some(d => d.name.toLowerCase().includes(specQuery)));
        }
        if (options.search) {
            const q = options.search.toLowerCase();
            results = results.filter(h => h.name.toLowerCase().includes(q) ||
                h.city.toLowerCase().includes(q) ||
                h.district.toLowerCase().includes(q) ||
                h.address.toLowerCase().includes(q) ||
                h.departments.some(d => d.name.toLowerCase().includes(q)));
        }
        // If user provided latitude & longitude, calculate distance using Haversine formula
        if (options.latitude !== undefined && options.longitude !== undefined) {
            const userLat = options.latitude;
            const userLng = options.longitude;
            results = results.map(h => {
                const distanceKm = this.calculateDistanceKm(userLat, userLng, h.latitude, h.longitude);
                return { ...h, distanceKm: Math.round(distanceKm * 10) / 10 };
            });
            // Filter by max distance if requested
            if (options.maxDistanceKm) {
                results = results.filter(h => (h.distanceKm || 0) <= options.maxDistanceKm);
            }
            // Sort by closest distance
            results.sort((a, b) => (a.distanceKm || 0) - (b.distanceKm || 0));
        }
        return results;
    }
    /**
     * Get single hospital by ID
     */
    static getHospitalById(id) {
        return this.HOSPITALS.find(h => h.id === id);
    }
    /**
     * Get all unique medical departments / specialties
     */
    static getAllDepartments() {
        const departmentSet = new Set();
        for (const hosp of this.HOSPITALS) {
            for (const dept of hosp.departments) {
                departmentSet.add(dept.name);
            }
        }
        return Array.from(departmentSet).sort();
    }
    /**
     * Haversine formula to compute distance between two GPS coordinates in Kilometers
     */
    static calculateDistanceKm(lat1, lon1, lat2, lon2) {
        const R = 6371; // Earth's radius in km
        const dLat = this.deg2rad(lat2 - lat1);
        const dLon = this.deg2rad(lon2 - lon1);
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }
    static deg2rad(deg) {
        return deg * (Math.PI / 180);
    }
}
exports.HospitalService = HospitalService;
