import api from '@/lib/api';
import { API_ENDPOINTS } from '@/lib/config';
import type { TramiteItem } from '@/types/tramites'


export const tramitesService = {


  crear: async (datosTramite) => {
    try {
      const formData = new FormData();
      Object.keys(datosTramite).forEach(key => {
        if (key !== 'documento') {
          formData.append(key, datosTramite[key]);
        }
      });
      if (datosTramite.documento) {
        formData.append('documento', datosTramite.documento);
      }
      const response = await api.post(API_ENDPOINTS.tramites.create, formData);
      return response.data;
    } catch (error) {
      console.error("Error creating tramite:", error);
      throw error;
    }
  },

    listarMisTramites: async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No token found');
      }

      let decodedToken = null;
      try {
        decodedToken = JSON.parse(atob(token.split('.')[1]));
      } catch (error) {
        console.error("Error decoding token:", error);
        throw error;
      }

      const campesinoId = decodedToken ? decodedToken.id : null;
      if (!campesinoId) {
        throw new Error('No user ID found in token');
      }

      const response = await api.get(API_ENDPOINTS.tramites.listByCampesino(campesinoId));
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error("Error fetching tramites:", error);
      return [];
    }
  },

  obtenerPorId: async (id: string) => {
    try {
      const response = await api.get(API_ENDPOINTS.tramites.update(id));
      return response.data;
    } catch (error) {
      console.error(`Error fetching tramite ${id}:`, error);
      throw error;
    }
  },

  actualizarEstado: async (id: string, estado: string) => {
    try {
      const response = await api.patch(API_ENDPOINTS.tramites.update(id), { estado });
      return response.data;
    } catch (error) {
      console.error(`Error updating tramite status ${id}:`, error);
      throw error;
    }
  },

  listarPorUsuario: async (id: string) => {
    try {
      const response = await api.get(API_ENDPOINTS.tramites.listByCampesino(id));
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error(`Error fetching tramites for user ${id}:`, error);
      return [];
    }
  },
  listarPublicos: async (): Promise<TramiteItem[]> => {
    try {
      const response = await api.get(API_ENDPOINTS.tramites.list)
      const list = Array.isArray(response.data) ? response.data : []
      return list.map((t: any) => ({ ...t })) as TramiteItem[]
    } catch (error) {
      console.error("Error fetching public tramites:", error)
      return []
    }
  },
};
