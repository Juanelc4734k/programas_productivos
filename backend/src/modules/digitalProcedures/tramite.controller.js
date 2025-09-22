import { TramiteService } from './tramite.service.js';

export const crearTramite = async (req, res) => {
    try {
        const datosTramite = {
            ...req.body,
            usuario: req.user.id
        };
        const tramite = await TramiteService.crear(datosTramite);
        res.status(201).json(tramite);
    } catch (error) {
        res.status(400).json({ mensaje: error.message });
    }
};

export const obtenerTramites = async (req, res) => {
    try {
        const tramites = await TramiteService.listar();
        res.json(tramites);
    } catch (error) {
        res.status(500).json({ mensaje: error.message });
    }
};

export const obtenerTramitePorId = async (req, res) => {
    try {
        const tramite = await TramiteService.obtenerPorId(req.params.id);
        if (!tramite) {
            return res.status(404).json({ mensaje: 'Trámite no encontrado' });
        }
        res.json(tramite);
    } catch (error) {
        res.status(500).json({ mensaje: error.message });
    }
};

export const obtenerTramitesPorUsuario = async (req, res) => {
    try {
        const tramites = await TramiteService.obtenerPorUsuario(req.params.userId);
        res.json(tramites);
    } catch (error) {
        res.status(500).json({ mensaje: error.message });
    }
};

export const actualizarTramite = async (req, res) => {
    try {
        const tramite = await TramiteService.actualizar(req.params.id, req.body);
        if (!tramite) {
            return res.status(404).json({ mensaje: 'Trámite no encontrado' });
        }
        res.json(tramite);
    } catch (error) {
        res.status(400).json({ mensaje: error.message });
    }
};

export const eliminarTramite = async (req, res) => {
    try {
        const tramite = await TramiteService.eliminar(req.params.id);
        if (!tramite) {
            return res.status(404).json({ mensaje: 'Trámite no encontrado' });
        }
        res.json({ mensaje: 'Trámite eliminado exitosamente' });
    } catch (error) {
        res.status(500).json({ mensaje: error.message });
    }
};

export const cambiarEstadoTramite = async (req, res) => {
    try {
        const { estado } = req.body;
        const tramite = await TramiteService.cambiarEstado(
            req.params.id,
            estado,
            req.user.id
        );
        if (!tramite) {
            return res.status(404).json({ mensaje: 'Trámite no encontrado' });
        }
        res.json(tramite);
    } catch (error) {
        res.status(400).json({ mensaje: error.message });
    }
};

export const adjuntarDocumento = async (req, res) => {
    try {
        const documento = {
            nombre: req.file.originalname,
            tipo: req.file.mimetype,
            cloudinaryUrl: req.cloudinaryUrl,
            cloudinaryId: req.cloudinaryId,
            subido_por: req.user.id
        };
        
        const tramite = await TramiteService.adjuntarDocumento(req.params.id, documento);
        if (!tramite) {
            return res.status(404).json({ mensaje: 'Trámite no encontrado' });
        }
        res.json(tramite);
    } catch (error) {
        res.status(400).json({ mensaje: error.message });
    }
};