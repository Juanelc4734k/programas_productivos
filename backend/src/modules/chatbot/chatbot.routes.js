import express from 'express';
import {
    startSession,
    sendMessage,
    getQuickReplies,
    getUserSessions,
    closeSession,
    addFeedback,
    getSessionDetails,
    getChatStats,
    checkLlamaStatus,
    toggleAIResponses,
    getChatbotConfig
} from './chatbot.controller.js';
import { protect } from '../../middlewares/auth.middleware.js';
import {
    rateLimitMessages,
    validateMessage,
    validateActiveSession,
    limitActiveSessions,
    logConversation,
    cleanupExpiredSessions,
    validateSessionParams
} from './chatbot.middleware.js';
import {
    validateSendMessage,
    validateCloseSession,
    validateAddFeedback,
    validateGetSessionDetails,
    validateGetUserSessions,
    handleValidationErrors
} from './chatbot.validation.js';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(protect);

// Middleware global para logging y limpieza
router.use(logConversation);
router.use(cleanupExpiredSessions);

// Rutas principales del chatbot

// POST /api/chatbot/session/start - Iniciar nueva sesión de chat
router.post('/session/start', 
    limitActiveSessions,
    startSession
);

// POST /api/chatbot/message - Enviar mensaje al chatbot
router.post('/message', 
    validateSendMessage,
    handleValidationErrors,
    rateLimitMessages,
    validateMessage,
    validateActiveSession,
    sendMessage
);

// GET /api/chatbot/quick-replies - Obtener respuestas rápidas
router.get('/quick-replies', getQuickReplies);

// GET /api/chatbot/sessions - Obtener historial de sesiones del usuario
router.get('/sessions', 
    validateGetUserSessions,
    handleValidationErrors,
    getUserSessions
);

// PUT /api/chatbot/session/:sessionId/close - Cerrar sesión específica
router.put('/session/:sessionId/close', 
    validateCloseSession,
    handleValidationErrors,
    validateSessionParams,
    closeSession
);

// GET /api/chatbot/session/:sessionId - Obtener detalles de una sesión específica
router.get('/session/:sessionId', 
    validateGetSessionDetails,
    handleValidationErrors,
    validateSessionParams,
    getSessionDetails
);

// POST /api/chatbot/session/:sessionId/feedback - Agregar feedback a una sesión
router.post('/session/:sessionId/feedback', 
    validateAddFeedback,
    handleValidationErrors,
    validateSessionParams,
    addFeedback
);

// GET /api/chatbot/stats - Obtener estadísticas del chatbot para el usuario
router.get('/stats', getChatStats);

// Rutas específicas para Llama 3.2

// GET /api/chatbot/llama/status - Verificar estado del servicio de Llama 3.2
router.get('/llama/status', checkLlamaStatus);

// POST /api/chatbot/admin/toggle-ai - Alternar entre respuestas de IA y predefinidas (solo admin)
router.post('/admin/toggle-ai', toggleAIResponses);

// GET /api/chatbot/config - Obtener configuración actual del chatbot
router.get('/config', getChatbotConfig);

export default router;