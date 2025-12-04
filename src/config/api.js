// Configuración centralizada de la API
// IMPORTANTE: Cambia esta IP por la IP correcta del servidor en tu red actual
// Para encontrar la IP del servidor, ejecuta 'ipconfig' en la máquina donde corre el servidor
// y busca la "Dirección IPv4" del adaptador activo (Wi-Fi o Ethernet)
export const API_BASE_URL = 'http://192.168.106.151:4000'; // Cambia esta IP por la del servidor

// Endpoints de la API
export const API_ENDPOINTS = {
  // Autenticación
  LOGIN: `${API_BASE_URL}/api/users/login-mobile`,
  UPDATE_PROFILE: `${API_BASE_URL}/api/users/update-profile`,
  
  // Visitas
  VISITS: `${API_BASE_URL}/api/visits`,
  SAVE_VISIT: `${API_BASE_URL}/api/visits/save`,
  CANCEL_VISIT: (id) => `${API_BASE_URL}/api/visits/cancel/${id}`,
  GET_VISIT: (id) => `${API_BASE_URL}/api/visits/${id}`,
  UPDATE_VISIT_STATUS: (id) => `${API_BASE_URL}/api/visits/status/${id}`,
  UPDATE_VISIT_STATUS_WITH_EVIDENCE: (id) => `${API_BASE_URL}/api/visits/status-with-evidence/${id}`,
  
  // Usuarios
  CHECK_USERNAME: (username) => `${API_BASE_URL}/api/users/check-username?username=${username}`,
  
  // Notificaciones
  NOTIFICATIONS: `${API_BASE_URL}/api/notifications`,
  GET_NOTIFICATIONS: (userId) => `${API_BASE_URL}/api/notifications?userId=${userId}`,
  MARK_NOTIFICATION_READ: (id) => `${API_BASE_URL}/api/notifications/${id}/read`,
  MARK_ALL_READ: (userId) => `${API_BASE_URL}/api/notifications/read-all?userId=${userId}`,
  CREATE_NOTIFICATION: `${API_BASE_URL}/api/notifications`,
  GET_UNREAD_COUNT: (userId) => `${API_BASE_URL}/api/notifications/unread-count?userId=${userId}`,
};

