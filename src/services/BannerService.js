import axios from 'axios';

const API = axios.create({
  baseURL: 'https://my-project-backend-ee4t.onrender.com/api',
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Get all banners
export const getBanner = async () => {
  const res = await API.get('/ads/get');
  return res.data;
};

// Create or update banners (ADMIN ONLY)
export const createBanner = async (payload) => {
  const res = await API.post('/ads/create-or-update', payload);
  return res.data;
};
