import apiClient from './axios';
import { InterviewQuestion, InterviewQuestionsResponse } from '@/types';

export const questionsApi = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
  }): Promise<InterviewQuestionsResponse> => {
    const response = await apiClient.get<InterviewQuestionsResponse>(
      '/api/interview-questions',
      { params }
    );
    return response.data;
  },

  search: async (params: {
    topic?: string;
    company?: string;
  }): Promise<InterviewQuestion[]> => {
    const response = await apiClient.get<InterviewQuestion[]>(
      '/api/interview-questions/search',
      { params }
    );
    return response.data;
  },

  create: async (data: {
    company: string;
    role: string;
    round: string;
    topic: string;
    question: string;
    notes?: string;
  }): Promise<InterviewQuestion> => {
    const response = await apiClient.post<InterviewQuestion>(
      '/api/interview-questions',
      data
    );
    return response.data;
  },

  update: async (
    id: string,
    data: Partial<{
      company: string;
      role: string;
      round: string;
      topic: string;
      question: string;
      notes: string;
    }>
  ): Promise<{ message: string }> => {
    const response = await apiClient.put<{ message: string }>(
      `/api/interview-questions/${id}`,
      data
    );
    return response.data;
  },

  delete: async (id: string): Promise<{ message: string }> => {
    const response = await apiClient.delete<{ message: string }>(
      `/api/interview-questions/${id}`
    );
    return response.data;
  },
};