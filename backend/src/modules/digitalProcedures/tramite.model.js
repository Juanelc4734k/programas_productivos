import mongoose from "mongoose";

const tramiteSchema = new mongoose.Schema({
    usuario: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    tipo_tramite: {
        type: String,
        enum: ["supplies_request", "technical_request", "program_enrollment", "certificate_request"],
        required: true
    },
    titulo: {
        type: String,
        required: true,
        trim: true
    },
    descripcion: {
        type: String,
        required: true,
    },
    tipo_insumo: {
        type: String,
        enum: ['semillas-de-cafe', 'semillas-de-hortalizas', 'fertilizantes-organicos', 'fertilizantes-quimicos', 'herramientas-de-trabajo', 'sistemas-de-riego', 'plantas-frutales', 'otros'],
        required: true
    },
    cantidad: {
        type: Number,
        required: true
    },
    estado: {
        type: String,
        enum: ['submitted', 'in_review', 'approved', 'rejected', 'completed'],
        default: "submitted"
    },
    fecha_solicitud: {
        type: Date,
        default: Date.now
    },
    fecha_revision: {
        type: Date
    },
    fecha_completado: {
        type: Date
    },
    revisado_por: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    notas: {
        type: String
    },
    documentos: [{
        nombre: String,
        cloudinaryId: String,     // ID único de Cloudinary
        cloudinaryUrl: String,    // URL pública de Cloudinary
        tipo: String,
        subido_en: {
            type: Date,
            default: Date.now
        },
        subido_por: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    }],
    vereda: {
        type: String,
        required: true
    },
    prioridad: {
        type: String,
        enum: ['high', 'medium', 'low'],
        default: 'medium'
    }
}, {
    timestamps: true
});

tramiteSchema.index({
    usuario: 1, estado: 1
});
tramiteSchema.index({
    tipo_tramite: 1
});
tramiteSchema.index({
    fecha_solicitud: 1
});

// Middleware para actualizar fechas automáticamente
tramiteSchema.pre('save', function(next) {
    if (this.isModified('estado')) {
        if (this.estado === 'in_review') {
            this.fecha_revision = new Date();
        } else if (this.estado === 'completed') {
            this.fecha_completado = new Date();
        }
    }
    next();
});

// Método para verificar si un trámite puede ser editado
tramiteSchema.methods.puedeSerEditado = function() {
    return ['submitted', 'in_review'].includes(this.estado);
};

// Método para obtener el tiempo de procesamiento
tramiteSchema.methods.getTiempoProcesamiento = function() {
    if (!this.fecha_completado) return null;
    return this.fecha_completado - this.fecha_solicitud;
};

const Tramite = mongoose.model('Tramite', tramiteSchema);

export default Tramite;