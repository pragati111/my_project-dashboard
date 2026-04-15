// src/services/ProductService.js
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

// ─────────────────────────────────────────────────────────────────────────────
// PRODUCT CRUD OPERATIONS
// ─────────────────────────────────────────────────────────────────────────────

// Get all products with filters
export const getProduct = async (filters = {}) => {
  const queryParams = new URLSearchParams(filters).toString();
  const url = queryParams ? `/product?${queryParams}` : '/product';
  const res = await API.get(url);
  return res.data;
};

// Get product by ID
export const getProductById = async (id) => {
  const res = await API.get(`/product/${id}`);
  return res.data;
};

// Create product (ADMIN ONLY)
export const createProduct = async (payload) => {
  const res = await API.post('/product/create', payload);
  return res.data;
};

// Update product (ADMIN ONLY)
export const updateProduct = async (id, payload) => {
  const res = await API.put(`/product/${id}`, payload);
  return res.data;
};

// Delete product (ADMIN ONLY)
export const deleteProduct = async (id) => {
  const res = await API.delete(`/product/${id}`);
  return res.data;
};

// ─────────────────────────────────────────────────────────────────────────────
// FILTERED PRODUCT ENDPOINTS
// ─────────────────────────────────────────────────────────────────────────────

// Get products by category
export const getProductsByCategory = async (categoryId) => {
  const res = await API.get(`/product/category/${categoryId}`);
  return res.data;
};

// Get products by subcategory
export const getProductsBySubCategory = async (subCategoryId) => {
  const res = await API.get(`/product/subcategory/${subCategoryId}`);
  return res.data;
};

// Get products by multiple subcategories (query param)
export const getProductsBySubCategories = async (subCategoryIds) => {
  const ids = Array.isArray(subCategoryIds) ? subCategoryIds.join(',') : subCategoryIds;
  const res = await API.get(`/product/subcategories?subCategories=${ids}`);
  return res.data;
};

// Get popular products
export const getPopularProducts = async () => {
  const res = await API.get('/product/popular/all');
  return res.data;
};

// ─────────────────────────────────────────────────────────────────────────────
// PRODUCT UTILITIES
// ─────────────────────────────────────────────────────────────────────────────

// Compute price with customizations
export const computePrice = async (productId, selectedOptions) => {
  const res = await API.post(`/product/${productId}/compute-price`, selectedOptions);
  return res.data;
};

// Toggle product active status
export const toggleProductStatus = async (productId) => {
  const res = await API.patch(`/product/${productId}/toggle-status`);
  return res.data;
};

// ─────────────────────────────────────────────────────────────────────────────
// BULK OPERATIONS (Optional - if needed)
// ─────────────────────────────────────────────────────────────────────────────

// Bulk update products status
export const bulkUpdateProductStatus = async (productIds, active) => {
  const res = await API.patch('/product/bulk/status', { productIds, active });
  return res.data;
};

// Bulk delete products
export const bulkDeleteProducts = async (productIds) => {
  const res = await API.delete('/product/bulk', { data: { productIds } });
  return res.data;
};

// ─────────────────────────────────────────────────────────────────────────────
// EXPORT ALL FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────────
export default {
  getProduct,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductsByCategory,
  getProductsBySubCategory,
  getProductsBySubCategories,
  getPopularProducts,
  computePrice,
  toggleProductStatus,
  bulkUpdateProductStatus,
  bulkDeleteProducts,
};
