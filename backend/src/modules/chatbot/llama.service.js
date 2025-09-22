import { CHATBOT_CONFIG, SYSTEM_PROMPT, MONTEBELLO_CONTEXT } from './chatbot.config.js';

class LlamaService {
    constructor() {
        this.config = CHATBOT_CONFIG.LLAMA;
        this.systemPrompt = SYSTEM_PROMPT;
        this.context = MONTEBELLO_CONTEXT;
    }

    /**
     * Genera una respuesta usando Llama 3.2
     * @param {string} userMessage - Mensaje del usuario
     * @param {Object} sessionContext - Contexto de la sesión
     * @param {Array} conversationHistory - Historial de la conversación
     * @returns {Promise<Object>} Respuesta del modelo
     */
    async generateResponse(userMessage, sessionContext = {}, conversationHistory = []) {
        try {
            // Validar que la consulta esté relacionada con Montebello
            if (!this.isValidQuery(userMessage)) {
                return {
                    success: true,
                    response: this.getRedirectResponse(),
                    source: 'validation'
                };
            }

            // Construir el prompt completo
            const fullPrompt = this.buildPrompt(userMessage, sessionContext, conversationHistory);

            // Realizar llamada a Llama 3.2
            const response = await this.callLlamaAPI(fullPrompt);

            if (response.success) {
                return {
                    success: true,
                    response: response.text,
                    source: 'llama',
                    metadata: {
                        tokens_used: response.tokens_used,
                        processing_time: response.processing_time
                    }
                };
            } else {
                throw new Error(response.error);
            }

        } catch (error) {
            console.error('Error generating Llama response:', error);
            return {
                success: false,
                error: error.message,
                source: 'error'
            };
        }
    }

    /**
     * Valida si la consulta está relacionada con Montebello o temas municipales
     * @param {string} message - Mensaje del usuario
     * @returns {boolean} True si es válida
     */
    isValidQuery(message) {
        const lowerMessage = message.toLowerCase();
        
        // Palabras clave relacionadas con servicios municipales
        const municipalKeywords = [
            'montebello', 'alcaldia', 'alcaldía', 'municipio', 'municipal',
            'insumos', 'semillas', 'fertilizantes', 'agricultura', 'agrícola',
            'capacitacion', 'capacitación', 'curso', 'taller', 'entrenamiento',
            'certificado', 'certificación', 'programa', 'proyecto',
            'credito', 'crédito', 'financiamiento', 'microcrédito',
            'tramite', 'trámite', 'solicitud', 'documento',
            'campesino', 'agricultor', 'productor', 'rural',
            'cafe', 'café', 'hortaliza', 'flor', 'flores', 'ganaderia', 'ganadería',
            'turismo', 'turistico', 'turístico',
            'contacto', 'telefono', 'teléfono', 'direccion', 'dirección',
            'horario', 'atencion', 'atención', 'servicio', 'ayuda', 'soporte'
        ];

        // Verificar si contiene palabras clave municipales
        const hasValidKeywords = municipalKeywords.some(keyword => 
            lowerMessage.includes(keyword)
        );

        // Permitir saludos y despedidas básicas
        const basicInteractions = [
            'hola', 'buenos dias', 'buenas tardes', 'buenas noches',
            'adios', 'adiós', 'hasta luego', 'gracias', 'muchas gracias',
            'ayuda', 'help', 'que puedes hacer', 'qué puedes hacer'
        ];

        const isBasicInteraction = basicInteractions.some(phrase => 
            lowerMessage.includes(phrase)
        );

        return hasValidKeywords || isBasicInteraction;
    }

    /**
     * Construye el prompt completo para Llama 3.2
     * @param {string} userMessage - Mensaje del usuario
     * @param {Object} sessionContext - Contexto de la sesión
     * @param {Array} conversationHistory - Historial de conversación
     * @returns {string} Prompt completo
     */
    buildPrompt(userMessage, sessionContext, conversationHistory) {
        let prompt = this.systemPrompt + '\n\n';

        // Agregar contexto del usuario si está disponible
        if (sessionContext.userType) {
            prompt += `TIPO DE USUARIO: ${sessionContext.userType}\n`;
        }
        if (sessionContext.department) {
            prompt += `DEPENDENCIA: ${sessionContext.department}\n`;
        }
        if (sessionContext.location) {
            prompt += `UBICACIÓN: ${sessionContext.location}\n`;
        }

        // Agregar historial de conversación reciente (últimos 5 mensajes)
        if (conversationHistory.length > 0) {
            prompt += '\nHISTORIAL RECIENTE:\n';
            const recentHistory = conversationHistory.slice(-5);
            recentHistory.forEach(msg => {
                const role = msg.sender === 'user' ? 'Usuario' : 'Asistente';
                prompt += `${role}: ${msg.content}\n`;
            });
        }

        prompt += `\nUSUARIO: ${userMessage}\nASISTENTE:`;

        return prompt;
    }

    /**
     * Realiza la llamada a la API de Llama 3.2
     * @param {string} prompt - Prompt completo
     * @returns {Promise<Object>} Respuesta de la API
     */
    async callLlamaAPI(prompt) {
        const startTime = Date.now();
        
        try {
            const requestBody = {
                model: this.config.MODEL_NAME,
                prompt: prompt,
                stream: false,
                options: {
                    temperature: this.config.TEMPERATURE,
                    top_p: this.config.TOP_P,
                    num_predict: this.config.MAX_TOKENS
                }
            };

            const response = await fetch(this.config.API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody),
                signal: AbortSignal.timeout(this.config.TIMEOUT_MS)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            const processingTime = Date.now() - startTime;

            return {
                success: true,
                text: data.response?.trim() || 'Lo siento, no pude generar una respuesta.',
                tokens_used: data.eval_count || 0,
                processing_time: processingTime
            };

        } catch (error) {
            console.error('Llama API call failed:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Obtiene una respuesta de redirección para consultas no válidas
     * @returns {string} Mensaje de redirección
     */
    getRedirectResponse() {
        const redirectMessages = [
            '🏛️ Soy el asistente virtual de la Alcaldía de Montebello. Estoy aquí para ayudarte con información sobre nuestros programas municipales, trámites y servicios. ¿En qué puedo asistirte hoy?',
            '🌱 ¡Hola! Me especializo en brindar información sobre los servicios y programas de la Alcaldía de Montebello. ¿Te gustaría conocer sobre nuestros programas agrícolas, capacitaciones o trámites disponibles?',
            '📋 Estoy aquí para ayudarte con consultas relacionadas con los servicios municipales de Montebello. Puedo informarte sobre programas de insumos, capacitaciones, microcréditos y más. ¿Qué necesitas saber?'
        ];

        return redirectMessages[Math.floor(Math.random() * redirectMessages.length)];
    }

    /**
     * Verifica si el servicio de Llama está disponible
     * @returns {Promise<boolean>} True si está disponible
     */
    async isServiceAvailable() {
        try {
            const response = await fetch(this.config.API_URL.replace('/api/generate', '/api/tags'), {
                method: 'GET',
                signal: AbortSignal.timeout(5000)
            });
            return response.ok;
        } catch (error) {
            console.error('Llama service availability check failed:', error);
            return false;
        }
    }

    /**
     * Obtiene información sobre el modelo
     * @returns {Promise<Object>} Información del modelo
     */
    async getModelInfo() {
        try {
            const response = await fetch(this.config.API_URL.replace('/api/generate', '/api/show'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name: this.config.MODEL_NAME }),
                signal: AbortSignal.timeout(5000)
            });

            if (response.ok) {
                return await response.json();
            }
            return null;
        } catch (error) {
            console.error('Failed to get model info:', error);
            return null;
        }
    }
}

export default new LlamaService();