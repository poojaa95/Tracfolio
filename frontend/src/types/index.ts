export interface User {
  _id: string;
  name: string;
  email: string;
  profile_picture?: string;
  auth_provider: 'google' | 'local';
  settings: {
    theme: string;
    notifications: boolean;
    default_resume_id: string | null;
  };
  created_at: string;
  last_login: string;
  is_active: boolean;
}

export interface Application {
  _id: string;
  user_id: string;
  company: string;
  role: string;
  source: string;
  status: string;
  resume_id?: string | null;
  applied_at: string;
  updated_at: string;
}

export interface ApplicationsResponse {
  total: number;
  page: number;
  limit: number;
  data: Application[];
}

export interface ResumeVersion {
  _id: string;
  user_id: string;
  version: number;
  file_url: string;
  name?: string;
  notes?: string;
  uploaded_at: string;
 }

export interface InterviewQuestion {
  _id: string;
  user_id: string;
  company: string;
  role: string;
  round: string;
  topic: string;
  question: string;
  notes?: string;
  created_at: string;
}

export interface InterviewQuestionsResponse {
  total: number;
  page: number;
  limit: number;
  data: InterviewQuestion[];
}

export interface LeetCodeStats {
  _id?: string;
  user_id?: string;
  username: string;
  total_solved: number;
  easy: number;
  medium: number;
  hard: number;
  updated_at?: string;
}

export interface AnalyticsSummary {
  total_applications: number;
  total_interviews: number;
  total_offers: number;
  total_rejected: number;
  interview_rate: number;
  offer_rate: number;
}

export interface Analytics {
  summary: AnalyticsSummary;
  applications_by_source: Record<string, number>;
  applications_by_status: Record<string, number>;
  applications_by_month: { month: string; count: number }[];
  resume_performance: {
    resume_id: string;
    total_applications: number;
    interviews: number;
    offers: number;
    interview_rate: number;
  }[];
  top_interview_topics: { topic: string; count: number }[];
  most_repeated_questions: { question: string; count: number }[];
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user?: {
    id: string;
    name: string;
    email: string;
    auth_provider: string;
  };
}