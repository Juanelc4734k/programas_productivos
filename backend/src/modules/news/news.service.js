import { News, Event } from './news.model.js';
import mongoose from 'mongoose';

// ==================== SERVICIOS DE NOTICIAS ====================

/**
 * Crear una nueva noticia
 */
export const createNews = async (newsData) => {
    try {
        const news = new News(newsData);
        await news.save();
        await news.populate('autor', 'nombre email');
        return news;
    } catch (error) {
        throw new Error(`Error al crear noticia: ${error.message}`);
    }
};

/**
 * Obtener todas las noticias con filtros
 */
export const getAllNews = async (filters = {}, options = {}) => {
    try {
        const {
            categoria,
            temas,
            hashtags,
            destacada,
            autor,
            fechaDesde,
            fechaHasta,
            busqueda,
            estado = 'publicada'
        } = filters;

        const {
            page = 1,
            limit = 10,
            sortBy = 'fecha',
            sortOrder = 'desc',
            userId
        } = options;

        // Construir query
        const query = { estado };

        if (categoria) query.categoria = categoria;
        if (temas && temas.length > 0) query.temas = { $in: temas };
        if (hashtags && hashtags.length > 0) query.hashtags = { $in: hashtags };
        if (destacada !== undefined) query.destacada = destacada;
        if (autor) query.autor = autor;
        
        // Debug: Log del query construido
        console.log('Query MongoDB construido:', JSON.stringify(query, null, 2));
        
        if (fechaDesde || fechaHasta) {
            query.fecha = {};
            if (fechaDesde) query.fecha.$gte = new Date(fechaDesde);
            if (fechaHasta) query.fecha.$lte = new Date(fechaHasta);
        }

        if (busqueda) {
            query.$or = [
                { titulo: { $regex: busqueda, $options: 'i' } },
                { descripcion: { $regex: busqueda, $options: 'i' } },
                { hashtags: { $regex: busqueda, $options: 'i' } }
            ];
        }

        // Configurar ordenamiento
        const sort = {};
        sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

        // Ejecutar consulta con paginación
        const skip = (page - 1) * limit;
        
        const [news, total] = await Promise.all([
            News.find(query)
                .populate('autor', 'nombre email')
                .sort(sort)
                .skip(skip)
                .limit(parseInt(limit))
                .lean(),
            News.countDocuments(query)
        ]);

        // Agregar información de favoritos si se proporciona userId
        if (userId) {
            news.forEach(noticia => {
                noticia.esFavorito = noticia.favoritos.some(
                    fav => fav.usuario.toString() === userId.toString()
                );
            });
        }

        return {
            news,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / limit),
                totalItems: total,
                itemsPerPage: parseInt(limit)
            }
        };
    } catch (error) {
        throw new Error(`Error al obtener noticias: ${error.message}`);
    }
};

/**
 * Obtener una noticia por ID
 */
export const getNewsById = async (id, userId = null) => {
    try {
        const news = await News.findById(id)
            .populate('autor', 'nombre email')
            .lean();

        if (!news) {
            throw new Error('Noticia no encontrada');
        }

        // Agregar información de favoritos si se proporciona userId
        if (userId) {
            news.esFavorito = news.favoritos.some(
                fav => fav.usuario.toString() === userId.toString()
            );
        }

        return news;
    } catch (error) {
        throw new Error(`Error al obtener noticia: ${error.message}`);
    }
};

/**
 * Actualizar una noticia
 */
export const updateNews = async (id, updateData) => {
    try {
        const news = await News.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        ).populate('autor', 'nombre email');

        if (!news) {
            throw new Error('Noticia no encontrada');
        }

        return news;
    } catch (error) {
        throw new Error(`Error al actualizar noticia: ${error.message}`);
    }
};

/**
 * Eliminar una noticia
 */
export const deleteNews = async (id) => {
    try {
        const news = await News.findByIdAndDelete(id);
        
        if (!news) {
            throw new Error('Noticia no encontrada');
        }

        return news;
    } catch (error) {
        throw new Error(`Error al eliminar noticia: ${error.message}`);
    }
};

/**
 * Incrementar vistas de una noticia
 */
export const incrementNewsViews = async (id) => {
    try {
        const news = await News.findById(id);
        
        if (!news) {
            throw new Error('Noticia no encontrada');
        }

        await news.incrementarVistas();
        return news;
    } catch (error) {
        throw new Error(`Error al incrementar vistas: ${error.message}`);
    }
};

/**
 * Toggle favorito en noticia
 */
export const toggleNewsFavorite = async (newsId, userId) => {
    try {
        const news = await News.findById(newsId);
        
        if (!news) {
            throw new Error('Noticia no encontrada');
        }

        const result = news.toggleFavorito(userId);
        await news.save();
        
        return result;
    } catch (error) {
        throw new Error(`Error al gestionar favorito: ${error.message}`);
    }
};

/**
 * Obtener noticias favoritas de un usuario
 */
export const getUserFavoriteNews = async (userId, options = {}) => {
    try {
        const { page = 1, limit = 10 } = options;
        const skip = (page - 1) * limit;

        const [news, total] = await Promise.all([
            News.find({ 'favoritos.usuario': userId })
                .populate('autor', 'nombre email')
                .sort({ 'favoritos.fechaAgregado': -1 })
                .skip(skip)
                .limit(parseInt(limit))
                .lean(),
            News.countDocuments({ 'favoritos.usuario': userId })
        ]);

        // Marcar todas como favoritas
        news.forEach(noticia => {
            noticia.esFavorito = true;
        });

        return {
            news,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / limit),
                totalItems: total,
                itemsPerPage: parseInt(limit)
            }
        };
    } catch (error) {
        throw new Error(`Error al obtener noticias favoritas: ${error.message}`);
    }
};

// ==================== SERVICIOS DE EVENTOS ====================

/**
 * Crear un nuevo evento
 */
export const createEvent = async (eventData) => {
    try {
        const event = new Event(eventData);
        await event.save();
        await event.populate('organizador', 'nombre email');
        return event;
    } catch (error) {
        throw new Error(`Error al crear evento: ${error.message}`);
    }
};

/**
 * Obtener todos los eventos con filtros
 */
export const getAllEvents = async (filters = {}, options = {}) => {
    try {
        const {
            categoria,
            fechaDesde,
            fechaHasta,
            lugar,
            organizador,
            estado = 'programado',
            busqueda
        } = filters;

        const {
            page = 1,
            limit = 10,
            sortBy = 'fechaEvento',
            sortOrder = 'asc',
            userId
        } = options;

        // Construir query
        const query = { estado };

        if (categoria) query.categoria = categoria;
        if (organizador) query.organizador = organizador;
        if (lugar) query.lugar = { $regex: lugar, $options: 'i' };
        
        if (fechaDesde || fechaHasta) {
            query.fechaEvento = {};
            if (fechaDesde) query.fechaEvento.$gte = new Date(fechaDesde);
            if (fechaHasta) query.fechaEvento.$lte = new Date(fechaHasta);
        }

        if (busqueda) {
            query.$or = [
                { titulo: { $regex: busqueda, $options: 'i' } },
                { descripcion: { $regex: busqueda, $options: 'i' } },
                { lugar: { $regex: busqueda, $options: 'i' } }
            ];
        }

        // Configurar ordenamiento
        const sort = {};
        sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

        // Ejecutar consulta con paginación
        const skip = (page - 1) * limit;
        
        const [events, total] = await Promise.all([
            Event.find(query)
                .populate('organizador', 'nombre email')
                .populate('participantes.registrados.usuario', 'nombre email')
                .sort(sort)
                .skip(skip)
                .limit(parseInt(limit))
                .lean(),
            Event.countDocuments(query)
        ]);

        // Agregar información de favoritos y registro si se proporciona userId
        if (userId) {
            events.forEach(evento => {
                evento.esFavorito = evento.favoritos.some(
                    fav => fav.usuario.toString() === userId.toString()
                );
                evento.estaRegistrado = evento.participantes.registrados.some(
                    p => p.usuario._id.toString() === userId.toString()
                );
            });
        }

        return {
            events,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / limit),
                totalItems: total,
                itemsPerPage: parseInt(limit)
            }
        };
    } catch (error) {
        throw new Error(`Error al obtener eventos: ${error.message}`);
    }
};

/**
 * Obtener un evento por ID
 */
export const getEventById = async (id, userId = null) => {
    try {
        const event = await Event.findById(id)
            .populate('organizador', 'nombre email')
            .populate('participantes.registrados.usuario', 'nombre email')
            .lean();

        if (!event) {
            throw new Error('Evento no encontrado');
        }

        // Agregar información de favoritos y registro si se proporciona userId
        if (userId) {
            event.esFavorito = event.favoritos.some(
                fav => fav.usuario.toString() === userId.toString()
            );
            event.estaRegistrado = event.participantes.registrados.some(
                p => p.usuario._id.toString() === userId.toString()
            );
        }

        return event;
    } catch (error) {
        throw new Error(`Error al obtener evento: ${error.message}`);
    }
};

/**
 * Actualizar un evento
 */
export const updateEvent = async (id, updateData) => {
    try {
        const event = await Event.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        ).populate('organizador', 'nombre email');

        if (!event) {
            throw new Error('Evento no encontrado');
        }

        return event;
    } catch (error) {
        throw new Error(`Error al actualizar evento: ${error.message}`);
    }
};

/**
 * Eliminar un evento
 */
export const deleteEvent = async (id) => {
    try {
        const event = await Event.findByIdAndDelete(id);
        
        if (!event) {
            throw new Error('Evento no encontrado');
        }

        return event;
    } catch (error) {
        throw new Error(`Error al eliminar evento: ${error.message}`);
    }
};

/**
 * Registrar usuario en evento
 */
export const registerUserToEvent = async (eventId, userId) => {
    try {
        const event = await Event.findById(eventId);
        
        if (!event) {
            throw new Error('Evento no encontrado');
        }

        await event.registrarParticipante(userId);
        return event;
    } catch (error) {
        throw new Error(`Error al registrar en evento: ${error.message}`);
    }
};

/**
 * Toggle favorito en evento
 */
export const toggleEventFavorite = async (eventId, userId) => {
    try {
        const event = await Event.findById(eventId);
        
        if (!event) {
            throw new Error('Evento no encontrado');
        }

        const result = event.toggleFavorito(userId);
        await event.save();
        
        return result;
    } catch (error) {
        throw new Error(`Error al gestionar favorito: ${error.message}`);
    }
};

/**
 * Obtener eventos favoritos de un usuario
 */
export const getUserFavoriteEvents = async (userId, options = {}) => {
    try {
        const { page = 1, limit = 10 } = options;
        const skip = (page - 1) * limit;

        const [events, total] = await Promise.all([
            Event.find({ 'favoritos.usuario': userId })
                .populate('organizador', 'nombre email')
                .sort({ 'favoritos.fechaAgregado': -1 })
                .skip(skip)
                .limit(parseInt(limit))
                .lean(),
            Event.countDocuments({ 'favoritos.usuario': userId })
        ]);

        // Marcar todos como favoritos
        events.forEach(evento => {
            evento.esFavorito = true;
        });

        return {
            events,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / limit),
                totalItems: total,
                itemsPerPage: parseInt(limit)
            }
        };
    } catch (error) {
        throw new Error(`Error al obtener eventos favoritos: ${error.message}`);
    }
};

// ==================== SERVICIOS GENERALES ====================

/**
 * Obtener estadísticas generales
 */
export const getNewsStats = async () => {
    try {
        const [newsStats, eventStats] = await Promise.all([
            News.aggregate([
                {
                    $group: {
                        _id: null,
                        totalNoticias: { $sum: 1 },
                        totalVistas: { $sum: '$vistas' },
                        noticiasDestacadas: {
                            $sum: { $cond: ['$destacada', 1, 0] }
                        }
                    }
                }
            ]),
            Event.aggregate([
                {
                    $group: {
                        _id: null,
                        totalEventos: { $sum: 1 },
                        eventosActivos: {
                            $sum: { $cond: [{ $eq: ['$estado', 'programado'] }, 1, 0] }
                        }
                    }
                }
            ])
        ]);

        return {
            noticias: newsStats[0] || { totalNoticias: 0, totalVistas: 0, noticiasDestacadas: 0 },
            eventos: eventStats[0] || { totalEventos: 0, eventosActivos: 0 }
        };
    } catch (error) {
        throw new Error(`Error al obtener estadísticas: ${error.message}`);
    }
};

/**
 * Obtener categorías y temas disponibles
 */
export const getAvailableFilters = async () => {
    try {
        const categorias = ['Programas', 'Capacitaciones', 'Eventos', 'Convocatorias', 'Logros y Resultados'];
        const temas = ['Cafe', 'Tecnologia', 'Comercializacion', 'Ganaderia', 'Agricultura'];
        
        // Obtener hashtags más utilizados
        const hashtagsPopulares = await News.aggregate([
            { $unwind: '$hashtags' },
            { $group: { _id: '$hashtags', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 20 },
            { $project: { hashtag: '$_id', count: 1, _id: 0 } }
        ]);

        return {
            categorias,
            temas,
            hashtagsPopulares: hashtagsPopulares.map(h => h.hashtag)
        };
    } catch (error) {
        throw new Error(`Error al obtener filtros: ${error.message}`);
    }
};

export default {
    // Noticias
    createNews,
    getAllNews,
    getNewsById,
    updateNews,
    deleteNews,
    incrementNewsViews,
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