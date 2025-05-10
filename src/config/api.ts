export const API_BASE_URL = process.env.REACT_APP_SERVER_URL || 'https://reva-backend-production-016a.up.railway.app';

export const API_ENDPOINTS = {
    MENU: `${API_BASE_URL}/menu`,
    ORDERS: `${API_BASE_URL}/orders`,
    TABLES: `${API_BASE_URL}/tables`,
    ANALYTICS: `${API_BASE_URL}/analytics`,
} as const; 