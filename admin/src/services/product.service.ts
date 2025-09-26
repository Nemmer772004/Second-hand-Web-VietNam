import apiClient from './api-client';

export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
  stock: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductDto {
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
  stock: number;
}

export const ProductService = {
  async getAll() {
    try {
      const response = await apiClient.get<Product[]>('/products');
      return response.data;
    } catch (error: any) {
      console.error('Failed to fetch products:', error.message);
      throw error;
    }
  },

  async getById(id: string) {
    const response = await apiClient.get<Product>(`/products/${id}`);
    return response.data;
  },

  async create(product: CreateProductDto) {
    try {
      // Validate product data before sending
      if (!product.name || !product.price || !product.category) {
        throw new Error('Name, price, and category are required');
      }

      const config = {
        timeout: 10000, // 10 second timeout
        headers: {
          'Content-Type': 'application/json'
        }
      };

      const response = await apiClient.post<Product>('/products', product, config);
      return response.data;
    } catch (error: any) {
      console.error('Failed to create product:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        config: error.config
      });
      throw error;
    }
  },

  async update(id: string, product: Partial<CreateProductDto>) {
    const response = await apiClient.put<Product>(`/products/${id}`, product);
    return response.data;
  },

  async delete(id: string) {
    await apiClient.delete(`/products/${id}`);
  },

  async updateStock(id: string, stock: number) {
    const response = await apiClient.patch<Product>(`/products/${id}/stock`, { stock });
    return response.data;
  }
};
