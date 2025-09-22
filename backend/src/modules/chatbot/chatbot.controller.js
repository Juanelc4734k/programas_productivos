import chatbotService from './chatbot.service.js';

// Iniciar nueva sesión de chat
export const startSession = async (req, res) => {
    try {
        const userId = req.user.id;
        
        const result = await chatbotService.createSession(userId);
        
        if (!result.success) {
            return res.status(500).json({
                success: false,
                message: result.error || 'Error al iniciar sesión de chat'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Sesión iniciada correctamente',
            data: result.data
        });
    } catch (error) {
        console.error('Error in startSession:', error);
        return res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};

// Enviar mensaje
export const sendMessage = async (req, res) => {
    try {
        const userId = req.user.id;
        const { message, sessionId } = req.body;

        // Validar que el mensaje no esté vacío
        if (!message || !message.trim()) {
            return res.status(400).json({
                success: false,
                message: 'El mensaje no puede estar vacío'
            });
        }

        // Validar longitud del mensaje
        if (message.length > 1000) {
            return res.status(400).json({
                success: false,
                message: 'El mensaje es demasiado largo (máximo 1000 caracteres)'
            });
        }

        const result = await chatbotService.processMessage(userId, message, sessionId);
        
        if (!result.success) {
            return res.status(500).json({
                success: false,
                message: result.error || 'Error al procesar mensaje'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Mensaje procesado correctamente',
            data: result.data
        });
    } catch (error) {
        console.error('Error in sendMessage:', error);
        return res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};

// Obtener respuestas rápidas
export const getQuickReplies = async (req, res) => {
    try {
        // Obtener información del usuario para personalizar respuestas
        const User = (await import('../auth/user.model.js')).default;
        const user = await User.findById(req.user.id);
        
        const userType = user?.tipo_usuario || 'campesino';
        const result = chatbotService.getQuickReplies(userType);
        
        return res.status(200).json({
            success: true,
            message: 'Respuestas rápidas obtenidas correctamente',
            data: result.data
        });
    } catch (error) {
        console.error('Error in getQuickReplies:', error);
        return res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};

// Obtener historial de sesiones
export const getUserSessions = async (req, res) => {
    try {
        const userId = req.user.id;
        const limit = parseInt(req.query.limit) || 10;

        // Validar límite
        if (limit > 50) {
            return res.status(400).json({
                success: false,
                message: 'El límite máximo es 50 sesiones'
            });
        }

        const result = await chatbotService.getUserSessions(userId, limit);
        
        if (!result.success) {
            return res.status(500).json({
                success: false,
                message: result.error || 'Error al obtener historial'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Historial obtenido correctamente',
            data: result.data
        });
    } catch (error) {
        console.error('Error in getUserSessions:', error);
        return res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};

// Cerrar sesión de chat
export const closeSession = async (req, res) => {
    try {
        const userId = req.user.id;
        const { sessionId } = req.params;

        if (!sessionId) {
            return res.status(400).json({
                success: false,
                message: 'ID de sesión requerido'
            });
        }

        const result = await chatbotService.closeSession(sessionId, userId);
        
        if (!result.success) {
            return res.status(500).json({
                success: false,
                message: result.error || 'Error al cerrar sesión'
            });
        }

        return res.status(200).json({
            success: true,
            message: result.message
        });
    } catch (error) {
        console.error('Error in closeSession:', error);
        return res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};

// Agregar feedback a una sesión
export const addFeedback = async (req, res) => {
    try {
        const userId = req.user.id;
        const { sessionId } = req.params;
        const { rating, comment } = req.body;

        // Validaciones
        if (!sessionId) {
            return res.status(400).json({
                success: false,
                message: 'ID de sesión requerido'
            });
        }

        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({
                success: false,
                message: 'La calificación debe ser un número entre 1 y 5'
            });
        }

        if (comment && comment.length > 500) {
            return res.status(400).json({
                success: false,
                message: 'El comentario es demasiado largo (máximo 500 caracteres)'
            });
        }

        const result = await chatbotService.addFeedback(sessionId, userId, rating, comment);
        
        if (!result.success) {
            return res.status(500).json({
                success: false,
                message: result.error || 'Error al agregar feedback'
            });
        }

        return res.status(200).json({
            success: true,
            message: result.message
        });
    } catch (error) {
        console.error('Error in addFeedback:', error);
        return res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};

// Obtener detalles de una sesión específica
export const getSessionDetails = async (req, res) => {
    try {
        const userId = req.user.id;
        const { sessionId } = req.params;

        if (!sessionId) {
            return res.status(400).json({
                success: false,
                message: 'ID de sesión requerido'
            });
        }

        // Importar el modelo aquí para evitar dependencias circulares
        const ChatSession = (await import('./chatbot.model.js')).default;
        
        const session = await ChatSession.findOne({ 
            sessionId, 
            userId 
        }).select('sessionId status startedAt lastActivity endedAt messages feedback context');

        if (!session) {
            return res.status(404).json({
                success: false,
                message: 'Sesión no encontrada'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Detalles de sesión obtenidos correctamente',
            data: session
        });
    } catch (error) {
        console.error('Error in getSessionDetails:', error);
        return res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};

// Obtener estadísticas del chatbot para el usuario
export const getChatStats = async (req, res) => {
    try {
        const userId = req.user.id;
        
        // Importar el modelo aquí para evitar dependencias circulares
        const ChatSession = (await import('./chatbot.model.js')).default;
        
        const stats = await ChatSession.aggregate([
            { $match: { userId: userId } },
            {
                $group: {
                    _id: null,
                    totalSessions: { $sum: 1 },
                    activeSessions: {
                        $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
                    },
                    totalMessages: {
                        $sum: { $size: '$messages' }
                    },
                    averageRating: {
                        $avg: '$feedback.rating'
                    },
                    lastActivity: { $max: '$lastActivity' }
                }
            }
        ]);

        const result = stats[0] || {
            totalSessions: 0,
            activeSessions: 0,
            totalMessages: 0,
            averageRating: null,
            lastActivity: null
        };

        return res.status(200).json({
            success: true,
            message: 'Estadísticas obtenidas correctamente',
            data: result
        });
    } catch (error) {
        console.error('Error in getChatStats:', error);
        return res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};

// Verificar estado del servicio de Llama 3.2
export const checkLlamaStatus = async (req, res) => {
    try {
        const result = await chatbotService.checkLlamaServiceStatus();
        
        if (!result.success) {
            return res.status(500).json({
                success: false,
                message: result.error || 'Error al verificar estado del servicio de IA'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Estado del servicio de IA obtenido correctamente',
            data: result.data
        });
    } catch (error) {
        console.error('Error in checkLlamaStatus:', error);
        return res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};

// Alternar entre respuestas de IA y predefinidas (solo para administradores)
export const toggleAIResponses = async (req, res) => {
    try {
        // Verificar que el usuario sea administrador
        const User = (await import('../auth/user.model.js')).default;
        const user = await User.findById(req.user.id);
        
        if (!user || user.tipo_usuario !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Acceso denegado. Solo los administradores pueden cambiar esta configuración.'
            });
        }

        const { enabled } = req.body;
        
        if (typeof enabled !== 'boolean') {
            return res.status(400).json({
                success: false,
                message: 'El parámetro "enabled" debe ser un valor booleano'
            });
        }

        const result = chatbotService.toggleAIResponses(enabled);
        
        return res.status(200).json({
            success: true,
            message: result.message,
            data: {
                ai_enabled: result.ai_enabled
            }
        });
    } catch (error) {
        console.error('Error in toggleAIResponses:', error);
        return res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};

// Obtener configuración actual del chatbot
export const getChatbotConfig = async (req, res) => {
    try {
        const { CHATBOT_CONFIG } = await import('./chatbot.config.js');
        
        // Solo mostrar configuración relevante para el frontend
        const config = {
            session: {
                timeout_minutes: CHATBOT_CONFIG.SESSION.SESSION_TIMEOUT_MINUTES,
                max_duration_hours: CHATBOT_CONFIG.SESSION.MAX_SESSION_DURATION_HOURS
            },
            messages: {
                max_length: CHATBOT_CONFIG.MESSAGES.MAX_MESSAGE_LENGTH,
                rate_limit_per_minute: CHATBOT_CONFIG.MESSAGES.RATE_LIMIT_MESSAGES_PER_MINUTE
            },
            responses: {
                ai_enabled: CHATBOT_CONFIG.RESPONSES.USE_AI_RESPONSES,
                fallback_enabled: CHATBOT_CONFIG.RESPONSES.FALLBACK_TO_PREDEFINED,
                typing_indicator: CHATBOT_CONFIG.RESPONSES.ENABLE_TYPING_INDICATOR
            },
            llama: {
                model_name: CHATBOT_CONFIG.LLAMA.MODEL_NAME,
                max_tokens: CHATBOT_CONFIG.LLAMA.MAX_TOKENS,
                temperature: CHATBOT_CONFIG.LLAMA.TEMPERATURE
            }
        };

        return res.status(200).json({
            success: true,
            message: 'Configuración del chatbot obtenida correctamente',
            data: config
        });
    } catch (error) {
        console.error('Error in getChatbotConfig:', error);
        return res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};