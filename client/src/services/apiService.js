// API service với tự động refresh token
import authService from './authService';
import { buildApiUrl } from '../config/api';

class ApiService {
  constructor() {
    this.baseURL = buildApiUrl('/api');
  }

  // Tạo headers với authentication
  getAuthHeaders() {
    return authService.getAuthHeaders();
  }

  // GET request với tự động refresh token
  async get(endpoint) {
    const url = `${this.baseURL}${endpoint}`;
    const options = {
      method: 'GET',
      headers: this.getAuthHeaders()
    };

    const response = await authService.authenticatedFetch(url, options);
    return response.json();
  }

  // POST request với tự động refresh token
  async post(endpoint, data) {
    const url = `${this.baseURL}${endpoint}`;
    const options = {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data)
    };

    const response = await authService.authenticatedFetch(url, options);
    return response.json();
  }

  // PUT request với tự động refresh token
  async put(endpoint, data) {
    const url = `${this.baseURL}${endpoint}`;
    const options = {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data)
    };

    const response = await authService.authenticatedFetch(url, options);
    return response.json();
  }

  // DELETE request với tự động refresh token
  async delete(endpoint) {
    const url = `${this.baseURL}${endpoint}`;
    const options = {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    };

    const response = await authService.authenticatedFetch(url, options);
    return response.json();
  }

  // Form data request (cho upload file)
  async postForm(endpoint, formData) {
    const url = `${this.baseURL}${endpoint}`;
    const headers = authService.getAuthHeaders();
    delete headers['Content-Type']; // Để browser tự động set boundary

    const options = {
      method: 'POST',
      headers: headers,
      body: formData
    };

    const response = await authService.authenticatedFetch(url, options);
    return response.json();
  }
}

export default new ApiService();