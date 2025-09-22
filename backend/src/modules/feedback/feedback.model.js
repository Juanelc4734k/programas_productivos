import mongoose from 'mongoose';

const ratingSchema = new mongoose.Schema({
    value: {
        type: Number,
        required: true,
        min: 1,
        max: 5, // Example: 5-star rating
    },
    comment: {
        type: String,
        trim: true,
    },
    ratedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    relatedTo: { // What is being rated (e.g., program, training, service, article)
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        // refPath: 'onModel' // Dynamic referencing if needed
    },
    // onModel: {
    //     type: String,
    //     required: true,
    //     enum: ['Program', 'Training', 'Service', 'Article'] // Add other models as needed
    // },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const surveyQuestionSchema = new mongoose.Schema({
    questionText: {
        type: String,
        required: true,
        trim: true,
    },
    questionType: {
        type: String,
        required: true,
        enum: ['multiple_choice', 'single_choice', 'text', 'rating_scale', 'boolean'],
        default: 'text',
    },
    options: [String], // For multiple_choice or single_choice
    isRequired: {
        type: Boolean,
        default: false,
    },
});

const surveySchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        unique: true,
    },
    description: {
        type: String,
        trim: true,
    },
    questions: [surveyQuestionSchema],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Admin or Funcionario
        required: true,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    targetAudience: {
        type: String,
        enum: ['all', 'campesinos', 'funcionarios', 'specific_group', 'program_participants', 'training_attendees'],
        default: 'all',
    },
    // relatedEntity: { // e.g., link to a specific Program or Training if the survey is about it
    //     type: mongoose.Schema.Types.ObjectId,
    //     refPath: 'relatedModelName'
    // },
    // relatedModelName: {
    //     type: String,
    //     enum: ['Program', 'Training'] // Add other relevant models
    // },
    startDate: {
        type: Date,
        default: Date.now,
    },
    endDate: {
        type: Date,
    },
}, { timestamps: true });

const surveyResponseSchema = new mongoose.Schema({
    survey: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Survey',
        required: true,
    },
    respondent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true, // Can be anonymous if respondent is null and a flag is set
    },
    answers: [{
        question: { type: mongoose.Schema.Types.ObjectId }, // Reference to surveyQuestionSchema._id if questions are stored separately
        questionText: String, // Or store question text directly for easier reporting
        answer: mongoose.Schema.Types.Mixed, // Can be String, Number, Array of Strings, Boolean
    }],
    submittedAt: {
        type: Date,
        default: Date.now,
    },
}, { timestamps: true });

const generalFeedbackSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        // Can be null for anonymous feedback if allowed
    },
    email: { // For non-logged-in users providing feedback
        type: String,
        trim: true,
        lowercase: true,
    },
    category: {
        type: String,
        required: true,
        enum: ['sugerencia', 'queja', 'felicitacion', 'reporte_error', 'otro'],
        default: 'sugerencia',
    },
    subject: {
        type: String,
        trim: true,
    },
    message: {
        type: String,
        required: true,
        trim: true,
    },
    relatedFeature: { // e.g., 'Programs Module', 'Chatbot', 'Specific Training ID'
        type: String,
        trim: true,
    },
    status: {
        type: String,
        enum: ['nuevo', 'en_revision', 'resuelto', 'cerrado'],
        default: 'nuevo',
    },
    priority: {
        type: String,
        enum: ['bajo', 'medio', 'alto'],
        default: 'medio',
    },
    attachments: [{
        fileName: String,
        filePath: String,
        fileType: String,
    }],
    adminNotes: [{
        note: String,
        admin: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        date: { type: Date, default: Date.now },
    }]
}, { timestamps: true });

surveySchema.index({ title: 'text', description: 'text' });
generalFeedbackSchema.index({ category: 1, status: 1 });
ratingSchema.index({ relatedTo: 1, ratedBy: 1 });
surveyResponseSchema.index({ survey: 1, respondent: 1 });

export const Rating = mongoose.model('Rating', ratingSchema);
export const Survey = mongoose.model('Survey', surveySchema);
export const SurveyResponse = mongoose.model('SurveyResponse', surveyResponseSchema);
export const GeneralFeedback = mongoose.model('GeneralFeedback', generalFeedbackSchema);