import mongoose from 'mongoose';

const testimonioSchema = new mongoose.Schema({
    texto: {
        type: String,
        required: true,
        trim: true
    },
    autor: {
        type: String,
        required: true,
        trim: true
    },
    fecha: {
        type: Date,
        default: Date.now
    }
});

const programSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: [true, 'El nombre del programa es obligatorio'],
        trim: true,
        unique: true
    },
    descripcion: {
        type: String,
        required: [true, 'La descripción del programa es obligatoria'],
        trim: true,
    },
    categoria: {
        type: String,
        required: [true, 'La categoría del programa es obligatoria'],
        trim: true,
    },
    fecha_inicio: {
        type: Date,
        required: [true, 'La fecha de inicio es obligatoria'],
    },
    fecha_fin: {
        type: Date,
        required: [true, 'La fecha de finalización es obligatoria'],
    },
    estado: {
        type: String,
        required: true,
        enum: ['activo', 'finalizado', 'en espera', 'cancelado'],
        default: 'en espera',
    },
    cupos: {
        type: Number,
        required: [true, 'El número de cupos es obligatorio'],
        min: [0, 'Los cupos no pueden ser negativos'],
    },
    banner_url: {
        type: String,
        trim: true,
    },
    responsable: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    inscritos: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    // Nuevos campos basados en la interfaz
    beneficios: [{
        type: String,
        required: true,
        trim: true
    }],
    requisitos: [{
        type: String,
        required: true,
        trim: true
    }],
    progreso: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    presupuesto: {
        type: Number,
        required: true,
        min: 0
    },
    ubicaciones: [{
        type: String,
        required: true,
        trim: true
    }],
    testimonios: [testimonioSchema]
}, {
    timestamps: true
});

programSchema.index({ nombre: 'text', categoria: 'text' });

export default mongoose.model('Program', programSchema);