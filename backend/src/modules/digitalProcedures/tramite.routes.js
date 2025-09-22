import { Router } from 'express';
import { protect, authorize } from '../../middlewares/auth.middleware.js';
import { 
    crearTramite,
    obtenerTramites,
    obtenerTramitePorId,
    actualizarTramite,
    eliminarTramite,
    obtenerTramitesPorUsuario,
    cambiarEstadoTramite,
    adjuntarDocumento
} from './tramite.controller.js';
import multer from 'multer';
import { uploadToCloudinary } from '../../middlewares/upload.middleware.js';

const upload = multer({ storage: multer.memoryStorage() });

const router = Router();

// Rutas públicas - solo lectura
router.get('/public', obtenerTramites);

// Rutas protegidas - requieren autenticación
router.use(protect);

// Rutas para todos los usuarios autenticados
router.post('/', authorize(['campesino', 'funcionario', 'admin']), crearTramite);
router.get('/', obtenerTramites);
router.get('/usuario/:userId', obtenerTramitesPorUsuario);
router.get('/:id', obtenerTramitePorId);

// Rutas para funcionarios y administradores
router.put('/:id', authorize(['funcionario', 'admin']), actualizarTramite);
router.delete('/:id', authorize(['admin']), eliminarTramite);
router.patch('/:id/estado', authorize(['funcionario', 'admin']), cambiarEstadoTramite);
router.post('/:id/documentos', 
    authorize(['campesino', 'funcionario', 'admin']), 
    upload.single('documento'),
    uploadToCloudinary,
    adjuntarDocumento
);

export default router;