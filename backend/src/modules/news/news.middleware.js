import { News, Event } from './news.model.js';
import { validationResult } from 'express-validator';

/**
 * Middleware para verificar si el usuario es propietario de la noticia o tiene permisos de admin
 */
export const checkNewsOwnership = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const userRole = req.user.role;
        
        // Los administradores pueden editar cualquier noticia
        if (userRole === 'admin' || userRole === 'editor') {
            return next();
        }
        
        const news = await News.findById(id);
        if (!news) {
            return res.status(404).json({
                success: false,
                message: 'Noticia no encontrada'
            });
        }
        
        // Verificar si el usuario es el autor
        if (news.autor.toString() !== userId) {
            return res.status(403).json({
                success: false,
                message: 'No tienes permisos para modificar esta noticia'
            });
        }
        
        req.news = news;
        next();
    } catch (error) {
        console.error('Error en checkNewsOwnership:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};

/**
 * Middleware para verificar si el usuario es propietario del evento o tiene permisos de admin
 */
export const checkEventOwnership = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const userRole = req.user.role;
        
        // Los administradores pueden editar cualquier evento
        if (userRole === 'admin' || userRole === 'editor') {
            return next();
        }
        
        const event = await Event.findById(id);
        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Evento no encontrado'
            });
        }
        
        // Verificar si el usuario es el organizador
        if (event.organizador.toString() !== userId) {
            return res.status(403).json({
                success: false,
                message: 'No tienes permisos para modificar este evento'
            });
        }
        
        req.event = event;
        next();
    } catch (error) {
        console.error('Error en checkEventOwnership:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};

/**
 * Middleware para verificar permisos de administrador
 */
export const requireAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Acceso denegado. Se requieren permisos de administrador'
        });
    }
    next();
};

/**
 * Middleware para verificar permisos de editor o administrador
 */
export const requireEditor = (req, res, next) => {
    if (req.user.role !== 'admin' && req.user.role !== 'editor') {
        return res.status(403).json({
            success: false,
            message: 'Acceso denegado. Se requieren permisos de editor o administrador'
        });
    }
    next();
};

/**
 * Middleware para verificar si un evento permite registros
 */
export const checkEventRegistration = async (req, res, next) => {
    try {
        const { id } = req.params;
        const event = await Event.findById(id);
        
        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Evento no encontrado'
            });
        }
        
        // Verificar si el evento está en estado que permite registros
        if (event.estado !== 'programado') {
            return res.status(400).json({
                success: false,
                message: 'No se puede registrar para este evento. Estado actual: ' + event.estado
            });
        }
        
        // Verificar si el evento ya pasó
        if (new Date(event.fechaEvento) < new Date()) {
            return res.status(400).json({
                success: false,
                message: 'No se puede registrar para un evento que ya pasó'
            });
        }
        
        // Verificar si hay cupos disponibles
        if (event.participantes.maximo && 
            event.participantes.registrados.length >= event.participantes.maximo) {
            return res.status(400).json({
                success: false,
                message: 'El evento ha alcanzado el máximo de participantes'
            });
        }
        
        req.event = event;
        next();
    } catch (error) {
        console.error('Error en checkEventRegistration:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};

/**
 * Middleware para verificar si el usuario ya está registrado en un evento
 */
export const checkAlreadyRegistered = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        
        const event = await Event.findById(id);
        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Evento no encontrado'
            });
        }
        
        const isRegistered = event.participantes.registrados.some(
            participant => participant.usuario.toString() === userId
        );
        
        if (isRegistered) {
            return res.status(400).json({
                success: false,
                message: 'Ya estás registrado en este evento'
            });
        }
        
        req.event = event;
        next();
    } catch (error) {
        console.error('Error en checkAlreadyRegistered:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};

/**
 * Middleware para verificar si el usuario está registrado en un evento (para cancelar registro)
 */
export const checkIsRegistered = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        
        const event = await Event.findById(id);
        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Evento no encontrado'
            });
        }
        
        const isRegistered = event.participantes.registrados.some(
            participant => participant.usuario.toString() === userId
        );
        
        if (!isRegistered) {
            return res.status(400).json({
                success: false,
                message: 'No estás registrado en este evento'
            });
        }
        
        req.event = event;
        next();
    } catch (error) {
        console.error('Error en checkIsRegistered:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};

/**
 * Middleware para sanitizar y procesar datos de entrada
 */
export const sanitizeNewsData = (req, res, next) => {
    if (req.body.titulo) {
        req.body.titulo = req.body.titulo.trim();
    }
    
    if (req.body.descripcion) {
        req.body.descripcion = req.body.descripcion.trim();
    }
    
    if (req.body.lugar) {
        req.body.lugar = req.body.lugar.trim();
    }
    
    // Procesar hashtags
    if (req.body.hashtags && Array.isArray(req.body.hashtags)) {
        req.body.hashtags = req.body.hashtags
            .map(tag => tag.trim().toLowerCase())
            .filter(tag => tag.length > 0)
            .map(tag => tag.startsWith('#') ? tag : `#${tag}`);
    }
    
    // Procesar temas
    if (req.body.temas && Array.isArray(req.body.temas)) {
        req.body.temas = [...new Set(req.body.temas)]; // Eliminar duplicados
    }
    
    next();
};

/**
 * Middleware para sanitizar y procesar datos de eventos
 */
export const sanitizeEventData = (req, res, next) => {
    if (req.body.titulo) {
        req.body.titulo = req.body.titulo.trim();
    }
    
    if (req.body.descripcion) {
        req.body.descripcion = req.body.descripcion.trim();
    }
    
    if (req.body.lugar) {
        req.body.lugar = req.body.lugar.trim();
    }
    
    // Procesar requisitos
    if (req.body.requisitos && Array.isArray(req.body.requisitos)) {
        req.body.requisitos = req.body.requisitos
            .map(req => req.trim())
            .filter(req => req.length > 0);
    }
    
    // Procesar materiales
    if (req.body.materiales && Array.isArray(req.body.materiales)) {
        req.body.materiales = req.body.materiales
            .map(mat => mat.trim())
            .filter(mat => mat.length > 0);
    }
    
    next();
};

/**
 * Middleware para logging de actividades
 */
export const logActivity = (action) => {
    return (req, res, next) => {
        const originalSend = res.send;
        
        res.send = function(data) {
            // Log solo si la operación fue exitosa
            if (res.statusCode >= 200 && res.statusCode < 300) {
                console.log(`[NEWS MODULE] ${action}:`, {
                    user: req.user?.id || 'anonymous',
                    ip: req.ip,
                    userAgent: req.get('User-Agent'),
                    timestamp: new Date().toISOString(),
                    params: req.params,
                    query: req.query
                });
            }
            
            originalSend.call(this, data);
        };
        
        next();
    };
};

/**
 * Middleware para cache de respuestas públicas
 */
export const cacheControl = (maxAge = 300) => { // 5 minutos por defecto
    return (req, res, next) => {
        // Solo aplicar cache a métodos GET
        if (req.method === 'GET') {
            res.set('Cache-Control', `public, max-age=${maxAge}`);
        }
        next();
    };
};

/**
 * Middleware para manejar errores de validación
 */
export const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Errores de validación',
            errors: errors.array().map(error => ({
                field: error.path,
                message: error.msg,
                value: error.value
            }))
        });
    }
    
    next();
};

export default {
    checkNewsOwnership,
    checkEventOwnership,
    requireAdmin,
    requireEditor,
    checkEventRegistration,
    checkAlreadyRegistered,
    checkIsRegistered,
    sanitizeNewsData,
    sanitizeEventData,
    logActivity,
    cacheControl,
    handleValidationErrors
};