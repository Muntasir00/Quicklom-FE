/**
 * Centralized API Configuration
 * Use this across all components, hooks, and services
 */

// Get API base URL from environment variable or default to localhost
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// Export for different use cases
export const getApiUrl = (path = '') => {
  const baseUrl = API_BASE_URL.replace(/\/$/, ''); // Remove trailing slash
  const cleanPath = path.replace(/^\//, ''); // Remove leading slash
  return cleanPath ? `${baseUrl}/${cleanPath}` : baseUrl;
};

// For file/image URLs (without /api/)
export const getFileUrl = (path) => {
  if (!path) return '';
  const baseUrl = API_BASE_URL.replace(/\/$/, '');
  const cleanPath = path.replace(/^\//, '');
  return `${baseUrl}/${cleanPath}`;
};

export default API_BASE_URL;
