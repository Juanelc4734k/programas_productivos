import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: [true, 'El nombre del proyecto es obligatorio'],
        trim: true,
        unique: true // Assuming project names within a program should be unique, or globally unique
    },
    descripcion: {
        type: String,
        required: [true, 'La descripción del proyecto es obligatoria'],
        trim: true,
    },
    objetivos: {
        type: String,
        trim: true,
    },
    programa_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Program',
        required: [true, 'El ID del programa asociado es obligatorio'],
    },
    responsable_proyecto: { // User (campesino or other) leading the project
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        // required: true // Decide if a project must have a responsible user
    },
    participantes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    estado: {
        type: String,
        required: true,
        enum: ['planificación', 'en curso', 'completado', 'en espera', 'cancelado', 'suspendido'],
        default: 'planificación',
    },
    fecha_inicio_estimada: {
        type: Date,
    },
    fecha_fin_estimada: {
        type: Date,
    },
    fecha_inicio_real: {
        type: Date,
    },
    fecha_fin_real: {
        type: Date,
    },
    presupuesto_estimado: {
        type: Number,
        min: [0, 'El presupuesto no puede ser negativo'],
    },
    presupuesto_real: {
        type: Number,
        min: [0, 'El presupuesto no puede ser negativo'],
    },
    ubicacion: {
        type: String, // Could be more complex (e.g., GeoJSON for coordinates)
        trim: true,
    },
    archivos_adjuntos: [{
        nombre_archivo: String,
        url_archivo: String,
        tipo_archivo: String, // e.g., 'documento', 'imagen', 'video'
        fecha_subida: { type: Date, default: Date.now }
    }],
    notas_seguimiento: [{
        nota: String,
        fecha: { type: Date, default: Date.now },
        creado_por: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
    }]
    // Add other fields relevant to a project
}, {
    timestamps: true, // Adds createdAt and updatedAt timestamps
});

// Index for searching by project name or program ID
projectSchema.index({ nombre: 'text', programa_id: 1 });

export default mongoose.model('Project', projectSchema);