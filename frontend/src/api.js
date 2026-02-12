import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Create axios instance
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor for token refresh
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = localStorage.getItem('refresh_token');
                const response = await axios.post(`${API_BASE_URL}/auth/refresh/`, {
                    refresh: refreshToken,
                });

                const { access } = response.data;
                localStorage.setItem('access_token', access);

                originalRequest.headers.Authorization = `Bearer ${access}`;
                return api(originalRequest);
            } catch (refreshError) {
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

// AI Assistant API functions
export const aiAPI = {
    getPriceRecommendation: (listingData, provider = null) => {
        const url = provider ? `/ai/price-recommendation/?provider=${provider}` : '/ai/price-recommendation/';
        return api.post(url, listingData);
    },
    analyzeBid: (bidId, provider = null) => {
        const url = provider ? `/ai/analyze-bid/${bidId}/?provider=${provider}` : `/ai/analyze-bid/${bidId}/`;
        return api.post(url);
    },
    getMarketInsights: (cropVariety, state = '', provider = null) => {
        const params = new URLSearchParams({ crop_variety: cropVariety });
        if (state) params.append('state', state);
        if (provider) params.append('provider', provider);
        return api.get(`/ai/market-insights/?${params}`);
    },
    getNegotiationTips: (listingId, provider = null) => {
        const url = provider ? `/ai/negotiation-tips/${listingId}/?provider=${provider}` : `/ai/negotiation-tips/${listingId}/`;
        return api.get(url);
    }
};

export default api;
