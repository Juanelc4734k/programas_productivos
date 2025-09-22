import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { News, Event } from './news.model.js';
import * as newsService from './news.service.js';
import { CATEGORIES, TOPICS, NEWS_STATUS, EVENT_STATUS } from './news.utils.js';

let mongoServer;

/**
 * Configuración inicial para pruebas
 */
beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
});

/**
 * Limpieza después de todas las pruebas
 */
afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

/**
 * Limpieza después de cada prueba
 */
afterEach(async () => {
    await News.deleteMany({});
    await Event.deleteMany({});
});

/**
 * Datos de prueba para noticias
 */
const sampleNews = {
    titulo: 'Noticia de prueba',
    descripcion: 'Esta es una descripción de prueba para la noticia',
    categoria: CATEGORIES.PROGRAMAS,
    fecha: new Date(),
    imagen: 'https://example.com/imagen.jpg',
    destacada: true,
    temas: [TOPICS.CAFE, TOPICS.TECNOLOGIA],
    hashtags: ['#prueba', '#noticia'],
    lugar: 'Montebello, Antioquia',
    autor: new mongoose.Types.ObjectId(),
    estado: NEWS_STATUS.PUBLISHED
};

/**
 * Datos de prueba para eventos
 */
const sampleEvent = {
    titulo: 'Evento de prueba',
    descripcion: 'Esta es una descripción de prueba para el evento',
    categoria: CATEGORIES.EVENTOS,
    fechaEvento: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 días en el futuro
    horarioEvento: {
        inicio: '09:00',
        fin: '12:00'
    },
    lugar: 'Centro Cultural, Montebello',
    participantes: {
        maximo: 50,
        registrados: []
    },
    organizador: new mongoose.Types.ObjectId(),
    estado: EVENT_STATUS.SCHEDULED
};

/**
 * Pruebas para el modelo de noticias
 */
describe('Modelo de Noticias', () => {
    test('Debe crear una noticia correctamente', async () => {
        const news = new News(sampleNews);
        const savedNews = await news.save();
        
        expect(savedNews._id).toBeDefined();
        expect(savedNews.titulo).toBe(sampleNews.titulo);
        expect(savedNews.slug).toBeDefined();
        expect(savedNews.vistas).toBe(0);
        expect(savedNews.favoritos).toEqual([]);
    });
    
    test('Debe validar campos requeridos', async () => {
        const invalidNews = new News({
            // Sin título ni descripción
            categoria: CATEGORIES.PROGRAMAS
        });
        
        await expect(invalidNews.save()).rejects.toThrow();
    });
    
    test('Debe generar slug automáticamente', async () => {
        const news = new News({
            ...sampleNews,
            titulo: 'Título con Espacios y Acentos áéíóú'
        });
        
        const savedNews = await news.save();
        expect(savedNews.slug).toBe('titulo-con-espacios-y-acentos-aeiou');
    });
    
    test('Debe incrementar vistas correctamente', async () => {
        const news = new News(sampleNews);
        await news.save();
        
        news.incrementViews();
        await news.save();
        
        const updatedNews = await News.findById(news._id);
        expect(updatedNews.vistas).toBe(1);
    });
    
    test('Debe agregar y quitar favoritos correctamente', async () => {
        const news = new News(sampleNews);
        await news.save();
        
        const userId = new mongoose.Types.ObjectId();
        
        // Agregar a favoritos
        news.toggleFavorite(userId);
        await news.save();
        
        let updatedNews = await News.findById(news._id);
        expect(updatedNews.favoritos).toContainEqual(userId);
        
        // Quitar de favoritos
        updatedNews.toggleFavorite(userId);
        await updatedNews.save();
        
        updatedNews = await News.findById(news._id);
        expect(updatedNews.favoritos).not.toContainEqual(userId);
    });
});

/**
 * Pruebas para el modelo de eventos
 */
describe('Modelo de Eventos', () => {
    test('Debe crear un evento correctamente', async () => {
        const event = new Event(sampleEvent);
        const savedEvent = await event.save();
        
        expect(savedEvent._id).toBeDefined();
        expect(savedEvent.titulo).toBe(sampleEvent.titulo);
        expect(savedEvent.slug).toBeDefined();
        expect(savedEvent.participantes.registrados).toHaveLength(0);
    });
    
    test('Debe validar campos requeridos', async () => {
        const invalidEvent = new Event({
            // Sin título ni descripción
            categoria: CATEGORIES.EVENTOS
        });
        
        await expect(invalidEvent.save()).rejects.toThrow();
    });
    
    test('Debe validar fecha futura para eventos', async () => {
        const pastEvent = new Event({
            ...sampleEvent,
            fechaEvento: new Date(Date.now() - 24 * 60 * 60 * 1000) // 1 día en el pasado
        });
        
        await expect(pastEvent.save()).rejects.toThrow();
    });
    
    test('Debe registrar participantes correctamente', async () => {
        const event = new Event(sampleEvent);
        await event.save();
        
        const userId = new mongoose.Types.ObjectId();
        const userData = {
            nombre: 'Usuario Prueba',
            email: 'usuario@test.com',
            telefono: '1234567890'
        };
        
        // Registrar participante
        event.registerParticipant(userId, userData);
        await event.save();
        
        const updatedEvent = await Event.findById(event._id);
        expect(updatedEvent.participantes.registrados).toHaveLength(1);
        expect(updatedEvent.participantes.registrados[0].usuario).toEqual(userId);
        expect(updatedEvent.participantes.registrados[0].datos.nombre).toBe(userData.nombre);
    });
    
    test('No debe permitir registros duplicados', async () => {
        const event = new Event(sampleEvent);
        await event.save();
        
        const userId = new mongoose.Types.ObjectId();
        const userData = { nombre: 'Usuario Prueba' };
        
        // Primer registro
        event.registerParticipant(userId, userData);
        await event.save();
        
        // Intento de registro duplicado
        expect(() => {
            event.registerParticipant(userId, userData);
        }).toThrow();
    });
    
    test('Debe cancelar registro correctamente', async () => {
        const event = new Event(sampleEvent);
        await event.save();
        
        const userId = new mongoose.Types.ObjectId();
        event.registerParticipant(userId, { nombre: 'Usuario Prueba' });
        await event.save();
        
        // Cancelar registro
        event.unregisterParticipant(userId);
        await event.save();
        
        const updatedEvent = await Event.findById(event._id);
        expect(updatedEvent.participantes.registrados).toHaveLength(0);
    });
});

/**
 * Pruebas para el servicio de noticias
 */
describe('Servicio de Noticias', () => {
    test('Debe crear y recuperar noticias', async () => {
        // Crear noticia
        const createdNews = await newsService.createNews({
            ...sampleNews,
            autor: sampleNews.autor.toString()
        });
        
        expect(createdNews._id).toBeDefined();
        
        // Recuperar noticia
        const retrievedNews = await newsService.getNewsById(createdNews._id);
        expect(retrievedNews.titulo).toBe(sampleNews.titulo);
    });
    
    test('Debe actualizar noticias', async () => {
        // Crear noticia
        const createdNews = await newsService.createNews({
            ...sampleNews,
            autor: sampleNews.autor.toString()
        });
        
        // Actualizar noticia
        const updatedData = {
            titulo: 'Título actualizado',
            descripcion: 'Descripción actualizada'
        };
        
        const updatedNews = await newsService.updateNews(
            createdNews._id,
            updatedData
        );
        
        expect(updatedNews.titulo).toBe(updatedData.titulo);
        expect(updatedNews.descripcion).toBe(updatedData.descripcion);
    });
    
    test('Debe eliminar noticias', async () => {
        // Crear noticia
        const createdNews = await newsService.createNews({
            ...sampleNews,
            autor: sampleNews.autor.toString()
        });
        
        // Eliminar noticia
        await newsService.deleteNews(createdNews._id);
        
        // Intentar recuperar la noticia eliminada
        await expect(newsService.getNewsById(createdNews._id))
            .rejects.toThrow();
    });
    
    test('Debe filtrar noticias correctamente', async () => {
        // Crear varias noticias
        await newsService.createNews({
            ...sampleNews,
            autor: sampleNews.autor.toString(),
            categoria: CATEGORIES.PROGRAMAS
        });
        
        await newsService.createNews({
            ...sampleNews,
            titulo: 'Otra noticia',
            autor: sampleNews.autor.toString(),
            categoria: CATEGORIES.CAPACITACIONES
        });
        
        // Filtrar por categoría
        const result = await newsService.getNews({
            categoria: CATEGORIES.PROGRAMAS
        });
        
        expect(result.noticias).toHaveLength(1);
        expect(result.noticias[0].categoria).toBe(CATEGORIES.PROGRAMAS);
    });
});

/**
 * Pruebas para el servicio de eventos
 */
describe('Servicio de Eventos', () => {
    test('Debe crear y recuperar eventos', async () => {
        // Crear evento
        const createdEvent = await newsService.createEvent({
            ...sampleEvent,
            organizador: sampleEvent.organizador.toString()
        });
        
        expect(createdEvent._id).toBeDefined();
        
        // Recuperar evento
        const retrievedEvent = await newsService.getEventById(createdEvent._id);
        expect(retrievedEvent.titulo).toBe(sampleEvent.titulo);
    });
    
    test('Debe actualizar eventos', async () => {
        // Crear evento
        const createdEvent = await newsService.createEvent({
            ...sampleEvent,
            organizador: sampleEvent.organizador.toString()
        });
        
        // Actualizar evento
        const updatedData = {
            titulo: 'Título actualizado',
            descripcion: 'Descripción actualizada'
        };
        
        const updatedEvent = await newsService.updateEvent(
            createdEvent._id,
            updatedData
        );
        
        expect(updatedEvent.titulo).toBe(updatedData.titulo);
        expect(updatedEvent.descripcion).toBe(updatedData.descripcion);
    });
    
    test('Debe registrar y cancelar participantes', async () => {
        // Crear evento
        const createdEvent = await newsService.createEvent({
            ...sampleEvent,
            organizador: sampleEvent.organizador.toString()
        });
        
        const userId = new mongoose.Types.ObjectId().toString();
        const userData = {
            nombre: 'Usuario Prueba',
            email: 'usuario@test.com'
        };
        
        // Registrar participante
        await newsService.registerForEvent(createdEvent._id, userId, userData);
        
        // Verificar registro
        let event = await newsService.getEventById(createdEvent._id);
        expect(event.participantes.registrados).toHaveLength(1);
        
        // Cancelar registro
        await newsService.unregisterFromEvent(createdEvent._id, userId);
        
        // Verificar cancelación
        event = await newsService.getEventById(createdEvent._id);
        expect(event.participantes.registrados).toHaveLength(0);
    });
    
    test('Debe obtener estadísticas correctamente', async () => {
        // Crear noticias y eventos
        await newsService.createNews({
            ...sampleNews,
            autor: sampleNews.autor.toString()
        });
        
        await newsService.createEvent({
            ...sampleEvent,
            organizador: sampleEvent.organizador.toString()
        });
        
        // Obtener estadísticas
        const stats = await newsService.getStatistics();
        
        expect(stats.totalNoticias).toBe(1);
        expect(stats.totalEventos).toBe(1);
    });
});

/**
 * Pruebas para filtros y búsqueda
 */
describe('Filtros y Búsqueda', () => {
    beforeEach(async () => {
        // Crear varias noticias para pruebas
        await newsService.createNews({
            ...sampleNews,
            titulo: 'Noticia sobre café',
            descripcion: 'Descripción sobre café',
            autor: sampleNews.autor.toString(),
            temas: [TOPICS.CAFE],
            hashtags: ['#cafe', '#agricultura']
        });
        
        await newsService.createNews({
            ...sampleNews,
            titulo: 'Noticia sobre tecnología',
            descripcion: 'Descripción sobre tecnología',
            autor: sampleNews.autor.toString(),
            temas: [TOPICS.TECNOLOGIA],
            hashtags: ['#tecnologia', '#innovacion']
        });
        
        await newsService.createNews({
            ...sampleNews,
            titulo: 'Noticia sobre ganadería',
            descripcion: 'Descripción sobre ganadería',
            autor: sampleNews.autor.toString(),
            temas: [TOPICS.GANADERIA],
            hashtags: ['#ganaderia', '#agricultura']
        });
    });
    
    test('Debe buscar por texto correctamente', async () => {
        const result = await newsService.getNews({
            busqueda: 'café'
        });
        
        expect(result.noticias).toHaveLength(1);
        expect(result.noticias[0].titulo).toContain('café');
    });
    
    test('Debe filtrar por temas correctamente', async () => {
        const result = await newsService.getNews({
            temas: [TOPICS.TECNOLOGIA]
        });
        
        expect(result.noticias).toHaveLength(1);
        expect(result.noticias[0].temas).toContain(TOPICS.TECNOLOGIA);
    });
    
    test('Debe filtrar por hashtags correctamente', async () => {
        const result = await newsService.getNews({
            busqueda: 'agricultura'
        });
        
        expect(result.noticias).toHaveLength(2);
    });
    
    test('Debe obtener filtros disponibles', async () => {
        const filters = await newsService.getFilters();
        
        expect(filters.categorias).toContain(CATEGORIES.PROGRAMAS);
        expect(filters.temas).toContain(TOPICS.CAFE);
        expect(filters.temas).toContain(TOPICS.TECNOLOGIA);
        expect(filters.temas).toContain(TOPICS.GANADERIA);
        expect(filters.hashtags).toContainEqual(expect.stringMatching(/#agricultura/));
    });
});

/**
 * Pruebas para paginación
 */
describe('Paginación', () => {
    beforeEach(async () => {
        // Crear 15 noticias para pruebas de paginación
        for (let i = 1; i <= 15; i++) {
            await newsService.createNews({
                ...sampleNews,
                titulo: `Noticia ${i}`,
                autor: sampleNews.autor.toString()
            });
        }
    });
    
    test('Debe paginar correctamente', async () => {
        // Primera página (10 elementos por defecto)
        const page1 = await newsService.getNews({
            page: 1,
            limit: 10
        });
        
        expect(page1.noticias).toHaveLength(10);
        expect(page1.pagination.currentPage).toBe(1);
        expect(page1.pagination.totalPages).toBe(2);
        expect(page1.pagination.hasNextPage).toBe(true);
        
        // Segunda página
        const page2 = await newsService.getNews({
            page: 2,
            limit: 10
        });
        
        expect(page2.noticias).toHaveLength(5);
        expect(page2.pagination.currentPage).toBe(2);
        expect(page2.pagination.hasNextPage).toBe(false);
    });
    
    test('Debe ordenar correctamente', async () => {
        // Ordenar por título ascendente
        const resultAsc = await newsService.getNews({
            sortBy: 'titulo',
            sortOrder: 'asc'
        });
        
        expect(resultAsc.noticias[0].titulo).toBe('Noticia 1');
        expect(resultAsc.noticias[9].titulo).toBe('Noticia 19'); // Noticia 19 sería la décima en orden ascendente
        
        // Ordenar por título descendente
        const resultDesc = await newsService.getNews({
            sortBy: 'titulo',
            sortOrder: 'desc'
        });
        
        expect(resultDesc.noticias[0].titulo).toBe('Noticia 9'); // Noticia 9 sería la primera en orden descendente
    });
});