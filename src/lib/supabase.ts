import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          skills: string[];
          preferred_locations: string[];
          resume_url: string | null;
          certifications: string[];
          achievements: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          skills?: string[];
          preferred_locations?: string[];
          resume_url?: string | null;
          certifications?: string[];
          achievements?: string | null;
        };
        Update: {
          full_name?: string | null;
          skills?: string[];
          preferred_locations?: string[];
          resume_url?: string | null;
          certifications?: string[];
          achievements?: string | null;
          updated_at?: string;
        };
      };
      job_analyses: {
        Row: {
          id: string;
          user_id: string;
          job_description: string;
          ats_score: number;
          matched_skills: string[];
          missing_skills: string[];
          created_at: string;
        };
        Insert: {
          user_id: string;
          job_description: string;
          ats_score: number;
          matched_skills: string[];
          missing_skills: string[];
        };
        Update: {
          ats_score?: number;
          matched_skills?: string[];
          missing_skills?: string[];
        };
      };
      resume_analyses: {
        Row: {
          id: string;
          user_id: string;
          resume_url: string;
          job_description: string;
          ats_score: number;
          spelling_errors: string[];
          improvement_suggestions: string[];
          created_at: string;
        };
        Insert: {
          user_id: string;
          resume_url: string;
          job_description: string;
          ats_score: number;
          spelling_errors: string[];
          improvement_suggestions: string[];
        };
        Update: {
          ats_score?: number;
          spelling_errors?: string[];
          improvement_suggestions?: string[];
        };
      };
    };
  };
};