# Módulo de Noticias y Eventos

Este módulo proporciona funcionalidades completas para la gestión de noticias y eventos en el sistema de la Alcaldía de Montebello.

## Características Principales

### Noticias
- ✅ Creación, edición y eliminación de noticias
- ✅ Sistema de categorías predefinidas
- ✅ Temas específicos del municipio
- ✅ Sistema de hashtags
- ✅ Gestión de favoritos por usuario
- ✅ Contador de vistas
- ✅ Estados de publicación (borrador, publicada, archivada)
- ✅ Búsqueda y filtrado avanzado
- ✅ Paginación
- ✅ Generación automática de slug
- ✅ Metadatos SEO

### Eventos
- ✅ Creación y gestión de eventos
- ✅ Sistema de registro de participantes
- ✅ Control de cupos máximos
- ✅ Validación de fechas futuras
- ✅ Horarios de inicio y fin
- ✅ Información de contacto
- ✅ Requisitos y materiales
- ✅ Estados del evento (programado, en curso, finalizado, cancelado)

## Estructura del Módulo

```
src/modules/news/
├── news.model.js          # Modelos de datos (News, Event)
├── news.service.js        # Lógica de negocio
├── news.controller.js     # Controladores de API
├── news.routes.js         # Definición de rutas
├── news.validation.js     # Validaciones de entrada
├── news.middleware.js     # Middleware específico
├── news.utils.js          # Utilidades y helpers
├── news.config.js         # Configuración del módulo
├── news.test.js           # Pruebas unitarias
└── README.md              # Documentación
```

## Modelos de Datos

### Noticia (News)

```javascript
{
  titulo: String,              // Título de la noticia (requerido)
  descripcion: String,         // Descripción completa (requerido)
  categoria: String,           // Categoría predefinida (requerido)
  fecha: Date,                 // Fecha de la noticia
  imagen: String,              // URL de la imagen
  destacada: Boolean,          // Si es noticia destacada
  temas: [String],            // Temas relacionados
  hashtags: [String],         // Hashtags
  lugar: String,              // Ubicación
  autor: ObjectId,            // ID del autor
  estado: String,             // Estado de publicación
  vistas: Number,             // Contador de vistas
  favoritos: [ObjectId],      // IDs de usuarios que marcaron como favorito
  slug: String,               // URL amigable
  metadatos: {
    resumen: String,          // Resumen para SEO
    palabrasClave: [String],  // Palabras clave
    tiempoLectura: Number     // Tiempo estimado de lectura
  }
}
```

### Evento (Event)

```javascript
{
  titulo: String,              // Título del evento (requerido)
  descripcion: String,         // Descripción completa (requerido)
  categoria: String,           // Categoría predefinida (requerido)
  fechaEvento: Date,          // Fecha del evento (requerido)
  horarioEvento: {
    inicio: String,           // Hora de inicio (HH:MM)
    fin: String              // Hora de fin (HH:MM)
  },
  lugar: String,              // Ubicación del evento (requerido)
  participantes: {
    maximo: Number,           // Cupo máximo
    registrados: [{
      usuario: ObjectId,      // ID del usuario
      datos: {
        nombre: String,
        email: String,
        telefono: String
      },
      fechaRegistro: Date
    }]
  },
  organizador: ObjectId,      // ID del organizador
  imagen: String,             // URL de la imagen
  requisitos: [String],       // Requisitos para participar
  materiales: [String],       // Materiales necesarios
  contacto: {
    telefono: String,
    email: String
  },
  estado: String,             // Estado del evento
  slug: String               // URL amigable
}
```

## Categorías Predefinidas

- **Programas**: Programas municipales y gubernamentales
- **Capacitaciones**: Talleres, cursos y entrenamientos
- **Eventos**: Eventos culturales, deportivos y sociales
- **Convocatorias**: Llamados públicos y licitaciones
- **Logros y Resultados**: Achievements y resultados de gestión

## Temas Específicos

- **Café**: Relacionado con la industria cafetera
- **Tecnología**: Innovación y tecnología
- **Comercialización**: Comercio y mercadeo
- **Ganadería**: Sector ganadero
- **Agricultura**: Sector agrícola

## API Endpoints

### Noticias

| Método | Endpoint | Descripción | Autenticación |
|--------|----------|-------------|---------------|
| GET | `/api/news` | Listar noticias con filtros | No |
| GET | `/api/news/:id` | Obtener noticia por ID | No |
| POST | `/api/news` | Crear nueva noticia | Sí (Editor/Admin) |
| PUT | `/api/news/:id` | Actualizar noticia | Sí (Propietario/Admin) |
| DELETE | `/api/news/:id` | Eliminar noticia | Sí (Admin) |
| POST | `/api/news/:id/favorite` | Agregar/quitar favorito | Sí |
| POST | `/api/news/:id/view` | Incrementar vistas | No |

### Eventos

| Método | Endpoint | Descripción | Autenticación |
|--------|----------|-------------|---------------|
| GET | `/api/news/events` | Listar eventos con filtros | No |
| GET | `/api/news/events/:id` | Obtener evento por ID | No |
| POST | `/api/news/events` | Crear nuevo evento | Sí (Editor/Admin) |
| PUT | `/api/news/events/:id` | Actualizar evento | Sí (Propietario/Admin) |
| DELETE | `/api/news/events/:id` | Eliminar evento | Sí (Admin) |
| POST | `/api/news/events/:id/register` | Registrarse en evento | Sí |
| DELETE | `/api/news/events/:id/register` | Cancelar registro | Sí |
| GET | `/api/news/events/:id/participants` | Ver participantes | Sí (Admin/Editor) |

### Utilidades

| Método | Endpoint | Descripción | Autenticación |
|--------|----------|-------------|---------------|
| GET | `/api/news/filters` | Obtener filtros disponibles | No |
| GET | `/api/news/admin/statistics` | Estadísticas generales | Sí (Admin) |

## Parámetros de Consulta

### Para Noticias

- `page`: Número de página (default: 1)
- `limit`: Elementos por página (default: 10, max: 100)
- `categoria`: Filtrar por categoría
- `destacada`: Filtrar noticias destacadas (true/false)
- `estado`: Filtrar por estado (borrador/publicada/archivada)
- `temas`: Filtrar por temas (array)
- `sortBy`: Campo de ordenamiento (fecha/titulo/vistas/fechaCreacion)
- `sortOrder`: Orden (asc/desc)
- `fechaDesde`: Fecha desde (ISO 8601)
- `fechaHasta`: Fecha hasta (ISO 8601)
- `busqueda`: Búsqueda por texto

### Para Eventos

- `page`: Número de página (default: 1)
- `limit`: Elementos por página (default: 10, max: 100)
- `categoria`: Filtrar por categoría
- `estado`: Filtrar por estado (programado/en_curso/finalizado/cancelado)
- `sortBy`: Campo de ordenamiento (fechaEvento/titulo/createdAt)
- `sortOrder`: Orden (asc/desc)
- `fechaDesde`: Fecha desde (ISO 8601)
- `fechaHasta`: Fecha hasta (ISO 8601)
- `busqueda`: Búsqueda por texto

## Ejemplos de Uso

### Crear una Noticia

```javascript
POST /api/news
Content-Type: application/json
Authorization: Bearer <token>

{
  "titulo": "Nueva capacitación en técnicas de cultivo de café",
  "descripcion": "La Alcaldía de Montebello invita a todos los caficultores...",
  "categoria": "Capacitaciones",
  "fecha": "2024-01-15T00:00:00.000Z",
  "imagen": "https://example.com/cafe-capacitacion.jpg",
  "destacada": true,
  "temas": ["Cafe", "Agricultura"],
  "hashtags": ["#cafe", "#capacitacion", "#montebello"],
  "lugar": "Centro de Convenciones, Montebello"
}
```

### Buscar Noticias

```javascript
GET /api/news?categoria=Capacitaciones&temas=Cafe&busqueda=cultivo&page=1&limit=10
```

### Crear un Evento

```javascript
POST /api/news/events
Content-Type: application/json
Authorization: Bearer <token>

{
  "titulo": "Taller de Comercialización de Café",
  "descripcion": "Aprende las mejores técnicas para comercializar tu café...",
  "categoria": "Capacitaciones",
  "fechaEvento": "2024-02-20T00:00:00.000Z",
  "horarioEvento": {
    "inicio": "08:00",
    "fin": "12:00"
  },
  "lugar": "Salón Comunal, Vereda El Café",
  "participantes": {
    "maximo": 30
  },
  "requisitos": ["Ser productor de café", "Traer muestra de café"],
  "materiales": ["Cuaderno", "Lapicero"],
  "contacto": {
    "telefono": "3001234567",
    "email": "eventos@montebello.gov.co"
  }
}
```

### Registrarse en un Evento

```javascript
POST /api/news/events/507f1f77bcf86cd799439011/register
Content-Type: application/json
Authorization: Bearer <token>

{
  "nombre": "Juan Pérez",
  "email": "juan.perez@email.com",
  "telefono": "3009876543"
}
```

## Validaciones

### Noticias
- Título: 5-200 caracteres, requerido
- Descripción: mínimo 10 caracteres, requerido
- Categoría: debe ser una de las predefinidas
- Temas: deben ser de la lista predefinida
- Hashtags: máximo 10, cada uno máximo 50 caracteres
- Estado: borrador/publicada/archivada

### Eventos
- Título: 5-200 caracteres, requerido
- Descripción: mínimo 10 caracteres, requerido
- Fecha del evento: debe ser futura
- Horario: formato HH:MM, fin debe ser posterior al inicio
- Lugar: 3-200 caracteres, requerido
- Participantes máximo: 1-10000
- Email de contacto: formato válido
- Teléfono: formato colombiano

## Middleware de Seguridad

- **Rate Limiting**: Límites por tipo de operación
- **Autenticación**: JWT tokens para operaciones protegidas
- **Autorización**: Roles de usuario (admin, editor, user)
- **Validación**: Validación exhaustiva de entrada
- **Sanitización**: Limpieza de datos de entrada

## Configuración

El módulo utiliza configuración centralizada en `news.config.js`:

- Límites de paginación
- Límites de contenido
- Configuración de cache
- Rate limiting
- Configuración de imágenes
- Mensajes de error personalizados

## Pruebas

Ejecuta las pruebas con:

```bash
npm test src/modules/news/news.test.js
```

Las pruebas cubren:
- Modelos de datos
- Servicios
- Validaciones
- Filtros y búsqueda
- Paginación
- Registro de eventos

## Logging

El módulo incluye logging detallado:

- Actividades de usuario
- Errores y excepciones
- Operaciones CRUD
- Accesos y consultas

## Consideraciones de Rendimiento

- Índices de base de datos optimizados
- Cache de consultas frecuentes
- Paginación eficiente
- Rate limiting para prevenir abuso
- Compresión de respuestas

## Seguridad

- Validación de entrada exhaustiva
- Sanitización de datos
- Protección contra inyección
- Control de acceso basado en roles
- Logging de actividades sensibles

## Mantenimiento

- Configuración por entorno
- Backup automático (producción)
- Monitoreo de errores
- Métricas de uso
- Limpieza automática de datos obsoletos

## Contribución

Para contribuir al módulo:

1. Sigue las convenciones de código establecidas
2. Agrega pruebas para nuevas funcionalidades
3. Actualiza la documentación
4. Verifica que todas las pruebas pasen
5. Mantén la compatibilidad con versiones anteriores

## Soporte

Para soporte técnico o reportar problemas, contacta al equipo de desarrollo del sistema de la Alcaldía de Montebello.