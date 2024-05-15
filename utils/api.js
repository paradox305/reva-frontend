// utils/api.js

import axios from 'axios';

const BASE_URL = 'https://coral-app-2q2fn.ondigitalocean.app';


const axiosInstance = axios.create({
  baseURL: 'https://coral-app-2q2fn.ondigitalocean.app',
});


// Add a request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosInstance;

export const signIn = async (username, password) => {
  try {
    const response = await axios.post(`${BASE_URL}/auth/signin`, {
      username,
      password
    });
    return response.data;
  } catch (error) {
    // Handle error
    console.error('Error signing in:', error);
    throw error;
  }
};
