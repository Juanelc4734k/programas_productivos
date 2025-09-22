// Middleware para verificar roles específicos
export const checkRole = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ 
                success: false,
                message: 'No autorizado, debe iniciar sesión primero.' 
            });
        }

        if (!allowedRoles.includes(req.user.tipo_usuario)) {
            return res.status(403).json({ 
                success: false,
                message: `Acceso denegado. El rol '${req.user.tipo_usuario}' no está autorizado para acceder a este recurso.` 
            });
        }

        next();
    };
};

// Middleware específico para administradores
export const requireAdmin = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ 
            success: false,
            message: 'No autorizado, debe iniciar sesión primero.' 
        });
    }

    if (req.user.tipo_usuario !== 'admin') {
        return res.status(403).json({ 
            success: false,
            message: 'Acceso denegado. Se requieren permisos de administrador.' 
        });
    }

    next();
};

// Middleware específico para funcionarios
export const requireFuncionario = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ 
            success: false,
            message: 'No autorizado, debe iniciar sesión primero.' 
        });
    }

    if (!['funcionario', 'admin'].includes(req.user.tipo_usuario)) {
        return res.status(403).json({ 
            success: false,
            message: 'Acceso denegado. Se requieren permisos de funcionario o administrador.' 
        });
    }

    next();
};

// Middleware específico para campesinos
export const requireCampesino = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ 
            success: false,
            message: 'No autorizado, debe iniciar sesión primero.' 
        });
    }

    if (req.user.tipo_usuario !== 'campesino') {
        return res.status(403).json({ 
            success: false,
            message: 'Acceso denegado. Se requieren permisos de campesino.' 
        });
    }

    next();
};