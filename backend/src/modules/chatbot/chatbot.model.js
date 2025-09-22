import mongoose from 'mongoose';

// Esquema para mensajes individuales
const messageSchema = new mongoose.Schema({
    content: {
        type: String,
        required: true,
        trim: true
    },
    sender: {
        type: String,
        required: true,
        enum: ['user', 'assistant', 'system'],
        default: 'user'
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    }
}, {
    _id: true
});

// Esquema para sesiones de chat
const chatSessionSchema = new mongoose.Schema({
    sessionId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    messages: [messageSchema],
    status: {
        type: String,
        enum: ['active', 'closed', 'archived'],
        default: 'active'
    },
    startedAt: {
        type: Date,
        default: Date.now
    },
    lastActivity: {
        type: Date,
        default: Date.now
    },
    endedAt: {
        type: Date
    },
    context: {
        userType: {
            type: String,
            enum: ['campesino', 'funcionario', 'admin']
        },
        department: String,
        location: String,
        preferences: {
            type: mongoose.Schema.Types.Mixed,
            default: {}
        }
    },
    feedback: {
        rating: {
            type: Number,
            min: 1,
            max: 5
        },
        comment: String,
        submittedAt: Date
    }
}, {
    timestamps: true
});

// Índices para optimizar consultas
chatSessionSchema.index({ userId: 1, startedAt: -1 });
chatSessionSchema.index({ status: 1, lastActivity: -1 });
chatSessionSchema.index({ sessionId: 1 }, { unique: true });

// Middleware para actualizar lastActivity
chatSessionSchema.pre('save', function(next) {
    if (this.isModified('messages')) {
        this.lastActivity = new Date();
    }
    next();
});

// Métodos del esquema
chatSessionSchema.methods.addMessage = function(content, sender = 'user', metadata = {}) {
    this.messages.push({
        content,
        sender,
        metadata,
        timestamp: new Date()
    });
    this.lastActivity = new Date();
    return this.save();
};

chatSessionSchema.methods.closeSession = function() {
    this.status = 'closed';
    this.endedAt = new Date();
    return this.save();
};

chatSessionSchema.methods.addFeedback = function(rating, comment = '') {
    this.feedback = {
        rating,
        comment,
        submittedAt: new Date()
    };
    return this.save();
};

// Métodos estáticos
chatSessionSchema.statics.createSession = async function(userId, userContext = {}) {
    const sessionId = `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const session = new this({
        sessionId,
        userId,
        context: userContext,
        messages: [{
            content: '¡Hola! Soy tu asistente virtual de la Alcaldía. Estoy aquí para ayudarte con información sobre programas agrícolas, trámites, capacitaciones y más. ¿En qué puedo ayudarte hoy?',
            sender: 'assistant',
            timestamp: new Date()
        }]
    });
    
    return session.save();
};

chatSessionSchema.statics.findActiveSession = function(userId) {
    return this.findOne({
        userId,
        status: 'active'
    }).sort({ lastActivity: -1 });
};

chatSessionSchema.statics.getUserSessions = function(userId, limit = 10) {
    return this.find({ userId })
        .sort({ startedAt: -1 })
        .limit(limit)
        .select('sessionId status startedAt lastActivity messages.length');
};

export default mongoose.model('ChatSession', chatSessionSchema);