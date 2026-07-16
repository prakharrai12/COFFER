const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class ApiClient {
  constructor() {
    this.accessToken = localStorage.getItem('coffer_access_token') || null;
  }

  setAccessToken(token) {
    this.accessToken = token;
    if (token) {
      localStorage.setItem('coffer_access_token', token);
    } else {
      localStorage.removeItem('coffer_access_token');
    }
  }

  getAccessToken() {
    return this.accessToken;
  }

  async request(endpoint, options = {}) {
    const url = `${BASE_URL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    };

    if (this.accessToken) {
      headers.Authorization = `Bearer ${this.accessToken}`;
    }

    const config = {
      ...options,
      headers,
      credentials: 'include', // send httpOnly refresh cookie
    };

    let response = await fetch(url, config);

    // If unauthorized or token expired, attempt auto-refresh exactly once
    if (response.status === 401 && !options._retry && endpoint !== '/auth/login' && endpoint !== '/auth/register' && endpoint !== '/auth/refresh') {
      options._retry = true;
      try {
        const refreshResponse = await fetch(`${BASE_URL}/auth/refresh`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
        });

        if (refreshResponse.ok) {
          const data = await refreshResponse.json();
          this.setAccessToken(data.accessToken);
          // Retry original request with new token
          headers.Authorization = `Bearer ${data.accessToken}`;
          response = await fetch(url, { ...config, headers });
        } else {
          this.setAccessToken(null);
          // Dispatch global auth logout event if refresh fails
          window.dispatchEvent(new CustomEvent('coffer:unauthorized'));
        }
      } catch (err) {
        this.setAccessToken(null);
        window.dispatchEvent(new CustomEvent('coffer:unauthorized'));
      }
    }

    // Parse response
    const contentType = response.headers.get('content-type');
    const data = contentType && contentType.includes('application/json') ? await response.json() : await response.text();

    if (!response.ok) {
      const error = new Error(data?.error || data?.message || 'API request failed');
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  }

  get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'GET' });
  }

  post(endpoint, body, options = {}) {
    return this.request(endpoint, { ...options, method: 'POST', body: JSON.stringify(body) });
  }

  put(endpoint, body, options = {}) {
    return this.request(endpoint, { ...options, method: 'PUT', body: JSON.stringify(body) });
  }

  delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'DELETE' });
  }
}

const api = new ApiClient();
export default api;
