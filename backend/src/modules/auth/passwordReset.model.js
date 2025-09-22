import mongoose from 'mongoose';

const passwordResetSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    code: {
        type: String,
        required: true,
    },
    expiresAt: {
        type: Date,
        required: true,
        default: () => new Date(Date.now() + 15 * 60 * 1000)
    },
    used: {
        type: Boolean,
        default: false,
    }
}, {
    timestamps: true
});

export default mongoose.model('PasswordReset', passwordResetSchema);
