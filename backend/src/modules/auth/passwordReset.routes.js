import express from 'express';
import { 
  requestPasswordReset, 
  verifyResetCode, 
  resetPassword 
} from './passwordReset.controller.js';

const router = express.Router();

// Solicitar código de recuperación
router.post('/request', requestPasswordReset);

// Verificar código
router.post('/verify', verifyResetCode);

// Restablecer contraseña
router.post('/reset', resetPassword);

export default router;