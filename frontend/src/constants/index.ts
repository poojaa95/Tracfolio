export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const ROUTES = {
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  APPLICATIONS: '/dashboard/applications',
  RESUMES: '/dashboard/resumes',
  QUESTIONS: '/dashboard/questions',
  LEETCODE: '/dashboard/leetcode',
  ANALYTICS: '/dashboard/analytics',
} as const;

export const APPLICATION_SOURCES = [
  'LinkedIn',
  'Indeed',
  'Naukri',
  'Internshala',
  'Unstop',
  'Other',
] as const;

export const APPLICATION_STATUSES = [
  'Applied',
  'OA Received',
  'OA Completed',
  'Interview',
  'Offer',
  'Rejected',
  'Withdrawn',
] as const;