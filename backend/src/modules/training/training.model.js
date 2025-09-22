import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    location: { type: String, trim: true }, // Could be a physical address or virtual meeting link
    resources: [{ name: String, url: String }],
});

const participantSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    enrollmentDate: { type: Date, default: Date.now },
    status: {
        type: String,
        enum: ['inscrito', 'asistió', 'completado', 'certificado', 'ausente'],
        default: 'inscrito',
    },
    completionDate: { type: Date },
    certificationUrl: { type: String, trim: true }, // Link to a certificate if applicable
    feedback: { type: String, trim: true },
});

const trainingSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'El título de la capacitación es obligatorio'],
        trim: true,
        unique: true,
    },
    description: {
        type: String,
        required: [true, 'La descripción de la capacitación es obligatoria'],
        trim: true,
    },
    category: {
        type: String,
        trim: true,
        // Example categories: 'Desarrollo Agrícola', 'Tecnología', 'Gestión Empresarial'
    },
    modality: {
        type: String,
        required: true,
        enum: ['virtual', 'presencial', 'híbrida'],
        default: 'virtual',
    },
    instructor: {
        // Could be a User ID (if instructors are users) or just a name
        type: String, // or mongoose.Schema.Types.ObjectId, ref: 'User'
        trim: true,
    },
    startDate: {
        type: Date,
        required: [true, 'La fecha de inicio es obligatoria'],
    },
    endDate: {
        type: Date,
        required: [true, 'La fecha de finalización es obligatoria'],
    },
    maxParticipants: {
        type: Number,
        min: [0, 'El número de participantes no puede ser negativo'],
        default: 0, // 0 for unlimited
    },
    status: {
        type: String,
        required: true,
        enum: ['planificada', 'abierta para inscripción', 'en curso', 'finalizada', 'cancelada'],
        default: 'planificada',
    },
    sessions: [sessionSchema], // Array of sessions if the training has multiple parts
    participants: [participantSchema], // Array of enrolled participants
    tags: [String], // For searching and categorization
    bannerImageUrl: { type: String, trim: true },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // User who created the training (e.g., funcionario)
        required: true,
    }
}, {
    timestamps: true, // Adds createdAt and updatedAt timestamps
});

// Index for searching by title or category
trainingSchema.index({ title: 'text', category: 'text', tags: 'text' });

export default mongoose.model('Training', trainingSchema);