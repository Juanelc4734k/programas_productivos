# Módulo Chatbot con Llama 3.2 - Alcaldía de Montebello

Este módulo implementa un sistema de chatbot inteligente para la Alcaldía de Montebello, potenciado por **Llama 3.2**, diseñado para asistir a campesinos, funcionarios y administradores con información sobre programas municipales, trámites y servicios.

## 🚀 Características Principales

### 🤖 Asistente Virtual con IA
- **Llama 3.2** como motor principal de respuestas
- Respuestas contextuales y naturales
- Validación de contexto específico para Montebello
- Fallback a respuestas predefinidas
- Base de conocimiento específica para servicios municipales

### 💬 Gestión de Sesiones
- Sesiones persistentes con historial de conversación
- Múltiples sesiones activas por usuario
- Cierre automático de sesiones inactivas
- Archivado automático de conversaciones antiguas

### 👥 Soporte Multi-Usuario
- **Campesinos**: Información sobre programas agrícolas, insumos, capacitaciones
- **Funcionarios**: Gestión de solicitudes, reportes, procedimientos internos
- **Administradores**: Métricas del sistema, gestión de usuarios, configuración

### 🔒 Seguridad y Validación
- Validación de consultas relacionadas con Montebello
- Filtrado de contenido no relacionado
- Rate limiting para prevenir spam
- Autenticación requerida para todas las operaciones

## 🧠 Integración con Llama 3.2

### Configuración del Modelo

```javascript
// Configuración en chatbot.config.js
LLAMA: {
    MODEL_NAME: 'llama3.2',
    API_URL: process.env.LLAMA_API_URL || 'http://localhost:11434/api/generate',
    MAX_TOKENS: 512,
    TEMPERATURE: 0.7,
    TOP_P: 0.9,
    TIMEOUT_MS: 30000,
    RETRY_ATTEMPTS: 3,
    CONTEXT_WINDOW: 4096
}
```

### Variables de Entorno

```env
# Configuración de Llama 3.2
LLAMA_API_URL=http://localhost:11434/api/generate

# Base de datos
MONGO_URI=mongodb://localhost:27017/alcaldia_montebello

# Configuración del servidor
PORT=5000
NODE_ENV=development

# JWT para autenticación
JWT_SECRET=tu_jwt_secret_aqui
JWT_EXPIRE=30d
```

### Contexto Específico de Montebello

El sistema incluye un prompt especializado que instruye a Llama 3.2 sobre:

- **Municipio**: Montebello, Antioquia, Colombia
- **Actividades principales**: Agricultura (café, hortalizas, flores), ganadería menor, turismo rural
- **Programas disponibles**: 5 programas municipales específicos
- **Restricciones**: Solo responde sobre temas relacionados con Montebello
- **Tono**: Profesional pero cercano y amigable

## 📁 Estructura del Módulo

```
chatbot/
├── chatbot.config.js      # Configuración del módulo y Llama 3.2
├── chatbot.controller.js  # Controladores de endpoints
├── chatbot.middleware.js  # Middlewares de validación y seguridad
├── chatbot.model.js       # Modelo de datos de sesiones
├── chatbot.routes.js      # Definición de rutas
├── chatbot.service.js     # Lógica de negocio principal
├── chatbot.utils.js       # Utilidades y helpers
├── chatbot.validation.js  # Validaciones de entrada
├── llama.service.js       # Servicio específico para Llama 3.2
└── README.md             # Documentación
```

## 🔗 API Endpoints

### Gestión de Sesiones

#### `POST /api/chatbot/session/start`
Inicia una nueva sesión de chat o retorna una sesión activa existente.

#### `PUT /api/chatbot/session/:sessionId/close`
Cierra una sesión específica.

#### `GET /api/chatbot/session/:sessionId`
Obtiene los detalles de una sesión específica.

### Mensajería con IA

#### `POST /api/chatbot/message`
Envía un mensaje al chatbot y recibe una respuesta generada por Llama 3.2.

**Cuerpo de la petición:**
```json
{
  "message": "¿Cómo puedo solicitar semillas de café en Montebello?",
  "sessionId": "chat_1234567890_abc123"
}
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Mensaje procesado correctamente",
  "data": {
    "response": "Para solicitar semillas de café en Montebello, puedes seguir estos pasos: 1. Ingresa al portal de la alcaldía...",
    "sessionId": "chat_1234567890_abc123",
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
}
```

### Nuevos Endpoints para Llama 3.2

#### `GET /api/chatbot/llama/status`
Verifica el estado del servicio de Llama 3.2.

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "available": true,
    "model": "llama3.2",
    "api_url": "http://localhost:11434/api/generate",
    "ai_responses_enabled": true,
    "fallback_enabled": true
  }
}
```

#### `POST /api/chatbot/admin/toggle-ai` (Solo Administradores)
Alterna entre respuestas de IA y respuestas predefinidas.

**Cuerpo de la petición:**
```json
{
  "enabled": true
}
```

#### `GET /api/chatbot/config`
Obtiene la configuración actual del chatbot.

### Utilidades

#### `GET /api/chatbot/quick-replies`
Obtiene respuestas rápidas personalizadas según el tipo de usuario.

#### `GET /api/chatbot/sessions`
Obtiene el historial de sesiones del usuario.

#### `GET /api/chatbot/stats`
Obtiene estadísticas de uso del chatbot para el usuario.

## ⚙️ Configuración de Llama 3.2

### Instalación de Ollama (Recomendado)

1. **Instalar Ollama:**
```bash
# En Linux/macOS
curl -fsSL https://ollama.ai/install.sh | sh

# En Windows
# Descargar desde https://ollama.ai/download
```

2. **Descargar Llama 3.2:**
```bash
ollama pull llama3.2
```

3. **Iniciar el servicio:**
```bash
ollama serve
```

4. **Verificar instalación:**
```bash
curl http://localhost:11434/api/tags
```

### Configuración Alternativa

Si usas otro proveedor de Llama 3.2, actualiza la URL en las variables de entorno:

```env
LLAMA_API_URL=https://tu-proveedor-llama.com/api/generate
```

## 🎯 Validación de Contexto

El sistema valida que las consultas estén relacionadas con Montebello mediante:

### Palabras Clave Municipales
- Términos relacionados con servicios municipales
- Programas específicos de la alcaldía
- Actividades agrícolas locales
- Información de contacto y trámites

### Respuestas de Redirección
Si una consulta no está relacionada con Montebello, el sistema redirige amablemente:

```
"🏛️ Soy el asistente virtual de la Alcaldía de Montebello. 
Estoy aquí para ayudarte con información sobre nuestros 
programas municipales, trámites y servicios. 
¿En qué puedo asistirte hoy?"
```

## 🔄 Sistema de Fallback

El chatbot implementa un sistema robusto de fallback:

1. **Llama 3.2** (Principal): Respuestas generadas por IA
2. **Respuestas Predefinidas** (Fallback): Base de conocimiento local
3. **Mensaje de Error** (Último recurso): Cuando ambos fallan

### Configuración del Fallback

```javascript
// En chatbot.config.js
RESPONSES: {
    USE_AI_RESPONSES: true,        // Usar Llama 3.2
    FALLBACK_TO_PREDEFINED: true   // Fallback activado
}
```

## 📊 Monitoreo y Métricas

### Métricas de IA
- Tiempo de respuesta de Llama 3.2
- Tokens utilizados por consulta
- Tasa de éxito/fallo de la IA
- Uso de fallback vs respuestas de IA

### Logs Específicos
```javascript
// Ejemplo de log de respuesta
console.log(`Respuesta generada por llama: Para solicitar semillas...`);
console.warn('Llama service failed, falling back to predefined responses: Connection timeout');
```

## 🛠️ Desarrollo y Extensión

### Modificar el Prompt del Sistema

Edita `SYSTEM_PROMPT` en `chatbot.config.js` para ajustar el comportamiento de Llama 3.2:

```javascript
export const SYSTEM_PROMPT = `Eres un asistente virtual de la Alcaldía de Montebello...
// Agregar nuevas instrucciones aquí
`;
```

### Agregar Nuevas Validaciones

Modifica `isValidQuery()` en `llama.service.js` para incluir nuevas palabras clave:

```javascript
const municipalKeywords = [
    // Palabras existentes...
    'nueva_palabra_clave',
    'otro_termino_municipal'
];
```

### Configurar Parámetros de IA

Ajusta los parámetros de Llama 3.2 en `chatbot.config.js`:

```javascript
LLAMA: {
    TEMPERATURE: 0.7,    // Creatividad (0.0 - 1.0)
    TOP_P: 0.9,         // Diversidad de respuestas
    MAX_TOKENS: 512     // Longitud máxima de respuesta
}
```

## 🔧 Solución de Problemas

### Problemas con Llama 3.2

1. **Servicio no disponible**
   ```bash
   # Verificar que Ollama esté ejecutándose
   curl http://localhost:11434/api/tags
   
   # Reiniciar Ollama si es necesario
   ollama serve
   ```

2. **Modelo no encontrado**
   ```bash
   # Descargar el modelo
   ollama pull llama3.2
   ```

3. **Timeouts frecuentes**
   - Aumentar `TIMEOUT_MS` en la configuración
   - Verificar recursos del servidor
   - Considerar usar un modelo más pequeño

4. **Respuestas fuera de contexto**
   - Revisar y ajustar `SYSTEM_PROMPT`
   - Mejorar validaciones en `isValidQuery()`
   - Agregar más palabras clave específicas

### Logs de Debug

```javascript
// Habilitar logs detallados
LOGGING_CONFIG.LOG_LEVEL = 'debug';
```

### Verificar Estado del Sistema

```bash
# Endpoint para verificar estado
GET /api/chatbot/llama/status

# Endpoint para configuración
GET /api/chatbot/config
```

## 🚀 Despliegue en Producción

### Consideraciones de Rendimiento

1. **Recursos del Servidor**
   - CPU: Mínimo 4 cores para Llama 3.2
   - RAM: Mínimo 8GB (16GB recomendado)
   - Almacenamiento: SSD recomendado

2. **Configuración de Producción**
   ```env
   NODE_ENV=production
   LLAMA_API_URL=http://llama-server:11434/api/generate
   ```

3. **Monitoreo**
   - Configurar alertas para fallos de IA
   - Monitorear uso de recursos
   - Logs de rendimiento activados

### Docker Compose (Ejemplo)

```yaml
version: '3.8'
services:
  ollama:
    image: ollama/ollama
    ports:
      - "11434:11434"
    volumes:
      - ollama_data:/root/.ollama
    
  chatbot:
    build: .
    environment:
      - LLAMA_API_URL=http://ollama:11434/api/generate
    depends_on:
      - ollama
```

## 📝 Licencia

Este módulo es parte del sistema de la Alcaldía de Montebello y está sujeto a las políticas de software de la institución.