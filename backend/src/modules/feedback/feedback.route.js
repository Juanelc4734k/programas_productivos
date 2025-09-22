import { Router } from 'express';
import * as feedbackController from './feedback.controller.js';
import { isAuthenticated, authorizeRoles } from '../../middlewares/auth.middleware.js'; // Adjust path as needed
// Assuming ROLES.ADMIN, ROLES.FUNCIONARIO, ROLES.CAMPESINO are defined in your auth middleware or a constants file
const ROLES = { ADMIN: 'admin', FUNCIONARIO: 'funcionario', CAMPESINO: 'campesino', USER: 'user' }; // Example roles

const router = Router();

// --- Rating Routes ---
// POST a new rating (any authenticated user can rate)
router.post('/ratings', isAuthenticated, feedbackController.handleCreateRating);
// GET ratings for a specific entity (e.g., program, training)
router.get('/ratings/entity/:entityId', feedbackController.handleGetRatingsForEntity);
// GET average rating for a specific entity
router.get('/ratings/entity/:entityId/average', feedbackController.handleGetAverageRatingForEntity);

// --- Survey Routes ---
// POST a new survey (Admin or Funcionario)
router.post('/surveys', isAuthenticated, authorizeRoles(ROLES.ADMIN, ROLES.FUNCIONARIO), feedbackController.handleCreateSurvey);
// GET all active surveys (publicly accessible or for specific target audiences)
router.get('/surveys', feedbackController.handleGetAllSurveys);
// GET a specific survey by ID (publicly accessible if active)
router.get('/surveys/:surveyId', feedbackController.handleGetSurveyById);
// PUT update a survey (Admin or Funcionario who created it - add more specific logic in service/controller)
router.put('/surveys/:surveyId', isAuthenticated, authorizeRoles(ROLES.ADMIN, ROLES.FUNCIONARIO), feedbackController.handleUpdateSurvey);
// PATCH deactivate a survey (Admin or Funcionario)
router.patch('/surveys/:surveyId/deactivate', isAuthenticated, authorizeRoles(ROLES.ADMIN, ROLES.FUNCIONARIO), feedbackController.handleDeactivateSurvey);

// --- Survey Response Routes ---
// POST a response to a survey (Authenticated users)
router.post('/surveys/:surveyId/responses', isAuthenticated, feedbackController.handleSubmitSurveyResponse);
// GET all responses for a specific survey (Admin or Funcionario)
router.get('/surveys/:surveyId/responses', isAuthenticated, authorizeRoles(ROLES.ADMIN, ROLES.FUNCIONARIO), feedbackController.handleGetSurveyResponses);
// GET analytics for a specific survey (Admin or Funcionario)
router.get('/surveys/:surveyId/analytics', isAuthenticated, authorizeRoles(ROLES.ADMIN, ROLES.FUNCIONARIO), feedbackController.handleGetSurveyAnalytics);

// --- General Feedback Routes ---
// POST general feedback (can be anonymous or by authenticated user)
router.post('/general', feedbackController.handleSubmitGeneralFeedback); // isAuthenticated can be optional here or handled inside controller
// GET all general feedback (Admin or Funcionario)
router.get('/general', isAuthenticated, authorizeRoles(ROLES.ADMIN, ROLES.FUNCIONARIO), feedbackController.handleGetAllGeneralFeedback);
// GET specific feedback by ID (Admin or Funcionario)
router.get('/general/:feedbackId', isAuthenticated, authorizeRoles(ROLES.ADMIN, ROLES.FUNCIONARIO), feedbackController.handleGetGeneralFeedbackById);
// PATCH update status of a feedback item (Admin or Funcionario)
router.patch('/general/:feedbackId/status', isAuthenticated, authorizeRoles(ROLES.ADMIN, ROLES.FUNCIONARIO), feedbackController.handleUpdateGeneralFeedbackStatus);
// POST add an admin note to a feedback item (Admin or Funcionario)
router.post('/general/:feedbackId/notes', isAuthenticated, authorizeRoles(ROLES.ADMIN, ROLES.FUNCIONARIO), feedbackController.handleAddAdminNoteToFeedback);

export default router;