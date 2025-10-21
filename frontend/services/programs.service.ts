import api from '@/lib/api';
import { API_ENDPOINTS } from '@/lib/config';
import type { Program, ProgramResponse } from '@/types/programs';

export async function fetchPrograms() {
    try {
      const response = await api.get(API_ENDPOINTS.programs.list);
      return Array.isArray(response.data.programs)
        ? response.data.programs.map((program: Program) => ({
            ...program,
            beneficios: program.beneficios || [],
            requisitos: program.requisitos || [],
            ubicaciones: program.ubicaciones || [],
          }))
        : [];
    } catch (error) {
      console.error("Error fetching programs:", error);
      return [];
    }
}

export async function subirEvidencia(programId: string, file: File) {
    const fd = new FormData();
    fd.append('evidencia', file);
    const { data } = await api.post(`/programas/${programId}/evidencia`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
    return data;
}

export async function reportarAvance(
    programId: string,
    progreso: number,
    descripcion?: string,
    fecha?: string
) {
    const { data } = await api.post(`/programas/${programId}/progreso`, { progreso, descripcion, fecha });
    return data;
}

export async function fetchProgramsByCampesino(id: string) {
    try {
        const response = await api.get(API_ENDPOINTS.programs.programsByCampesino(id));
        return Array.isArray(response.data) ? response.data : []; // Asegúrate de retornar un arreglo
    } catch (error) {
        console.error("Error fetching programs by campesino:", error);
        return []; // Retorna un arreglo vacío en caso de error
    }
}

export async function fetchProgramById(id: string): Promise<Program> {
    try {
        const response = await api.get(`/programas/${id}`);
        
        // Handle both response formats: wrapped in success/data or direct program object
        let program;
        if (response.data.success && response.data.data) {
            // Wrapped format: {success: true, data: program}
            program = response.data.data;
        } else if (response.data._id) {
            // Direct format: program object
            program = response.data;
        } else {
            throw new Error(response.data.message || 'Programa no encontrado');
        }
        
        return {
            ...program,
            beneficios: program.beneficios || [],
            requisitos: program.requisitos || [],
            ubicaciones: program.ubicaciones || [],
            testimonios: program.testimonios || [],
            inscritos: program.inscritos || []
        };
    } catch (error: any) {
        console.error('Error fetching program by ID:', error);
        throw new Error(error.response?.data?.message || error.message || 'Error al cargar el programa');
    }
}

export async function enrollUserInProgram(programId: string, userId: string): Promise<any> {
    try {
        const response = await api.post(`/programas/${programId}/enroll/${userId}`);
        return response.data;
    } catch (error: any) {
        console.error('Error enrolling user in program:', error);
        throw new Error(error.response?.data?.message || error.message || 'Error al inscribirse en el programa');
    }
}

export async function unenrollUserFromProgram(programId: string, userId: string): Promise<any> {
    try {
        const response = await api.delete(`/programas/${programId}/unenroll/${userId}`);
        return response.data;
    } catch (error: any) {
        console.error('Error unenrolling user from program:', error);
        throw new Error(error.response?.data?.message || error.message || 'Error al desinscribirse del programa');
    }
}