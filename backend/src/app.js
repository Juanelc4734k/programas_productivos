import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';

import authRoutes from './modules/auth/auth.routes.js';
import userRoutes from './modules/auth/user.routes.js';
// Rutas de Programas y Proyectos
import programsRoutes from './modules/programs/programs.route.js';

import chatbotRoutes from './modules/chatbot/chatbot.routes.js'; // Importar rutas del chatbot

import tramiteRoutes from './modules/digitalProcedures/tramite.routes.js'; // Importar rutas de trámites digitales
import newsRoutes from './modules/news/news.routes.js'; // Importar rutas del módulo de noticias
import adminRoutes from './modules/admin/admin.routes.js'; // Importar rutas del módulo de administración

dotenv.config();

const app = express();

//Middlewares
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));

//Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/programas', programsRoutes);
app.use('/api/chatbot', chatbotRoutes); // Montar rutas del chatbot
app.use('/api/tramites', tramiteRoutes); // Montar rutas de trámites digitales
app.use('/api/news', newsRoutes); // Montar rutas del módulo de noticias
app.use('/api/admin', adminRoutes); // Montar rutas del módulo de administración
//app.use('/api/procedures', proceduresRoutes); // Montar rutas de trámites digitales
//app.use('/api/trainings', trainingRoutes); // Montar rutas de capacitaciones
//app.use('/api/geo', geoRoutes); // Montar rutas de georreferenciación
//app.use('/api/communications', communicationsRoutes); // Montar rutas de comunicaciones
//app.use('/api/feedback', feedbackRoutes); // Montar rutas de evaluación y retroalimentación
//app.use('/api/documents', documentRoutes); // Montar rutas de gestión documental

export default app;


