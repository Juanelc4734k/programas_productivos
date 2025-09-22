import Program from './programs.model.js';
import Project from './projects.model.js';
import User from '../auth/user.model.js'; // Assuming user model is in auth module

// --- Program Services ---

export const createNewProgram = async (programData) => {
    try {
        const newProgram = new Program(programData);
        return await newProgram.save();
    } catch (error) {
        // Log the error or handle it as per application's error handling strategy
        console.error("Service Error: createNewProgram", error);
        throw error; // Re-throw the error to be caught by the controller
    }
};

export const findAllPrograms = async (filter, options) => {
    try {
        const { page = 1, limit = 10, sort = 'createdAt' } = options;
        const skip = (page - 1) * limit;

        const programs = await Program.find(filter)
            .populate('responsable', 'nombre correo tipo_usuario')
            .populate('inscritos', 'nombre correo')
            .sort(sort)
            .skip(skip)
            .limit(limit);
        
        const totalPrograms = await Program.countDocuments(filter);
        
        return {
            totalPages: Math.ceil(totalPrograms / limit),
            currentPage: page,
            totalPrograms,
            programs
        };
    } catch (error) {
        console.error("Service Error: findAllPrograms", error);
        throw error;
    }
};

export const findProgramById = async (programId) => {
    try {
        const program = await Program.findById(programId)
            .populate('responsable', 'nombre correo tipo_usuario')
            .populate('inscritos', 'nombre correo documento_identidad');
        return program;
    } catch (error) {
        console.error("Service Error: findProgramById", error);
        throw error;
    }
};

export const updateExistingProgram = async (programId, updateData) => {
    try {
        return await Program.findByIdAndUpdate(programId, updateData, { new: true, runValidators: true });
    } catch (error) {
        console.error("Service Error: updateExistingProgram", error);
        throw error;
    }
};

export const deleteExistingProgram = async (programId) => {
    try {
        // Optional: Add business logic here, e.g., check for associated projects
        const projectsInProgram = await Project.countDocuments({ programa_id: programId });
        if (projectsInProgram > 0) {
            const error = new Error(`No se puede eliminar el programa. Tiene ${projectsInProgram} proyectos asociados. Elimine los proyectos primero.`);
            error.statusCode = 400; // Custom status code for controller to use
            throw error;
        }
        return await Program.findByIdAndDelete(programId);
    } catch (error) {
        console.error("Service Error: deleteExistingProgram", error);
        throw error;
    }
};

export const enrollUserInProgram = async (programId, userId) => {
    try {
        const program = await Program.findById(programId);
        const user = await User.findById(userId);

        if (!program) throw new Error('Programa no encontrado');
        if (!user) throw new Error('Usuario no encontrado');

        if (program.inscritos.includes(userId)) {
            const error = new Error('El usuario ya está inscrito en este programa');
            error.statusCode = 400;
            throw error;
        }

        if (program.cupos > 0 && program.inscritos.length >= program.cupos) { // Check cupos > 0 to allow unlimited if cupos is 0 or not set
            const error = new Error('No hay cupos disponibles en este programa');
            error.statusCode = 400;
            throw error;
        }

        program.inscritos.push(userId);
        return await program.save();
    } catch (error) {
        console.error("Service Error: enrollUserInProgram", error);
        throw error;
    }
};

export const unenrollUserFromProgram = async (programId, userId) => {
    try {
        const program = await Program.findById(programId);
        if (!program) throw new Error('Programa no encontrado');

        const userIndex = program.inscritos.indexOf(userId);
        if (userIndex === -1) {
            const error = new Error('El usuario no está inscrito en este programa');
            error.statusCode = 400;
            throw error;
        }

        program.inscritos.splice(userIndex, 1);
        return await program.save();
    } catch (error) {
        console.error("Service Error: unenrollUserFromProgram", error);
        throw error;
    }
};


// --- Project Services ---

export const createNewProject = async (projectData) => {
    try {
        const program = await Program.findById(projectData.programa_id);
        if (!program) {
            const error = new Error('Programa asociado no encontrado');
            error.statusCode = 404;
            throw error;
        }
        const newProject = new Project(projectData);
        return await newProject.save();
    } catch (error) {
        console.error("Service Error: createNewProject", error);
        throw error;
    }
};

export const findAllProjectsInProgram = async (programId) => {
    try {
        const program = await Program.findById(programId);
        if (!program) {
            const error = new Error('Programa no encontrado');
            error.statusCode = 404;
            throw error;
        }
        return await Project.find({ programa_id: programId })
            .populate('responsable_proyecto', 'nombre correo')
            .populate('participantes', 'nombre correo');
    } catch (error) {
        console.error("Service Error: findAllProjectsInProgram", error);
        throw error;
    }
};

export const findProjectById = async (projectId) => {
    try {
        return await Project.findById(projectId)
            .populate('programa_id', 'nombre categoria')
            .populate('responsable_proyecto', 'nombre correo tipo_usuario')
            .populate('participantes', 'nombre correo');
    } catch (error) {
        console.error("Service Error: findProjectById", error);
        throw error;
    }
};

export const updateExistingProject = async (projectId, updateData) => {
    try {
        return await Project.findByIdAndUpdate(projectId, updateData, { new: true, runValidators: true });
    } catch (error) {
        console.error("Service Error: updateExistingProject", error);
        throw error;
    }
};

export const deleteExistingProject = async (projectId) => {
    try {
        return await Project.findByIdAndDelete(projectId);
    } catch (error) {
        console.error("Service Error: deleteExistingProject", error);
        throw error;
    }
};