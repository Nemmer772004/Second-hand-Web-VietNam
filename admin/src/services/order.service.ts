import apiClient from './api-client';

export interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
}

export interface Order {
  _id: string;
  userId: string;
  items: OrderItem[];
  totalAmount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  createdAt: string;
  updatedAt: string;
}

export const OrderService = {
  async getAll() {
    const response = await apiClient.get<Order[]>('/orders');
    return response.data;
  },

  async getById(id: string) {
    const response = await apiClient.get<Order>(`/orders/${id}`);
    return response.data;
  },

  async updateStatus(id: string, status: Order['status']) {
    const response = await apiClient.patch<Order>(`/orders/${id}/status`, { status });
    return response.data;
  },

  async delete(id: string) {
    await apiClient.delete(`/orders/${id}`);
  },

  async getOrderStats() {
    const response = await apiClient.get('/orders/stats');
    return response.data;
  },

  async getTotalStats() {
    const response = await apiClient.get<{ total: number; totalRevenue: number }>('/orders/total-stats');
    return response.data;
  }
};
