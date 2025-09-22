import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Categorías predefinidas para noticias y eventos
 */
export const CATEGORIES = {
    PROGRAMAS: 'Programas',
    CAPACITACIONES: 'Capacitaciones',
    EVENTOS: 'Eventos',
    CONVOCATORIAS: 'Convocatorias',
    LOGROS_RESULTADOS: 'Logros y Resultados'
};

/**
 * Temas predefinidos
 */
export const TOPICS = {
    CAFE: 'Cafe',
    TECNOLOGIA: 'Tecnologia',
    COMERCIALIZACION: 'Comercializacion',
    GANADERIA: 'Ganaderia',
    AGRICULTURA: 'Agricultura'
};

/**
 * Estados para noticias
 */
export const NEWS_STATUS = {
    DRAFT: 'borrador',
    PUBLISHED: 'publicada',
    ARCHIVED: 'archivada'
};

/**
 * Estados para eventos
 */
export const EVENT_STATUS = {
    SCHEDULED: 'programado',
    IN_PROGRESS: 'en_curso',
    FINISHED: 'finalizado',
    CANCELLED: 'cancelado'
};

/**
 * Generar slug a partir del título
 */
export const generateSlug = (title) => {
    return title
        .toLowerCase()
        .trim()
        .replace(/[áàäâã]/g, 'a')
        .replace(/[éèëê]/g, 'e')
        .replace(/[íìïî]/g, 'i')
        .replace(/[óòöôõ]/g, 'o')
        .replace(/[úùüû]/g, 'u')
        .replace(/[ñ]/g, 'n')
        .replace(/[ç]/g, 'c')
        .replace(/[^a-z0-9\s-]/g, '') // Remover caracteres especiales
        .replace(/\s+/g, '-') // Reemplazar espacios con guiones
        .replace(/-+/g, '-') // Reemplazar múltiples guiones con uno solo
        .replace(/^-|-$/g, ''); // Remover guiones al inicio y final
};

/**
 * Calcular tiempo estimado de lectura
 */
export const calculateReadingTime = (content) => {
    const wordsPerMinute = 200; // Promedio de palabras por minuto
    const words = content.trim().split(/\s+/).length;
    const minutes = Math.ceil(words / wordsPerMinute);
    return Math.max(1, minutes); // Mínimo 1 minuto
};

/**
 * Extraer palabras clave del contenido
 */
export const extractKeywords = (title, description) => {
    const text = `${title} ${description}`.toLowerCase();
    
    // Palabras comunes a ignorar
    const stopWords = new Set([
        'el', 'la', 'de', 'que', 'y', 'a', 'en', 'un', 'es', 'se', 'no', 'te', 'lo', 'le',
        'da', 'su', 'por', 'son', 'con', 'para', 'al', 'del', 'los', 'las', 'una', 'como',
        'pero', 'sus', 'le', 'ya', 'o', 'porque', 'cuando', 'muy', 'sin', 'sobre', 'también',
        'me', 'hasta', 'hay', 'donde', 'quien', 'desde', 'todos', 'durante', 'todo', 'esto',
        'era', 'ser', 'estar', 'tener', 'hacer', 'poder', 'decir', 'ir', 'ver', 'dar',
        'saber', 'querer', 'llegar', 'pasar', 'deber', 'poner', 'parecer', 'quedar',
        'creer', 'hablar', 'llevar', 'dejar', 'seguir', 'encontrar', 'llamar', 'venir',
        'pensar', 'salir', 'volver', 'tomar', 'conocer', 'vivir', 'sentir', 'tratar',
        'mirar', 'contar', 'empezar', 'esperar', 'buscar', 'existir', 'entrar', 'trabajar',
        'escribir', 'perder', 'producir', 'ocurrir', 'entender', 'pedir', 'recibir'
    ]);
    
    const words = text
        .replace(/[^a-záéíóúñü\s]/g, '') // Solo letras y espacios
        .split(/\s+/)
        .filter(word => word.length > 3 && !stopWords.has(word))
        .reduce((acc, word) => {
            acc[word] = (acc[word] || 0) + 1;
            return acc;
        }, {});
    
    // Retornar las 10 palabras más frecuentes
    return Object.entries(words)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .map(([word]) => word);
};

/**
 * Formatear fecha para mostrar
 */
export const formatDate = (date, options = {}) => {
    const defaultOptions = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        timeZone: 'America/Bogota'
    };
    
    return new Intl.DateTimeFormat('es-CO', { ...defaultOptions, ...options })
        .format(new Date(date));
};

/**
 * Formatear hora
 */
export const formatTime = (time) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
};

/**
 * Validar si una fecha es futura
 */
export const isFutureDate = (date) => {
    return new Date(date) > new Date();
};

/**
 * Calcular días restantes hasta una fecha
 */
export const daysUntil = (date) => {
    const now = new Date();
    const target = new Date(date);
    const diffTime = target - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
};

/**
 * Generar resumen automático del contenido
 */
export const generateSummary = (content, maxLength = 200) => {
    if (content.length <= maxLength) {
        return content;
    }
    
    // Buscar el último punto antes del límite
    const truncated = content.substring(0, maxLength);
    const lastPeriod = truncated.lastIndexOf('.');
    
    if (lastPeriod > maxLength * 0.7) {
        return truncated.substring(0, lastPeriod + 1);
    }
    
    // Si no hay punto, buscar el último espacio
    const lastSpace = truncated.lastIndexOf(' ');
    return truncated.substring(0, lastSpace) + '...';
};

/**
 * Validar formato de imagen
 */
export const isValidImageUrl = (url) => {
    const imageExtensions = /\.(jpg|jpeg|png|gif|webp|svg)$/i;
    try {
        const urlObj = new URL(url);
        return imageExtensions.test(urlObj.pathname);
    } catch {
        return false;
    }
};

/**
 * Procesar hashtags
 */
export const processHashtags = (hashtags) => {
    if (!Array.isArray(hashtags)) return [];
    
    return hashtags
        .map(tag => {
            const cleaned = tag.trim().toLowerCase();
            return cleaned.startsWith('#') ? cleaned : `#${cleaned}`;
        })
        .filter(tag => tag.length > 1)
        .slice(0, 10); // Máximo 10 hashtags
};

/**
 * Generar estadísticas de engagement
 */
export const calculateEngagement = (views, favorites, comments = 0) => {
    if (views === 0) return 0;
    
    const engagementScore = ((favorites * 2 + comments * 3) / views) * 100;
    return Math.round(engagementScore * 100) / 100; // 2 decimales
};

/**
 * Crear estructura de respuesta estándar
 */
export const createResponse = (success, data = null, message = '', pagination = null) => {
    const response = {
        success,
        message,
        timestamp: new Date().toISOString()
    };
    
    if (data !== null) {
        response.data = data;
    }
    
    if (pagination) {
        response.pagination = pagination;
    }
    
    return response;
};

/**
 * Crear objeto de paginación
 */
export const createPagination = (page, limit, total) => {
    const totalPages = Math.ceil(total / limit);
    
    return {
        currentPage: page,
        totalPages,
        totalItems: total,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
        nextPage: page < totalPages ? page + 1 : null,
        prevPage: page > 1 ? page - 1 : null
    };
};

/**
 * Sanitizar texto para búsqueda
 */
export const sanitizeSearchText = (text) => {
    return text
        .trim()
        .toLowerCase()
        .replace(/[^a-záéíóúñü0-9\s]/g, '')
        .replace(/\s+/g, ' ');
};

/**
 * Crear filtros de búsqueda para MongoDB
 */
export const buildSearchFilters = (query) => {
    const filters = {};
    
    // Filtro por categoría
    if (query.categoria) {
        filters.categoria = query.categoria;
    }
    
    // Filtro por estado
    if (query.estado) {
        filters.estado = query.estado;
    }
    
    // Filtro por destacada
    if (query.destacada !== undefined) {
        filters.destacada = query.destacada;
    }
    
    // Filtro por temas
    if (query.temas && Array.isArray(query.temas)) {
        filters.temas = { $in: query.temas };
    }
    
    // Filtro por rango de fechas
    if (query.fechaDesde || query.fechaHasta) {
        filters.fecha = {};
        if (query.fechaDesde) {
            filters.fecha.$gte = new Date(query.fechaDesde);
        }
        if (query.fechaHasta) {
            filters.fecha.$lte = new Date(query.fechaHasta);
        }
    }
    
    // Filtro de búsqueda por texto
    if (query.busqueda) {
        const searchText = sanitizeSearchText(query.busqueda);
        filters.$or = [
            { titulo: { $regex: searchText, $options: 'i' } },
            { descripcion: { $regex: searchText, $options: 'i' } },
            { hashtags: { $regex: searchText, $options: 'i' } }
        ];
    }
    
    return filters;
};

/**
 * Crear opciones de ordenamiento
 */
export const buildSortOptions = (sortBy = 'fechaCreacion', sortOrder = 'desc') => {
    const validSortFields = {
        fecha: 'fecha',
        titulo: 'titulo',
        vistas: 'vistas',
        fechaCreacion: 'createdAt',
        fechaEvento: 'fechaEvento'
    };
    
    const field = validSortFields[sortBy] || 'createdAt';
    const order = sortOrder === 'asc' ? 1 : -1;
    
    return { [field]: order };
};

/**
 * Logging personalizado para el módulo de noticias
 */
export const logger = {
    info: (message, data = {}) => {
        console.log(`[NEWS MODULE - INFO] ${message}`, data);
    },
    error: (message, error = {}) => {
        console.error(`[NEWS MODULE - ERROR] ${message}`, error);
    },
    warn: (message, data = {}) => {
        console.warn(`[NEWS MODULE - WARN] ${message}`, data);
    },
    debug: (message, data = {}) => {
        if (process.env.NODE_ENV === 'development') {
            console.debug(`[NEWS MODULE - DEBUG] ${message}`, data);
        }
    }
};

export default {
    CATEGORIES,
    TOPICS,
    NEWS_STATUS,
    EVENT_STATUS,
    generateSlug,
    calculateReadingTime,
    extractKeywords,
    formatDate,
    formatTime,
    isFutureDate,
    daysUntil,
    generateSummary,
    isValidImageUrl,
    processHashtags,
    calculateEngagement,
    createResponse,
    createPagination,
    sanitizeSearchText,
    buildSearchFilters,
    buildSortOptions,
    logger
};