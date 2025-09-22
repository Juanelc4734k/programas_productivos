import * as feedbackService from './feedback.service.js';
import { asyncHandler } from '../../utils/asyncHandler.js'; // Assuming you have an asyncHandler utility
import { ApiResponse } from '../../utils/ApiResponse.js'; // Assuming you have an ApiResponse utility
import { ApiError } from '../../utils/ApiError.js'; // Assuming you have an ApiError utility

// --- Rating Controllers ---
export const handleCreateRating = asyncHandler(async (req, res) => {
    const { value, comment, relatedTo /*, onModel */ } = req.body;
    const ratedBy = req.user._id; // Assuming user is authenticated and ID is in req.user

    if (!value || !relatedTo) {
        throw new ApiError(400, 'El valor de la calificación y la entidad relacionada son obligatorios.');
    }

    const ratingData = { value, comment, relatedTo, ratedBy /*, onModel */ };
    const newRating = await feedbackService.createRating(ratingData);
    res.status(201).json(new ApiResponse(201, newRating, 'Calificación enviada con éxito.'));
});

export const handleGetRatingsForEntity = asyncHandler(async (req, res) => {
    const { entityId } = req.params;
    const { page, limit } = req.query;
    const ratings = await feedbackService.getRatingsForEntity(entityId, parseInt(page), parseInt(limit));
    res.status(200).json(new ApiResponse(200, ratings, 'Calificaciones obtenidas con éxito.'));
});

export const handleGetAverageRatingForEntity = asyncHandler(async (req, res) => {
    const { entityId } = req.params;
    const averageRating = await feedbackService.getAverageRatingForEntity(entityId);
    res.status(200).json(new ApiResponse(200, averageRating, 'Promedio de calificación obtenido con éxito.'));
});

// --- Survey Controllers ---
export const handleCreateSurvey = asyncHandler(async (req, res) => {
    const surveyData = req.body;
    const createdBy = req.user._id; // Admin/Funcionario creating the survey

    if (!surveyData.title || !surveyData.questions || surveyData.questions.length === 0) {
        throw new ApiError(400, 'El título y al menos una pregunta son obligatorios para la encuesta.');
    }

    const newSurvey = await feedbackService.createSurvey(surveyData, createdBy);
    res.status(201).json(new ApiResponse(201, newSurvey, 'Encuesta creada con éxito.'));
});

export const handleGetAllSurveys = asyncHandler(async (req, res) => {
    const { page, limit, sort, targetAudience, isActive } = req.query;
    const filters = {};
    if (targetAudience) filters.targetAudience = targetAudience;
    if (isActive !== undefined) filters.isActive = isActive === 'true';

    const options = { page: parseInt(page), limit: parseInt(limit), sort }; 
    const result = await feedbackService.getAllSurveys(filters, options);
    res.status(200).json(new ApiResponse(200, result, 'Encuestas obtenidas con éxito.'));
});

export const handleGetSurveyById = asyncHandler(async (req, res) => {
    const { surveyId } = req.params;
    const survey = await feedbackService.getSurveyById(surveyId);
    res.status(200).json(new ApiResponse(200, survey, 'Encuesta obtenida con éxito.'));
});

export const handleUpdateSurvey = asyncHandler(async (req, res) => {
    const { surveyId } = req.params;
    const updateData = req.body;
    // Add authorization check: req.user must be creator or admin
    const updatedSurvey = await feedbackService.updateSurvey(surveyId, updateData);
    if (!updatedSurvey) throw new ApiError(404, 'Encuesta no encontrada para actualizar.');
    res.status(200).json(new ApiResponse(200, updatedSurvey, 'Encuesta actualizada con éxito.'));
});

export const handleDeactivateSurvey = asyncHandler(async (req, res) => {
    const { surveyId } = req.params;
    // Add authorization check
    const deactivatedSurvey = await feedbackService.deactivateSurvey(surveyId);
    if (!deactivatedSurvey) throw new ApiError(404, 'Encuesta no encontrada para desactivar.');
    res.status(200).json(new ApiResponse(200, deactivatedSurvey, 'Encuesta desactivada con éxito.'));
});

// --- Survey Response Controllers ---
export const handleSubmitSurveyResponse = asyncHandler(async (req, res) => {
    const { surveyId } = req.params;
    const respondentId = req.user._id; // User submitting the response
    const { answers } = req.body;

    if (!answers || !Array.isArray(answers) || answers.length === 0) {
        throw new ApiError(400, 'Se requieren respuestas para enviar la encuesta.');
    }

    const newResponse = await feedbackService.submitSurveyResponse(surveyId, respondentId, answers);
    res.status(201).json(new ApiResponse(201, newResponse, 'Respuesta de encuesta enviada con éxito.'));
});

export const handleGetSurveyResponses = asyncHandler(async (req, res) => {
    const { surveyId } = req.params;
    const { page, limit } = req.query;
    const result = await feedbackService.getSurveyResponses(surveyId, parseInt(page), parseInt(limit));
    res.status(200).json(new ApiResponse(200, result, 'Respuestas de encuesta obtenidas con éxito.'));
});

export const handleGetSurveyAnalytics = asyncHandler(async (req, res) => {
    const { surveyId } = req.params;
    // Add authorization: only admin/creator should see analytics
    const analytics = await feedbackService.getSurveyAnalytics(surveyId);
    res.status(200).json(new ApiResponse(200, analytics, 'Análisis de encuesta obtenido con éxito.'));
});

// --- General Feedback Controllers ---
export const handleSubmitGeneralFeedback = asyncHandler(async (req, res) => {
    const feedbackData = req.body;
    if (req.user) {
        feedbackData.user = req.user._id; // If user is logged in
    } else if (!feedbackData.email && !feedbackData.user) {
        // Allow anonymous if configured, or require email for non-logged-in
        // For now, let's assume email is not strictly required if anonymous is allowed by service logic
    }

    if (!feedbackData.message || !feedbackData.category) {
        throw new ApiError(400, 'La categoría y el mensaje son obligatorios para el feedback.');
    }

    const newFeedback = await feedbackService.submitGeneralFeedback(feedbackData);
    res.status(201).json(new ApiResponse(201, newFeedback, 'Feedback general enviado con éxito.'));
});

export const handleGetAllGeneralFeedback = asyncHandler(async (req, res) => {
    const { page, limit, sort, category, status, priority } = req.query;
    const filters = {};
    if (category) filters.category = category;
    if (status) filters.status = status;
    if (priority) filters.priority = priority;
    // Add more filters as needed, e.g., date range

    const options = { page: parseInt(page), limit: parseInt(limit), sort };
    const result = await feedbackService.getAllGeneralFeedback(filters, options);
    res.status(200).json(new ApiResponse(200, result, 'Feedback general obtenido con éxito.'));
});

export const handleGetGeneralFeedbackById = asyncHandler(async (req, res) => {
    const { feedbackId } = req.params;
    const feedback = await feedbackService.getGeneralFeedbackById(feedbackId);
    res.status(200).json(new ApiResponse(200, feedback, 'Detalle de feedback obtenido con éxito.'));
});

export const handleUpdateGeneralFeedbackStatus = asyncHandler(async (req, res) => {
    const { feedbackId } = req.params;
    const { status, adminNote } = req.body;
    const adminId = req.user._id; // Admin making the update

    if (!status) {
        throw new ApiError(400, 'El nuevo estado es obligatorio.');
    }

    const updatedFeedback = await feedbackService.updateGeneralFeedbackStatus(feedbackId, status, adminId, adminNote);
    res.status(200).json(new ApiResponse(200, updatedFeedback, 'Estado del feedback actualizado con éxito.'));
});

export const handleAddAdminNoteToFeedback = asyncHandler(async (req, res) => {
    const { feedbackId } = req.params;
    const { note } = req.body;
    const adminId = req.user._id;

    if (!note) {
        throw new ApiError(400, 'La nota administrativa es obligatoria.');
    }
    const updatedFeedback = await feedbackService.addAdminNoteToFeedback(feedbackId, adminId, note);
    res.status(200).json(new ApiResponse(200, updatedFeedback, 'Nota administrativa agregada con éxito.'));
});