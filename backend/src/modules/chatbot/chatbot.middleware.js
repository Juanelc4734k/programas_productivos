import { CHATBOT_CONFIG, SYSTEM_MESSAGES } from './chatbot.config.js';
import { sanitizeInput, isMessageAppropriate } from './chatbot.utils.js';
import ChatSession from './chatbot.model.js';

// Store para rate limiting (en producción usar Redis)
const rateLimitStore = new Map();

/**
 * Middleware para rate limiting de mensajes
 */
export const rateLimitMessages = (req, res, next) => {
    const userId = req.user.id;
    const now = Date.now();
    const windowMs = 60 * 1000; // 1 minuto
    const maxRequests = CHATBOT_CONFIG.MESSAGES.RATE_LIMIT_MESSAGES_PER_MINUTE;
    
    // Obtener o crear entrada para el usuario
    if (!rateLimitStore.has(userId)) {
        rateLimitStore.set(userId, {
            requests: [],
            blocked: false,
            blockedUntil: null
        });
    }
    
    const userLimitData = rateLimitStore.get(userId);
    
    // Verificar si el usuario está bloqueado
    if (userLimitData.blocked && userLimitData.blockedUntil > now) {
        return res.status(429).json({
            success: false,
            message: SYSTEM_MESSAGES.ERROR.RATE_LIMIT,
            retryAfter: Math.ceil((userLimitData.blockedUntil - now) / 1000)
        });
    }
    
    // Limpiar requests antiguos
    userLimitData.requests = userLimitData.requests.filter(
        timestamp => now - timestamp < windowMs
    );
    
    // Verificar límite
    if (userLimitData.requests.length >= maxRequests) {
        userLimitData.blocked = true;
        userLimitData.blockedUntil = now + (CHATBOT_CONFIG.SECURITY.BLOCK_DURATION_MINUTES * 60 * 1000);
        
        return res.status(429).json({
            success: false,
            message: SYSTEM_MESSAGES.ERROR.RATE_LIMIT,
            retryAfter: CHATBOT_CONFIG.SECURITY.BLOCK_DURATION_MINUTES * 60
        });
    }
    
    // Agregar request actual
    userLimitData.requests.push(now);
    userLimitData.blocked = false;
    userLimitData.blockedUntil = null;
    
    next();
};

/**
 * Middleware para sanitizar y validar mensajes
 */
export const validateMessage = (req, res, next) => {
    const { message } = req.body;
    
    if (!message) {
        return res.status(400).json({
            success: false,
            message: 'El mensaje es requerido'
        });
    }
    
    // Sanitizar mensaje
    const sanitizedMessage = sanitizeInput(message);
    
    // Validar longitud
    if (sanitizedMessage.length < CHATBOT_CONFIG.MESSAGES.MIN_MESSAGE_LENGTH) {
        return res.status(400).json({
            success: false,
            message: 'El mensaje es demasiado corto'
        });
    }
    
    if (sanitizedMessage.length > CHATBOT_CONFIG.MESSAGES.MAX_MESSAGE_LENGTH) {
        return res.status(400).json({
            success: false,
            message: SYSTEM_MESSAGES.ERROR.MESSAGE_TOO_LONG
        });
    }
    
    // Validar contenido apropiado
    if (CHATBOT_CONFIG.SECURITY.ENABLE_CONTENT_FILTERING && !isMessageAppropriate(sanitizedMessage)) {
        return res.status(400).json({
            success: false,
            message: SYSTEM_MESSAGES.ERROR.INAPPROPRIATE_CONTENT
        });
    }
    
    // Reemplazar mensaje original con el sanitizado
    req.body.message = sanitizedMessage;
    
    next();
};

/**
 * Middleware para validar sesiones activas
 */
export const validateActiveSession = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { sessionId } = req.body;
        
        if (sessionId) {
            const session = await ChatSession.findOne({
                sessionId,
                userId,
                status: 'active'
            });
            
            if (!session) {
                return res.status(404).json({
                    success: false,
                    message: 'Sesión no encontrada o expirada'
                });
            }
            
            // Verificar si la sesión ha expirado por inactividad
            const now = new Date();
            const lastActivity = new Date(session.lastActivity);
            const inactiveMinutes = (now - lastActivity) / (1000 * 60);
            
            if (inactiveMinutes > CHATBOT_CONFIG.SESSION.SESSION_TIMEOUT_MINUTES) {
                session.status = 'expired';
                await session.save();
                
                return res.status(410).json({
                    success: false,
                    message: SYSTEM_MESSAGES.ERROR.SESSION_EXPIRED
                });
            }
            
            // Verificar límite de mensajes por sesión
            if (session.messages.length >= CHATBOT_CONFIG.MESSAGES.MAX_MESSAGES_PER_SESSION) {
                return res.status(400).json({
                    success: false,
                    message: 'Se ha alcanzado el límite máximo de mensajes para esta sesión. Por favor, inicia una nueva conversación.'
                });
            }
            
            req.session = session;
        }
        
        next();
    } catch (error) {
        console.error('Error validating session:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al validar sesión'
        });
    }
};

/**
 * Middleware para limitar sesiones activas por usuario
 */
export const limitActiveSessions = async (req, res, next) => {
    try {
        const userId = req.user.id;
        
        const activeSessions = await ChatSession.countDocuments({
            userId,
            status: 'active'
        });
        
        if (activeSessions >= CHATBOT_CONFIG.SESSION.MAX_ACTIVE_SESSIONS_PER_USER) {
            return res.status(400).json({
                success: false,
                message: `No puedes tener más de ${CHATBOT_CONFIG.SESSION.MAX_ACTIVE_SESSIONS_PER_USER} sesiones activas. Por favor, cierra alguna sesión existente.`
            });
        }
        
        next();
    } catch (error) {
        console.error('Error checking active sessions:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al verificar sesiones activas'
        });
    }
};

/**
 * Middleware para logging de conversaciones
 */
export const logConversation = (req, res, next) => {
    const originalSend = res.send;
    
    res.send = function(data) {
        // Log de la conversación (en producción enviar a servicio de logging)
        if (CHATBOT_CONFIG.LOGGING_CONFIG?.ENABLE_CONVERSATION_LOGGING) {
            const logData = {
                timestamp: new Date().toISOString(),
                userId: req.user?.id,
                sessionId: req.body?.sessionId || req.session?.sessionId,
                endpoint: req.originalUrl,
                method: req.method,
                userMessage: req.body?.message,
                statusCode: res.statusCode,
                responseTime: Date.now() - req.startTime
            };
            
            console.log('Chatbot Conversation Log:', JSON.stringify(logData));
        }
        
        originalSend.call(this, data);
    };
    
    req.startTime = Date.now();
    next();
};

/**
 * Middleware para limpiar sesiones expiradas automáticamente
 */
export const cleanupExpiredSessions = async (req, res, next) => {
    try {
        if (CHATBOT_CONFIG.SESSION.AUTO_CLOSE_INACTIVE_SESSIONS) {
            const cutoffTime = new Date(
                Date.now() - (CHATBOT_CONFIG.SESSION.SESSION_TIMEOUT_MINUTES * 60 * 1000)
            );
            
            await ChatSession.updateMany(
                {
                    status: 'active',
                    lastActivity: { $lt: cutoffTime }
                },
                {
                    status: 'expired',
                    endedAt: new Date()
                }
            );
        }
        
        next();
    } catch (error) {
        console.error('Error cleaning up expired sessions:', error);
        next(); // Continuar aunque falle la limpieza
    }
};

/**
 * Middleware para validar parámetros de sesión
 */
export const validateSessionParams = (req, res, next) => {
    const { sessionId } = req.params;
    
    if (!sessionId) {
        return res.status(400).json({
            success: false,
            message: 'ID de sesión requerido'
        });
    }
    
    // Validar formato del sessionId
    const sessionIdPattern = /^chat_\d{13}_[a-f0-9]{12}$/;
    if (!sessionIdPattern.test(sessionId)) {
        return res.status(400).json({
            success: false,
            message: 'Formato de ID de sesión inválido'
        });
    }
    
    next();
};

export default {
    rateLimitMessages,
    validateMessage,
    validateActiveSession,
    limitActiveSessions,
    logConversation,
    cleanupExpiredSessions,
    validateSessionParams
};