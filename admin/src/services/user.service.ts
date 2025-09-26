import apiClient from './api-client';

export interface User {
  _id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserDto {
  email: string;
  password: string;
  name: string;
  role: 'user' | 'admin';
}

export const UserService = {
  async getAll() {
    const response = await apiClient.get<User[]>('/users');
    return response.data;
  },

  async getById(id: string) {
    const response = await apiClient.get<User>(`/users/${id}`);
    return response.data;
  },

  async create(user: CreateUserDto) {
    const response = await apiClient.post<User>('/users', user);
    return response.data;
  },

  async update(id: string, user: Partial<CreateUserDto>) {
    const response = await apiClient.put<User>(`/users/${id}`, user);
    return response.data;
  },

  async delete(id: string) {
    await apiClient.delete(`/users/${id}`);
  },

  async getUserStats() {
    const response = await apiClient.get('/users/stats');
    return response.data;
  },

  async getTotalStats() {
    const response = await apiClient.get<{ total: number }>('/users/total-stats');
    return response.data;
  }
};
