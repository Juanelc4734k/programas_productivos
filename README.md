# Sistema de Programas Productivos - Alcaldía de Montebello

## 📋 Descripción del Proyecto

Sistema integral de gestión para la Alcaldía de Montebello que permite administrar programas productivos, trámites digitales, capacitaciones y servicios ciudadanos. La plataforma está diseñada para facilitar la interacción entre campesinos, funcionarios y administradores, proporcionando herramientas para la gestión de programas agrícolas, seguimiento de proyectos, comunicaciones y servicios municipales.

## 🏗️ Arquitectura del Sistema

El proyecto está estructurado como una aplicación full-stack con:

- **Frontend**: Next.js 15 con React 19, TypeScript y Tailwind CSS
- **Backend**: Node.js con Express.js y MongoDB
- **Base de Datos**: MongoDB con Mongoose ODM
- **Autenticación**: JWT (JSON Web Tokens)
- **Almacenamiento**: Cloudinary para archivos multimedia
- **IA/Chatbot**: Integración con Ollama (Llama 3.2)

## 📁 Estructura de Directorios

```
proyecto/
├── frontend/                    # Aplicación Next.js
│   ├── app/                     # App Router de Next.js 13+
│   │   ├── (auth)/             # Rutas de autenticación
│   │   │   └── auth/
│   │   │       ├── login/      # Página de inicio de sesión
│   │   │       ├── register/   # Página de registro
│   │   │       └── forgot-password/ # Recuperación de contraseña
│   │   ├── (main)/             # Rutas principales protegidas
│   │   │   ├── admin/          # Dashboard administrativo
│   │   │   ├── funcionario/    # Dashboard para funcionarios
│   │   │   └── user/           # Dashboard para usuarios/campesinos
│   │   │       ├── calendario/ # Gestión de eventos y citas
│   │   │       ├── capacitaciones/ # Módulo de capacitaciones
│   │   │       ├── certificados/   # Gestión de certificados
│   │   │       ├── mapa/       # Georreferenciación
│   │   │       ├── noticias/   # Noticias y comunicados
│   │   │       ├── programs/   # Programas productivos
│   │   │       └── tramites/   # Trámites digitales
│   │   ├── globals.css         # Estilos globales
│   │   ├── layout.tsx          # Layout principal
│   │   └── page.tsx            # Página de inicio
│   ├── components/             # Componentes reutilizables
│   │   ├── ui/                 # Componentes de UI (shadcn/ui)
│   │   ├── header.tsx          # Componente de encabezado
│   │   ├── main-dashboard.tsx  # Dashboard principal
│   │   ├── chat-bot.tsx        # Componente del chatbot
│   │   └── ...
│   ├── contexts/               # Contextos de React
│   │   └── auth-context.tsx    # Contexto de autenticación
│   ├── hooks/                  # Hooks personalizados
│   │   ├── use-auth.ts         # Hook de autenticación
│   │   └── use-toast.ts        # Hook para notificaciones
│   ├── services/               # Servicios de API
│   │   ├── auth.service.ts     # Servicios de autenticación
│   │   ├── programs.service.ts # Servicios de programas
│   │   └── ...
│   ├── types/                  # Definiciones de TypeScript
│   │   ├── programs.ts         # Tipos para programas
│   │   └── beneficiaries.ts    # Tipos para beneficiarios
│   └── lib/                    # Utilidades y configuraciones
│       ├── utils.ts            # Funciones utilitarias
│       └── api.ts              # Configuración de API
├── backend/                     # API REST con Express.js
│   ├── src/
│   │   ├── config/             # Configuraciones
│   │   │   ├── db.js           # Configuración de MongoDB
│   │   │   └── cloudinary.config.js # Configuración de Cloudinary
│   │   ├── middlewares/        # Middlewares globales
│   │   │   ├── auth.middleware.js   # Middleware de autenticación
│   │   │   ├── role.middleware.js   # Middleware de roles
│   │   │   └── upload.middleware.js # Middleware de subida de archivos
│   │   ├── modules/            # Módulos funcionales
│   │   │   ├── auth/           # Autenticación y usuarios
│   │   │   │   ├── user.model.js    # Modelo de usuario
│   │   │   │   ├── auth.controller.js # Controlador de autenticación
│   │   │   │   └── auth.routes.js   # Rutas de autenticación
│   │   │   ├── programs/       # Programas productivos
│   │   │   │   ├── programs.model.js    # Modelo de programas
│   │   │   │   ├── programs.controller.js # Controlador de programas
│   │   │   │   └── programs.route.js    # Rutas de programas
│   │   │   ├── chatbot/        # Sistema de chatbot con IA
│   │   │   ├── digitalProcedures/ # Trámites digitales
│   │   │   ├── news/           # Gestión de noticias
│   │   │   ├── training/       # Capacitaciones
│   │   │   ├── geo/            # Georreferenciación
│   │   │   ├── communications/ # Comunicaciones
│   │   │   ├── feedback/       # Evaluación y retroalimentación
│   │   │   └── documents/      # Gestión documental
│   │   ├── shared/             # Recursos compartidos
│   │   │   ├── models/         # Modelos compartidos
│   │   │   ├── services/       # Servicios compartidos
│   │   │   ├── utils/          # Utilidades
│   │   │   └── validation/     # Validaciones
│   │   ├── app.js              # Configuración de Express
│   │   └── server.js           # Punto de entrada del servidor
│   └── package.json            # Dependencias del backend
└── package.json                # Dependencias del proyecto raíz
```

## 🛠️ Tecnologías Utilizadas

### Frontend
- **Next.js 15.2.4**: Framework de React con App Router
- **React 19**: Biblioteca de interfaz de usuario
- **TypeScript 5**: Superset tipado de JavaScript
- **Tailwind CSS 3.4.17**: Framework de CSS utilitario
- **shadcn/ui**: Componentes de UI con Radix UI
- **React Hook Form**: Gestión de formularios
- **Axios**: Cliente HTTP para API
- **React Query**: Gestión de estado del servidor
- **Leaflet**: Mapas interactivos
- **Recharts**: Gráficos y visualizaciones
- **Lucide React**: Iconografía
- **Sonner**: Notificaciones toast
- **JWT Decode**: Decodificación de tokens JWT
- **Zod**: Validación de esquemas

### Backend
- **Node.js**: Entorno de ejecución de JavaScript
- **Express.js 4.21.2**: Framework web para Node.js
- **MongoDB**: Base de datos NoSQL
- **Mongoose 8.9.3**: ODM para MongoDB
- **JWT**: Autenticación basada en tokens
- **bcryptjs**: Encriptación de contraseñas
- **Cloudinary**: Almacenamiento de archivos multimedia
- **Multer**: Manejo de archivos multipart
- **Nodemailer**: Envío de correos electrónicos
- **Ollama**: Integración con modelos de IA (Llama 3.2)
- **Socket.io**: Comunicación en tiempo real
- **Helmet**: Seguridad HTTP
- **CORS**: Configuración de recursos cruzados
- **Morgan**: Logger de HTTP
- **Express Rate Limit**: Limitación de velocidad
- **Express Validator**: Validación de datos
- **Puppeteer**: Generación de PDFs
- **Node Cron**: Tareas programadas

## 📦 Dependencias Principales

### Frontend (`frontend/package.json`)
```json
{
  "dependencies": {
    "next": "15.2.4",
    "react": "^19",
    "react-dom": "^19",
    "typescript": "^5",
    "tailwindcss": "^3.4.17",
    "@tanstack/react-query": "^5.80.10",
    "axios": "^1.10.0",
    "react-hook-form": "^7.54.1",
    "@hookform/resolvers": "^3.9.1",
    "zod": "^3.24.1",
    "jwt-decode": "^4.0.0",
    "lucide-react": "^0.454.0",
    "sonner": "^1.7.1",
    "leaflet": "^1.9.4",
    "react-leaflet": "^5.0.0",
    "recharts": "2.15.0"
  }
}
```

### Backend (`backend/package.json`)
```json
{
  "dependencies": {
    "express": "^4.21.2",
    "mongoose": "^8.9.3",
    "jsonwebtoken": "^9.0.2",
    "bcryptjs": "^2.4.3",
    "cors": "^2.8.5",
    "helmet": "^8.0.0",
    "morgan": "^1.10.0",
    "dotenv": "^16.4.7",
    "cloudinary": "^2.7.0",
    "multer": "^1.4.5-lts.1",
    "nodemailer": "^6.9.17",
    "ollama": "^0.5.16",
    "socket.io": "^4.8.1",
    "express-rate-limit": "^8.0.1",
    "express-validator": "^7.2.1",
    "puppeteer": "^24.15.0",
    "node-cron": "^4.2.1"
  }
}
```

## ⚙️ Configuración del Proyecto

### Prerrequisitos
- Node.js 18+ y npm/pnpm
- MongoDB (local o remoto)
- Git

### Variables de Entorno

Crea un archivo `.env` en el directorio `backend/` con las siguientes variables:

```env
# Configuración del servidor
PORT=5000

# Base de datos
MONGO_URI=mongodb://localhost:27017/alcaldia_montebello

# Autenticación
JWT_SECRET=tu_jwt_secret_muy_seguro

# Ollama/IA
LLAMA_API_URL=http://localhost:11434/api/generate
LLAMA_MODEL_NAME=llama3.2

# Correo electrónico
EMAIL_USER=tu_email@gmail.com
EMAIL_PASS=tu_contraseña_de_aplicacion

# Cloudinary
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret
CLOUDINARY_CLOUD_NAME=tu_cloud_name
```

### Instalación y Configuración

#### 1. Clonar el repositorio
```bash
git clone <url-del-repositorio>
cd programas_productivos
```

#### 2. Instalar dependencias del proyecto raíz
```bash
npm install
# o
pnpm install
```

#### 3. Configurar el Backend
```bash
cd backend
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus configuraciones
```

#### 4. Configurar el Frontend
```bash
cd ../frontend
npm install
```

#### 5. Configurar MongoDB
- Instalar MongoDB localmente o usar MongoDB Atlas
- Crear la base de datos `alcaldia_montebello`
- Ejecutar scripts de inicialización si están disponibles:

```bash
# Desde el directorio backend
npm run seed:faqs  # Sembrar datos de FAQs para el chatbot
```

#### 6. Configurar Ollama (Opcional - para IA/Chatbot)
```bash
# Instalar Ollama
# Descargar modelo Llama 3.2
ollama pull llama3.2

# Desde el directorio backend
npm run setup:ollama
npm run setup:training
```

## 🚀 Ejecución del Proyecto

### Desarrollo

#### Ejecutar Backend
```bash
cd backend
npm run dev  # Usa nodemon para recarga automática
# o
npm start    # Ejecución normal
```
El backend estará disponible en: `http://localhost:5000`

#### Ejecutar Frontend
```bash
cd frontend
npm run dev
```
El frontend estará disponible en: `http://localhost:3000`

### Producción

#### Backend
```bash
cd backend
npm start
```

#### Frontend
```bash
cd frontend
npm run build
npm start
```

## 📊 Base de Datos y Modelos

### Modelos Principales

#### Usuario (`User`)
```javascript
{
  nombre: String,
  documento_identidad: String (único),
  correo: String (único),
  telefono: String,
  tipo_usuario: ['campesino', 'funcionario', 'admin'],
  contrasena: String (encriptada),
  estado: ['activo', 'inactivo'],
  fecha_registro: Date,
  // Campos específicos para campesinos
  vereda: String,
  direccion: String,
  // Campos específicos para funcionarios
  codigo_empleado: String,
  dependencia: String
}
```

#### Programa (`Program`)
```javascript
{
  nombre: String (único),
  descripcion: String,
  categoria: String,
  fecha_inicio: Date,
  fecha_fin: Date,
  estado: ['activo', 'finalizado', 'en espera', 'cancelado'],
  cupos: Number,
  banner_url: String,
  responsable: ObjectId (ref: User),
  inscritos: [ObjectId] (ref: User),
  beneficios: [String],
  requisitos: [String],
  progreso: Number (0-100),
  presupuesto: Number,
  ubicaciones: [String],
  testimonios: [{
    texto: String,
    autor: String,
    fecha: Date
  }]
}
```

## 🔌 API Endpoints Principales

### Autenticación
- `POST /api/auth/register` - Registro de usuarios
- `POST /api/auth/login` - Inicio de sesión
- `POST /api/auth/logout` - Cerrar sesión
- `POST /api/auth/forgot-password` - Recuperar contraseña

### Usuarios
- `GET /api/users/profile` - Obtener perfil del usuario
- `PUT /api/users/profile` - Actualizar perfil
- `GET /api/users` - Listar usuarios (admin)

### Programas
- `GET /api/programas` - Listar programas
- `GET /api/programas/:id` - Obtener programa específico
- `POST /api/programas` - Crear programa (funcionario/admin)
- `PUT /api/programas/:id` - Actualizar programa
- `DELETE /api/programas/:id` - Eliminar programa
- `POST /api/programas/:id/enroll/:userId` - Inscribir usuario
- `DELETE /api/programas/:id/unenroll/:userId` - Desinscribir usuario

### Chatbot
- `POST /api/chatbot/chat` - Enviar mensaje al chatbot
- `GET /api/chatbot/faqs` - Obtener preguntas frecuentes

### Trámites
- `GET /api/tramites` - Listar trámites
- `POST /api/tramites` - Crear trámite
- `GET /api/tramites/:id` - Obtener trámite específico

### Noticias
- `GET /api/news` - Listar noticias
- `POST /api/news` - Crear noticia (admin)
- `PUT /api/news/:id` - Actualizar noticia
- `DELETE /api/news/:id` - Eliminar noticia

## 📝 Scripts Disponibles

### Backend
```bash
npm start              # Ejecutar servidor en producción
npm run dev            # Ejecutar servidor en desarrollo con nodemon
npm run seed:faqs      # Sembrar datos de FAQs
npm run setup:ollama   # Configurar Ollama
npm run setup:training # Configurar entrenamiento de IA
npm run training:config # Configurar entrenamiento
npm run training:diagnose # Diagnosticar entrenamiento
npm run training:cleanup # Limpiar datos de entrenamiento
```

### Frontend
```bash
npm run dev    # Ejecutar en modo desarrollo
npm run build  # Construir para producción
npm run start  # Ejecutar versión de producción
npm run lint   # Ejecutar linter
```

## 🔐 Roles y Permisos

### Campesino
- Ver y inscribirse en programas
- Gestionar perfil personal
- Realizar trámites digitales
- Acceder a capacitaciones
- Ver noticias y comunicados
- Usar chatbot de asistencia

### Funcionario
- Todas las funciones de campesino
- Crear y gestionar programas
- Revisar y aprobar trámites
- Gestionar capacitaciones
- Publicar noticias
- Acceder a reportes básicos

### Administrador
- Todas las funciones anteriores
- Gestión completa de usuarios
- Configuración del sistema
- Acceso a todos los reportes
- Gestión de roles y permisos
- Configuración de módulos

## 🚀 Funcionalidades Principales

1. **Gestión de Programas Productivos**
   - Creación y administración de programas
   - Sistema de inscripciones
   - Seguimiento de progreso
   - Gestión de beneficiarios

2. **Trámites Digitales**
   - Solicitud de trámites en línea
   - Seguimiento de estado
   - Notificaciones automáticas
   - Generación de documentos

3. **Sistema de Capacitaciones**
   - Programación de eventos
   - Gestión de asistencia
   - Certificados digitales
   - Material de apoyo

4. **Chatbot Inteligente**
   - Asistencia 24/7
   - Respuestas automáticas
   - Integración con IA (Llama 3.2)
   - Base de conocimientos

5. **Georreferenciación**
   - Mapas interactivos
   - Ubicación de programas
   - Datos geográficos
   - Análisis territorial

6. **Sistema de Comunicaciones**
   - Noticias y comunicados
   - Notificaciones push
   - Correos electrónicos
   - Mensajería interna

## 🔧 Desarrollo y Contribución

### Estructura de Commits
```
feat: nueva funcionalidad
fix: corrección de errores
docs: documentación
style: formato, punto y coma faltante, etc.
refactor: refactorización de código
test: agregar pruebas
chore: tareas de mantenimiento
```

### Flujo de Desarrollo
1. Fork del repositorio
2. Crear rama feature: `git checkout -b feature/nueva-funcionalidad`
3. Commit de cambios: `git commit -m 'feat: agregar nueva funcionalidad'`
4. Push a la rama: `git push origin feature/nueva-funcionalidad`
5. Crear Pull Request

### Estándares de Código
- Usar TypeScript en el frontend
- Seguir convenciones de ESLint
- Documentar funciones complejas
- Escribir pruebas para nuevas funcionalidades
- Usar nombres descriptivos para variables y funciones

## 📞 Soporte y Contacto

Para soporte técnico o consultas sobre el proyecto:

- **Email**: jtoroblandon@gmail.com
- **Documentación**: Ver archivos README en cada módulo
- **Issues**: Usar el sistema de issues del repositorio

## 📄 Licencia

Este proyecto está bajo la Licencia ISC. Ver el archivo `LICENSE` para más detalles.

---

**Desarrollado para la Alcaldía de Montebello**  
*Sistema de Gestión de Programas Productivos*