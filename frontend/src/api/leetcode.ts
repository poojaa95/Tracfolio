import apiClient from './axios';
import { LeetCodeStats } from '@/types';

export const leetcodeApi = {
  getStats: async (): Promise<LeetCodeStats | { message: string }> => {
    const response = await apiClient.get('/api/leetcode');
    return response.data;
  },

  syncStats: async (username: string): Promise<LeetCodeStats> => {
    const response = await apiClient.put<LeetCodeStats>(
      `/api/leetcode?username=${username}`
    );
    return response.data;
  },
};