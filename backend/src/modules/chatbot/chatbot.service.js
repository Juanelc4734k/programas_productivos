import ChatSession from './chatbot.model.js';
import User from '../auth/user.model.js';
import { 
    SYSTEM_MESSAGES, 
    QUICK_REPLIES, 
    INTENT_PATTERNS, 
    USER_TYPES,
    CHATBOT_CONFIG 
} from './chatbot.config.js';
import { extractKeywords, calculateSimilarity } from './chatbot.utils.js';
import LlamaService from './llama.service.js';

class ChatbotService {
    constructor() {
        this.quickReplies = QUICK_REPLIES;
        this.intentPatterns = INTENT_PATTERNS;

        this.knowledgeBase = {
            // Insumos agrícolas
            'insumos': {
                keywords: ['insumos', 'semillas', 'fertilizantes', 'herramientas', 'solicitar', 'pedir'],
                response: 'Para solicitar insumos agrícolas:\n\n1. Ingresa a la sección "Programas" en tu dashboard\n2. Selecciona "Solicitud de Insumos"\n3. Completa el formulario con tus datos y necesidades\n4. Adjunta los documentos requeridos\n5. Envía tu solicitud\n\nRecibirás una respuesta en un plazo máximo de 5 días hábiles. ¿Necesitas ayuda con algún paso específico?'
            },
            
            // Capacitaciones
            'capacitaciones': {
                keywords: ['capacitaciones', 'cursos', 'entrenamientos', 'formación', 'aprender'],
                response: 'Las capacitaciones disponibles incluyen:\n\n• Técnicas de cultivo sostenible\n• Manejo de plagas y enfermedades\n• Comercialización de productos\n• Uso de tecnología agrícola\n• Gestión financiera rural\n\nPuedes ver el calendario completo y inscribirte en la sección "Capacitaciones" de tu dashboard. Las próximas sesiones están programadas para la segunda semana de cada mes.'
            },
            
            // Reportes de proyecto
            'reportes': {
                keywords: ['reportar', 'avance', 'progreso', 'proyecto', 'seguimiento'],
                response: 'Para reportar el avance de tu proyecto:\n\n1. Ve a "Mis Proyectos" en el dashboard\n2. Selecciona el proyecto activo\n3. Haz clic en "Reportar Avance"\n4. Completa el formulario con:\n   - Actividades realizadas\n   - Porcentaje de avance\n   - Evidencias fotográficas\n   - Observaciones\n\nLos reportes deben enviarse mensualmente antes del día 25.'
            },
            
            // Certificados
            'certificados': {
                keywords: ['certificados', 'descargar', 'documentos', 'constancias'],
                response: 'Para descargar tus certificados:\n\n1. Accede a "Mi Perfil"\n2. Ve a la sección "Documentos"\n3. Selecciona "Certificados"\n4. Haz clic en "Descargar" junto al certificado deseado\n\nSi no ves algún certificado esperado, verifica que hayas completado todos los requisitos del programa correspondiente.'
            },
            
            // Programas disponibles
            'programas': {
                keywords: ['programas', 'disponibles', 'ofertas', 'beneficios', 'ayudas'],
                response: 'Programas disponibles actualmente:\n\n🌱 **Programa de Insumos Agrícolas**\n- Semillas certificadas\n- Fertilizantes orgánicos\n- Herramientas básicas\n\n📚 **Programa de Capacitación**\n- Cursos técnicos\n- Talleres prácticos\n- Certificaciones\n\n💰 **Programa de Microcréditos**\n- Créditos blandos\n- Acompañamiento financiero\n\n🏆 **Programa de Certificación Orgánica**\n- Asesoría técnica\n- Certificación de productos\n\n¿Te interesa información específica sobre algún programa?'
            },
            
            // Actualizar datos
            'datos': {
                keywords: ['actualizar', 'cambiar', 'modificar', 'datos', 'información', 'perfil'],
                response: 'Para actualizar tus datos personales:\n\n1. Ve a "Mi Perfil" en el menú principal\n2. Haz clic en "Editar Información"\n3. Modifica los campos necesarios\n4. Guarda los cambios\n\nSi necesitas cambiar información sensible como documento de identidad o correo principal, debes contactar directamente con soporte técnico.'
            },
            
            // Contacto y soporte
            'contacto': {
                keywords: ['contacto', 'teléfono', 'email', 'soporte', 'ayuda', 'comunicar'],
                response: 'Puedes contactarnos por:\n\n📞 **Teléfono:** (601) 123-4567\n📧 **Email:** soporte@alcaldia.gov.co\n🕒 **Horario:** Lunes a Viernes, 8:00 AM - 5:00 PM\n\n🏢 **Oficina:** Calle Principal #123, Centro\n\nPara soporte técnico urgente, usa el chat en vivo o llama a nuestra línea directa.'
            },
            
            // Trámites
            'tramites': {
                keywords: ['trámites', 'procedimientos', 'documentos', 'requisitos'],
                response: 'Trámites disponibles en línea:\n\n📋 **Solicitud de Insumos**\n📋 **Inscripción a Programas**\n📋 **Reporte de Avances**\n📋 **Solicitud de Certificados**\n📋 **Actualización de Datos**\n\nTodos los trámites se pueden realizar desde tu dashboard. ¿Necesitas ayuda con algún trámite específico?'
            }
        };
    }

    // Crear nueva sesión de chat
    async createSession(userId) {
        try {
            // Verificar si ya existe una sesión activa
            const existingSession = await ChatSession.findActiveSession(userId);
            if (existingSession) {
                return {
                    success: true,
                    data: {
                        sessionId: existingSession.sessionId,
                        message: '¡Bienvenido de nuevo! ¿En qué más puedo ayudarte?',
                        isExisting: true
                    }
                };
            }

            // Obtener información del usuario para contexto
            const user = await User.findById(userId);
            if (!user) {
                throw new Error('Usuario no encontrado');
            }

            const userContext = {
                userType: user.tipo_usuario,
                department: user.dependencia || null,
                location: user.vereda || null
            };

            // Crear nueva sesión con mensaje personalizado
            const welcomeMessage = this.getWelcomeMessage(user.tipo_usuario);
            const session = await this.createCustomSession(userId, userContext, welcomeMessage);
            
            return {
                success: true,
                data: {
                    sessionId: session.sessionId,
                    message: session.messages[0].content,
                    isExisting: false
                }
            };
        } catch (error) {
            console.error('Error creating chat session:', error);
            return {
                success: false,
                error: 'Error al crear sesión de chat'
            };
        }
    }

    // Procesar mensaje del usuario
    async processMessage(userId, message, sessionId = null) {
        try {
            // Buscar sesión activa
            let session;
            if (sessionId) {
                session = await ChatSession.findOne({ sessionId, userId, status: 'active' });
            } else {
                session = await ChatSession.findActiveSession(userId);
            }

            if (!session) {
                // Crear nueva sesión si no existe
                const newSessionResult = await this.createSession(userId);
                if (!newSessionResult.success) {
                    throw new Error('No se pudo crear sesión de chat');
                }
                session = await ChatSession.findOne({ sessionId: newSessionResult.data.sessionId });
            }

            // Agregar mensaje del usuario
            await session.addMessage(message, 'user');

            // Generar respuesta usando Llama 3.2 o fallback
            const response = await this.generateResponse(message, session.context, session.messages);

            // Agregar respuesta del asistente
            await session.addMessage(response, 'assistant');

            return {
                success: true,
                data: {
                    response,
                    sessionId: session.sessionId,
                    timestamp: new Date().toISOString()
                }
            };
        } catch (error) {
            console.error('Error processing message:', error);
            return {
                success: false,
                error: 'Error al procesar mensaje'
            };
        }
    }

    // Generar respuesta basada en el mensaje usando Llama 3.2
    async generateResponse(message, context = {}, conversationHistory = []) {
        const normalizedMessage = message.toLowerCase();
        
        // Si está habilitado el uso de IA, intentar con Llama 3.2 primero
        if (CHATBOT_CONFIG.RESPONSES.USE_AI_RESPONSES) {
            try {
                const llamaResponse = await LlamaService.generateResponse(
                    message, 
                    context, 
                    conversationHistory
                );
                
                if (llamaResponse.success) {
                    console.log(`Respuesta generada por ${llamaResponse.source}:`, llamaResponse.response.substring(0, 100) + '...');
                    return llamaResponse.response;
                }
                
                console.warn('Llama service failed, falling back to predefined responses:', llamaResponse.error);
            } catch (error) {
                console.error('Error calling Llama service:', error);
            }
        }
        
        // Fallback a respuestas predefinidas si Llama falla o está deshabilitado
        if (CHATBOT_CONFIG.RESPONSES.FALLBACK_TO_PREDEFINED) {
            return this.generatePredefinedResponse(normalizedMessage);
        }
        
        // Respuesta de error si no hay fallback
        return 'Lo siento, el servicio de chat no está disponible en este momento. Por favor, intenta más tarde o contacta directamente con la alcaldía.';
    }
    
    // Generar respuesta predefinida (método de fallback)
    generatePredefinedResponse(normalizedMessage) {
        // Buscar coincidencias en la base de conocimiento
        for (const [category, data] of Object.entries(this.knowledgeBase)) {
            const hasKeyword = data.keywords.some(keyword => 
                normalizedMessage.includes(keyword.toLowerCase())
            );
            
            if (hasKeyword) {
                return data.response;
            }
        }

        // Respuestas para saludos
        if (this.isGreeting(normalizedMessage)) {
            const greetings = [
                '¡Hola! ¿En qué puedo ayudarte hoy?',
                '¡Buenos días! Estoy aquí para asistirte con cualquier consulta.',
                '¡Hola! Soy tu asistente virtual. ¿Qué necesitas saber?'
            ];
            return greetings[Math.floor(Math.random() * greetings.length)];
        }

        // Respuestas para despedidas
        if (this.isFarewell(normalizedMessage)) {
            return '¡Hasta luego! Si necesitas más ayuda, no dudes en escribirme. ¡Que tengas un excelente día!';
        }

        // Respuesta por defecto
        return 'Entiendo tu consulta, pero necesito más información para ayudarte mejor. ¿Podrías ser más específico? También puedes usar las preguntas frecuentes como guía o contactar directamente con nuestro equipo de soporte.';
    }

    // Detectar saludos
    isGreeting(message) {
        const greetings = ['hola', 'buenos días', 'buenas tardes', 'buenas noches', 'saludos', 'hey'];
        return greetings.some(greeting => message.includes(greeting));
    }

    // Detectar despedidas
    isFarewell(message) {
        const farewells = ['adiós', 'hasta luego', 'nos vemos', 'chao', 'bye', 'gracias', 'muchas gracias'];
        return farewells.some(farewell => message.includes(farewell));
    }

    // Obtener respuestas rápidas según tipo de usuario
    getQuickReplies(userType = USER_TYPES.CAMPESINO) {
        const replies = this.quickReplies[userType.toUpperCase()] || this.quickReplies.CAMPESINO;
        return {
            success: true,
            data: replies
        };
    }

    // Obtener mensaje de bienvenida según tipo de usuario
    getWelcomeMessage(userType) {
        return SYSTEM_MESSAGES.WELCOME[userType.toUpperCase()] || SYSTEM_MESSAGES.WELCOME.CAMPESINO;
    }

    // Crear sesión personalizada con mensaje específico
    async createCustomSession(userId, userContext, welcomeMessage) {
        const sessionId = `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        const session = new ChatSession({
            sessionId,
            userId,
            context: userContext,
            messages: [{
                content: welcomeMessage,
                sender: 'assistant',
                timestamp: new Date()
            }]
        });
        
        return session.save();
    }

    // Obtener historial de sesiones del usuario
    async getUserSessions(userId, limit = 10) {
        try {
            const sessions = await ChatSession.getUserSessions(userId, limit);
            return {
                success: true,
                data: sessions
            };
        } catch (error) {
            console.error('Error getting user sessions:', error);
            return {
                success: false,
                error: 'Error al obtener historial de sesiones'
            };
        }
    }

    // Cerrar sesión
    async closeSession(sessionId, userId) {
        try {
            const session = await ChatSession.findOne({ sessionId, userId });
            if (!session) {
                throw new Error('Sesión no encontrada');
            }

            await session.closeSession();
            return {
                success: true,
                message: 'Sesión cerrada correctamente'
            };
        } catch (error) {
            console.error('Error closing session:', error);
            return {
                success: false,
                error: 'Error al cerrar sesión'
            };
        }
    }

    // Agregar feedback a una sesión
    async addFeedback(sessionId, userId, rating, comment = '') {
        try {
            const session = await ChatSession.findOne({ sessionId, userId });
            if (!session) {
                throw new Error('Sesión no encontrada');
            }

            await session.addFeedback(rating, comment);
            return {
                success: true,
                message: 'Feedback agregado correctamente'
            };
        } catch (error) {
            console.error('Error adding feedback:', error);
            return {
                success: false,
                error: 'Error al agregar feedback'
            };
        }
    }

    // Verificar estado del servicio de Llama 3.2
    async checkLlamaServiceStatus() {
        try {
            const isAvailable = await LlamaService.isServiceAvailable();
            const modelInfo = await LlamaService.getModelInfo();
            
            return {
                success: true,
                data: {
                    available: isAvailable,
                    model: CHATBOT_CONFIG.LLAMA.MODEL_NAME,
                    api_url: CHATBOT_CONFIG.LLAMA.API_URL,
                    model_info: modelInfo,
                    ai_responses_enabled: CHATBOT_CONFIG.RESPONSES.USE_AI_RESPONSES,
                    fallback_enabled: CHATBOT_CONFIG.RESPONSES.FALLBACK_TO_PREDEFINED
                }
            };
        } catch (error) {
            console.error('Error checking Llama service status:', error);
            return {
                success: false,
                error: 'Error al verificar estado del servicio de IA'
            };
        }
    }

    // Alternar entre respuestas de IA y predefinidas
    toggleAIResponses(enabled) {
        CHATBOT_CONFIG.RESPONSES.USE_AI_RESPONSES = enabled;
        return {
            success: true,
            message: `Respuestas de IA ${enabled ? 'habilitadas' : 'deshabilitadas'}`,
            ai_enabled: enabled
        };
    }
}

export default new ChatbotService();