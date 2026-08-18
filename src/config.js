import axios from 'axios';

// Global backend URL configured from environment variable or default
export const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000/api';

// Set global default baseURL for all Axios requests
axios.defaults.baseURL = BACKEND_URL;

// Add request interceptor to automatically attach authentication headers
axios.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
            config.headers['x-auth-token'] = token;
            config.headers['token'] = token;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Add response interceptor to automatically handle invalid/expired tokens
axios.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            // Delete token and redirect to login
            if (localStorage.getItem('token')) {
                localStorage.removeItem('token');
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default BACKEND_URL;
