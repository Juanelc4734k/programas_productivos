import express from 'express';
import {
    createProgram,
    getAllPrograms,
    getProgramsByCampesino,
    getProgramById,
    updateProgram,
    deleteProgram,
    addUserToProgram,
    removeUserFromProgram,
    createProjectInProgram,
    getAllProjectsInProgram,
    getProjectById,
    updateProject,
    deleteProject,
    getBeneficiarios
} from './programs.controller.js';
import { protect, authorize } from '../../middlewares/auth.middleware.js'; // Assuming auth middleware is in a shared location

const router = express.Router();

// --- Program Routes ---
// POST /api/programs - Create a new program (Funcionario)
router.post('/', protect, authorize(['funcionario']), createProgram);

// GET /api/programs - Get all programs (Public or specific roles)
router.get('/', getAllPrograms); // Consider adding protect if only for logged-in users

// GET /api/programs/beneficiarios/:id - Get all beneficiarios of a program (Public or specific roles)
router.get('/beneficiarios/:id', getBeneficiarios); // Consider adding protect

// GET /api/programs/:id - Get a single program by ID (Public or specific roles)
router.get('/:id', getProgramById); // Consider adding protect

router.get('/campesino/:id', getProgramsByCampesino); // Get programs by campesino ID

// PUT /api/programs/:id - Update a program by ID (Funcionario)
router.put('/:id', protect, authorize(['funcionario']), updateProgram);

// DELETE /api/programs/:id - Delete a program by ID (Funcionario)
router.delete('/:id', protect, authorize(['funcionario']), deleteProgram);

// POST /api/programs/:programId/enroll/:userId - Enroll a user in a program (Campesino for self, Funcionario for others)
// This route might need more complex logic or separate routes for self-enrollment vs admin enrollment
router.post('/:programId/enroll/:userId', protect, addUserToProgram); // Add specific authorization if needed

// DELETE /api/programs/:programId/unenroll/:userId - Unenroll a user from a program (Campesino for self, Funcionario for others)
router.delete('/:programId/unenroll/:userId', protect, removeUserFromProgram); // Add specific authorization


// --- Project Routes (nested under programs for clarity, e.g., /api/programs/:programId/projects) ---

// POST /api/programs/:programId/projects - Create a new project within a program (Funcionario)
router.post('/:programId/projects', protect, authorize(['funcionario']), createProjectInProgram);

// GET /api/programs/:programId/projects - Get all projects for a specific program (Public or specific roles)
router.get('/:programId/projects', getAllProjectsInProgram); // Consider adding protect

// GET /api/programs/:programId/projects/:projectId - Get a single project by ID (Public or specific roles)
// Or a simpler route: /api/projects/:projectId if projects are globally unique and programId isn't strictly needed for lookup here
router.get('/:programId/projects/:projectId', getProjectById); // Consider adding protect
// Alternative simpler route for getting a project directly by its ID:
// router.get('/projects/:projectId', getProjectById); // This would require getProjectById to not rely on programId from params

// PUT /api/programs/:programId/projects/:projectId - Update a project by ID (Funcionario)
router.put('/:programId/projects/:projectId', protect, authorize(['funcionario']), updateProject);
// Alternative simpler route for updating a project directly by its ID:
// router.put('/projects/:projectId', protect, authorize(['funcionario']), updateProject);

// DELETE /api/programs/:programId/projects/:projectId - Delete a project by ID (Funcionario)
router.delete('/:programId/projects/:projectId', protect, authorize(['funcionario']), deleteProject);
// Alternative simpler route for deleting a project directly by its ID:
// router.delete('/projects/:projectId', protect, authorize(['funcionario']), deleteProject);


export default router;