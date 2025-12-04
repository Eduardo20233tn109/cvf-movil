import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../config/api';

/**
 * Obtiene el token de autenticación desde AsyncStorage
 */
const getToken = async () => {
  try {
    const token = await AsyncStorage.getItem('token');
    return token;
  } catch (error) {
    console.error('Error al obtener token:', error);
    return null;
  }
};

/**
 * Obtiene los headers con autenticación
 */
const getAuthHeaders = async (additionalHeaders = {}) => {
  const token = await getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...additionalHeaders,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
};

/**
 * Maneja errores de autenticación (401)
 */
const handleAuthError = async (response, navigation) => {
  if (response.status === 401) {
    let data = {};
    try {
      const text = await response.text();
      data = text ? JSON.parse(text) : {};
    } catch (e) {
      // Si no se puede parsear, usar objeto vacío
    }
    
    // Si el token expiró o es inválido, limpiar y redirigir al login
    const message = data.message || '';
    if (message.includes('expirado') || message.includes('Token') || message.includes('token') || message.includes('No autorizado')) {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
      
      // Importar dinámicamente para evitar dependencias circulares
      if (navigation) {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        });
      } else {
        // Si no hay navigation, al menos limpiar el storage
        console.warn('⚠️ Token expirado. Por favor, inicia sesión nuevamente.');
      }
      
      throw new Error('Token expirado. Por favor, inicia sesión nuevamente.');
    }
  }
  
  return response;
};

/**
 * Realiza una petición fetch con autenticación
 */
export const apiRequest = async (url, options = {}, navigation = null) => {
  try {
    const headers = await getAuthHeaders(options.headers);
    
    const config = {
      ...options,
      headers,
    };

    const response = await fetch(url, config);
    
    // Manejar errores de autenticación
    await handleAuthError(response, navigation);
    
    return response;
  } catch (error) {
    console.error('Error en apiRequest:', error);
    throw error;
  }
};

/**
 * Realiza una petición GET con autenticación
 */
export const apiGet = async (url, navigation = null) => {
  return apiRequest(url, { method: 'GET' }, navigation);
};

/**
 * Realiza una petición POST con autenticación
 */
export const apiPost = async (url, body, navigation = null, additionalHeaders = {}) => {
  return apiRequest(
    url,
    {
      method: 'POST',
      body: JSON.stringify(body),
      headers: additionalHeaders,
    },
    navigation
  );
};

/**
 * Realiza una petición PUT con autenticación
 */
export const apiPut = async (url, body, navigation = null, additionalHeaders = {}) => {
  return apiRequest(
    url,
    {
      method: 'PUT',
      body: JSON.stringify(body),
      headers: additionalHeaders,
    },
    navigation
  );
};

/**
 * Realiza una petición DELETE con autenticación
 */
export const apiDelete = async (url, navigation = null) => {
  return apiRequest(url, { method: 'DELETE' }, navigation);
};

/**
 * Realiza una petición con FormData (para archivos)
 * NOTA: No se establece Content-Type para FormData, el navegador lo hace automáticamente
 */
export const apiPostFormData = async (url, formData, navigation = null) => {
  try {
    const token = await getToken();
    const headers = {};

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: formData,
    });

    await handleAuthError(response, navigation);
    
    return response;
  } catch (error) {
    console.error('Error en apiPostFormData:', error);
    throw error;
  }
};

/**
 * Realiza una petición PUT con FormData (para archivos)
 * NOTA: No se establece Content-Type para FormData, el navegador lo hace automáticamente
 */
export const apiPutFormData = async (url, formData, navigation = null) => {
  try {
    const token = await getToken();
    const headers = {};

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      method: 'PUT',
      headers,
      body: formData,
    });

    await handleAuthError(response, navigation);
    
    return response;
  } catch (error) {
    console.error('Error en apiPutFormData:', error);
    throw error;
  }
};

