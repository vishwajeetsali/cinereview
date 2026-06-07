import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: true,
});

api.interceptors.request.use(
    (config) => {
        const token = window.accessToken;
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url.includes('/auth/refresh')) {
            originalRequest._retry = true;

            try {
                const res = await api.post("/api/auth/refresh");
                window.accessToken = res.data.accessToken;
                originalRequest.headers.Authorization = `Bearer ${window.accessToken}`;
                return api(originalRequest);
            } catch (_) {
                window.accessToken = null;
                return Promise.reject(error);
            }
        }

        return Promise.reject(error);
    }
);

export default api;