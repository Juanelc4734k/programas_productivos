import Training from './training.model.js';
import User from '../auth/user.model.js'; // Assuming user model is in auth module

// --- Training Services ---

export const createNewTraining = async (trainingData, creatorId) => {
    try {
        const newTraining = new Training({ ...trainingData, createdBy: creatorId });
        return await newTraining.save();
    } catch (error) {
        console.error("Service Error: createNewTraining", error);
        if (error.code === 11000) {
            const customError = new Error('Ya existe una capacitación con ese título.');
            customError.statusCode = 400;
            throw customError;
        }
        throw error;
    }
};

export const findAllTrainings = async (filters = {}, options = {}) => {
    try {
        const { page = 1, limit = 10, sort = '-createdAt' } = options;
        const skip = (page - 1) * limit;

        const query = {};
        if (filters.category) query.category = filters.category;
        if (filters.status) query.status = filters.status;
        if (filters.modality) query.modality = filters.modality;
        if (filters.search) {
            query.$text = { $search: filters.search };
        }
        // Add date range filters if needed

        const trainings = await Training.find(query)
            .populate('createdBy', 'nombre correo')
            .populate('participants.userId', 'nombre correo documento_identidad')
            .sort(sort)
            .skip(skip)
            .limit(limit);

        const totalTrainings = await Training.countDocuments(query);

        return {
            totalPages: Math.ceil(totalTrainings / limit),
            currentPage: page,
            totalTrainings,
            trainings,
        };
    } catch (error) {
        console.error("Service Error: findAllTrainings", error);
        throw error;
    }
};

export const findTrainingById = async (trainingId) => {
    try {
        const training = await Training.findById(trainingId)
            .populate('createdBy', 'nombre correo tipo_usuario')
            .populate('participants.userId', 'nombre correo documento_identidad estado')
            .populate('sessions'); // If sessions need specific population, add it here
        if (!training) {
            const error = new Error('Capacitación no encontrada.');
            error.statusCode = 404;
            throw error;
        }
        return training;
    } catch (error) {
        console.error("Service Error: findTrainingById", error);
        throw error;
    }
};

export const updateExistingTraining = async (trainingId, updateData) => {
    try {
        const training = await Training.findByIdAndUpdate(trainingId, updateData, { new: true, runValidators: true });
        if (!training) {
            const error = new Error('Capacitación no encontrada para actualizar.');
            error.statusCode = 404;
            throw error;
        }
        return training;
    } catch (error) {
        console.error("Service Error: updateExistingTraining", error);
        if (error.code === 11000) {
            const customError = new Error('Conflicto al actualizar, el título de la capacitación ya existe.');
            customError.statusCode = 400;
            throw customError;
        }
        throw error;
    }
};

export const deleteExistingTraining = async (trainingId) => {
    try {
        const training = await Training.findByIdAndDelete(trainingId);
        if (!training) {
            const error = new Error('Capacitación no encontrada para eliminar.');
            error.statusCode = 404;
            throw error;
        }
        // Consider if related data needs cleanup (e.g., if sessions were separate documents)
        return training;
    } catch (error) {
        console.error("Service Error: deleteExistingTraining", error);
        throw error;
    }
};

// --- Participant Management ---

export const enrollUserInTraining = async (trainingId, userId) => {
    try {
        const training = await Training.findById(trainingId);
        const user = await User.findById(userId);

        if (!training) {
            const error = new Error('Capacitación no encontrada.');
            error.statusCode = 404;
            throw error;
        }
        if (!user) {
            const error = new Error('Usuario no encontrado.');
            error.statusCode = 404;
            throw error;
        }

        if (training.participants.find(p => p.userId.equals(userId))) {
            const error = new Error('El usuario ya está inscrito en esta capacitación.');
            error.statusCode = 400;
            throw error;
        }

        if (training.maxParticipants > 0 && training.participants.length >= training.maxParticipants) {
            const error = new Error('No hay cupos disponibles en esta capacitación.');
            error.statusCode = 400;
            throw error;
        }
        
        if (training.status !== 'abierta para inscripción') {
            const error = new Error(`La capacitación no está abierta para inscripciones. Estado actual: ${training.status}`);
            error.statusCode = 400;
            throw error;
        }

        training.participants.push({ userId });
        return await training.save();
    } catch (error) {
        console.error("Service Error: enrollUserInTraining", error);
        throw error;
    }
};

export const updateUserEnrollmentStatus = async (trainingId, participantUserId, statusUpdate) => {
    try {
        const training = await Training.findById(trainingId);
        if (!training) {
            const error = new Error('Capacitación no encontrada.');
            error.statusCode = 404;
            throw error;
        }

        const participant = training.participants.find(p => p.userId.equals(participantUserId));
        if (!participant) {
            const error = new Error('Participante no encontrado en esta capacitación.');
            error.statusCode = 404;
            throw error;
        }

        // Update specific fields of the participant subdocument
        if (statusUpdate.status) participant.status = statusUpdate.status;
        if (statusUpdate.completionDate) participant.completionDate = statusUpdate.completionDate;
        if (statusUpdate.certificationUrl) participant.certificationUrl = statusUpdate.certificationUrl;
        if (statusUpdate.feedback) participant.feedback = statusUpdate.feedback;
        
        return await training.save();
    } catch (error) {
        console.error("Service Error: updateUserEnrollmentStatus", error);
        throw error;
    }
};

export const removeUserFromTraining = async (trainingId, participantUserId) => {
    try {
        const training = await Training.findById(trainingId);
        if (!training) {
            const error = new Error('Capacitación no encontrada.');
            error.statusCode = 404;
            throw error;
        }

        const participantIndex = training.participants.findIndex(p => p.userId.equals(participantUserId));
        if (participantIndex === -1) {
            const error = new Error('Usuario no encontrado en la lista de participantes de esta capacitación.');
            error.statusCode = 404;
            throw error;
        }

        training.participants.splice(participantIndex, 1);
        return await training.save();
    } catch (error) {
        console.error("Service Error: removeUserFromTraining", error);
        throw error;
    }
};

// --- Session Management (if applicable) ---

export const addSessionToTraining = async (trainingId, sessionData) => {
    try {
        const training = await Training.findById(trainingId);
        if (!training) {
            const error = new Error('Capacitación no encontrada.');
            error.statusCode = 404;
            throw error;
        }
        training.sessions.push(sessionData);
        return await training.save();
    } catch (error) {
        console.error("Service Error: addSessionToTraining", error);
        throw error;
    }
};

export const updateSessionInTraining = async (trainingId, sessionId, sessionUpdateData) => {
    try {
        const training = await Training.findById(trainingId);
        if (!training) {
            const error = new Error('Capacitación no encontrada.');
            error.statusCode = 404;
            throw error;
        }
        const session = training.sessions.id(sessionId);
        if (!session) {
            const error = new Error('Sesión no encontrada en esta capacitación.');
            error.statusCode = 404;
            throw error;
        }
        Object.assign(session, sessionUpdateData);
        return await training.save();
    } catch (error) {
        console.error("Service Error: updateSessionInTraining", error);
        throw error;
    }
};

export const removeSessionFromTraining = async (trainingId, sessionId) => {
    try {
        const training = await Training.findById(trainingId);
        if (!training) {
            const error = new Error('Capacitación no encontrada.');
            error.statusCode = 404;
            throw error;
        }
        const session = training.sessions.id(sessionId);
        if (!session) {
            const error = new Error('Sesión no encontrada para eliminar.');
            error.statusCode = 404;
            throw error;
        }
        session.remove(); // Mongoose subdocument remove method
        return await training.save();
    } catch (error) {
        console.error("Service Error: removeSessionFromTraining", error);
        throw error;
    }
};