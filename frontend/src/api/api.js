import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

api.interceptors.request.use((config) => {
    if (!config.skipLoader) {
        window.dispatchEvent(new Event('api-load-start'));
    }
    const token = localStorage.getItem('ekyam_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

api.interceptors.response.use(
    (response) => {
        if (response.config && !response.config.skipLoader) {
            window.dispatchEvent(new Event('api-load-end'));
        }
        return response;
    },
    (error) => {
        if (error.config && !error.config.skipLoader) {
            window.dispatchEvent(new Event('api-load-end'));
        }
        if (error.response && error.response.status === 401) {
            const url = error.config?.url || '';
            if (!url.includes('/auth/login') && !url.includes('/auth/register')) {
                localStorage.removeItem('ekyam_token');
                localStorage.removeItem('ekyam_user');
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
