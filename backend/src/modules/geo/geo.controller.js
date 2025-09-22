import * as geoService from './geo.service.js';

export const createGeoEntry = async (req, res) => {
    try {
        // req.user.id could be used to associate with creator if needed
        const newGeoEntry = await geoService.createGeoEntry(req.body);
        res.status(201).json(newGeoEntry);
    } catch (error) {
        console.error("Controller Error: createGeoEntry", error);
        res.status(error.statusCode || 500).json({ message: error.message || 'Error al crear la entrada geográfica.' });
    }
};

export const getGeoEntryById = async (req, res) => {
    try {
        const { geoId } = req.params;
        const geoEntry = await geoService.findGeoEntryById(geoId);
        res.status(200).json(geoEntry);
    } catch (error) {
        console.error("Controller Error: getGeoEntryById", error);
        res.status(error.statusCode || 500).json({ message: error.message || 'Error al obtener la entrada geográfica.' });
    }
};

export const getAllGeoEntries = async (req, res) => {
    try {
        const filters = { ...req.query };
        delete filters.page; // remove pagination params from filters
        delete filters.limit;
        delete filters.sort;

        // Special handling for geospatial query params if they are strings
        if (filters.withinPolygon && typeof filters.withinPolygon === 'string') {
            try {
                filters.withinPolygon = JSON.parse(filters.withinPolygon);
            } catch (e) {
                return res.status(400).json({ message: 'Parámetro withinPolygon inválido, debe ser un string JSON de coordenadas.' });
            }
        }
        if (filters.nearPoint && typeof filters.nearPoint === 'string') {
            try {
                filters.nearPoint = JSON.parse(filters.nearPoint);
            } catch (e) {
                return res.status(400).json({ message: 'Parámetro nearPoint inválido, debe ser un string JSON de coordenadas [lng, lat].' });
            }
        }
        if (filters.maxDistance && typeof filters.maxDistance === 'string') {
            filters.maxDistance = parseFloat(filters.maxDistance);
            if (isNaN(filters.maxDistance)) {
                 return res.status(400).json({ message: 'Parámetro maxDistance inválido, debe ser un número.' });
            }
        }

        const options = {
            page: parseInt(req.query.page) || 1,
            limit: parseInt(req.query.limit) || 10,
            sort: req.query.sort || '-createdAt'
        };

        const result = await geoService.findAllGeoEntries(filters, options);
        res.status(200).json(result);
    } catch (error) {
        console.error("Controller Error: getAllGeoEntries", error);
        res.status(error.statusCode || 500).json({ message: error.message || 'Error al obtener las entradas geográficas.' });
    }
};

export const updateGeoEntry = async (req, res) => {
    try {
        const { geoId } = req.params;
        const updatedGeoEntry = await geoService.updateExistingGeoEntry(geoId, req.body);
        res.status(200).json(updatedGeoEntry);
    } catch (error) {
        console.error("Controller Error: updateGeoEntry", error);
        res.status(error.statusCode || 500).json({ message: error.message || 'Error al actualizar la entrada geográfica.' });
    }
};

export const deleteGeoEntry = async (req, res) => {
    try {
        const { geoId } = req.params;
        // Determine if physical delete from query param, e.g., ?physical=true
        const physicalDelete = req.query.physical === 'true';
        const result = await geoService.deleteGeoEntry(geoId, physicalDelete);
        res.status(200).json(result);
    } catch (error) {
        console.error("Controller Error: deleteGeoEntry", error);
        res.status(error.statusCode || 500).json({ message: error.message || 'Error al eliminar la entrada geográfica.' });
    }
};

// Example of a controller for a specific geospatial query
export const getPointsOfInterestNear = async (req, res) => {
    try {
        const { longitude, latitude, radius } = req.query;
        if (!longitude || !latitude || !radius) {
            return res.status(400).json({ message: 'Los parámetros longitude, latitude, y radius son obligatorios.' });
        }
        const coords = [parseFloat(longitude), parseFloat(latitude)];
        const radiusMeters = parseFloat(radius);

        if (isNaN(coords[0]) || isNaN(coords[1]) || isNaN(radiusMeters)) {
            return res.status(400).json({ message: 'Valores inválidos para coordenadas o radio.' });
        }

        const points = await geoService.findPointsOfInterestNear(coords, radiusMeters);
        res.status(200).json(points);
    } catch (error) {
        console.error("Controller Error: getPointsOfInterestNear", error);
        res.status(error.statusCode || 500).json({ message: error.message || 'Error al buscar puntos de interés cercanos.' });
    }
};