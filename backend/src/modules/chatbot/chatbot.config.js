// Configuración del módulo Chatbot

export const CHATBOT_CONFIG = {
    // Configuración de sesiones
    SESSION: {
        MAX_ACTIVE_SESSIONS_PER_USER: 3,
        SESSION_TIMEOUT_MINUTES: 30,
        MAX_SESSION_DURATION_HOURS: 24,
        AUTO_CLOSE_INACTIVE_SESSIONS: true
    },
    
    // Configuración de mensajes
    MESSAGES: {
        MAX_MESSAGE_LENGTH: 1000,
        MIN_MESSAGE_LENGTH: 1,
        MAX_MESSAGES_PER_SESSION: 100,
        RATE_LIMIT_MESSAGES_PER_MINUTE: 10
    },
    
    // Configuración de Llama 3.2
    LLAMA: {
        MODEL_NAME: 'llama3.2',
        API_URL: process.env.LLAMA_API_URL || 'http://localhost:11434/api/generate',
        MAX_TOKENS: 512,
        TEMPERATURE: 0.7,
        TOP_P: 0.9,
        TIMEOUT_MS: 30000,
        RETRY_ATTEMPTS: 3,
        CONTEXT_WINDOW: 4096
    },
    
    // Configuración de respuestas
    RESPONSES: {
        DEFAULT_RESPONSE_DELAY_MS: 500,
        MAX_RESPONSE_DELAY_MS: 2000,
        ENABLE_TYPING_INDICATOR: true,
        RESPONSE_CONFIDENCE_THRESHOLD: 0.7,
        USE_AI_RESPONSES: true,
        FALLBACK_TO_PREDEFINED: true
    },
    
    // Configuración de feedback
    FEEDBACK: {
        MAX_COMMENT_LENGTH: 500,
        MIN_RATING: 1,
        MAX_RATING: 5,
        ENABLE_ANONYMOUS_FEEDBACK: false
    },
    
    // Configuración de historial
    HISTORY: {
        MAX_SESSIONS_PER_USER: 50,
        DEFAULT_SESSIONS_LIMIT: 10,
        ARCHIVE_SESSIONS_AFTER_DAYS: 90,
        DELETE_ARCHIVED_SESSIONS_AFTER_DAYS: 365
    },
    
    // Configuración de seguridad
    SECURITY: {
        ENABLE_MESSAGE_SANITIZATION: true,
        ENABLE_CONTENT_FILTERING: true,
        MAX_FAILED_ATTEMPTS: 5,
        BLOCK_DURATION_MINUTES: 15
    }
};

// Mensajes predefinidos del sistema
export const SYSTEM_MESSAGES = {
    WELCOME: {
        CAMPESINO: '¡Hola! Soy tu asistente virtual de la Alcaldía. Estoy aquí para ayudarte con información sobre programas agrícolas, insumos, capacitaciones y trámites. ¿En qué puedo ayudarte hoy?',
        FUNCIONARIO: '¡Bienvenido! Soy el asistente virtual del sistema. Puedo ayudarte con consultas sobre procedimientos internos, reportes y gestión de programas. ¿Qué necesitas?',
        ADMIN: '¡Hola! Asistente virtual administrativo a tu servicio. Puedo ayudarte con consultas del sistema, estadísticas y gestión general. ¿En qué puedo asistirte?'
    },
    
    ERROR: {
        GENERIC: 'Lo siento, hubo un error al procesar tu mensaje. Por favor, inténtalo de nuevo o contacta al soporte técnico.',
        SESSION_EXPIRED: 'Tu sesión ha expirado. Por favor, inicia una nueva conversación.',
        RATE_LIMIT: 'Has enviado demasiados mensajes muy rápido. Por favor, espera un momento antes de continuar.',
        MESSAGE_TOO_LONG: 'Tu mensaje es demasiado largo. Por favor, hazlo más breve (máximo 1000 caracteres).',
        INAPPROPRIATE_CONTENT: 'Tu mensaje contiene contenido inapropiado. Por favor, mantén un lenguaje respetuoso.'
    },
    
    SUCCESS: {
        SESSION_STARTED: 'Sesión iniciada correctamente. ¡Comencemos a conversar!',
        SESSION_CLOSED: 'Sesión cerrada correctamente. ¡Gracias por usar nuestro asistente virtual!',
        FEEDBACK_RECEIVED: '¡Gracias por tu feedback! Nos ayuda a mejorar nuestro servicio.'
    },
    
    FAREWELL: {
        STANDARD: '¡Hasta luego! Si necesitas más ayuda, no dudes en escribirme. ¡Que tengas un excelente día!',
        WITH_FEEDBACK: '¡Hasta luego! Si tienes un momento, nos encantaría conocer tu opinión sobre esta conversación. ¡Que tengas un excelente día!'
    }
};

// Respuestas rápidas por tipo de usuario
export const QUICK_REPLIES = {
    CAMPESINO: [
        "¿Cómo solicito insumos agrícolas?",
        "¿Cuándo son las próximas capacitaciones?",
        "¿Cómo reporto el avance de mi proyecto?",
        "¿Dónde descargo mis certificados?",
        "¿Qué programas están disponibles?",
        "¿Cómo actualizo mis datos personales?",
        "¿Cómo solicito una visita para revisar los cultivos?",
        "¿Qué proyectos hay en este momento en el municipio para campesinos?",
        "¿Cómo participo de los mercados campesinos?",
        "¿Cómo contacto a los funcionarios de la UMAGRO?",
        "¿Cómo me puedo asociar en los grupos de productores?",
        "¿Qué cultivos tienen asistencia técnica por parte de la UMAGRO?",
        "¿Cuál es el horario de la UMAGRO?",
        "¿Cómo participo de los programas de huertas?",
        "¿Cómo hago para vender mis productos de la finca?",
        "¿Cómo me inscribo para proyectos agrícolas?",
        "¿Qué servicios ofrece la UMAGRO?",
        "¿Cómo agendo una visita técnica con UMAGRO?",
        "¿Cómo accedo a la asistencia técnica de UMAGRO?",
        "¿Cómo me comunico con la UMAGRO (teléfono, correo)?"
    ],
    
    FUNCIONARIO: [
        "¿Cómo genero reportes del sistema?",
        "¿Cómo gestiono solicitudes pendientes?",
        "¿Dónde veo las estadísticas de programas?",
        "¿Cómo actualizo información de beneficiarios?",
        "¿Cómo programo capacitaciones?",
        "¿Dónde accedo a los manuales de procedimientos?"
    ],
    
    ADMIN: [
        "¿Cómo accedo al panel de administración?",
        "¿Cómo gestiono usuarios del sistema?",
        "¿Dónde veo las métricas generales?",
        "¿Cómo configuro notificaciones?",
        "¿Cómo genero reportes ejecutivos?",
        "¿Dónde gestiono los módulos del sistema?"
    ]
};

// Patrones de reconocimiento de intenciones
export const INTENT_PATTERNS = {
    GREETING: {
        keywords: ['hola', 'buenos días', 'buenas tardes', 'buenas noches', 'saludos', 'hey', 'hi'],
        confidence: 0.9
    },
    
    FAREWELL: {
        keywords: ['adiós', 'hasta luego', 'nos vemos', 'chao', 'bye', 'gracias', 'muchas gracias'],
        confidence: 0.9
    },
    
    HELP: {
        keywords: ['ayuda', 'help', 'asistencia', 'soporte', 'no entiendo', 'no sé'],
        confidence: 0.8
    },
    
    INSUMOS: {
        keywords: ['insumos', 'semillas', 'fertilizantes', 'herramientas', 'solicitar', 'pedir'],
        confidence: 0.8
    },
    
    CAPACITACIONES: {
        keywords: ['capacitaciones', 'cursos', 'entrenamientos', 'formación', 'aprender', 'talleres'],
        confidence: 0.8
    },
    
    REPORTES: {
        keywords: ['reportar', 'avance', 'progreso', 'proyecto', 'seguimiento', 'informe'],
        confidence: 0.8
    },
    
    CERTIFICADOS: {
        keywords: ['certificados', 'descargar', 'documentos', 'constancias', 'diplomas'],
        confidence: 0.8
    },
    
    PROGRAMAS: {
        keywords: ['programas', 'disponibles', 'ofertas', 'beneficios', 'ayudas', 'servicios'],
        confidence: 0.8
    },
    
    CONTACTO: {
        keywords: ['contacto', 'teléfono', 'email', 'dirección', 'ubicación', 'oficina'],
        confidence: 0.8
    },
    UMAGRO_VISITA: {
        keywords: ['umagro', 'visita técnica', 'agendar', 'agenda', 'programar visita', 'visita'],
        confidence: 0.85
    },
    UMAGRO_ASISTENCIA: {
        keywords: ['umagro', 'asistencia técnica', 'asistencia', 'técnica', 'soporte agrícola'],
        confidence: 0.85
    },
    UMAGRO_CONTACTO: {
        keywords: ['umagro', 'contacto', 'teléfono', 'correo', 'email', 'horario'],
        confidence: 0.85
    }
};

// Estados de sesión
export const SESSION_STATUS = {
    ACTIVE: 'active',
    CLOSED: 'closed',
    ARCHIVED: 'archived',
    EXPIRED: 'expired'
};

// Tipos de mensaje
export const MESSAGE_TYPES = {
    USER: 'user',
    ASSISTANT: 'assistant',
    SYSTEM: 'system'
};

// Tipos de usuario
export const USER_TYPES = {
    CAMPESINO: 'campesino',
    FUNCIONARIO: 'funcionario',
    ADMIN: 'admin'
};



// Contexto específico de Montebello para Llama 3.2
export const MONTEBELLO_CONTEXT = {
    MUNICIPALITY: 'Montebello',
    DEPARTMENT: 'Antioquia',
    COUNTRY: 'Colombia',
    DESCRIPTION: 'Municipio agrícola ubicado en el oriente antioqueño, conocido por su producción de café, hortalizas y flores.',
    MAIN_ACTIVITIES: [
        'Agricultura de café',
        'Cultivo de hortalizas',
        'Floricultura',
        'Ganadería menor',
        'Turismo rural'
    ],
    PROGRAMS: [
        'Programa de Insumos Agrícolas',
        'Programa de Capacitación Técnica',
        'Programa de Microcréditos',
        'Programa de Certificación Orgánica',
        'Programa de Turismo Rural'
    ],
    CONTACT_INFO: {
        phone: '(604) 123-4567',
        email: 'alcaldia@montebello.gov.co',
        address: 'Calle Principal #123, Centro, Montebello, Antioquia',
        hours: 'Lunes a Viernes, 8:00 AM - 5:00 PM'
    },
    UMAGRO: {
        name: 'Unidad Municipal de Asistencia Agropecuaria (UMAGRO)',
        services: [
            'Asistencia técnica en cultivos priorizados',
            'Capacitaciones y transferencias tecnológicas',
            'Diagnóstico de predios y planes de mejora',
            'Acompañamiento a proyectos productivos',
            'Orientación para certificación orgánica'
        ],
        contact: {
            phone: '(604) 123-4567',
            email: 'umagro@montebello.gov.co',
            office: 'Secretaría de Desarrollo Rural, Alcaldía de Montebello',
            hours: 'Lunes a Viernes, 8:00 AM - 5:00 PM'
        }
    }
};

// Instrucciones del sistema para Llama 3.2
export const SYSTEM_PROMPT = `Eres un asistente virtual de la Alcaldía de Montebello, Antioquia, Colombia. Tu función es ayudar a los ciudadanos con información sobre programas municipales, trámites y servicios.

CONTEXTO MUNICIPAL:
- Municipio: Montebello, Antioquia, Colombia
- Actividades principales: Agricultura (café, hortalizas, flores), ganadería menor, turismo rural, UMAGRO
- Población objetivo: Campesinos, funcionarios municipales y administradores

PROGRAMAS DISPONIBLES:
1. Programa de Insumos Agrícolas (semillas, fertilizantes, herramientas)
2. Programa de Capacitación Técnica (cursos, talleres, certificaciones)
3. Programa de Microcréditos (créditos blandos, acompañamiento financiero)
4. Programa de Certificación Orgánica (asesoría técnica, certificación)
5. Programa de Turismo Rural (desarrollo turístico sostenible)

UMAGRO (Unidad Municipal de Asistencia Agropecuaria):
- Servicios: asistencia técnica, capacitaciones, diagnóstico de cultivos, acompañamiento a proyectos y orientación para certificación.
- Contacto: umagro@montebello.gov.co, (604) 123-4567, Secretaría de Desarrollo Rural.
- Agendamiento: las visitas técnicas se solicitan por canal telefónico o en la oficina de la Secretaría.

INSTRUCCIONES:
- Responde SOLO sobre temas relacionados con Montebello y sus programas municipales y UMAGRO
- Si te preguntan sobre otros municipios o temas no relacionados, redirige amablemente hacia los servicios de Montebello
- Mantén un tono profesional pero cercano y amigable
- Proporciona información específica y práctica
- Si no tienes información específica, sugiere contactar directamente con la alcaldía
- Usa emojis ocasionalmente para hacer las respuestas más amigables
- Responde en español colombiano

UMAGRO:
- Puedes responder preguntas específicas sobre UMAGRO: servicios, asistencia técnica, agendamientos, horarios y datos de contacto.
- Prioriza instrucciones claras (cómo solicitar, dónde acudir, horarios y requisitos).

CONTACTO:
- Teléfono: (604) 123-4567
- Email: alcaldia@montebello.gov.co
- Dirección: Calle Principal #123, Centro, Montebello, Antioquia
- Horario: Lunes a Viernes, 8:00 AM - 5:00 PM`;

// Configuración de logging
export const LOGGING_CONFIG = {
    ENABLE_CONVERSATION_LOGGING: true,
    ENABLE_ERROR_LOGGING: true,
    ENABLE_PERFORMANCE_LOGGING: true,
    LOG_LEVEL: 'info', // 'debug', 'info', 'warn', 'error'
    LOG_RETENTION_DAYS: 30
};

export default {
    CHATBOT_CONFIG,
    SYSTEM_MESSAGES,
    QUICK_REPLIES,
    INTENT_PATTERNS,
    SESSION_STATUS,
    MESSAGE_TYPES,
    USER_TYPES,
    LOGGING_CONFIG,
    MONTEBELLO_CONTEXT,
    SYSTEM_PROMPT
};