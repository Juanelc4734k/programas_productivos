import GeoData from './geo.model.js';
// Import other models like Project, User if needed for validation or linking

/**
 * Creates a new geographic data entry.
 * @param {Object} geoDataInput - The data for the new geographic entry.
 * @returns {Promise<Document>} The created GeoData document.
 */
export const createGeoEntry = async (geoDataInput) => {
    try {
        // TODO: Add validation for relatedEntityId based on relatedEntityType if provided
        // e.g., if relatedEntityType is 'Project', check if Project with relatedEntityId exists
        const newGeoEntry = new GeoData(geoDataInput);
        return await newGeoEntry.save();
    } catch (error) {
        console.error("Service Error: createGeoEntry", error);
        if (error.code === 11000) {
            const customError = new Error('Ya existe una entrada geográfica con ese nombre.');
            customError.statusCode = 400;
            throw customError;
        }
        throw error;
    }
};

/**
 * Finds a geographic entry by its ID.
 * @param {String} geoId - The ID of the geographic entry.
 * @returns {Promise<Document>} The found GeoData document.
 */
export const findGeoEntryById = async (geoId) => {
    try {
        const geoEntry = await GeoData.findById(geoId);
        // Optionally populate relatedEntityId if it's a common requirement
        // .populate('relatedEntityId'); 
        if (!geoEntry) {
            const error = new Error('Entrada geográfica no encontrada.');
            error.statusCode = 404;
            throw error;
        }
        return geoEntry;
    } catch (error) {
        console.error("Service Error: findGeoEntryById", error);
        throw error;
    }
};

/**
 * Finds all geographic entries, with optional filters and pagination.
 * @param {Object} filters - Filtering criteria (e.g., type, isActive, bounding box).
 * @param {Object} options - Pagination and sorting options.
 * @returns {Promise<Object>} An object containing paginated geographic entries.
 */
export const findAllGeoEntries = async (filters = {}, options = {}) => {
    try {
        const { page = 1, limit = 10, sort = '-createdAt' } = options;
        const skip = (page - 1) * limit;

        const query = { isActive: true }; // Default to active entries
        if (filters.type) query.type = filters.type;
        if (filters.name) query.name = { $regex: filters.name, $options: 'i' };
        if (filters.relatedEntityType) query.relatedEntityType = filters.relatedEntityType;
        if (filters.relatedEntityId) query.relatedEntityId = filters.relatedEntityId;
        if (typeof filters.isActive === 'boolean') query.isActive = filters.isActive;

        // Geospatial query example: find entries within a polygon (bounding box)
        if (filters.withinPolygon) { // Expects GeoJSON Polygon coordinates
            query.geometry = {
                $geoWithin: {
                    $geometry: {
                        type: 'Polygon',
                        coordinates: filters.withinPolygon
                    }
                }
            };
        }
        // Geospatial query example: find entries near a point
        if (filters.nearPoint && filters.maxDistance) { // Expects [lng, lat] and distance in meters
             query.geometry = {
                $nearSphere: {
                    $geometry: {
                        type: 'Point',
                        coordinates: filters.nearPoint
                    },
                    $maxDistance: filters.maxDistance // in meters
                }
            };
        }

        const geoEntries = await GeoData.find(query)
            // .populate('relatedEntityId') // Populate if needed
            .sort(sort)
            .skip(skip)
            .limit(limit);

        const totalGeoEntries = await GeoData.countDocuments(query);

        return {
            totalPages: Math.ceil(totalGeoEntries / limit),
            currentPage: page,
            totalGeoEntries,
            geoEntries,
        };
    } catch (error) {
        console.error("Service Error: findAllGeoEntries", error);
        throw error;
    }
};

/**
 * Updates an existing geographic entry.
 * @param {String} geoId - The ID of the geographic entry to update.
 * @param {Object} updateData - The data to update the entry with.
 * @returns {Promise<Document>} The updated GeoData document.
 */
export const updateExistingGeoEntry = async (geoId, updateData) => {
    try {
        // Prevent changing geometry type directly, should be handled carefully
        if (updateData.geometry && updateData.geometry.type) {
            const existing = await GeoData.findById(geoId, 'geometry.type');
            if (existing && existing.geometry.type !== updateData.geometry.type) {
                const error = new Error('No se puede cambiar el tipo de geometría directamente. Cree una nueva entrada.');
                error.statusCode = 400;
                throw error;
            }
        }

        const geoEntry = await GeoData.findByIdAndUpdate(geoId, updateData, { new: true, runValidators: true });
        if (!geoEntry) {
            const error = new Error('Entrada geográfica no encontrada para actualizar.');
            error.statusCode = 404;
            throw error;
        }
        return geoEntry;
    } catch (error) {
        console.error("Service Error: updateExistingGeoEntry", error);
        if (error.code === 11000) {
            const customError = new Error('Conflicto al actualizar, el nombre de la entrada geográfica ya existe.');
            customError.statusCode = 400;
            throw customError;
        }
        throw error;
    }
};

/**
 * Deletes a geographic entry (logically by setting isActive to false, or physically).
 * @param {String} geoId - The ID of the geographic entry to delete.
 * @returns {Promise<Document|Object>} The deleted/deactivated GeoData document or a success message.
 */
export const deleteGeoEntry = async (geoId, physicalDelete = false) => {
    try {
        if (physicalDelete) {
            const geoEntry = await GeoData.findByIdAndDelete(geoId);
            if (!geoEntry) {
                const error = new Error('Entrada geográfica no encontrada para eliminar.');
                error.statusCode = 404;
                throw error;
            }
            return geoEntry; // Returns the deleted document
        } else {
            // Logical delete
            const geoEntry = await GeoData.findByIdAndUpdate(geoId, { isActive: false }, { new: true });
            if (!geoEntry) {
                const error = new Error('Entrada geográfica no encontrada para desactivar.');
                error.statusCode = 404;
                throw error;
            }
            return { message: 'Entrada geográfica desactivada correctamente.', entry: geoEntry };
        }
    } catch (error) {
        console.error("Service Error: deleteGeoEntry", error);
        throw error;
    }
};

// Example of a more specific geospatial service function:
/**
 * Finds all 'punto_interes' type entries within a given radius of a point.
 * @param {Array<Number>} coordinates - The [longitude, latitude] of the center point.
 * @param {Number} radiusInMeters - The radius in meters.
 * @returns {Promise<Array<Document>>} A list of matching GeoData documents.
 */
export const findPointsOfInterestNear = async (coordinates, radiusInMeters) => {
    try {
        return await GeoData.find({
            type: 'punto_interes',
            isActive: true,
            geometry: {
                $nearSphere: {
                    $geometry: {
                        type: 'Point',
                        coordinates: coordinates
                    },
                    $maxDistance: radiusInMeters
                }
            }
        });
    } catch (error) {
        console.error("Service Error: findPointsOfInterestNear", error);
        throw error;
    }
};