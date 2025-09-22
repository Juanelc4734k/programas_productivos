import { body, param, query } from 'express-validator';

// ==================== VALIDACIONES PARA NOTICIAS ====================

/**
 * Validaciones para crear noticia
 */
export const validateCreateNews = [
    body('titulo')
        .notEmpty()
        .withMessage('El título es requerido')
        .isLength({ min: 5, max: 200 })
        .withMessage('El título debe tener entre 5 y 200 caracteres')
        .trim(),
    
    body('descripcion')
        .notEmpty()
        .withMessage('La descripción es requerida')
        .isLength({ min: 10 })
        .withMessage('La descripción debe tener al menos 10 caracteres')
        .trim(),
    
    body('categoria')
        .notEmpty()
        .withMessage('La categoría es requerida')
        .isIn(['Programas', 'Capacitaciones', 'Eventos', 'Convocatorias', 'Logros y Resultados'])
        .withMessage('Categoría inválida'),
    
    body('fecha')
        .optional()
        .isISO8601()
        .withMessage('Formato de fecha inválido')
        .toDate(),
    
    body('imagen')
        .optional()
        .isURL()
        .withMessage('La imagen debe ser una URL válida'),
    
    body('destacada')
        .optional()
        .isBoolean()
        .withMessage('Destacada debe ser verdadero o falso')
        .toBoolean(),
    
    body('temas')
        .optional()
        .isArray()
        .withMessage('Los temas deben ser un array')
        .custom((temas) => {
            const temasValidos = ['Cafe', 'Tecnologia', 'Comercializacion', 'Ganaderia', 'Agricultura'];
            const temasInvalidos = temas.filter(tema => !temasValidos.includes(tema));
            if (temasInvalidos.length > 0) {
                throw new Error(`Temas inválidos: ${temasInvalidos.join(', ')}`);
            }
            return true;
        }),
    
    body('hashtags')
        .optional()
        .isArray()
        .withMessage('Los hashtags deben ser un array')
        .custom((hashtags) => {
            if (hashtags.some(tag => typeof tag !== 'string' || tag.length > 50)) {
                throw new Error('Cada hashtag debe ser una cadena de máximo 50 caracteres');
            }
            return true;
        }),
    
    body('lugar')
        .optional()
        .isLength({ max: 100 })
        .withMessage('El lugar no puede exceder 100 caracteres')
        .trim(),
    
    body('estado')
        .optional()
        .isIn(['borrador', 'publicada', 'archivada'])
        .withMessage('Estado inválido'),
    
    body('metadatos.resumen')
        .optional()
        .isLength({ max: 500 })
        .withMessage('El resumen no puede exceder 500 caracteres')
        .trim(),
    
    body('metadatos.palabrasClave')
        .optional()
        .isArray()
        .withMessage('Las palabras clave deben ser un array'),
    
    body('metadatos.tiempoLectura')
        .optional()
        .isInt({ min: 1, max: 60 })
        .withMessage('El tiempo de lectura debe ser entre 1 y 60 minutos')
        .toInt()
];

/**
 * Validaciones para actualizar noticia
 */
export const validateUpdateNews = [
    param('id')
        .isMongoId()
        .withMessage('ID de noticia inválido'),
    
    body('titulo')
        .optional()
        .isLength({ min: 5, max: 200 })
        .withMessage('El título debe tener entre 5 y 200 caracteres')
        .trim(),
    
    body('descripcion')
        .optional()
        .isLength({ min: 10 })
        .withMessage('La descripción debe tener al menos 10 caracteres')
        .trim(),
    
    body('categoria')
        .optional()
        .isIn(['Programas', 'Capacitaciones', 'Eventos', 'Convocatorias', 'Logros y Resultados'])
        .withMessage('Categoría inválida'),
    
    body('fecha')
        .optional()
        .isISO8601()
        .withMessage('Formato de fecha inválido')
        .toDate(),
    
    body('imagen')
        .optional()
        .isURL()
        .withMessage('La imagen debe ser una URL válida'),
    
    body('destacada')
        .optional()
        .isBoolean()
        .withMessage('Destacada debe ser verdadero o falso')
        .toBoolean(),
    
    body('temas')
        .optional()
        .isArray()
        .withMessage('Los temas deben ser un array')
        .custom((temas) => {
            const temasValidos = ['Cafe', 'Tecnologia', 'Comercializacion', 'Ganaderia', 'Agricultura'];
            const temasInvalidos = temas.filter(tema => !temasValidos.includes(tema));
            if (temasInvalidos.length > 0) {
                throw new Error(`Temas inválidos: ${temasInvalidos.join(', ')}`);
            }
            return true;
        }),
    
    body('hashtags')
        .optional()
        .isArray()
        .withMessage('Los hashtags deben ser un array')
        .custom((hashtags) => {
            if (hashtags.some(tag => typeof tag !== 'string' || tag.length > 50)) {
                throw new Error('Cada hashtag debe ser una cadena de máximo 50 caracteres');
            }
            return true;
        }),
    
    body('lugar')
        .optional()
        .isLength({ max: 100 })
        .withMessage('El lugar no puede exceder 100 caracteres')
        .trim(),
    
    body('estado')
        .optional()
        .isIn(['borrador', 'publicada', 'archivada'])
        .withMessage('Estado inválido')
];

// ==================== VALIDACIONES PARA EVENTOS ====================

/**
 * Validaciones para crear evento
 */
export const validateCreateEvent = [
    body('titulo')
        .notEmpty()
        .withMessage('El título es requerido')
        .isLength({ min: 5, max: 200 })
        .withMessage('El título debe tener entre 5 y 200 caracteres')
        .trim(),
    
    body('descripcion')
        .notEmpty()
        .withMessage('La descripción es requerida')
        .isLength({ min: 10 })
        .withMessage('La descripción debe tener al menos 10 caracteres')
        .trim(),
    
    body('categoria')
        .notEmpty()
        .withMessage('La categoría es requerida')
        .isIn(['Programas', 'Capacitaciones', 'Eventos', 'Convocatorias', 'Logros y Resultados'])
        .withMessage('Categoría inválida'),
    
    body('fechaEvento')
        .notEmpty()
        .withMessage('La fecha del evento es requerida')
        .isISO8601()
        .withMessage('Formato de fecha inválido')
        .custom((fecha) => {
            const fechaEvento = new Date(fecha);
            const ahora = new Date();
            if (fechaEvento <= ahora) {
                throw new Error('La fecha del evento debe ser futura');
            }
            return true;
        })
        .toDate(),
    
    body('horarioEvento.inicio')
        .notEmpty()
        .withMessage('La hora de inicio es requerida')
        .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
        .withMessage('Formato de hora inválido (HH:MM)'),
    
    body('horarioEvento.fin')
        .optional()
        .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
        .withMessage('Formato de hora inválido (HH:MM)')
        .custom((fin, { req }) => {
            if (fin && req.body.horarioEvento?.inicio) {
                const [inicioHora, inicioMin] = req.body.horarioEvento.inicio.split(':').map(Number);
                const [finHora, finMin] = fin.split(':').map(Number);
                const inicioMinutos = inicioHora * 60 + inicioMin;
                const finMinutos = finHora * 60 + finMin;
                
                if (finMinutos <= inicioMinutos) {
                    throw new Error('La hora de fin debe ser posterior a la hora de inicio');
                }
            }
            return true;
        }),
    
    body('lugar')
        .notEmpty()
        .withMessage('El lugar es requerido')
        .isLength({ min: 3, max: 200 })
        .withMessage('El lugar debe tener entre 3 y 200 caracteres')
        .trim(),
    
    body('participantes.maximo')
        .optional()
        .isInt({ min: 1, max: 10000 })
        .withMessage('El máximo de participantes debe ser entre 1 y 10000')
        .toInt(),
    
    body('imagen')
        .optional()
        .isURL()
        .withMessage('La imagen debe ser una URL válida'),
    
    body('requisitos')
        .optional()
        .isArray()
        .withMessage('Los requisitos deben ser un array'),
    
    body('materiales')
        .optional()
        .isArray()
        .withMessage('Los materiales deben ser un array'),
    
    body('contacto.telefono')
        .optional()
        .isMobilePhone('es-CO')
        .withMessage('Número de teléfono inválido'),
    
    body('contacto.email')
        .optional()
        .isEmail()
        .withMessage('Email inválido')
        .normalizeEmail(),
    
    body('estado')
        .optional()
        .isIn(['programado', 'en_curso', 'finalizado', 'cancelado'])
        .withMessage('Estado inválido')
];

/**
 * Validaciones para actualizar evento
 */
export const validateUpdateEvent = [
    param('id')
        .isMongoId()
        .withMessage('ID de evento inválido'),
    
    body('titulo')
        .optional()
        .isLength({ min: 5, max: 200 })
        .withMessage('El título debe tener entre 5 y 200 caracteres')
        .trim(),
    
    body('descripcion')
        .optional()
        .isLength({ min: 10 })
        .withMessage('La descripción debe tener al menos 10 caracteres')
        .trim(),
    
    body('categoria')
        .optional()
        .isIn(['Programas', 'Capacitaciones', 'Eventos', 'Convocatorias', 'Logros y Resultados'])
        .withMessage('Categoría inválida'),
    
    body('fechaEvento')
        .optional()
        .isISO8601()
        .withMessage('Formato de fecha inválido')
        .custom((fecha) => {
            const fechaEvento = new Date(fecha);
            const ahora = new Date();
            if (fechaEvento <= ahora) {
                throw new Error('La fecha del evento debe ser futura');
            }
            return true;
        })
        .toDate(),
    
    body('horarioEvento.inicio')
        .optional()
        .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
        .withMessage('Formato de hora inválido (HH:MM)'),
    
    body('horarioEvento.fin')
        .optional()
        .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
        .withMessage('Formato de hora inválido (HH:MM)'),
    
    body('lugar')
        .optional()
        .isLength({ min: 3, max: 200 })
        .withMessage('El lugar debe tener entre 3 y 200 caracteres')
        .trim(),
    
    body('participantes.maximo')
        .optional()
        .isInt({ min: 1, max: 10000 })
        .withMessage('El máximo de participantes debe ser entre 1 y 10000')
        .toInt(),
    
    body('imagen')
        .optional()
        .isURL()
        .withMessage('La imagen debe ser una URL válida'),
    
    body('estado')
        .optional()
        .isIn(['programado', 'en_curso', 'finalizado', 'cancelado'])
        .withMessage('Estado inválido')
];

// ==================== VALIDACIONES GENERALES ====================

/**
 * Validación para parámetros de ID
 */
export const validateId = [
    param('id')
        .isMongoId()
        .withMessage('ID inválido')
];

/**
 * Validaciones para consultas de noticias
 */
export const validateNewsQuery = [
    query('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('La página debe ser un número mayor a 0')
        .toInt(),
    
    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('El límite debe ser entre 1 y 100')
        .toInt(),
    
    query('categoria')
        .optional()
        .isIn(['Programas', 'Capacitaciones', 'Eventos', 'Convocatorias', 'Logros y Resultados'])
        .withMessage('Categoría inválida'),
    
    query('destacada')
        .optional()
        .isBoolean()
        .withMessage('Destacada debe ser verdadero o falso')
        .toBoolean(),
    
    query('estado')
        .optional()
        .isIn(['borrador', 'publicada', 'archivada'])
        .withMessage('Estado inválido'),
    
    query('sortBy')
        .optional()
        .isIn(['fecha', 'titulo', 'vistas', 'fechaCreacion'])
        .withMessage('Campo de ordenamiento inválido'),
    
    query('sortOrder')
        .optional()
        .isIn(['asc', 'desc'])
        .withMessage('Orden inválido'),
    
    query('fechaDesde')
        .optional()
        .isISO8601()
        .withMessage('Formato de fecha desde inválido')
        .toDate(),
    
    query('fechaHasta')
        .optional()
        .isISO8601()
        .withMessage('Formato de fecha hasta inválido')
        .toDate(),
    
    query('busqueda')
        .optional()
        .isLength({ min: 2, max: 100 })
        .withMessage('La búsqueda debe tener entre 2 y 100 caracteres')
        .trim()
];

/**
 * Validaciones para consultas de eventos
 */
export const validateEventQuery = [
    query('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('La página debe ser un número mayor a 0')
        .toInt(),
    
    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('El límite debe ser entre 1 y 100')
        .toInt(),
    
    query('categoria')
        .optional()
        .isIn(['Programas', 'Capacitaciones', 'Eventos', 'Convocatorias', 'Logros y Resultados'])
        .withMessage('Categoría inválida'),
    
    query('estado')
        .optional()
        .isIn(['programado', 'en_curso', 'finalizado', 'cancelado'])
        .withMessage('Estado inválido'),
    
    query('sortBy')
        .optional()
        .isIn(['fechaEvento', 'titulo', 'createdAt'])
        .withMessage('Campo de ordenamiento inválido'),
    
    query('sortOrder')
        .optional()
        .isIn(['asc', 'desc'])
        .withMessage('Orden inválido'),
    
    query('fechaDesde')
        .optional()
        .isISO8601()
        .withMessage('Formato de fecha desde inválido')
        .toDate(),
    
    query('fechaHasta')
        .optional()
        .isISO8601()
        .withMessage('Formato de fecha hasta inválido')
        .toDate(),
    
    query('busqueda')
        .optional()
        .isLength({ min: 2, max: 100 })
        .withMessage('La búsqueda debe tener entre 2 y 100 caracteres')
        .trim()
];

export default {
    validateCreateNews,
    validateUpdateNews,
    validateCreateEvent,
    validateUpdateEvent,
    validateId,
    validateNewsQuery,
    validateEventQuery
};