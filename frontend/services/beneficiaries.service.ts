import api from '@/lib/api';
import { API_BASE_URL } from '@/lib/config';
import type { 
  BeneficiariesResponse, 
  BeneficiariesFilters, 
  BeneficiaryStats,
  Beneficiary 
} from '@/types/beneficiaries';

export const beneficiariesService = {
  /**
   * Obtener beneficiarios de un programa específico
   */
  getBeneficiariesByProgram: async (programId: string, filters?: BeneficiariesFilters): Promise<BeneficiariesResponse> => {
    try {
      const params = new URLSearchParams();
      
      if (filters?.search) params.append('search', filters.search);
      if (filters?.estado && filters.estado !== 'todos') params.append('estado', filters.estado);
      if (filters?.vereda) params.append('vereda', filters.vereda);
      if (filters?.page) params.append('page', filters.page.toString());
      if (filters?.limit) params.append('limit', filters.limit.toString());
      
      const queryString = params.toString();
      const url = `/programas/beneficiarios/${programId}${queryString ? `?${queryString}` : ''}`;
      
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error(`Error fetching beneficiaries for program ${programId}:`, error);
      throw error;
    }
  },

  /**
   * Obtener estadísticas de beneficiarios de un programa
   */
  getBeneficiariesStats: async (programId: string): Promise<BeneficiaryStats> => {
    try {
      const response = await api.get(`/programas/beneficiarios/${programId}/stats`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching beneficiaries stats for program ${programId}:`, error);
      throw error;
    }
  },

  /**
   * Obtener detalles de un beneficiario específico
   */
  getBeneficiaryDetails: async (beneficiaryId: string): Promise<Beneficiary> => {
    try {
      const response = await api.get(`/usuarios/${beneficiaryId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching beneficiary details ${beneficiaryId}:`, error);
      throw error;
    }
  },

  /**
   * Actualizar estado de un beneficiario
   */
  updateBeneficiaryStatus: async (beneficiaryId: string, estado: 'activo' | 'inactivo'): Promise<Beneficiary> => {
    try {
      const response = await api.patch(`/usuarios/${beneficiaryId}/estado`, { estado });
      return response.data;
    } catch (error) {
      console.error(`Error updating beneficiary status ${beneficiaryId}:`, error);
      throw error;
    }
  },

  /**
   * Obtener todas las veredas disponibles para filtros
   */
  getVeredas: async (): Promise<string[]> => {
    try {
      const response = await api.get('/usuarios/veredas');
      return response.data;
    } catch (error) {
      console.error('Error fetching veredas:', error);
      return [];
    }
  },

  /**
   * Exportar lista de beneficiarios
   */
  exportBeneficiaries: async (programId: string, format: 'csv' | 'excel' | 'pdf' = 'csv'): Promise<Blob> => {
    try {
      const response = await api.get(`/programas/beneficiarios/${programId}/export`, {
        params: { format },
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error(`Error exporting beneficiaries for program ${programId}:`, error);
      throw error;
    }
  },

  /**
   * Inscribir un beneficiario a un programa
   */
  enrollBeneficiary: async (programId: string, beneficiaryId: string): Promise<void> => {
    try {
      await api.post(`/programas/${programId}/inscribir`, { usuarioId: beneficiaryId });
    } catch (error) {
      console.error(`Error enrolling beneficiary ${beneficiaryId} to program ${programId}:`, error);
      throw error;
    }
  },

  /**
   * Desinscribir un beneficiario de un programa
   */
  unenrollBeneficiary: async (programId: string, beneficiaryId: string): Promise<void> => {
    try {
      await api.delete(`/programas/${programId}/desinscribir/${beneficiaryId}`);
    } catch (error) {
      console.error(`Error unenrolling beneficiary ${beneficiaryId} from program ${programId}:`, error);
      throw error;
    }
  }
};