import { body, param, query } from 'express-validator';

// Validaciones para enviar mensaje
export const validateSendMessage = [
    body('message')
        .notEmpty()
        .withMessage('El mensaje es requerido')
        .isLength({ min: 1, max: 1000 })
        .withMessage('El mensaje debe tener entre 1 y 1000 caracteres')
        .trim(),
    body('sessionId')
        .optional()
        .isString()
        .withMessage('El ID de sesión debe ser una cadena de texto')
        .trim()
];

// Validaciones para cerrar sesión
export const validateCloseSession = [
    param('sessionId')
        .notEmpty()
        .withMessage('El ID de sesión es requerido')
        .isString()
        .withMessage('El ID de sesión debe ser una cadena de texto')
        .trim()
];

// Validaciones para agregar feedback
export const validateAddFeedback = [
    param('sessionId')
        .notEmpty()
        .withMessage('El ID de sesión es requerido')
        .isString()
        .withMessage('El ID de sesión debe ser una cadena de texto')
        .trim(),
    body('rating')
        .notEmpty()
        .withMessage('La calificación es requerida')
        .isInt({ min: 1, max: 5 })
        .withMessage('La calificación debe ser un número entero entre 1 y 5'),
    body('comment')
        .optional()
        .isLength({ max: 500 })
        .withMessage('El comentario no puede exceder 500 caracteres')
        .trim()
];

// Validaciones para obtener detalles de sesión
export const validateGetSessionDetails = [
    param('sessionId')
        .notEmpty()
        .withMessage('El ID de sesión es requerido')
        .isString()
        .withMessage('El ID de sesión debe ser una cadena de texto')
        .trim()
];

// Validaciones para obtener historial de sesiones
export const validateGetUserSessions = [
    query('limit')
        .optional()
        .isInt({ min: 1, max: 50 })
        .withMessage('El límite debe ser un número entero entre 1 y 50')
        .toInt()
];

import { validationResult } from 'express-validator';

// Middleware para manejar errores de validación
export const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Errores de validación',
            errors: errors.array().map(error => ({
                field: error.param,
                message: error.msg,
                value: error.value
            }))
        });
    }
    
    next();
};