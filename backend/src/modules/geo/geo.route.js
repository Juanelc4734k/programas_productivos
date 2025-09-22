import express from 'express';
import {
    createGeoEntry,
    getAllGeoEntries,
    getGeoEntryById,
    updateGeoEntry,
    deleteGeoEntry,
    getPointsOfInterestNear
} from './geo.controller.js';
import { protect, authorize } from '../../middlewares/auth.middleware.js'; // Assuming auth middleware

const router = express.Router();

// --- GeoData CRUD Routes ---

// POST /api/geo - Create a new geographic entry (e.g., Funcionario, Admin)
router.post('/', protect, authorize(['funcionario', 'admin']), createGeoEntry);

// GET /api/geo - Get all geographic entries (Public or Authenticated Users, depending on app needs)
// Add 'protect' if general access needs to be restricted.
router.get('/', getAllGeoEntries);

// GET /api/geo/near - Get points of interest near a specific location (Example custom route)
// This route demonstrates a specific geospatial query.
// Query params: longitude, latitude, radius (in meters)
// e.g., /api/geo/near?longitude=-74.0060&latitude=40.7128&radius=5000
router.get('/near', getPointsOfInterestNear);

// GET /api/geo/:geoId - Get a single geographic entry by ID
router.get('/:geoId', getGeoEntryById);

// PUT /api/geo/:geoId - Update a geographic entry by ID (e.g., Funcionario, Admin)
router.put('/:geoId', protect, authorize(['funcionario', 'admin']), updateGeoEntry);

// DELETE /api/geo/:geoId - Delete a geographic entry by ID (e.g., Funcionario, Admin)
// Optional query param: ?physical=true for physical deletion
router.delete('/:geoId', protect, authorize(['funcionario', 'admin']), deleteGeoEntry);


// --- More specific geospatial query routes could be added here ---
// Example: Get all projects within a specific administrative zone (polygon)
// router.get('/projects/in-zone/:zoneId', protect, getProjectsInZone);

export default router;