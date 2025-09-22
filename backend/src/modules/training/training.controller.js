import * as trainingService from './training.service.js';

// --- Training Controllers ---

export const createTraining = async (req, res) => {
    try {
        // req.user.id should be available from auth middleware (e.g., 'protect')
        const newTraining = await trainingService.createNewTraining(req.body, req.user.id);
        res.status(201).json(newTraining);
    } catch (error) {
        console.error("Controller Error: createTraining", error);
        res.status(error.statusCode || 500).json({ message: error.message || 'Error al crear la capacitación.' });
    }
};

export const getAllTrainings = async (req, res) => {
    try {
        const filters = { ...req.query };
        delete filters.page; // remove pagination params from filters
        delete filters.limit;
        delete filters.sort;

        const options = {
            page: parseInt(req.query.page) || 1,
            limit: parseInt(req.query.limit) || 10,
            sort: req.query.sort || '-createdAt'
        };
        const result = await trainingService.findAllTrainings(filters, options);
        res.status(200).json(result);
    } catch (error) {
        console.error("Controller Error: getAllTrainings", error);
        res.status(error.statusCode || 500).json({ message: error.message || 'Error al obtener las capacitaciones.' });
    }
};

export const getTrainingById = async (req, res) => {
    try {
        const { trainingId } = req.params;
        const training = await trainingService.findTrainingById(trainingId);
        res.status(200).json(training);
    } catch (error) {
        console.error("Controller Error: getTrainingById", error);
        res.status(error.statusCode || 500).json({ message: error.message || 'Error al obtener la capacitación.' });
    }
};

export const updateTraining = async (req, res) => {
    try {
        const { trainingId } = req.params;
        const updatedTraining = await trainingService.updateExistingTraining(trainingId, req.body);
        res.status(200).json(updatedTraining);
    } catch (error) {
        console.error("Controller Error: updateTraining", error);
        res.status(error.statusCode || 500).json({ message: error.message || 'Error al actualizar la capacitación.' });
    }
};

export const deleteTraining = async (req, res) => {
    try {
        const { trainingId } = req.params;
        await trainingService.deleteExistingTraining(trainingId);
        res.status(200).json({ message: 'Capacitación eliminada correctamente.' });
    } catch (error) {
        console.error("Controller Error: deleteTraining", error);
        res.status(error.statusCode || 500).json({ message: error.message || 'Error al eliminar la capacitación.' });
    }
};

// --- Participant Management Controllers ---

export const enrollInTraining = async (req, res) => {
    try {
        const { trainingId } = req.params;
        const userId = req.user.id; // User enrolling themselves
        const updatedTraining = await trainingService.enrollUserInTraining(trainingId, userId);
        res.status(200).json({ message: 'Inscripción exitosa.', training: updatedTraining });
    } catch (error) {
        console.error("Controller Error: enrollInTraining", error);
        res.status(error.statusCode || 500).json({ message: error.message || 'Error al inscribirse en la capacitación.' });
    }
};

// Controller for admin/funcionario to enroll a specific user
export const adminEnrollUser = async (req, res) => {
    try {
        const { trainingId, userId } = req.params;
        const updatedTraining = await trainingService.enrollUserInTraining(trainingId, userId);
        res.status(200).json({ message: `Usuario ${userId} inscrito exitosamente.`, training: updatedTraining });
    } catch (error) {
        console.error("Controller Error: adminEnrollUser", error);
        res.status(error.statusCode || 500).json({ message: error.message || 'Error al inscribir al usuario.' });
    }
};

export const updateEnrollment = async (req, res) => {
    try {
        const { trainingId, participantUserId } = req.params;
        const statusUpdate = req.body; // e.g., { status: 'completado', certificationUrl: '...' }
        const updatedTraining = await trainingService.updateUserEnrollmentStatus(trainingId, participantUserId, statusUpdate);
        res.status(200).json({ message: 'Estado de inscripción actualizado.', training: updatedTraining });
    } catch (error) {
        console.error("Controller Error: updateEnrollment", error);
        res.status(error.statusCode || 500).json({ message: error.message || 'Error al actualizar la inscripción.' });
    }
};

export const unenrollFromTraining = async (req, res) => {
    try {
        const { trainingId } = req.params;
        const userId = req.user.id; // User unenrolling themselves
        const updatedTraining = await trainingService.removeUserFromTraining(trainingId, userId);
        res.status(200).json({ message: 'Desinscripción exitosa.', training: updatedTraining });
    } catch (error) {
        console.error("Controller Error: unenrollFromTraining", error);
        res.status(error.statusCode || 500).json({ message: error.message || 'Error al desinscribirse de la capacitación.' });
    }
};

// Controller for admin/funcionario to unenroll a specific user
export const adminUnenrollUser = async (req, res) => {
    try {
        const { trainingId, userId } = req.params;
        const updatedTraining = await trainingService.removeUserFromTraining(trainingId, userId);
        res.status(200).json({ message: `Usuario ${userId} desinscrito exitosamente.`, training: updatedTraining });
    } catch (error) {
        console.error("Controller Error: adminUnenrollUser", error);
        res.status(error.statusCode || 500).json({ message: error.message || 'Error al desinscribir al usuario.' });
    }
};


// --- Session Management Controllers (if applicable) ---

export const addSession = async (req, res) => {
    try {
        const { trainingId } = req.params;
        const sessionData = req.body;
        const updatedTraining = await trainingService.addSessionToTraining(trainingId, sessionData);
        res.status(201).json({ message: 'Sesión agregada.', training: updatedTraining });
    } catch (error) {
        console.error("Controller Error: addSession", error);
        res.status(error.statusCode || 500).json({ message: error.message || 'Error al agregar la sesión.' });
    }
};

export const updateSession = async (req, res) => {
    try {
        const { trainingId, sessionId } = req.params;
        const sessionUpdateData = req.body;
        const updatedTraining = await trainingService.updateSessionInTraining(trainingId, sessionId, sessionUpdateData);
        res.status(200).json({ message: 'Sesión actualizada.', training: updatedTraining });
    } catch (error) {
        console.error("Controller Error: updateSession", error);
        res.status(error.statusCode || 500).json({ message: error.message || 'Error al actualizar la sesión.' });
    }
};

export const removeSession = async (req, res) => {
    try {
        const { trainingId, sessionId } = req.params;
        const updatedTraining = await trainingService.removeSessionFromTraining(trainingId, sessionId);
        res.status(200).json({ message: 'Sesión eliminada.', training: updatedTraining });
    } catch (error) {
        console.error("Controller Error: removeSession", error);
        res.status(error.statusCode || 500).json({ message: error.message || 'Error al eliminar la sesión.' });
    }
};