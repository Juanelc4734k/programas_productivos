import jwt from 'jsonwebtoken';
import User from '../modules/auth/user.model.js'; // Adjust path as necessary

// Middleware to protect routes - verify token
export const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Get token from header
            token = req.headers.authorization.split(' ')[1];

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Get user from the token (select -password to exclude password)
            req.user = await User.findById(decoded.id).select('-contrasena');

            if (!req.user) {
                return res.status(401).json({ message: 'No autorizado, usuario no encontrado.' });
            }

            next();
        } catch (error) {
            console.error('Error en middleware de protección:', error);
            if (error.name === 'JsonWebTokenError') {
                return res.status(401).json({ message: 'No autorizado, token inválido.' });
            }
            if (error.name === 'TokenExpiredError') {
                return res.status(401).json({ message: 'No autorizado, token expirado.' });
            }
            res.status(401).json({ message: 'No autorizado, token falló.' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'No autorizado, no se encontró token.' });
    }
};

// Middleware to authorize based on roles
export const authorize = (roles) => {
    return (req, res, next) => {
        if (!req.user) { // Should be set by 'protect' middleware
            return res.status(401).json({ message: 'No autorizado, debe iniciar sesión primero.' });
        }
        if (!roles.includes(req.user.tipo_usuario)) {
            return res.status(403).json({ message: `Acceso denegado. El rol '${req.user.tipo_usuario}' no está autorizado para acceder a este recurso.` });
        }
        next();
    };
};