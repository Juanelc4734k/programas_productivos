import Program from './programs.model.js';
import Project from './projects.model.js';
import User from '../auth/user.model.js';


// Create a new program
export const createProgram = async (req, res) => {
    try {
        const { 
            nombre, 
            descripcion, 
            categoria, 
            fecha_inicio, 
            fecha_fin, 
            estado, 
            cupos, 
            banner_url, 
            responsable,
            beneficios,
            requisitos,
            progreso,
            presupuesto,
            ubicaciones,
            testimonios
        } = req.body;
        const newProgram = new Program({ 
            nombre, 
            descripcion, 
            categoria, 
            fecha_inicio, 
            fecha_fin, 
            estado, 
            cupos, 
            banner_url,
            responsable,
            beneficios,
            requisitos,
            progreso,
            presupuesto,
            ubicaciones,
            testimonios
        });
        const savedProgram = await newProgram.save();
        res.status(201).json(savedProgram);
    } catch (error) {
        console.error("Error creating program:", error);
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Ya existe un programa con ese nombre.', error: error.message });
        }
        res.status(500).json({ message: 'Error al crear el programa', error: error.message });
    }
};

// Get all programs (with optional query parameters for filtering/pagination)
export const getAllPrograms = async (req, res) => {
    try {
        // Basic pagination and sorting example
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const sort = req.query.sort || 'createdAt'; // e.g., 'nombre', '-cupos'

        // Basic filtering example (can be expanded)
        const filter = {};
        if (req.query.categoria) filter.categoria = req.query.categoria;
        if (req.query.estado) filter.estado = req.query.estado;
        if (req.query.search) {
            filter.$text = { $search: req.query.search };
        }

        const programs = await Program.find(filter)
            .populate('responsable', 'nombre correo tipo_usuario') // Populate responsible user details
            .populate('inscritos', 'nombre correo') // Populate enrolled users' basic details
            .sort(sort)
            .skip(skip)
            .limit(limit);
        
        const totalPrograms = await Program.countDocuments(filter);

        res.status(200).json({
            totalPages: Math.ceil(totalPrograms / limit),
            currentPage: page,
            totalPrograms,
            programs
        });
    } catch (error) {
        console.error("Error getting all programs:", error);
        res.status(500).json({ message: 'Error al obtener los programas', error: error.message });
    }
};

export const getBeneficiarios = async (req, res) => {
    try {
        const program = await Program.findById(req.params.id)
            .populate('inscritos', 'nombre correo documento_identidad tipo_usuario'); // Populate enrolled users with their details
            
        if (!program) {
            return res.status(404).json({ message: 'Programa no encontrado' });
        }

        // Return the populated inscritos array with user details
        res.status(200).json(program.inscritos);
    } catch (error) {
        console.error("Error getting beneficiarios:", error);
        res.status(500).json({ message: 'Error al obtener los beneficiarios', error: error.message });
    }
}


// Get a single program by ID
export const getProgramById = async (req, res) => {
    try {
        const program = await Program.findById(req.params.id)
            .populate('responsable', 'nombre correo tipo_usuario')
            .populate('inscritos', 'nombre correo documento_identidad');
        if (!program) {
            return res.status(404).json({ message: 'Programa no encontrado' });
        }
        res.status(200).json(program);
    } catch (error) {
        console.error("Error getting program by ID:", error);
        if (error.kind === 'ObjectId') {
            return res.status(400).json({ message: 'ID de programa inválido' });
        }
        res.status(500).json({ message: 'Error al obtener el programa', error: error.message });
    }
};

export const getProgramsByCampesino = async (req, res) => {
    try {
      const { id } = req.params; // ID del campesino
      const programs = await Program.find({ inscritos: id })
        .populate('responsable', 'nombre correo tipo_usuario')
        .populate('inscritos', 'nombre correo documento_identidad');
  
      if (!programs || programs.length === 0) {
        return res.status(404).json({ message: 'No se encontraron programas para este campesino' });
      }
      res.status(200).json(programs);
    } catch (error) {
      console.error("Error getting programs by campesino:", error);
      res.status(500).json({ message: 'Error al obtener los programas del campesino', error: error.message });
    }
  };

// Update a program by ID
export const updateProgram = async (req, res) => {
    try {
        const updatedProgram = await Program.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!updatedProgram) {
            return res.status(404).json({ message: 'Programa no encontrado para actualizar' });
        }
        res.status(200).json(updatedProgram);
    } catch (error) {
        console.error("Error updating program:", error);
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Conflicto al actualizar, el nombre del programa ya existe.', error: error.message });
        }
        if (error.kind === 'ObjectId') {
            return res.status(400).json({ message: 'ID de programa inválido' });
        }
        res.status(500).json({ message: 'Error al actualizar el programa', error: error.message });
    }
};

// Delete a program by ID
export const deleteProgram = async (req, res) => {
    try {
        const program = await Program.findById(req.params.id);
        if (!program) {
            return res.status(404).json({ message: 'Programa no encontrado para eliminar' });
        }
        // Optional: Check if there are associated projects and handle them (e.g., prevent deletion or delete them too)
        const projectsInProgram = await Project.countDocuments({ programa_id: req.params.id });
        if (projectsInProgram > 0) {
            return res.status(400).json({ message: `No se puede eliminar el programa. Tiene ${projectsInProgram} proyectos asociados. Elimine los proyectos primero.` });
        }

        await Program.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Programa eliminado correctamente' });
    } catch (error) {
        console.error("Error deleting program:", error);
        if (error.kind === 'ObjectId') {
            return res.status(400).json({ message: 'ID de programa inválido' });
        }
        res.status(500).json({ message: 'Error al eliminar el programa', error: error.message });
    }
};

// Enroll a user in a program (REDUCE CUPOS)
export const addUserToProgram = async (req, res) => {
    try {
        const { programId, userId } = req.params;
        const program = await Program.findById(programId);
        const user = await User.findById(userId);

        if (!program) return res.status(404).json({ message: 'Programa no encontrado' });
        if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

        if (program.inscritos.includes(userId)) {
            return res.status(400).json({ message: 'El usuario ya está inscrito en este programa' });
        }

        if (program.inscritos.length >= program.cupos) {
            return res.status(400).json({ message: 'No hay cupos disponibles en este programa' });
        }

        program.inscritos.push(userId);
        program.cupos = program.cupos - 1; // Reduce available spots by 1
        await program.save();
        res.status(200).json({ 
            message: 'Usuario inscrito correctamente', 
            program,
            cuposRestantes: program.cupos // Return remaining spots
        });
    } catch (error) {
        console.error("Error enrolling user in program:", error);
        res.status(500).json({ message: 'Error al inscribir al usuario en el programa', error: error.message });
    }
};

// Unenroll a user from a program
export const removeUserFromProgram = async (req, res) => {
    try {
        const { programId, userId } = req.params;
        const program = await Program.findById(programId);

        if (!program) return res.status(404).json({ message: 'Programa no encontrado' });
        
        const userIndex = program.inscritos.indexOf(userId);
        if (userIndex === -1) {
            return res.status(400).json({ message: 'El usuario no está inscrito en este programa' });
        }

        program.inscritos.splice(userIndex, 1);
        program.cupos = program.cupos + 1; // Increase available spots by 1
        await program.save();
        res.status(200).json({ 
            message: 'Usuario desinscrito correctamente', 
            program,
            cuposRestantes: program.cupos // Return remaining spots
        });
    } catch (error) {
        console.error("Error unenrolling user from program:", error);
        res.status(500).json({ message: 'Error al desinscribir al usuario del programa', error: error.message });
    }
};


// --- Project Controllers (associated with a Program) ---

// Create a new project within a specific program
export const createProjectInProgram = async (req, res) => {
    try {
        const { programId } = req.params; // Get programId from URL parameters
        const { nombre, descripcion, objetivos, responsable_proyecto, participantes, estado, fecha_inicio_estimada, fecha_fin_estimada, presupuesto_estimado, ubicacion } = req.body;

        const program = await Program.findById(programId);
        if (!program) {
            return res.status(404).json({ message: 'Programa asociado no encontrado' });
        }

        const newProject = new Project({
            nombre,
            descripcion,
            objetivos,
            programa_id: programId,
            responsable_proyecto,
            participantes,
            estado,
            fecha_inicio_estimada,
            fecha_fin_estimada,
            presupuesto_estimado,
            ubicacion
        });
        const savedProject = await newProject.save();
        res.status(201).json(savedProject);
    } catch (error) {
        console.error("Error creating project:", error);
        if (error.code === 11000) { 
            return res.status(400).json({ message: 'Ya existe un proyecto con ese nombre.', error: error.message });
        }
        res.status(500).json({ message: 'Error al crear el proyecto', error: error.message });
    }
};

// Get all projects for a specific program
export const getAllProjectsInProgram = async (req, res) => {
    try {
        const { programId } = req.params;
        const program = await Program.findById(programId);
        if (!program) {
            return res.status(404).json({ message: 'Programa no encontrado' });
        }

        const projects = await Project.find({ programa_id: programId })
            .populate('responsable_proyecto', 'nombre correo')
            .populate('participantes', 'nombre correo');
        res.status(200).json(projects);
    } catch (error) {
        console.error("Error getting projects for program:", error);
        res.status(500).json({ message: 'Error al obtener los proyectos del programa', error: error.message });
    }
};

// Get a single project by its ID (ensure it belongs to the specified program if needed, or just by project ID)
export const getProjectById = async (req, res) => {
    try {
        // const { programId, projectId } = req.params; // If you want to ensure project is within program
        const { projectId } = req.params;
        const project = await Project.findById(projectId)
            // .where({ programa_id: programId }) // Uncomment if programId is also in route and needed for lookup
            .populate('programa_id', 'nombre categoria')
            .populate('responsable_proyecto', 'nombre correo tipo_usuario')
            .populate('participantes', 'nombre correo');

        if (!project) {
            return res.status(404).json({ message: 'Proyecto no encontrado' });
        }
        res.status(200).json(project);
    } catch (error) {
        console.error("Error getting project by ID:", error);
        if (error.kind === 'ObjectId') {
            return res.status(400).json({ message: 'ID de proyecto inválido' });
        }
        res.status(500).json({ message: 'Error al obtener el proyecto', error: error.message });
    }
};

// Update a project by ID
export const updateProject = async (req, res) => {
    try {
        const { projectId } = req.params;
        const updatedProject = await Project.findByIdAndUpdate(projectId, req.body, { new: true, runValidators: true });
        if (!updatedProject) {
            return res.status(404).json({ message: 'Proyecto no encontrado para actualizar' });
        }
        res.status(200).json(updatedProject);
    } catch (error) {
        console.error("Error updating project:", error);
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Conflicto al actualizar, el nombre del proyecto ya existe.', error: error.message });
        }
        if (error.kind === 'ObjectId') {
            return res.status(400).json({ message: 'ID de proyecto inválido' });
        }
        res.status(500).json({ message: 'Error al actualizar el proyecto', error: error.message });
    }
};

// Delete a project by ID
export const deleteProject = async (req, res) => {
    try {
        const { projectId } = req.params;
        const deletedProject = await Project.findByIdAndDelete(projectId);
        if (!deletedProject) {
            return res.status(404).json({ message: 'Proyecto no encontrado para eliminar' });
        }
        res.status(200).json({ message: 'Proyecto eliminado correctamente' });
    } catch (error) {
        console.error("Error deleting project:", error);
        if (error.kind === 'ObjectId') {
            return res.status(400).json({ message: 'ID de proyecto inválido' });
        }
        res.status(500).json({ message: 'Error al eliminar el proyecto', error: error.message });
    }
};