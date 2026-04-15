import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:8000/api',
});
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Get all categories
export const getBanner = async () => {
  const res = await API.get('/ads/get');
  return res.data;
};

// Create category (ADMIN ONLY)
export const createBanner = async (payload) => {
  const res = await API.post('/ads/create-or-update', payload);
  return res.data;
};
