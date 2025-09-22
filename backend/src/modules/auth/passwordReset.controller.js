import userModel from './user.model.js';
import PasswordReset from './passwordReset.model.js';
import bcryptjs from 'bcryptjs';
import { sendPasswordResetCode, sendPasswordChangeConfirmation } from './email.service.js';

// Generar código aleatorio de 6 dígitos
const generateResetCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Solicitar código de recuperación
export const requestPasswordReset = async (req, res) => {
  try {
    const { identifier, userType } = req.body;
    
    if (!identifier || !userType) {
      return res.status(400).json({ 
        message: 'El identificador y tipo de usuario son obligatorios' 
      });
    }

    // Buscar usuario por email o documento_identidad
    const user = await userModel.findOne({
      $and: [
        {
          $or: [
            { correo: identifier },
            { documento_identidad: identifier }
          ]
        },
        { tipo_usuario: userType }
      ]
    });

    if (!user) {
      return res.status(404).json({ 
        message: 'No se encontró un usuario con esos datos' 
      });
    }

    // Cambiar user.activo por user.estado !== 'activo'
    if (user.estado !== 'activo') {
      return res.status(400).json({ 
        message: 'La cuenta no está activa. Contacta al administrador.' 
      });
    }

    // Eliminar códigos anteriores no utilizados
    const deletedCodes = await PasswordReset.deleteMany({ 
      userId: user._id, 
      used: false 
    });
    console.log('Códigos anteriores eliminados:', deletedCodes.deletedCount);

    // Generar nuevo código
    const resetCode = generateResetCode();
    console.log('Código generado:', resetCode);
    
    // Guardar código en la base de datos
    const passwordReset = new PasswordReset({
      userId: user._id,
      email: user.correo,
      code: resetCode
    });
    
    const savedReset = await passwordReset.save();
    console.log('Código guardado en BD:', {
      id: savedReset._id,
      email: savedReset.email,
      code: savedReset.code,
      expiresAt: savedReset.expiresAt,
      used: savedReset.used
    });

    // Verificar inmediatamente que se guardó correctamente
    const verification = await PasswordReset.findOne({
      email: user.correo,
      code: resetCode,
      used: false
    });
    console.log('Verificación inmediata del código guardado:', verification);

    // Enviar código por email
    try {
      await sendPasswordResetCode(user.correo, resetCode, user.nombre);
      
      res.status(200).json({ 
        message: 'Código de recuperación enviado a tu correo electrónico',
        email: user.correo.replace(/(.{2})(.*)(@.*)/, '$1***$3') // Ocultar parte del email
      });
    } catch (emailError) {
      console.error('Error enviando email:', emailError);
      // Eliminar el código si no se pudo enviar el email
      await PasswordReset.findByIdAndDelete(passwordReset._id);
      
      return res.status(500).json({ 
        message: 'Error al enviar el código. Intenta nuevamente.' 
      });
    }

  } catch (error) {
    console.error('Error en requestPasswordReset:', error);
    res.status(500).json({ 
      message: 'Error interno del servidor' 
    });
  }
};

// Verificar código de recuperación
export const verifyResetCode = async (req, res) => {
  try {
    const { email, code } = req.body;
    
    if (!email || !code) {
      return res.status(400).json({ 
        message: 'El email y código son obligatorios' 
      });
    }

    // Agregar logs para depuración
    console.log('Verificando código:', { email, code, currentTime: new Date() });

    // Buscar código válido
    const passwordReset = await PasswordReset.findOne({
      email,
      code,
      used: false
    });

    console.log('Código encontrado:', passwordReset);

    if (!passwordReset) {
      return res.status(400).json({ 
        message: 'Código no encontrado o ya usado' 
      });
    }

    // Verificar expiración manualmente
    const now = new Date();
    const isExpired = passwordReset.expiresAt < now;
    
    console.log('Verificación de expiración:', {
      expiresAt: passwordReset.expiresAt,
      now: now,
      isExpired: isExpired
    });

    if (isExpired) {
      return res.status(400).json({ 
        message: 'Código expirado' 
      });
    }

    res.status(200).json({ 
      message: 'Código verificado correctamente',
      resetId: passwordReset._id
    });

  } catch (error) {
    console.error('Error en verifyResetCode:', error);
    res.status(500).json({ 
      message: 'Error interno del servidor' 
    });
  }
};

// Restablecer contraseña
export const resetPassword = async (req, res) => {
  try {
    const { resetId, newPassword, confirmPassword } = req.body;
    
    if (!resetId || !newPassword || !confirmPassword) {
      return res.status(400).json({ 
        message: 'Todos los campos son obligatorios' 
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ 
        message: 'Las contraseñas no coinciden' 
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ 
        message: 'La contraseña debe tener al menos 8 caracteres' 
      });
    }

    // Buscar código de reset válido
    const passwordReset = await PasswordReset.findOne({
      _id: resetId,
      used: false,
      expiresAt: { $gt: new Date() }
    });

    if (!passwordReset) {
      return res.status(400).json({ 
        message: 'Código de recuperación inválido o expirado' 
      });
    }

    // Buscar usuario
    const user = await userModel.findById(passwordReset.userId);
    if (!user) {
      return res.status(404).json({ 
        message: 'Usuario no encontrado' 
      });
    }

    // Encriptar nueva contraseña
    const hashedPassword = await bcryptjs.hash(newPassword, 10);
    
    // Actualizar contraseña del usuario
    await userModel.findByIdAndUpdate(user._id, {
      contrasena: hashedPassword
    });

    // Marcar código como usado
    await PasswordReset.findByIdAndUpdate(passwordReset._id, {
      used: true
    });

    // Enviar confirmación por email (opcional, no bloquea si falla)
    try {
      await sendPasswordChangeConfirmation(user.correo, user.nombre);
    } catch (emailError) {
      console.error('Error enviando confirmación:', emailError);
    }

    res.status(200).json({ 
      message: 'Contraseña actualizada exitosamente' 
    });

  } catch (error) {
    console.error('Error en resetPassword:', error);
    res.status(500).json({ 
      message: 'Error interno del servidor' 
    });
  }
};