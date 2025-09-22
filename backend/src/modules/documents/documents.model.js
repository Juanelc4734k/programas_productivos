import mongoose from 'mongoose';

const documentVersionSchema = new mongoose.Schema({
    versionNumber: { type: Number, required: true, default: 1 },
    s3Key: { type: String, required: true }, // Key for the file in S3 or other storage
    s3Bucket: { type: String, required: true },
    fileSize: { type: Number, required: true }, // In bytes
    mimeType: { type: String, required: true },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    createdAt: { type: Date, default: Date.now },
    notes: { type: String, trim: true },
});

const documentSchema = new mongoose.Schema({
    originalFileName: {
        type: String,
        required: [true, 'El nombre original del archivo es obligatorio.'],
        trim: true,
    },
    title: {
        type: String,
        required: [true, 'El título del documento es obligatorio.'],
        trim: true,
    },
    description: {
        type: String,
        trim: true,
    },
    category: {
        type: String,
        trim: true,
        // Example: 'Contratos', 'Informes', 'Certificados', 'Manuales'
    },
    tags: [String],
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // User who owns/uploaded the document initially
        required: true,
    },
    versions: [documentVersionSchema],
    currentVersion: {
        type: Number,
        required: true,
        default: 1,
    },
    accessControl: {
        type: String,
        enum: ['publico', 'privado', 'restringido'], // publico: anyone, privado: owner only, restringido: specific users/roles
        default: 'privado',
    },
    allowedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // For 'restringido' access
    allowedRoles: [String], // For 'restringido' access (e.g., 'funcionario', 'admin')
    isArchived: {
        type: Boolean,
        default: false,
    },
    archivedAt: Date,
    retentionPolicy: {
        type: String, // e.g., '5_years', 'indefinite'
    },
    retentionExpiresAt: Date,
    // Digital Signature Information
    signatures: [{
        signedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        signedAt: { type: Date, default: Date.now },
        signatureData: { type: String, required: true }, // Could be a hash or reference to signature file
        certificateInfo: { type: String }, // Info about the digital certificate used
        status: { type: String, enum: ['pendiente', 'firmado', 'revocado'], default: 'pendiente' }
    }],
    metadata: { type: mongoose.Schema.Types.Mixed }, // For any other custom metadata
}, {
    timestamps: true, // Adds createdAt and updatedAt for the document itself
});

// Index for searching
documentSchema.index({ title: 'text', description: 'text', originalFileName: 'text', tags: 'text' });
documentSchema.index({ owner: 1, category: 1 });
documentSchema.index({ accessControl: 1 });
documentSchema.index({ 'versions.uploadedBy': 1 });

export default mongoose.model('Document', documentSchema);