import express from 'express';
import { registerCampesino, loginCampesino, registerFuncionario, loginFuncionario, loginAdmin } from './auth.controller.js';
import { protect } from '../../middlewares/auth.middleware.js';
import passwordResetRoutes from './passwordReset.routes.js';

const router = express.Router();

router.post('/register/campesino', registerCampesino);
router.post('/login/campesino', loginCampesino);

router.post('/register/funcionario', registerFuncionario);
router.post('/login/funcionario', loginFuncionario);
router.post('/login/admin', loginAdmin);

// Rutas de recuperación de contraseña
router.use('/password-reset', passwordResetRoutes);

router.get('/me', protect, (req, res) => {
    res.json({
        message: 'Usuario autenticado',
        user: req.user
    });
});

export default router;
