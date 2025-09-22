import mongoose from 'mongoose';

// Schema for GeoJSON Point
const pointSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['Point'],
        required: true
    },
    coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
        index: '2dsphere' // Create a geospatial index
    }
}, { _id: false });

// Schema for GeoJSON Polygon
const polygonSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['Polygon'],
        required: true
    },
    coordinates: {
        type: [[[Number]]], // Array of LinearRing coordinate arrays
        required: true
    }
}, { _id: false });

// Main GeoData Schema
const geoDataSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'El nombre es obligatorio'],
        trim: true,
        unique: true
    },
    description: {
        type: String,
        trim: true
    },
    type: {
        type: String,
        required: [true, 'El tipo de dato geográfico es obligatorio'],
        enum: ['punto_interes', 'zona', 'region', 'ruta', 'proyecto_ubicacion', 'usuario_ubicacion'],
        // punto_interes: Specific locations like a municipal office, park, etc.
        // zona: Defined areas like agricultural zones, risk zones.
        // region: Larger geographical areas.
        // ruta: Defined paths or routes.
        // proyecto_ubicacion: Location associated with a specific project.
        // usuario_ubicacion: Location associated with a user (e.g., farm location).
    },
    geometry: {
        type: {
            type: String,
            enum: ['Point', 'Polygon', 'LineString'], // Extend as needed
            required: true
        },
        coordinates: { // Dynamic based on 'type'
            type: mongoose.Schema.Types.Mixed,
            required: true
        }
    },
    // Reference to related entities (e.g., project, user, program)
    relatedEntityId: {
        type: mongoose.Schema.Types.ObjectId,
        // ref: 'Project' // Example: dynamically set ref based on 'type' or use a generic approach
    },
    relatedEntityType: {
        type: String, // e.g., 'Project', 'User', 'Program'
    },
    properties: {
        type: mongoose.Schema.Types.Mixed, // For additional custom properties
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Geospatial index on the geometry field for efficient location-based queries
geoDataSchema.index({ geometry: '2dsphere' });
geoDataSchema.index({ name: 'text', description: 'text' });

// Pre-save hook to ensure correct coordinates structure based on geometry type
geoDataSchema.pre('save', function(next) {
    if (this.geometry && this.geometry.type === 'Point') {
        if (!Array.isArray(this.geometry.coordinates) || this.geometry.coordinates.length !== 2) {
            return next(new Error('Coordenadas inválidas para el tipo Point. Debe ser [longitude, latitude].'));
        }
    } else if (this.geometry && this.geometry.type === 'Polygon') {
        // Add more complex validation for Polygon if needed
        if (!Array.isArray(this.geometry.coordinates) || !this.geometry.coordinates.every(ring => Array.isArray(ring))) {
            return next(new Error('Coordenadas inválidas para el tipo Polygon.'));
        }
    }
    // Add validation for LineString, etc.
    next();
});

export default mongoose.model('GeoData', geoDataSchema);