# Módulo de Administración - Reportes de Programas Productivos

Este módulo proporciona funcionalidades completas para la generación de reportes y análisis de programas productivos para funcionarios y administradores del sistema.

## Características Principales

- **Reportes Generales**: Estadísticas completas de todos los programas
- **Reportes Específicos**: Análisis detallado por programa individual
- **Reportes de Participantes**: Seguimiento de campesinos y su participación
- **Estadísticas del Sistema**: Métricas generales y tendencias
- **Exportación**: Formatos JSON y CSV
- **Métricas de Rendimiento**: Análisis de progreso y eficiencia
- **Resumen Ejecutivo**: Vista de alto nivel para toma de decisiones

## Estructura del Módulo

```
admin/
├── admin.controller.js    # Controladores de endpoints
├── admin.service.js       # Lógica de negocio y cálculos
├── admin.routes.js        # Definición de rutas
├── admin.middleware.js    # Validaciones y autenticación
└── README.md             # Documentación
```

## Endpoints Disponibles

### Reportes Principales

#### GET `/api/admin/reports/programs`
Genera un reporte general de todos los programas.

**Parámetros de consulta:**
- `startDate` (opcional): Fecha de inicio (YYYY-MM-DD)
- `endDate` (opcional): Fecha de fin (YYYY-MM-DD)
- `estado` (opcional): Estado del programa (activo, completado, pendiente, cancelado)
- `categoria` (opcional): Categoría del programa

**Respuesta:**
```json
{
  "success": true,
  "message": "Reporte general generado exitosamente",
  "data": {
    "resumen": {
      "totalPrograms": 25,
      "activePrograms": 15,
      "completedPrograms": 8,
      "pendingPrograms": 2,
      "totalParticipants": 450,
      "totalBudget": 2500000,
      "averageParticipants": 18
    },
    "porCategoria": {...},
    "programasDestacados": [...],
    "programas": [...]
  }
}
```

#### GET `/api/admin/reports/programs/:id`
Genera un reporte específico de un programa.

**Parámetros:**
- `id`: ID del programa

**Parámetros de consulta:**
- `includeProjects` (opcional): Incluir proyectos asociados (default: true)
- `includeParticipants` (opcional): Incluir participantes (default: true)

#### GET `/api/admin/reports/participants`
Genera un reporte de participación por campesino.

**Parámetros de consulta:**
- `documento_identidad` (opcional): Documento específico
- `ubicacion` (opcional): Ubicación del participante
- `programa_id` (opcional): ID del programa específico

#### GET `/api/admin/reports/statistics`
Genera estadísticas generales del sistema.

**Parámetros de consulta:**
- `period` (opcional): Período en días (default: 30)

### Exportación

#### GET `/api/admin/reports/export/:type`
Exporta reportes en diferentes formatos.

**Parámetros:**
- `type`: Tipo de reporte (programs, participants, statistics)

**Parámetros de consulta:**
- `format` (opcional): Formato (json, csv) (default: json)

### Métricas y Análisis

#### GET `/api/admin/metrics/programs/:id`
Obtiene métricas de rendimiento por programa.

#### GET `/api/admin/reports/executive-summary`
Genera un resumen ejecutivo.

**Parámetros de consulta:**
- `startDate` (opcional): Fecha de inicio
- `endDate` (opcional): Fecha de fin

### Análisis Adicionales

#### GET `/api/admin/analytics/programs-by-category`
Análisis de programas agrupados por categoría.

#### GET `/api/admin/analytics/participation-trends`
Tendencias de participación en el tiempo.

**Parámetros de consulta:**
- `months` (opcional): Número de meses hacia atrás (default: 6)

#### GET `/api/admin/analytics/budget-analysis`
Análisis detallado de presupuestos.

## Autenticación y Autorización

Todas las rutas requieren:
1. **Token JWT válido** en el header `Authorization: Bearer <token>`
2. **Rol de funcionario o administrador** en el sistema

## Validaciones

El módulo incluye validaciones para:
- Formatos de fecha válidos
- IDs de MongoDB válidos
- Parámetros de consulta apropiados
- Rangos de fechas lógicos
- Rate limiting (100 requests por 15 minutos por usuario)

## Características de Seguridad

- **Autenticación JWT**: Verificación de tokens
- **Autorización por roles**: Solo funcionarios y administradores
- **Rate Limiting**: Prevención de abuso
- **Validación de entrada**: Sanitización de parámetros
- **Logging de acceso**: Registro de todas las consultas

## Ejemplos de Uso

### Obtener reporte general
```bash
curl -H "Authorization: Bearer <token>" \
     "http://localhost:5000/api/admin/reports/programs?estado=activo&startDate=2024-01-01"
```

### Exportar participantes en CSV
```bash
curl -H "Authorization: Bearer <token>" \
     "http://localhost:5000/api/admin/reports/export/participants?format=csv"
```

### Obtener métricas de un programa
```bash
curl -H "Authorization: Bearer <token>" \
     "http://localhost:5000/api/admin/metrics/programs/64a7b8c9d1e2f3a4b5c6d7e8"
```

## Estructura de Datos

### Reporte General
- **Resumen**: Totales y promedios
- **Por Categoría**: Agrupación por tipo de programa
- **Programas Destacados**: Top 5 por participación
- **Lista Completa**: Todos los programas con detalles

### Reporte de Programa
- **Información del Programa**: Datos básicos y estado
- **Métricas**: Ocupación, progreso, tiempo
- **Participantes**: Lista de campesinos inscritos
- **Proyectos**: Proyectos asociados y su estado

### Estadísticas del Sistema
- **Programas**: Totales por estado
- **Usuarios**: Distribución por tipo
- **Proyectos**: Tasas de completación
- **Participación**: Por ubicación geográfica
- **Tendencias**: Evolución mensual

## Manejo de Errores

El módulo maneja los siguientes tipos de errores:
- **401 Unauthorized**: Token inválido o expirado
- **403 Forbidden**: Permisos insuficientes
- **404 Not Found**: Programa no encontrado
- **400 Bad Request**: Parámetros inválidos
- **429 Too Many Requests**: Rate limit excedido
- **500 Internal Server Error**: Errores del servidor

## Consideraciones de Rendimiento

- **Agregaciones MongoDB**: Uso de pipelines optimizados
- **Índices**: Campos indexados para consultas rápidas
- **Paginación**: Para grandes conjuntos de datos
- **Cache**: Resultados cacheados cuando es apropiado
- **Rate Limiting**: Prevención de sobrecarga

## Logging

Todas las operaciones se registran con:
- Timestamp
- Usuario que realiza la consulta
- Endpoint accedido
- Parámetros utilizados
- IP de origen

## Mantenimiento

### Monitoreo
- Verificar logs regularmente
- Monitorear uso de recursos
- Revisar métricas de rendimiento

### Actualizaciones
- Mantener dependencias actualizadas
- Revisar y optimizar consultas
- Actualizar validaciones según necesidades

## Dependencias

- **express**: Framework web
- **jsonwebtoken**: Autenticación JWT
- **mongoose**: ODM para MongoDB
- **cors**: Manejo de CORS
- **helmet**: Seguridad HTTP

## Versión

**Versión actual**: 1.0.0

## Soporte

Para soporte técnico o reportar problemas, contactar al equipo de desarrollo.

---

*Documentación generada para el Sistema de Gestión de Programas Productivos - Alcaldía*