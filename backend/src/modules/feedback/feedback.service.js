import { Rating, Survey, SurveyResponse, GeneralFeedback } from './feedback.model.js';
import User from '../auth/user.model.js'; // Adjust path as needed

// --- Rating Services ---
export const createRating = async (ratingData) => {
    // Add validation: e.g., check if user has already rated the item, if relatedTo entity exists
    const newRating = new Rating(ratingData);
    return await newRating.save();
};

export const getRatingsForEntity = async (entityId, page = 1, limit = 10) => {
    return Rating.find({ relatedTo: entityId })
        .populate('ratedBy', 'nombre correo')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);
};

export const getAverageRatingForEntity = async (entityId) => {
    const result = await Rating.aggregate([
        { $match: { relatedTo: mongoose.Types.ObjectId(entityId) } },
        { $group: { _id: '$relatedTo', averageRating: { $avg: '$value' }, count: { $sum: 1 } } }
    ]);
    return result.length > 0 ? result[0] : { averageRating: 0, count: 0 };
};

// --- Survey Services ---
export const createSurvey = async (surveyData, createdBy) => {
    const newSurvey = new Survey({ ...surveyData, createdBy });
    return await newSurvey.save();
};

export const getAllSurveys = async (filters = {}, options = {}) => {
    const { page = 1, limit = 10, sort = '-createdAt' } = options;
    const query = { isActive: true, ...filters }; // Default to active surveys
    if (query.targetAudience && query.targetAudience === 'active_users') {
        // Special filter logic if needed, e.g. based on user activity
        delete query.targetAudience; // Remove from direct mongo query
    }

    const surveys = await Survey.find(query)
        .populate('createdBy', 'nombre')
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(limit);
    const totalSurveys = await Survey.countDocuments(query);
    return { surveys, totalPages: Math.ceil(totalSurveys / limit), currentPage: page, totalSurveys };
};

export const getSurveyById = async (surveyId) => {
    const survey = await Survey.findById(surveyId)
        .populate('createdBy', 'nombre')
        .populate('questions'); // Assuming questions are embedded
    if (!survey || !survey.isActive) {
        throw new Error('Encuesta no encontrada o no activa.');
    }
    return survey;
};

export const updateSurvey = async (surveyId, updateData) => {
    // Add authorization: only creator or admin can update
    return Survey.findByIdAndUpdate(surveyId, updateData, { new: true });
};

export const deactivateSurvey = async (surveyId) => {
    return Survey.findByIdAndUpdate(surveyId, { isActive: false }, { new: true });
};

// --- Survey Response Services ---
export const submitSurveyResponse = async (surveyId, respondentId, answers) => {
    const survey = await Survey.findById(surveyId);
    if (!survey || !survey.isActive) {
        throw new Error('Encuesta no encontrada o ya no está activa.');
    }
    // TODO: Validate answers against survey questions (e.g., required, options)
    // TODO: Check if user has already responded if multiple responses are not allowed

    const surveyResponse = new SurveyResponse({ survey: surveyId, respondent: respondentId, answers });
    return await surveyResponse.save();
};

export const getSurveyResponses = async (surveyId, page = 1, limit = 20) => {
    const responses = await SurveyResponse.find({ survey: surveyId })
        .populate('respondent', 'nombre correo')
        .sort({ submittedAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);
    const totalResponses = await SurveyResponse.countDocuments({ survey: surveyId });
    return { responses, totalPages: Math.ceil(totalResponses / limit), currentPage: page, totalResponses };
};

export const getSurveyAnalytics = async (surveyId) => {
    const survey = await Survey.findById(surveyId).lean(); // Use .lean() for plain JS object
    if (!survey) throw new Error('Encuesta no encontrada.');

    const responses = await SurveyResponse.find({ survey: surveyId }).lean();
    const analytics = {
        totalResponses: responses.length,
        questionSummary: [],
    };

    if (responses.length === 0) return analytics;

    for (const question of survey.questions) {
        const questionStat = {
            questionId: question._id.toString(),
            questionText: question.questionText,
            questionType: question.questionType,
            answers: {},
            totalAnswersToThisQuestion: 0,
        };

        responses.forEach(response => {
            const answerEntry = response.answers.find(a => a.questionText === question.questionText || (a.question && a.question.toString() === question._id.toString()));
            if (answerEntry && answerEntry.answer !== undefined && answerEntry.answer !== null) {
                questionStat.totalAnswersToThisQuestion++;
                const answerValue = Array.isArray(answerEntry.answer) ? answerEntry.answer.join(', ') : String(answerEntry.answer);
                questionStat.answers[answerValue] = (questionStat.answers[answerValue] || 0) + 1;
            }
        });
        analytics.questionSummary.push(questionStat);
    }
    return analytics;
};

// --- General Feedback Services ---
export const submitGeneralFeedback = async (feedbackData) => {
    if (feedbackData.user) {
        const userExists = await User.findById(feedbackData.user);
        if (!userExists) throw new Error('Usuario especificado no encontrado.');
    }
    const newFeedback = new GeneralFeedback(feedbackData);
    return await newFeedback.save();
};

export const getAllGeneralFeedback = async (filters = {}, options = {}) => {
    const { page = 1, limit = 10, sort = '-createdAt' } = options;
    const query = { ...filters };

    const feedbackItems = await GeneralFeedback.find(query)
        .populate('user', 'nombre correo') // Populate if user is logged in
        .populate('adminNotes.admin', 'nombre')
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(limit);
    const totalFeedback = await GeneralFeedback.countDocuments(query);
    return { feedbackItems, totalPages: Math.ceil(totalFeedback / limit), currentPage: page, totalFeedback };
};

export const getGeneralFeedbackById = async (feedbackId) => {
    const feedback = await GeneralFeedback.findById(feedbackId)
        .populate('user', 'nombre correo')
        .populate('adminNotes.admin', 'nombre');
    if (!feedback) throw new Error('Feedback no encontrado.');
    return feedback;
};

export const updateGeneralFeedbackStatus = async (feedbackId, status, adminId, adminNote) => {
    const feedback = await GeneralFeedback.findById(feedbackId);
    if (!feedback) throw new Error('Feedback no encontrado.');

    feedback.status = status;
    if (adminId && adminNote) {
        feedback.adminNotes.push({ note: adminNote, admin: adminId, date: new Date() });
    }
    return await feedback.save();
};

export const addAdminNoteToFeedback = async (feedbackId, adminId, note) => {
    return GeneralFeedback.findByIdAndUpdate(
        feedbackId,
        { $push: { adminNotes: { note, admin: adminId, date: new Date() } } },
        { new: true }
    ).populate('adminNotes.admin', 'nombre');
};