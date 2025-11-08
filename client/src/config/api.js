// API configuration
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

// Helper function to build API URLs
export const buildApiUrl = (endpoint) => {
  return `${API_BASE_URL}${endpoint}`;
};

export default {
  API_BASE_URL,
  buildApiUrl
};