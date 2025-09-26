import axios from 'axios';

const API_URL = 'http://localhost:3000/api'; // URL của API gateway

export const productService = {
  getProducts: async () => {
    const response = await axios.get(`${API_URL}/products`);
    return response.data;
  },

  getProduct: async (id: string) => {
    const response = await axios.get(`${API_URL}/products/${id}`);
    return response.data;
  },

  createProduct: async (data: any) => {
    const response = await axios.post(`${API_URL}/products`, data);
    return response.data;
  },

  updateProduct: async (id: string, data: any) => {
    const response = await axios.put(`${API_URL}/products/${id}`, data);
    return response.data;
  },

  deleteProduct: async (id: string) => {
    const response = await axios.delete(`${API_URL}/products/${id}`);
    return response.data;
  }
};
