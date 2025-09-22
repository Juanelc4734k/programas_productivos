import crypto from 'crypto';

/**
 * Genera un ID único para sesiones de chat
 * @returns {string} ID único de sesión
 */
export const generateSessionId = () => {
    const timestamp = Date.now();
    const randomBytes = crypto.randomBytes(6).toString('hex');
    return `chat_${timestamp}_${randomBytes}`;
};

/**
 * Limpia y normaliza el texto de entrada
 * @param {string} text - Texto a limpiar
 * @returns {string} Texto limpio
 */
export const cleanText = (text) => {
    if (!text || typeof text !== 'string') return '';
    
    return text
        .trim()
        .replace(/\s+/g, ' ') // Reemplazar múltiples espacios por uno solo
        .replace(/[^\w\sáéíóúñüÁÉÍÓÚÑÜ¿?¡!.,;:()\-]/g, '') // Mantener solo caracteres válidos
        .substring(0, 1000); // Limitar longitud
};

/**
 * Extrae palabras clave de un mensaje
 * @param {string} message - Mensaje del usuario
 * @returns {Array} Array de palabras clave
 */
export const extractKeywords = (message) => {
    if (!message || typeof message !== 'string') return [];
    
    const stopWords = [
        'el', 'la', 'de', 'que', 'y', 'a', 'en', 'un', 'es', 'se', 'no', 'te', 'lo', 'le',
        'da', 'su', 'por', 'son', 'con', 'para', 'al', 'del', 'los', 'las', 'una', 'como',
        'pero', 'sus', 'le', 'ya', 'o', 'fue', 'este', 'ha', 'si', 'porque', 'esta', 'son',
        'entre', 'cuando', 'muy', 'sin', 'sobre', 'ser', 'tiene', 'también', 'me', 'hasta',
        'hay', 'donde', 'han', 'quien', 'están', 'estado', 'desde', 'todo', 'nos', 'durante',
        'todos', 'uno', 'les', 'ni', 'contra', 'otros', 'fueron', 'ese', 'eso', 'había',
        'ante', 'ellos', 'e', 'esto', 'mí', 'antes', 'algunos', 'qué', 'unos', 'yo', 'otro',
        'otras', 'otra', 'él', 'tanto', 'esa', 'estos', 'mucho', 'quienes', 'nada', 'muchos',
        'cual', 'poco', 'ella', 'estar', 'haber', 'estas', 'estaba', 'estamos', 'pueden',
        'hacen', 'entonces', 'tiempo', 'podría', 'hacer', 'cada', 'aquí', 'ahí', 'allí'
    ];
    
    return message
        .toLowerCase()
        .split(/\s+/)
        .filter(word => word.length > 2 && !stopWords.includes(word))
        .slice(0, 10); // Limitar a 10 palabras clave
};

/**
 * Calcula la similitud entre dos textos usando distancia de Levenshtein
 * @param {string} str1 - Primer texto
 * @param {string} str2 - Segundo texto
 * @returns {number} Porcentaje de similitud (0-1)
 */
export const calculateSimilarity = (str1, str2) => {
    if (!str1 || !str2) return 0;
    
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const distance = levenshteinDistance(longer, shorter);
    return (longer.length - distance) / longer.length;
};

/**
 * Calcula la distancia de Levenshtein entre dos cadenas
 * @param {string} str1 - Primera cadena
 * @param {string} str2 - Segunda cadena
 * @returns {number} Distancia de Levenshtein
 */
const levenshteinDistance = (str1, str2) => {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
        matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
        matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
        for (let j = 1; j <= str1.length; j++) {
            if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1,
                    matrix[i][j - 1] + 1,
                    matrix[i - 1][j] + 1
                );
            }
        }
    }
    
    return matrix[str2.length][str1.length];
};

/**
 * Formatea la fecha para mostrar en mensajes
 * @param {Date} date - Fecha a formatear
 * @returns {string} Fecha formateada
 */
export const formatMessageDate = (date) => {
    if (!date) return '';
    
    const now = new Date();
    const messageDate = new Date(date);
    const diffInHours = (now - messageDate) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
        const diffInMinutes = Math.floor((now - messageDate) / (1000 * 60));
        return diffInMinutes <= 1 ? 'Hace un momento' : `Hace ${diffInMinutes} minutos`;
    } else if (diffInHours < 24) {
        const hours = Math.floor(diffInHours);
        return hours === 1 ? 'Hace 1 hora' : `Hace ${hours} horas`;
    } else {
        return messageDate.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
};

/**
 * Valida si un mensaje contiene contenido inapropiado
 * @param {string} message - Mensaje a validar
 * @returns {boolean} True si el mensaje es apropiado
 */
export const isMessageAppropriate = (message) => {
    if (!message || typeof message !== 'string') return false;
    
    const inappropriateWords = [
        // Lista básica de palabras inapropiadas
        'spam', 'hack', 'virus', 'malware'
    ];
    
    const lowerMessage = message.toLowerCase();
    return !inappropriateWords.some(word => lowerMessage.includes(word));
};

/**
 * Genera un resumen de la conversación
 * @param {Array} messages - Array de mensajes
 * @returns {Object} Resumen de la conversación
 */
export const generateConversationSummary = (messages) => {
    if (!Array.isArray(messages) || messages.length === 0) {
        return {
            totalMessages: 0,
            userMessages: 0,
            assistantMessages: 0,
            duration: 0,
            topics: []
        };
    }
    
    const userMessages = messages.filter(msg => msg.sender === 'user');
    const assistantMessages = messages.filter(msg => msg.sender === 'assistant');
    
    const firstMessage = messages[0];
    const lastMessage = messages[messages.length - 1];
    const duration = lastMessage.timestamp - firstMessage.timestamp;
    
    // Extraer temas principales basados en palabras clave
    const allKeywords = userMessages
        .map(msg => extractKeywords(msg.content))
        .flat();
    
    const keywordFrequency = {};
    allKeywords.forEach(keyword => {
        keywordFrequency[keyword] = (keywordFrequency[keyword] || 0) + 1;
    });
    
    const topics = Object.entries(keywordFrequency)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([keyword]) => keyword);
    
    return {
        totalMessages: messages.length,
        userMessages: userMessages.length,
        assistantMessages: assistantMessages.length,
        duration: Math.round(duration / (1000 * 60)), // en minutos
        topics
    };
};

/**
 * Valida el formato de un ID de sesión
 * @param {string} sessionId - ID de sesión a validar
 * @returns {boolean} True si el formato es válido
 */
export const isValidSessionId = (sessionId) => {
    if (!sessionId || typeof sessionId !== 'string') return false;
    
    // Formato esperado: chat_timestamp_randomhex
    const sessionIdPattern = /^chat_\d{13}_[a-f0-9]{12}$/;
    return sessionIdPattern.test(sessionId);
};

/**
 * Sanitiza el input del usuario para prevenir inyecciones
 * @param {string} input - Input del usuario
 * @returns {string} Input sanitizado
 */
export const sanitizeInput = (input) => {
    if (!input || typeof input !== 'string') return '';
    
    return input
        .replace(/<script[^>]*>.*?<\/script>/gi, '') // Remover scripts
        .replace(/<[^>]*>/g, '') // Remover HTML tags
        .replace(/javascript:/gi, '') // Remover javascript:
        .replace(/on\w+\s*=/gi, '') // Remover event handlers
        .trim();
};

export default {
    generateSessionId,
    cleanText,
    extractKeywords,
    calculateSimilarity,
    formatMessageDate,
    isMessageAppropriate,
    generateConversationSummary,
    isValidSessionId,
    sanitizeInput
};