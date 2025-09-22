import express from 'express';
import rateLimit from 'express-rate-limit';
import {
    createNews,
    getAllNews,
    getNewsById,
    updateNews,
    deleteNews,
    toggleNewsFavorite,
    getUserFavoriteNews,
    createEvent,
    getAllEvents,
    getEventById,
    updateEvent,
    deleteEvent,
    registerUserToEvent,
    toggleEventFavorite,
    getUserFavoriteEvents,
    getNewsStats,
    getAvailableFilters
} from './news.controller.js';
import {
    validateCreateNews,
    validateUpdateNews,
    validateCreateEvent,
    validateUpdateEvent,
    validateId,
    validateNewsQuery,
    validateEventQuery
} from './news.validation.js';
import { protect, authorize } from '../../middlewares/auth.middleware.js';
import { handleValidationErrors, cacheControl } from './news.middleware.js';

const authenticateToken = protect;
const validateRequest = handleValidationErrors;

// Rate limiter helper function
const rateLimiter = (options) => rateLimit({
    windowMs: options.windowMs || 15 * 60 * 1000, // 15 minutes default
    max: options.max || 100, // limit each IP to 100 requests per windowMs
    message: {
        success: false,
        message: 'Demasiadas solicitudes desde esta IP, por favor intenta de nuevo más tarde.'
    },
    standardHeaders: true,
    legacyHeaders: false
});

const router = express.Router();

// ==================== RUTAS ESPECÍFICAS (DEBEN IR ANTES QUE LAS DINÁMICAS) ====================

// ==================== RUTAS DE EVENTOS ====================

/**
 * @route   GET /api/news/events
 * @desc    Obtener todos los eventos con filtros y paginación
 * @access  Public
 */
router.get(
    '/events',
    rateLimiter({ windowMs: 15 * 60 * 1000, max: 100 }), // 100 requests per 15 minutes
    cacheControl(300), // 5 minutos de cache
    validateEventQuery,
    validateRequest,
    getAllEvents
);

/**
 * @route   GET /api/news/events/:id
 * @desc    Obtener un evento por ID
 * @access  Public
 */
router.get(
    '/events/:id',
    rateLimiter({ windowMs: 15 * 60 * 1000, max: 200 }), // 200 requests per 15 minutes
    validateId,
    validateRequest,
    getEventById
);

/**
 * @route   POST /api/news/events
 * @desc    Crear un nuevo evento
 * @access  Private (Admin/Editor)
 */
router.post(
    '/events',
    authenticateToken,
    rateLimiter({ windowMs: 15 * 60 * 1000, max: 20 }), // 20 requests per 15 minutes
    validateCreateEvent,
    validateRequest,
    createEvent
);

/**
 * @route   PUT /api/news/events/:id
 * @desc    Actualizar un evento
 * @access  Private (Admin/Editor)
 */
router.put(
    '/events/:id',
    authenticateToken,
    rateLimiter({ windowMs: 15 * 60 * 1000, max: 30 }), // 30 requests per 15 minutes
    validateUpdateEvent,
    validateRequest,
    updateEvent
);

/**
 * @route   DELETE /api/news/events/:id
 * @desc    Eliminar un evento
 * @access  Private (Admin)
 */
router.delete(
    '/events/:id',
    authenticateToken,
    rateLimiter({ windowMs: 15 * 60 * 1000, max: 10 }), // 10 requests per 15 minutes
    validateId,
    validateRequest,
    deleteEvent
);

/**
 * @route   POST /api/news/events/:id/register
 * @desc    Registrarse para un evento
 * @access  Private
 */
router.post(
    '/events/:id/register',
    authenticateToken,
    rateLimiter({ windowMs: 15 * 60 * 1000, max: 30 }), // 30 requests per 15 minutes
    validateId,
    validateRequest,
    registerUserToEvent
);

/**
 * @route   POST /api/news/events/:id/favorite
 * @desc    Agregar/quitar evento de favoritos
 * @access  Private
 */
router.post(
    '/events/:id/favorite',
    authenticateToken,
    rateLimiter({ windowMs: 15 * 60 * 1000, max: 50 }), // 50 requests per 15 minutes
    validateId,
    validateRequest,
    toggleEventFavorite
);

/**
 * @route   GET /api/news/events/favorites
 * @desc    Obtener eventos favoritos del usuario
 * @access  Private
 */
router.get(
    '/events/favorites',
    authenticateToken,
    rateLimiter({ windowMs: 15 * 60 * 1000, max: 100 }), // 100 requests per 15 minutes
    getUserFavoriteEvents
);

// ==================== RUTAS DE ESTADÍSTICAS Y FILTROS ====================

/**
 * @route   GET /api/news/admin/statistics
 * @desc    Obtener estadísticas generales
 * @access  Private (Admin)
 */
router.get(
    '/admin/statistics',
    authenticateToken,
    rateLimiter({ windowMs: 15 * 60 * 1000, max: 20 }), // 20 requests per 15 minutes
    getNewsStats
);

/**
 * @route   GET /api/news/filters
 * @desc    Obtener filtros disponibles (categorías, temas, hashtags)
 * @access  Public
 */
router.get(
    '/filters',
    rateLimiter({ windowMs: 15 * 60 * 1000, max: 100 }), // 100 requests per 15 minutes
    getAvailableFilters
);

// ==================== RUTAS DE NOTICIAS (DINÁMICAS) ====================

/**
 * @route   GET /api/news
 * @desc    Obtener todas las noticias con filtros y paginación
 * @access  Public
 */
router.get(
    '/',
    rateLimiter({ windowMs: 15 * 60 * 1000, max: 100 }), // 100 requests per 15 minutes
    validateNewsQuery,
    validateRequest,
    getAllNews
);

/**
 * @route   GET /api/news/:id
 * @desc    Obtener una noticia por ID
 * @access  Public
 */
router.get(
    '/:id',
    rateLimiter({ windowMs: 15 * 60 * 1000, max: 200 }), // 200 requests per 15 minutes
    validateId,
    validateRequest,
    getNewsById
);

/**
 * @route   POST /api/news
 * @desc    Crear una nueva noticia
 * @access  Private (Admin/Editor)
 */
router.post(
    '/',
    authenticateToken,
    rateLimiter({ windowMs: 15 * 60 * 1000, max: 20 }), // 20 requests per 15 minutes
    validateCreateNews,
    validateRequest,
    createNews
);

/**
 * @route   PUT /api/news/:id
 * @desc    Actualizar una noticia
 * @access  Private (Admin/Editor)
 */
router.put(
    '/:id',
    authenticateToken,
    rateLimiter({ windowMs: 15 * 60 * 1000, max: 30 }), // 30 requests per 15 minutes
    validateUpdateNews,
    validateRequest,
    updateNews
);

/**
 * @route   DELETE /api/news/:id
 * @desc    Eliminar una noticia
 * @access  Private (Admin)
 */
router.delete(
    '/:id',
    authenticateToken,
    rateLimiter({ windowMs: 15 * 60 * 1000, max: 10 }), // 10 requests per 15 minutes
    validateId,
    validateRequest,
    deleteNews
);

/**
 * @route   POST /api/news/:id/favorite
 * @desc    Agregar/quitar noticia de favoritos
 * @access  Private
 */
router.post(
    '/:id/favorite',
    authenticateToken,
    rateLimiter({ windowMs: 15 * 60 * 1000, max: 50 }), // 50 requests per 15 minutes
    validateId,
    validateRequest,
    toggleNewsFavorite
);

/**
 * @route   POST /api/news/:id/view
 * @desc    Incrementar vistas de una noticia
 * @access  Public
 */
router.get(
    '/:id/view',
    authenticateToken,
    rateLimiter({ windowMs: 15 * 60 * 1000, max: 100 }), // 100 requests per 15 minutes
    getUserFavoriteNews
);



// ==================== MIDDLEWARE DE MANEJO DE ERRORES ====================

/**
 * Middleware para manejar errores específicos del módulo de noticias
 */
router.use((error, req, res, next) => {
    console.error('Error en módulo de noticias:', error);
    
    // Error de validación de Mongoose
    if (error.name === 'ValidationError') {
        const errors = Object.values(error.errors).map(err => err.message);
        return res.status(400).json({
            success: false,
            message: 'Error de validación',
            errors
        });
    }
    
    // Error de cast de Mongoose (ID inválido)
    if (error.name === 'CastError') {
        return res.status(400).json({
            success: false,
            message: 'ID inválido'
        });
    }
    
    // Error de duplicado (índice único)
    if (error.code === 11000) {
        const field = Object.keys(error.keyValue)[0];
        return res.status(400).json({
            success: false,
            message: `Ya existe un registro con ese ${field}`
        });
    }
    
    // Error de límite de tamaño
    if (error.type === 'entity.too.large') {
        return res.status(413).json({
            success: false,
            message: 'El archivo es demasiado grande'
        });
    }
    
    // Error genérico
    res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        ...(process.env.NODE_ENV === 'development' && { error: error.message })
    });
});

export default router;

/**
 * @swagger
 * components:
 *   schemas:
 *     News:
 *       type: object
 *       required:
 *         - titulo
 *         - descripcion
 *         - categoria
 *       properties:
 *         titulo:
 *           type: string
 *           description: Título de la noticia
 *         descripcion:
 *           type: string
 *           description: Descripción de la noticia
 *         categoria:
 *           type: string
 *           enum: [Programas, Capacitaciones, Eventos, Convocatorias, Logros y Resultados]
 *         fecha:
 *           type: string
 *           format: date
 *         imagen:
 *           type: string
 *           format: uri
 *         destacada:
 *           type: boolean
 *         temas:
 *           type: array
 *           items:
 *             type: string
 *             enum: [Cafe, Tecnologia, Comercializacion, Ganaderia, Agricultura]
 *         hashtags:
 *           type: array
 *           items:
 *             type: string
 *         lugar:
 *           type: string
 *         estado:
 *           type: string
 *           enum: [borrador, publicada, archivada]
 *     
 *     Event:
 *       type: object
 *       required:
 *         - titulo
 *         - descripcion
 *         - categoria
 *         - fechaEvento
 *         - horarioEvento
 *         - lugar
 *       properties:
 *         titulo:
 *           type: string
 *         descripcion:
 *           type: string
 *         categoria:
 *           type: string
 *           enum: [Programas, Capacitaciones, Eventos, Convocatorias, Logros y Resultados]
 *         fechaEvento:
 *           type: string
 *           format: date
 *         horarioEvento:
 *           type: object
 *           properties:
 *             inicio:
 *               type: string
 *               pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$'
 *             fin:
 *               type: string
 *               pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$'
 *         lugar:
 *           type: string
 *         participantes:
 *           type: object
 *           properties:
 *             maximo:
 *               type: integer
 *             registrados:
 *               type: array
 *               items:
 *                 type: string
 *         organizador:
 *           type: string
 *         estado:
 *           type: string
 *           enum: [programado, en_curso, finalizado, cancelado]
 */