import jwt from 'jsonwebtoken';
import User from '../auth/user.model.js';
import mongoose from 'mongoose';

/**
 * Verificar que el usuario tenga acceso de funcionario o administrador
 */
const verifyFuncionarioAccess = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token de acceso requerido'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-contrasena');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // Verificar que el usuario sea funcionario o administrador
    if (user.tipo_usuario !== 'funcionario' && user.tipo_usuario !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Acceso denegado. Se requieren permisos de funcionario o administrador'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Error en verificación de acceso:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Token inválido'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expirado'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor en autenticación',
      error: error.message
    });
  }
};

/**
 * Validar parámetros para reportes generales
 */
const validateReportParams = (req, res, next) => {
  try {
    const { startDate, endDate, estado, categoria } = req.query;
    
    // Validar fechas si se proporcionan
    if (startDate && !isValidDate(startDate)) {
      return res.status(400).json({
        success: false,
        message: 'Fecha de inicio inválida. Use formato YYYY-MM-DD'
      });
    }
    
    if (endDate && !isValidDate(endDate)) {
      return res.status(400).json({
        success: false,
        message: 'Fecha de fin inválida. Use formato YYYY-MM-DD'
      });
    }
    
    // Validar que la fecha de inicio sea anterior a la fecha de fin
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      return res.status(400).json({
        success: false,
        message: 'La fecha de inicio debe ser anterior a la fecha de fin'
      });
    }
    
    // Validar estado si se proporciona
    if (estado && !['activo', 'completado', 'pendiente', 'cancelado'].includes(estado)) {
      return res.status(400).json({
        success: false,
        message: 'Estado inválido. Use: activo, completado, pendiente, cancelado'
      });
    }
    
    // Validar categoría (opcional, cualquier string es válido)
    if (categoria && typeof categoria !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Categoría debe ser una cadena de texto'
      });
    }
    
    next();
  } catch (error) {
    console.error('Error validando parámetros de reporte:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor en validación',
      error: error.message
    });
  }
};

/**
 * Validar ID de programa
 */
const validateProgramId = (req, res, next) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'ID del programa es requerido'
      });
    }
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID del programa inválido'
      });
    }
    
    next();
  } catch (error) {
    console.error('Error validando ID de programa:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor en validación',
      error: error.message
    });
  }
};

/**
 * Validar parámetros para reporte de participantes
 */
const validateParticipantsParams = (req, res, next) => {
  try {
    const { documento_identidad, ubicacion, programa_id } = req.query;
    
    // Validar documento de identidad si se proporciona
    if (documento_identidad && (typeof documento_identidad !== 'string' || documento_identidad.length < 5)) {
      return res.status(400).json({
        success: false,
        message: 'Documento de identidad inválido'
      });
    }
    
    // Validar ubicación si se proporciona
    if (ubicacion && typeof ubicacion !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Ubicación debe ser una cadena de texto'
      });
    }
    
    // Validar programa_id si se proporciona
    if (programa_id && !mongoose.Types.ObjectId.isValid(programa_id)) {
      return res.status(400).json({
        success: false,
        message: 'ID del programa inválido'
      });
    }
    
    next();
  } catch (error) {
    console.error('Error validando parámetros de participantes:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor en validación',
      error: error.message
    });
  }
};

/**
 * Validar parámetros para estadísticas
 */
const validateStatisticsParams = (req, res, next) => {
  try {
    const { period } = req.query;
    
    if (period) {
      const periodNum = parseInt(period);
      
      if (isNaN(periodNum) || periodNum < 1 || periodNum > 365) {
        return res.status(400).json({
          success: false,
          message: 'Período debe ser un número entre 1 y 365 días'
        });
      }
    }
    
    next();
  } catch (error) {
    console.error('Error validando parámetros de estadísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor en validación',
      error: error.message
    });
  }
};

/**
 * Validar parámetros para exportación
 */
const validateExportParams = (req, res, next) => {
  try {
    const { type } = req.params;
    const { format } = req.query;
    
    // Validar tipo de reporte
    if (!['programs', 'participants', 'statistics'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Tipo de reporte inválido. Use: programs, participants, statistics'
      });
    }
    
    // Validar formato si se proporciona
    if (format && !['json', 'csv', 'pdf'].includes(format)) {
      return res.status(400).json({
        success: false,
        message: 'Formato inválido. Use: json, csv, pdf'
      });
    }
    
    next();
  } catch (error) {
    console.error('Error validando parámetros de exportación:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor en validación',
      error: error.message
    });
  }
};

/**
 * Validar rango de fechas
 */
const validateDateRange = (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    
    if (startDate && !isValidDate(startDate)) {
      return res.status(400).json({
        success: false,
        message: 'Fecha de inicio inválida. Use formato YYYY-MM-DD'
      });
    }
    
    if (endDate && !isValidDate(endDate)) {
      return res.status(400).json({
        success: false,
        message: 'Fecha de fin inválida. Use formato YYYY-MM-DD'
      });
    }
    
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      if (start > end) {
        return res.status(400).json({
          success: false,
          message: 'La fecha de inicio debe ser anterior a la fecha de fin'
        });
      }
      
      // Validar que el rango no sea mayor a 2 años
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays > 730) {
        return res.status(400).json({
          success: false,
          message: 'El rango de fechas no puede ser mayor a 2 años'
        });
      }
    }
    
    next();
  } catch (error) {
    console.error('Error validando rango de fechas:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor en validación',
      error: error.message
    });
  }
};

/**
 * Middleware para logging de acceso a reportes
 */
const logReportAccess = (req, res, next) => {
  try {
    const { user } = req;
    const { method, originalUrl, ip } = req;
    
    console.log(`[ADMIN ACCESS] ${new Date().toISOString()} - Usuario: ${user?.nombres} ${user?.apellidos} (${user?.correo}) - ${method} ${originalUrl} - IP: ${ip}`);
    
    next();
  } catch (error) {
    console.error('Error en logging de acceso:', error);
    next(); // Continuar aunque falle el logging
  }
};

/**
 * Middleware para rate limiting básico
 */
const rateLimitReports = (() => {
  const requests = new Map();
  const WINDOW_MS = 15 * 60 * 1000; // 15 minutos
  const MAX_REQUESTS = 100; // máximo 100 requests por ventana
  
  return (req, res, next) => {
    try {
      const userId = req.user?.id;
      if (!userId) return next();
      
      const now = Date.now();
      const userRequests = requests.get(userId) || [];
      
      // Limpiar requests antiguos
      const validRequests = userRequests.filter(time => now - time < WINDOW_MS);
      
      if (validRequests.length >= MAX_REQUESTS) {
        return res.status(429).json({
          success: false,
          message: 'Demasiadas solicitudes. Intente nuevamente en 15 minutos',
          retryAfter: Math.ceil((validRequests[0] + WINDOW_MS - now) / 1000)
        });
      }
      
      validRequests.push(now);
      requests.set(userId, validRequests);
      
      next();
    } catch (error) {
      console.error('Error en rate limiting:', error);
      next(); // Continuar aunque falle el rate limiting
    }
  };
})();

/**
 * Función auxiliar para validar fechas
 */
const isValidDate = (dateString) => {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateString)) return false;
  
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date) && dateString === date.toISOString().split('T')[0];
};

export {
  verifyFuncionarioAccess,
  validateReportParams,
  validateProgramId,
  validateParticipantsParams,
  validateStatisticsParams,
  validateExportParams,
  validateDateRange,
  logReportAccess,
  rateLimitReports
};