import api from '@/lib/api'
import { API_ENDPOINTS } from '@/lib/config'

interface RequestPasswordResetData {
  identifier: string; // email o documento_identidad
  userType: 'campesino' | 'funcionario';
}

interface VerifyCodeData {
  email: string;
  code: string;
}

interface ResetPasswordData {
  resetId: string;
  newPassword: string;
  confirmPassword: string;
}

export const passwordResetService = {
  // Solicitar código de recuperación
  requestReset: async (data: RequestPasswordResetData) => {
    const response = await api.post(API_ENDPOINTS.auth.requestPasswordReset, data)
    return response.data
  },

  // Verificar código
  verifyCode: async (data: VerifyCodeData) => {
    const response = await api.post(API_ENDPOINTS.auth.verifyResetCode, data)
    return response.data
  },

  // Restablecer contraseña
  resetPassword: async (data: ResetPasswordData) => {
    const response = await api.post(API_ENDPOINTS.auth.resetPassword, data)
    return response.data
  }
}