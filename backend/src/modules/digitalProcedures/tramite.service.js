import Tramite from './tramite.model.js';

export const TramiteService = {
    crear: async (datosTramite) => {
        const nuevoTramite = new Tramite(datosTramite);
        return await nuevoTramite.save();
    },

    listar: async (filtros = {}) => {
        return await Tramite.find(filtros)
            .populate('usuario', 'nombre email')
            .populate('revisado_por', 'nombre email')
            .sort({ fecha_solicitud: -1 });
    },

    obtenerPorId: async (id) => {
        return await Tramite.findById(id)
           .populate('usuario', 'nombre email')
           .populate('revisado_por', 'nombre email');
    },

    obtenerPorUsuario: async (userId) => {
        return await Tramite.find({ usuario: userId })
          .populate('revisado_por', 'nombre email')
          .sort({ fecha_solicitud: -1 });
    },

    actualizar: async (id, datosTramite) => {
        const tramite = await Tramite.findById(id);
        if (!tramite) {
            throw new Error('Trámite no encontrado');
        }
        if (!tramite.puedeSerEditado()) {
            throw new Error('No se puede editar este trámite');
        }
        return await Tramite.findByIdAndUpdate(id, datosTramite, { new: true });
    },

    eliminar: async (id) => {
        return await Tramite.findByIdAndDelete(id);
    },

    cambiarEstado: async (id, nuevoEstado, revisadoPor) => {
        const actualización = {
            estado: nuevoEstado,
            revisado_por: revisadoPor
        };
        return await Tramite.findByIdAndUpdate(id, actualización, { new: true });
    },

    adjuntarDocumento: async (id, documento) => {
        if (!documento.cloudinaryUrl || !documento.cloudinaryId) {
            throw new Error('Se requieren los datos de Cloudinary')
        }
        return await Tramite.findByIdAndUpdate(id, { $push: { documentos: documento } }, { new: true });
    }
};