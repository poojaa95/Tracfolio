import apiClient from './axios';
import { Analytics } from '@/types';

export const analyticsApi = {
  get: async (): Promise<Analytics> => {
    const response = await apiClient.get<Analytics>('/api/analytics');
    return response.data;
  },
};