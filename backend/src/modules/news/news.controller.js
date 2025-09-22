import * as newsService from './news.service.js';
import { validationResult } from 'express-validator';

// ==================== CONTROLADORES DE NOTICIAS ====================

/**
 * Crear una nueva noticia
 * POST /api/news
 */
export const createNews = async (req, res) => {
    try {
        // Validar errores de entrada
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Datos de entrada inválidos',
                errors: errors.array()
            });
        }

        const newsData = {
            ...req.body,
            autor: req.user.id // Obtener del token de autenticación
        };

        const news = await newsService.createNews(newsData);

        res.status(201).json({
            success: true,
            message: 'Noticia creada exitosamente',
            data: news
        });
    } catch (error) {
        console.error('Error en createNews:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error interno del servidor'
        });
    }
};

/**
 * Obtener todas las noticias
 * GET /api/news
 */
export const getAllNews = async (req, res) => {
    try {
        const filters = {
            categoria: req.query.categoria,
            temas: req.query.temas ? req.query.temas.split(',') : undefined,
            hashtags: req.query.hashtags ? req.query.hashtags.split(',') : undefined,
            destacada: req.query.destacada !== undefined ? req.query.destacada === 'true' : undefined,
            autor: req.query.autor,
            fechaDesde: req.query.fechaDesde,
            fechaHasta: req.query.fechaHasta,
            busqueda: req.query.busqueda,
            estado: req.query.estado || 'publicada'
        };

        const options = {
            page: req.query.page || 1,
            limit: req.query.limit || 10,
            sortBy: req.query.sortBy || 'fecha',
            sortOrder: req.query.sortOrder || 'desc',
            userId: req.user?.id // Para verificar favoritos
        };

        // Debug logs
        console.log('Filters aplicados:', JSON.stringify(filters, null, 2));
        console.log('Options:', JSON.stringify(options, null, 2));
        
        const result = await newsService.getAllNews(filters, options);
        
        console.log('Resultado del servicio:', {
            newsCount: result.news?.length || 0,
            pagination: result.pagination
        });

        res.status(200).json({
            success: true,
            message: 'Noticias obtenidas exitosamente',
            data: result.news,
            pagination: result.pagination
        });
    } catch (error) {
        console.error('Error en getAllNews:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error interno del servidor'
        });
    }
};

/**
 * Obtener una noticia por ID
 * GET /api/news/:id
 */
export const getNewsById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;

        const news = await newsService.getNewsById(id, userId);

        // Incrementar vistas si no es el autor
        if (!userId || news.autor._id.toString() !== userId.toString()) {
            await newsService.incrementNewsViews(id);
        }

        res.status(200).json({
            success: true,
            message: 'Noticia obtenida exitosamente',
            data: news
        });
    } catch (error) {
        console.error('Error en getNewsById:', error);
        const statusCode = error.message.includes('no encontrada') ? 404 : 500;
        res.status(statusCode).json({
            success: false,
            message: error.message || 'Error interno del servidor'
        });
    }
};

/**
 * Actualizar una noticia
 * PUT /api/news/:id
 */
export const updateNews = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Datos de entrada inválidos',
                errors: errors.array()
            });
        }

        const { id } = req.params;
        const updateData = req.body;

        // Verificar que el usuario sea el autor o tenga permisos de admin
        const existingNews = await newsService.getNewsById(id);
        if (existingNews.autor._id.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'No tienes permisos para actualizar esta noticia'
            });
        }

        const news = await newsService.updateNews(id, updateData);

        res.status(200).json({
            success: true,
            message: 'Noticia actualizada exitosamente',
            data: news
        });
    } catch (error) {
        console.error('Error en updateNews:', error);
        const statusCode = error.message.includes('no encontrada') ? 404 : 500;
        res.status(statusCode).json({
            success: false,
            message: error.message || 'Error interno del servidor'
        });
    }
};

/**
 * Eliminar una noticia
 * DELETE /api/news/:id
 */
export const deleteNews = async (req, res) => {
    try {
        const { id } = req.params;

        // Verificar que el usuario sea el autor o tenga permisos de admin
        const existingNews = await newsService.getNewsById(id);
        if (existingNews.autor._id.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'No tienes permisos para eliminar esta noticia'
            });
        }

        await newsService.deleteNews(id);

        res.status(200).json({
            success: true,
            message: 'Noticia eliminada exitosamente'
        });
    } catch (error) {
        console.error('Error en deleteNews:', error);
        const statusCode = error.message.includes('no encontrada') ? 404 : 500;
        res.status(statusCode).json({
            success: false,
            message: error.message || 'Error interno del servidor'
        });
    }
};

/**
 * Toggle favorito en noticia
 * POST /api/news/:id/favorite
 */
export const toggleNewsFavorite = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const result = await newsService.toggleNewsFavorite(id, userId);

        res.status(200).json({
            success: true,
            message: result.agregado ? 'Noticia agregada a favoritos' : 'Noticia removida de favoritos',
            data: {
                esFavorito: result.agregado,
                totalFavoritos: result.total
            }
        });
    } catch (error) {
        console.error('Error en toggleNewsFavorite:', error);
        const statusCode = error.message.includes('no encontrada') ? 404 : 500;
        res.status(statusCode).json({
            success: false,
            message: error.message || 'Error interno del servidor'
        });
    }
};

/**
 * Obtener noticias favoritas del usuario
 * GET /api/news/favorites
 */
export const getUserFavoriteNews = async (req, res) => {
    try {
        const userId = req.user.id;
        const options = {
            page: req.query.page || 1,
            limit: req.query.limit || 10
        };

        const result = await newsService.getUserFavoriteNews(userId, options);

        res.status(200).json({
            success: true,
            message: 'Noticias favoritas obtenidas exitosamente',
            data: result.news,
            pagination: result.pagination
        });
    } catch (error) {
        console.error('Error en getUserFavoriteNews:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error interno del servidor'
        });
    }
};

// ==================== CONTROLADORES DE EVENTOS ====================

/**
 * Crear un nuevo evento
 * POST /api/events
 */
export const createEvent = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Datos de entrada inválidos',
                errors: errors.array()
            });
        }

        const eventData = {
            ...req.body,
            organizador: req.user.id
        };

        const event = await newsService.createEvent(eventData);

        res.status(201).json({
            success: true,
            message: 'Evento creado exitosamente',
            data: event
        });
    } catch (error) {
        console.error('Error en createEvent:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error interno del servidor'
        });
    }
};

/**
 * Obtener todos los eventos
 * GET /api/events
 */
export const getAllEvents = async (req, res) => {
    try {
        const filters = {
            categoria: req.query.categoria,
            fechaDesde: req.query.fechaDesde,
            fechaHasta: req.query.fechaHasta,
            lugar: req.query.lugar,
            organizador: req.query.organizador,
            estado: req.query.estado || 'programado',
            busqueda: req.query.busqueda
        };

        const options = {
            page: req.query.page || 1,
            limit: req.query.limit || 10,
            sortBy: req.query.sortBy || 'fechaEvento',
            sortOrder: req.query.sortOrder || 'asc',
            userId: req.user?.id
        };

        const result = await newsService.getAllEvents(filters, options);

        res.status(200).json({
            success: true,
            message: 'Eventos obtenidos exitosamente',
            data: result.events,
            pagination: result.pagination
        });
    } catch (error) {
        console.error('Error en getAllEvents:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error interno del servidor'
        });
    }
};

/**
 * Obtener un evento por ID
 * GET /api/events/:id
 */
export const getEventById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;

        const event = await newsService.getEventById(id, userId);

        res.status(200).json({
            success: true,
            message: 'Evento obtenido exitosamente',
            data: event
        });
    } catch (error) {
        console.error('Error en getEventById:', error);
        const statusCode = error.message.includes('no encontrado') ? 404 : 500;
        res.status(statusCode).json({
            success: false,
            message: error.message || 'Error interno del servidor'
        });
    }
};

/**
 * Actualizar un evento
 * PUT /api/events/:id
 */
export const updateEvent = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Datos de entrada inválidos',
                errors: errors.array()
            });
        }

        const { id } = req.params;
        const updateData = req.body;

        // Verificar que el usuario sea el organizador o tenga permisos de admin
        const existingEvent = await newsService.getEventById(id);
        if (existingEvent.organizador._id.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'No tienes permisos para actualizar este evento'
            });
        }

        const event = await newsService.updateEvent(id, updateData);

        res.status(200).json({
            success: true,
            message: 'Evento actualizado exitosamente',
            data: event
        });
    } catch (error) {
        console.error('Error en updateEvent:', error);
        const statusCode = error.message.includes('no encontrado') ? 404 : 500;
        res.status(statusCode).json({
            success: false,
            message: error.message || 'Error interno del servidor'
        });
    }
};

/**
 * Eliminar un evento
 * DELETE /api/events/:id
 */
export const deleteEvent = async (req, res) => {
    try {
        const { id } = req.params;

        // Verificar que el usuario sea el organizador o tenga permisos de admin
        const existingEvent = await newsService.getEventById(id);
        if (existingEvent.organizador._id.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'No tienes permisos para eliminar este evento'
            });
        }

        await newsService.deleteEvent(id);

        res.status(200).json({
            success: true,
            message: 'Evento eliminado exitosamente'
        });
    } catch (error) {
        console.error('Error en deleteEvent:', error);
        const statusCode = error.message.includes('no encontrado') ? 404 : 500;
        res.status(statusCode).json({
            success: false,
            message: error.message || 'Error interno del servidor'
        });
    }
};

/**
 * Registrar usuario en evento
 * POST /api/events/:id/register
 */
export const registerUserToEvent = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const event = await newsService.registerUserToEvent(id, userId);

        res.status(200).json({
            success: true,
            message: 'Registrado en el evento exitosamente',
            data: {
                totalParticipantes: event.totalParticipantes,
                lugaresDisponibles: event.lugaresDisponibles
            }
        });
    } catch (error) {
        console.error('Error en registerUserToEvent:', error);
        let statusCode = 500;
        if (error.message.includes('no encontrado')) statusCode = 404;
        if (error.message.includes('ya está registrado') || error.message.includes('máximo de participantes')) {
            statusCode = 400;
        }
        
        res.status(statusCode).json({
            success: false,
            message: error.message || 'Error interno del servidor'
        });
    }
};

/**
 * Toggle favorito en evento
 * POST /api/events/:id/favorite
 */
export const toggleEventFavorite = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const result = await newsService.toggleEventFavorite(id, userId);

        res.status(200).json({
            success: true,
            message: result.agregado ? 'Evento agregado a favoritos' : 'Evento removido de favoritos',
            data: {
                esFavorito: result.agregado,
                totalFavoritos: result.total
            }
        });
    } catch (error) {
        console.error('Error en toggleEventFavorite:', error);
        const statusCode = error.message.includes('no encontrado') ? 404 : 500;
        res.status(statusCode).json({
            success: false,
            message: error.message || 'Error interno del servidor'
        });
    }
};

/**
 * Obtener eventos favoritos del usuario
 * GET /api/events/favorites
 */
export const getUserFavoriteEvents = async (req, res) => {
    try {
        const userId = req.user.id;
        const options = {
            page: req.query.page || 1,
            limit: req.query.limit || 10
        };

        const result = await newsService.getUserFavoriteEvents(userId, options);

        res.status(200).json({
            success: true,
            message: 'Eventos favoritos obtenidos exitosamente',
            data: result.events,
            pagination: result.pagination
        });
    } catch (error) {
        console.error('Error en getUserFavoriteEvents:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error interno del servidor'
        });
    }
};

// ==================== CONTROLADORES GENERALES ====================

/**
 * Obtener estadísticas generales
 * GET /api/news/stats
 */
export const getNewsStats = async (req, res) => {
    try {
        const stats = await newsService.getNewsStats();

        res.status(200).json({
            success: true,
            message: 'Estadísticas obtenidas exitosamente',
            data: stats
        });
    } catch (error) {
        console.error('Error en getNewsStats:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error interno del servidor'
        });
    }
};

/**
 * Obtener filtros disponibles
 * GET /api/news/filters
 */
export const getAvailableFilters = async (req, res) => {
    try {
        const filters = await newsService.getAvailableFilters();

        res.status(200).json({
            success: true,
            message: 'Filtros obtenidos exitosamente',
            data: filters
        });
    } catch (error) {
        console.error('Error en getAvailableFilters:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error interno del servidor'
        });
    }
};

export default {
    // Noticias
    createNews,
    getAllNews,
    getNewsById,
    updateNews,
    deleteNews,
    toggleNewsFavorite,
    getUserFavoriteNews,
    
    // Eventos
    createEvent,
    getAllEvents,
    getEventById,
    updateEvent,
    deleteEvent,
    registerUserToEvent,
    toggleEventFavorite,
    getUserFavoriteEvents,
    
    // Generales
    getNewsStats,
    getAvailableFilters
};