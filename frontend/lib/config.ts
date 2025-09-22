export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

export const API_ENDPOINTS = {
  auth: {
    loginCampesino: '/auth/login/campesino',
    registerCampesino: '/auth/register/campesino',
    loginFuncionario: '/auth/login/funcionario',
    registerFuncionario: '/auth/register/funcionario',
    me: '/auth/me',
    // Nuevos endpoints para recuperación de contraseña
    requestPasswordReset: '/auth/password-reset/request',
    verifyResetCode: '/auth/password-reset/verify',
    resetPassword: '/auth/password-reset/reset'
  },
  programs: {
    list: '/programas/',
    programsByCampesino: (id: string) => `/programas/campesino/${id}`, // Nuevo endpoint para obtener programas por campesino
    create: '/programas',
    update: (id: string) => `/programs/${id}`,
    delete: (id: string) => `/programs/${id}`
  },
  tramites: {
    list: '/tramites/public',
    create: '/tramites',
    update: (id: string) => `/tramites/${id}`,
    delete: (id: string) => `/tramites/${id}`,
    listByCampesino: (id: string) => `/tramites/usuario/${id}` // Nuevo endpoint para obtener tramites por campesino
  },
  documents: {
    list: '/documents',
    upload: '/documents',
    download: (id: string) => `/documents/${id}`
  },
  chatbot: {
    sendMessage: '/chatbot/message',
    getHistory: '/chatbot/history',
    getQuickReplies: '/chatbot/quick-replies',
    startSession: '/chatbot/session/start',
    endSession: (sessionId: string) => `/chatbot/session/${sessionId}/end`,
    // FAQ management (for funcionarios/admin)
    createFAQ: '/chatbot/faq',
    getFAQs: '/chatbot/faq',
    updateFAQ: (id: string) => `/chatbot/faq/${id}`,
    deleteFAQ: (id: string) => `/chatbot/faq/${id}`
  }
}