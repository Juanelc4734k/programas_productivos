import express from 'express';
import {
    createTraining,
    getAllTrainings,
    getTrainingById,
    updateTraining,
    deleteTraining,
    enrollInTraining,
    updateEnrollment,
    unenrollFromTraining,
    adminEnrollUser,      // For admin/funcionario to enroll others
    adminUnenrollUser,    // For admin/funcionario to unenroll others
    addSession,
    updateSession,
    removeSession
} from './training.controller.js';
import { protect, authorize } from '../../middlewares/auth.middleware.js';

const router = express.Router();

// --- Training Routes ---
// POST /api/trainings - Create a new training (Funcionario, Admin)
router.post('/', protect, authorize(['funcionario', 'admin']), createTraining);

// GET /api/trainings - Get all trainings (Public or Authenticated Users)
// Public access might be suitable for listing available trainings
router.get('/', getAllTrainings); // Add 'protect' if only for logged-in users

// GET /api/trainings/:trainingId - Get a single training by ID (Public or Authenticated Users)
router.get('/:trainingId', getTrainingById); // Add 'protect' if needed

// PUT /api/trainings/:trainingId - Update a training by ID (Funcionario, Admin)
router.put('/:trainingId', protect, authorize(['funcionario', 'admin']), updateTraining);

// DELETE /api/trainings/:trainingId - Delete a training by ID (Funcionario, Admin)
router.delete('/:trainingId', protect, authorize(['funcionario', 'admin']), deleteTraining);


// --- Participant Enrollment Routes ---
// POST /api/trainings/:trainingId/enroll - Enroll current logged-in user (Authenticated Users)
router.post('/:trainingId/enroll', protect, enrollInTraining);

// DELETE /api/trainings/:trainingId/unenroll - Unenroll current logged-in user (Authenticated Users)
router.delete('/:trainingId/unenroll', protect, unenrollFromTraining);

// --- Admin/Funcionario Management of Participants ---
// POST /api/trainings/:trainingId/participants/:userId - Admin/Funcionario enrolls a specific user
router.post('/:trainingId/participants/:userId', protect, authorize(['funcionario', 'admin']), adminEnrollUser);

// PUT /api/trainings/:trainingId/participants/:participantUserId - Update a participant's enrollment status/details (Funcionario, Admin)
router.put('/:trainingId/participants/:participantUserId', protect, authorize(['funcionario', 'admin']), updateEnrollment);

// DELETE /api/trainings/:trainingId/participants/:userId - Admin/Funcionario unenrolls a specific user
router.delete('/:trainingId/participants/:userId', protect, authorize(['funcionario', 'admin']), adminUnenrollUser);


// --- Session Management Routes (within a training) ---
// POST /api/trainings/:trainingId/sessions - Add a session to a training (Funcionario, Admin)
router.post('/:trainingId/sessions', protect, authorize(['funcionario', 'admin']), addSession);

// PUT /api/trainings/:trainingId/sessions/:sessionId - Update a session (Funcionario, Admin)
router.put('/:trainingId/sessions/:sessionId', protect, authorize(['funcionario', 'admin']), updateSession);

// DELETE /api/trainings/:trainingId/sessions/:sessionId - Remove a session (Funcionario, Admin)
router.delete('/:trainingId/sessions/:sessionId', protect, authorize(['funcionario', 'admin']), removeSession);


export default router;