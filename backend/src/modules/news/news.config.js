/**
 * Configuración específica para el módulo de noticias
 */

export const NEWS_CONFIG = {
    // Límites de paginación
    PAGINATION: {
        DEFAULT_LIMIT: 10,
        MAX_LIMIT: 100,
        DEFAULT_PAGE: 1
    },
    
    // Límites de contenido
    CONTENT_LIMITS: {
        TITLE_MIN_LENGTH: 5,
        TITLE_MAX_LENGTH: 200,
        DESCRIPTION_MIN_LENGTH: 10,
        DESCRIPTION_MAX_LENGTH: 5000,
        SUMMARY_MAX_LENGTH: 500,
        HASHTAG_MAX_LENGTH: 50,
        MAX_HASHTAGS: 10,
        MAX_TOPICS: 5,
        LOCATION_MAX_LENGTH: 100,
        KEYWORDS_MAX_COUNT: 10
    },
    
    // Configuración de imágenes
    IMAGES: {
        ALLOWED_FORMATS: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'],
        MAX_SIZE: 5 * 1024 * 1024, // 5MB
        DEFAULT_PLACEHOLDER: '/images/news-placeholder.jpg'
    },
    
    // Configuración de cache
    CACHE: {
        NEWS_LIST_TTL: 300, // 5 minutos
        NEWS_DETAIL_TTL: 600, // 10 minutos
        FILTERS_TTL: 3600, // 1 hora
        STATISTICS_TTL: 1800 // 30 minutos
    },
    
    // Rate limiting
    RATE_LIMITS: {
        READ: {
            windowMs: 15 * 60 * 1000, // 15 minutos
            max: 200 // requests por ventana
        },
        write: {
            windowMs: 15 * 60 * 1000, // 15 minutos
            max: 30 // requests por ventana
        },
        admin: {
            windowMs: 15 * 60 * 1000, // 15 minutos
            max: 100 // requests por ventana
        }
    },
    
    // Configuración de búsqueda
    SEARCH: {
        MIN_QUERY_LENGTH: 2,
        MAX_QUERY_LENGTH: 100,
        DEFAULT_SORT: 'fechaCreacion',
        DEFAULT_ORDER: 'desc'
    },
    
    // Estados válidos
    VALID_STATES: {
        NEWS: ['borrador', 'publicada', 'archivada'],
        EVENTS: ['programado', 'en_curso', 'finalizado', 'cancelado']
    },
    
    // Categorías predefinidas
    CATEGORIES: [
        'Programas',
        'Capacitaciones', 
        'Eventos',
        'Convocatorias',
        'Logros y Resultados'
    ],
    
    // Temas predefinidos
    TOPICS: [
        'Cafe',
        'Tecnologia',
        'Comercializacion',
        'Ganaderia',
        'Agricultura'
    ],
    
    // Configuración de eventos
    EVENTS: {
        MAX_PARTICIPANTS: 10000,
        MIN_PARTICIPANTS: 1,
        REGISTRATION_DEADLINE_HOURS: 24, // Horas antes del evento para cerrar registro
        REMINDER_HOURS: [24, 2], // Horas antes para enviar recordatorios
        TIME_FORMAT: 'HH:mm'
    },
    
    // Configuración de notificaciones
    NOTIFICATIONS: {
        NEW_NEWS: {
            enabled: true,
            template: 'new-news',
            recipients: ['subscribers']
        },
        NEW_EVENT: {
            enabled: true,
            template: 'new-event',
            recipients: ['subscribers']
        },
        EVENT_REMINDER: {
            enabled: true,
            template: 'event-reminder',
            recipients: ['participants']
        },
        EVENT_CANCELLED: {
            enabled: true,
            template: 'event-cancelled',
            recipients: ['participants']
        }
    },
    
    // Configuración de SEO
    SEO: {
        META_DESCRIPTION_LENGTH: 160,
        SLUG_MAX_LENGTH: 100,
        KEYWORDS_SEPARATOR: ', ',
        READING_SPEED_WPM: 200 // Palabras por minuto promedio
    },
    
    // Configuración de estadísticas
    ANALYTICS: {
        TRACK_VIEWS: true,
        TRACK_FAVORITES: true,
        TRACK_SHARES: true,
        TRACK_DOWNLOADS: true,
        VIEW_COOLDOWN: 300000, // 5 minutos entre vistas del mismo usuario
        POPULAR_THRESHOLD: 100 // Vistas mínimas para considerar popular
    },
    
    // Configuración de archivos
    FILES: {
        UPLOAD_PATH: '/uploads/news/',
        ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
        THUMBNAIL_SIZES: {
            small: { width: 150, height: 150 },
            medium: { width: 400, height: 300 },
            large: { width: 800, height: 600 }
        }
    },
    
    // Configuración de validación
    VALIDATION: {
        PHONE_REGEX: /^[+]?[0-9]{10,15}$/,
        TIME_REGEX: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
        HASHTAG_REGEX: /^#[a-zA-Z0-9_]+$/,
        SLUG_REGEX: /^[a-z0-9-]+$/
    },
    
    // Mensajes de error personalizados
    ERROR_MESSAGES: {
        NEWS_NOT_FOUND: 'Noticia no encontrada',
        EVENT_NOT_FOUND: 'Evento no encontrado',
        UNAUTHORIZED: 'No tienes permisos para realizar esta acción',
        INVALID_DATE: 'La fecha proporcionada no es válida',
        EVENT_FULL: 'El evento ha alcanzado el máximo de participantes',
        EVENT_PAST: 'No se puede registrar para un evento que ya pasó',
        ALREADY_REGISTERED: 'Ya estás registrado en este evento',
        NOT_REGISTERED: 'No estás registrado en este evento',
        INVALID_IMAGE: 'El formato de imagen no es válido',
        CONTENT_TOO_LONG: 'El contenido excede la longitud máxima permitida',
        INVALID_CATEGORY: 'La categoría seleccionada no es válida',
        INVALID_TOPIC: 'El tema seleccionado no es válido'
    },
    
    // Configuración de logging
    LOGGING: {
        LEVEL: process.env.NODE_ENV === 'production' ? 'error' : 'debug',
        LOG_REQUESTS: true,
        LOG_RESPONSES: false,
        LOG_ERRORS: true,
        LOG_FILE: 'logs/news.log'
    },
    
    // Configuración de backup
    BACKUP: {
        ENABLED: process.env.NODE_ENV === 'production',
        FREQUENCY: '0 2 * * *', // Diario a las 2 AM
        RETENTION_DAYS: 30,
        INCLUDE_IMAGES: false
    },
    
    // Configuración de integración externa
    EXTERNAL_INTEGRATIONS: {
        SOCIAL_MEDIA: {
            AUTO_SHARE: false,
            PLATFORMS: ['facebook', 'twitter', 'instagram']
        },
        EMAIL_MARKETING: {
            ENABLED: false,
            PROVIDER: 'mailchimp',
            LIST_ID: null
        },
        ANALYTICS: {
            GOOGLE_ANALYTICS: {
                enabled: false,
                tracking_id: null
            },
            FACEBOOK_PIXEL: {
                enabled: false,
                pixel_id: null
            }
        }
    },
    
    // Configuración de moderación
    MODERATION: {
        AUTO_APPROVE: false,
        REQUIRE_REVIEW: true,
        SPAM_DETECTION: {
            enabled: true,
            keywords: ['spam', 'promoción', 'oferta'],
            max_links: 3
        },
        CONTENT_FILTER: {
            enabled: true,
            inappropriate_words: []
        }
    }
};

/**
 * Obtener configuración por clave
 */
export const getConfig = (key, defaultValue = null) => {
    const keys = key.split('.');
    let value = NEWS_CONFIG;
    
    for (const k of keys) {
        if (value && typeof value === 'object' && k in value) {
            value = value[k];
        } else {
            return defaultValue;
        }
    }
    
    return value;
};

/**
 * Validar configuración al inicializar
 */
export const validateConfig = () => {
    const errors = [];
    
    // Validar límites de paginación
    if (NEWS_CONFIG.PAGINATION.DEFAULT_LIMIT > NEWS_CONFIG.PAGINATION.MAX_LIMIT) {
        errors.push('DEFAULT_LIMIT no puede ser mayor que MAX_LIMIT');
    }
    
    // Validar límites de contenido
    if (NEWS_CONFIG.CONTENT_LIMITS.TITLE_MIN_LENGTH >= NEWS_CONFIG.CONTENT_LIMITS.TITLE_MAX_LENGTH) {
        errors.push('TITLE_MIN_LENGTH debe ser menor que TITLE_MAX_LENGTH');
    }
    
    // Validar categorías
    if (!Array.isArray(NEWS_CONFIG.CATEGORIES) || NEWS_CONFIG.CATEGORIES.length === 0) {
        errors.push('CATEGORIES debe ser un array no vacío');
    }
    
    // Validar temas
    if (!Array.isArray(NEWS_CONFIG.TOPICS) || NEWS_CONFIG.TOPICS.length === 0) {
        errors.push('TOPICS debe ser un array no vacío');
    }
    
    if (errors.length > 0) {
        throw new Error(`Errores de configuración del módulo de noticias:\n${errors.join('\n')}`);
    }
    
    return true;
};

/**
 * Configuración específica por entorno
 */
export const getEnvironmentConfig = () => {
    const env = process.env.NODE_ENV || 'development';
    
    const envConfigs = {
        development: {
            CACHE: {
                ...NEWS_CONFIG.CACHE,
                NEWS_LIST_TTL: 60, // Cache más corto en desarrollo
                NEWS_DETAIL_TTL: 120
            },
            RATE_LIMITS: {
                read: { windowMs: 15 * 60 * 1000, max: 1000 },
                write: { windowMs: 15 * 60 * 1000, max: 100 },
                admin: { windowMs: 15 * 60 * 1000, max: 500 }
            },
            LOGGING: {
                ...NEWS_CONFIG.LOGGING,
                LEVEL: 'debug',
                LOG_REQUESTS: true,
                LOG_RESPONSES: true
            }
        },
        production: {
            CACHE: NEWS_CONFIG.CACHE,
            RATE_LIMITS: NEWS_CONFIG.RATE_LIMITS,
            LOGGING: {
                ...NEWS_CONFIG.LOGGING,
                LEVEL: 'error',
                LOG_REQUESTS: false,
                LOG_RESPONSES: false
            },
            BACKUP: {
                ...NEWS_CONFIG.BACKUP,
                ENABLED: true
            }
        },
        test: {
            CACHE: {
                NEWS_LIST_TTL: 0,
                NEWS_DETAIL_TTL: 0,
                FILTERS_TTL: 0,
                STATISTICS_TTL: 0
            },
            RATE_LIMITS: {
                read: { windowMs: 15 * 60 * 1000, max: 10000 },
                write: { windowMs: 15 * 60 * 1000, max: 1000 },
                admin: { windowMs: 15 * 60 * 1000, max: 1000 }
            },
            LOGGING: {
                ...NEWS_CONFIG.LOGGING,
                LEVEL: 'silent'
            }
        }
    };
    
    return {
        ...NEWS_CONFIG,
        ...envConfigs[env]
    };
};

export default {
    NEWS_CONFIG,
    getConfig,
    validateConfig,
    getEnvironmentConfig
};