import apiClient from './axios';
import { Application, ApplicationsResponse } from '@/types';

export const applicationsApi = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    source?: string;
  }): Promise<ApplicationsResponse> => {
    const response = await apiClient.get<ApplicationsResponse>('/api/applications', { params });
    return response.data;
  },

  getById: async (id: string): Promise<Application> => {
    const response = await apiClient.get<Application>(`/api/applications/${id}`);
    return response.data;
  },

  create: async (data: {
    company: string;
    role: string;
    source: string;
    status?: string;
    resume_id?: string;
  }): Promise<Application> => {
    const response = await apiClient.post<Application>('/api/applications', data);
    return response.data;
  },

  update: async (id: string, data: {
    status?: string;
    resume_id?: string;
  }): Promise<{ message: string }> => {
    const response = await apiClient.put<{ message: string }>(`/api/applications/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<{ message: string }> => {
    const response = await apiClient.delete<{ message: string }>(`/api/applications/${id}`);
    return response.data;
  },
};