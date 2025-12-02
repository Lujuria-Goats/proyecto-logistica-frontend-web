/**
 * API client para autenticación
 * Maneja comunicación con el backend en /api/Auth
 */

const API_BASE_URL = "http://localhost:5132/api";

/**
 * Registra un nuevo usuario
 * @param {Object} registerData - Datos del usuario { fullName, email, password, phoneNumber, role }
 * @returns {Promise<Object>} Respuesta del servidor
 * @throws {Error} Si hay error de conexión o validación
 */
export async function registerUser(registerData) {
  try {
    const response = await fetch(`${API_BASE_URL}/Auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(registerData)
    });

    const data = await response.json();

    if (!response.ok) {
      const errorMessage = data.message || data.errors || "Error desconocido al registrar";
      throw new Error(errorMessage);
    }

    return data;
  } catch (error) {
    console.error("Registration error:", error);
    throw error;
  }
}

/**
 * Inicia sesión con email y contraseña
 * @param {Object} loginData - { email, password }
 * @returns {Promise<Object>} Respuesta con token JWT
 * @throws {Error} Si hay error de autenticación
 */
export async function loginUser(loginData) {
  try {
    const response = await fetch(`${API_BASE_URL}/Auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(loginData)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Credenciales inválidas");
    }

    return data;
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
}

/**
 * Almacena token JWT en localStorage
 * @param {string} token - Token JWT
 */
export function saveToken(token) {
  localStorage.setItem("authToken", token);
}

/**
 * Obtiene token JWT del localStorage
 * @returns {string|null} Token o null si no existe
 */
export function getToken() {
  return localStorage.getItem("authToken");
}

/**
 * Elimina token JWT del localStorage (logout)
 */
export function clearToken() {
  localStorage.removeItem("authToken");
}

/**
 * Verifica si el usuario está autenticado
 * @returns {boolean}
 */
export function isAuthenticated() {
  return !!getToken();
}

