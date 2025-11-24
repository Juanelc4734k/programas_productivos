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
        const { id } = req.params;
        const { search, estado, vereda, page = 1, limit = 10 } = req.query;

        let usersQuery;
        if (id === 'all') {
            usersQuery = User.find({ tipo_usuario: 'campesino' });
        } else {
            const program = await Program.findById(id);
            if (!program) {
                return res.status(404).json({ message: 'Programa no encontrado' });
            }
            usersQuery = User.find({ _id: { $in: program.inscritos } });
        }

        if (estado && (estado === 'activo' || estado === 'inactivo')) {
            usersQuery = usersQuery.where({ estado });
        }
        if (vereda) {
            usersQuery = usersQuery.where({ vereda });
        }
        if (search) {
            const regex = new RegExp(search, 'i');
            usersQuery = usersQuery.where({
                $or: [
                    { nombre: regex },
                    { correo: regex },
                    { documento_identidad: regex }
                ]
            });
        }

        const pageNum = Number(page) || 1;
        const limitNum = Number(limit) || 10;
        const skip = (pageNum - 1) * limitNum;

        const total = await usersQuery.clone().countDocuments();
        const rawUsers = await usersQuery.skip(skip).limit(limitNum).lean();

        const beneficiaries = await Promise.all(
            rawUsers.map(async (u) => {
                const programas = await Program.find({ inscritos: u._id }).select('nombre estado createdAt').lean();
                return {
                    ...u,
                    programas: programas.map(p => ({
                        _id: p._id,
                        nombre: p.nombre,
                        estado: p.estado || 'activo',
                        fecha_inscripcion: p.createdAt
                    })),
                    totalProgramas: programas.length
                };
            })
        );

        res.status(200).json({
            success: true,
            message: 'Beneficiarios obtenidos correctamente',
            data: {
                beneficiaries,
                total,
                page: pageNum,
                limit: limitNum,
                totalPages: Math.ceil(total / limitNum)
            }
        });
    } catch (error) {
        console.error('Error getting beneficiarios:', error);
        res.status(500).json({ message: 'Error al obtener los beneficiarios', error: error.message });
    }
}

export const getBeneficiariosStats = async (req, res) => {
    try {
        const { id } = req.params;
        const { estado, vereda } = req.query;

        let usersQuery;
        if (id === 'all') {
            usersQuery = User.find({ tipo_usuario: 'campesino' });
        } else {
            const program = await Program.findById(id);
            if (!program) {
                return res.status(404).json({ message: 'Programa no encontrado' });
            }
            usersQuery = User.find({ _id: { $in: program.inscritos } });
        }

        if (estado && (estado === 'activo' || estado === 'inactivo')) {
            usersQuery = usersQuery.where({ estado });
        }
        if (vereda) {
            usersQuery = usersQuery.where({ vereda });
        }

        const users = await usersQuery.lean();

        const total = users.length;
        const activos = users.filter(u => u.estado === 'activo').length;
        const inactivos = users.filter(u => u.estado === 'inactivo').length;
        const porVereda = users.reduce((acc, u) => {
            const v = u.vereda || 'Sin vereda';
            acc[v] = (acc[v] || 0) + 1;
            return acc;
        }, {});
        const porPrograma = {};

        for (const u of users) {
            const programas = await Program.find({ inscritos: u._id }).select('nombre').lean();
            for (const p of programas) {
                porPrograma[p.nombre] = (porPrograma[p.nombre] || 0) + 1;
            }
        }

        res.status(200).json({ total, activos, inactivos, porVereda, porPrograma });
    } catch (error) {
        console.error('Error getting beneficiarios stats:', error);
        res.status(500).json({ message: 'Error al obtener estadísticas', error: error.message });
    }
}

export const exportBeneficiarios = async (req, res) => {
    try {
        const { id } = req.params;
        const { search, estado, vereda } = req.query;
        const format = (req.query.format || 'csv').toString().toLowerCase();

        let usersQuery;
        if (id === 'all') {
            usersQuery = User.find({ tipo_usuario: 'campesino' });
        } else {
            const program = await Program.findById(id);
            if (!program) {
                return res.status(404).json({ message: 'Programa no encontrado' });
            }
            usersQuery = User.find({ _id: { $in: program.inscritos } });
        }

        if (estado && (estado === 'activo' || estado === 'inactivo')) {
            usersQuery = usersQuery.where({ estado });
        }
        if (vereda) {
            usersQuery = usersQuery.where({ vereda });
        }
        if (search) {
            const regex = new RegExp(search, 'i');
            usersQuery = usersQuery.where({
                $or: [
                    { nombre: regex },
                    { correo: regex },
                    { documento_identidad: regex }
                ]
            });
        }

        const users = await usersQuery.lean();

        const header = ['nombre','documento_identidad','correo','telefono','vereda','estado','programas','totalProgramas','fecha_registro'];
        const rows = [];
        for (const u of users) {
            const programas = await Program.find({ inscritos: u._id }).select('nombre');
            const programaNombres = (programas || []).map(p => p.nombre).join('; ');
            rows.push([
                u.nombre || '',
                u.documento_identidad || '',
                u.correo || '',
                u.telefono || '',
                u.vereda || '',
                u.estado || '',
                programaNombres,
                String(programas.length || 0),
                (u.createdAt ? new Date(u.createdAt).toISOString() : '')
            ]);
        }

        // Generate CSV content (base for CSV/XLS)
        const escapeCell = (value) => {
            const s = String(value ?? '');
            const needsQuote = /[",\n]/.test(s);
            const escaped = s.replace(/"/g, '""');
            return needsQuote ? `"${escaped}"` : escaped;
        };
        const csvBody = [header.map(escapeCell).join(','), ...rows.map(r => r.map(escapeCell).join(','))].join('\n');
        const bom = '\uFEFF';
        const csv = bom + csvBody;

        if (format === 'csv' || format === 'xls' || format === 'excel') {
            const isXls = format === 'xls' || format === 'excel';
            res.setHeader('Content-Type', isXls ? 'application/vnd.ms-excel; charset=utf-8' : 'text/csv; charset=utf-8');
            res.setHeader('Content-Disposition', `attachment; filename="beneficiarios-${id}.${isXls ? 'xls' : 'csv'}"`);
            return res.status(200).send(csv);
        }

        if (format === 'pdf') {
            // Render a simple HTML table and convert to PDF using puppeteer
            const tableRows = rows.map(r => `<tr>${r.map(c => `<td style="padding:4px;border:1px solid #ddd;font-size:12px">${String(c)}</td>`).join('')}</tr>`).join('');
            const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Beneficiarios</title>
              <style>body{font-family:Arial,Helvetica,sans-serif;padding:16px;color:#111}
              h1{font-size:16px;margin:0 0 12px}
              table{border-collapse:collapse;width:100%}
              thead th{background:#f5f5f5;border:1px solid #ddd;padding:6px;font-size:12px;text-align:left}
              </style></head><body>
              <h1>Beneficiarios - Programa ${id}</h1>
              <table><thead><tr>${header.map(h => `<th>${h}</th>`).join('')}</tr></thead><tbody>${tableRows}</tbody></table>
              </body></html>`;

            try {
                const puppeteer = await import('puppeteer');
                const commonWindowsPaths = [
                  'C:/Program Files/Google/Chrome/Application/chrome.exe',
                  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
                  (process.env.LOCALAPPDATA ? `${process.env.LOCALAPPDATA}/Google/Chrome/Application/chrome.exe` : '')
                ].filter(Boolean);
                const { default: fs } = await import('fs');
                const os = await import('os');
                const path = await import('path');
                const envPath = process.env.PUPPETEER_EXECUTABLE_PATH || process.env.CHROME_PATH;
                let resolvedPath = envPath && fs.existsSync(envPath) ? envPath : commonWindowsPaths.find(p => { try { return fs.existsSync(p) } catch { return false } });
                if (!resolvedPath) {
                  try {
                    const home = (os.userInfo && os.userInfo().homedir) || process.env.USERPROFILE || '';
                    const cacheRoot = path.join(home, '.cache', 'puppeteer', 'chrome');
                    const platforms = fs.existsSync(cacheRoot) ? fs.readdirSync(cacheRoot) : [];
                    for (const plat of platforms) {
                      const candidate = path.join(cacheRoot, plat, 'chrome-win64', 'chrome.exe');
                      if (fs.existsSync(candidate)) { resolvedPath = candidate; break; }
                    }
                  } catch {}
                }

                let browser;
                try {
                  browser = await puppeteer.launch({ headless: true, channel: 'chrome', args: ['--no-sandbox','--disable-setuid-sandbox','--disable-gpu'] });
                } catch {
                  if (!resolvedPath) throw new Error('Chrome no encontrado. Configura CHROME_PATH o instala Chrome.');
                  browser = await puppeteer.launch({ headless: true, executablePath: resolvedPath, args: ['--no-sandbox','--disable-setuid-sandbox','--disable-gpu'] });
                }
                const page = await browser.newPage();
                await page.setContent(html, { waitUntil: 'networkidle0' });
                const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true, margin: { top: '20mm', right: '12mm', bottom: '20mm', left: '12mm' } });
                await browser.close();
                res.setHeader('Content-Type', 'application/pdf');
                res.setHeader('Content-Length', String(pdfBuffer.length));
                res.setHeader('Content-Disposition', `attachment; filename=\"beneficiarios-${id}.pdf\"`);
                return res.status(200).send(pdfBuffer);
            } catch (err) {
                console.error('Error generating PDF for beneficiarios:', err);
                return res.status(500).json({ message: 'Error al generar PDF de beneficiarios' });
            }
        }

        return res.status(400).json({ message: 'Formato no soportado' });
    } catch (error) {
        console.error('Error exporting beneficiarios:', error);
        res.status(500).json({ message: 'Error al exportar beneficiarios', error: error.message });
    }
}


// Get a single program by ID
export const getProgramById = async (req, res) => {
    try {
        const program = await Program.findById(req.params.id)
            .populate('responsable', 'nombre correo telefono tipo_usuario') // Ensure responsable field is populated
            .populate('inscritos', 'nombre correo documento_identidad');
        if (!program) {
            return res.status(404).json({ message: 'Programa no encontrado' });
        }

        const data = program.toObject() ? program.toObject() : program;

        if(!data.responsable && Array.isArray(data.inscritos) && data.inscritos.length > 0) {
            data.responsable = data.inscritos[0];
        }

        res.status(200).json({ success: true, data });
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

export const uploadEvidenceProgram = async (req, res) => {
    try {
        const { programId } = req.params;
        if (!req.file) {
            return res.status(400).json({ message: 'No se ha proporcionado ningún archivo' });
        }
        const program = await Program.findById(programId);
        if (!program) {
            return res.status(404).json({ message: 'Programa no encontrado' });
        }

        const normalizedPath = req.file.path.replace(/\\/g, '/');
        const uploadsIndex = normalizedPath.indexOf('/uploads');
        const publicPath = uploadsIndex >= 0 ? normalizedPath.substring(uploadsIndex) : normalizedPath;

        const evidenceItem = {
            filename: req.file.originalname,
            path: publicPath,
            mimetype: req.file.mimetype,
            size: req.file.size,
            uploadedBy: req.user?._id,
            uploadedAt: new Date()
        };

        if (!program.evidencia) program.evidencia = [];
        program.evidencia.push(evidenceItem);
        await program.save();

        res.status(200).json({ message: 'Evidencia subida correctamente', evidencia: evidenceItem, programId: program._id });
    } catch (error) {
        console.error("Error uploading evidence:", error);
        res.status(500).json({ message: 'Error al subir la evidencia', error: error.message });
    }
    // ... existing code ...
}

export const reportProgramProgress = async (req, res) => {
    try {
        const { programId } = req.params;
        const { progreso, descripcion } = req.body;

        const value = Number(progreso);
        if (!Number.isFinite(value) || value < 0 || value > 100) {
            return res.status(400).json({ message: 'El progreso debe estar entre 0 y 100' });
        }

        const program = await Program.findById(programId);
        if (!program) {
            return res.status(404).json({ message: 'Programa no encontrado' });
        }

        program.progreso = value;

        if (descripcion) {
            if (!program.reportesAvance) program.reportesAvance = [];
            program.reportesAvance.push({
                valor: value,
                descripcion,
                fecha: new Date(),
                usuario: req.user?._id
            });
        }

        await program.save();
        res.status(200).json({ message: 'Progreso actualizado', progreso: program.progreso, programId: program._id });
    } catch (error) {
        console.error("Error reporting progress:", error);
        res.status(500).json({ message: 'Error al reportar el avance', error: error.message });
    }
    // ... existing code ...
}


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
