import apiClient from './axios';
import { ResumeVersion } from '@/types';
import { tokenStorage } from '@/utils/token';

export const resumesApi = {
  getAll: async (): Promise<ResumeVersion[]> => {
    const response = await apiClient.get<ResumeVersion[]>('/api/resumes');
    return response.data;
  },

  upload: async (file: File, name?: string, notes?: string): Promise<ResumeVersion> => {
  const formData = new FormData();
  formData.append('file', file);
  if (name) formData.append('name', name);
  if (notes) formData.append('notes', notes);
  const response = await apiClient.post<ResumeVersion>('/api/resumes', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
 },

  download: async (resumeId: string, version: number): Promise<void> => {
    const token = tokenStorage.get();
    const response = await fetch(
      `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/resumes/${resumeId}/download`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `resume_v${version}.pdf`;
    a.click();
    window.URL.revokeObjectURL(url);
  },

  delete: async (resumeId: string): Promise<{ message: string }> => {
    const response = await apiClient.delete<{ message: string }>(`/api/resumes/${resumeId}`);
    return response.data;
  },
};