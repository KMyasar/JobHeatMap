/*
  # Initial Schema for Job Prep Heatmap Application

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key) - matches auth.users id
      - `email` (text, unique, not null)
      - `full_name` (text, nullable)
      - `skills` (text array, default empty array)
      - `preferred_locations` (text array, default empty array)
      - `resume_url` (text, nullable)
      - `certifications` (text array, default empty array)
      - `achievements` (text, nullable)
      - `created_at` (timestamptz, default now)
      - `updated_at` (timestamptz, default now)

    - `job_analyses`
      - `id` (uuid, primary key, default gen_random_uuid())
      - `user_id` (uuid, foreign key to profiles.id)
      - `job_description` (text, not null)
      - `ats_score` (integer, not null)
      - `matched_skills` (text array, default empty array)
      - `missing_skills` (text array, default empty array)
      - `created_at` (timestamptz, default now)

    - `resume_analyses`
      - `id` (uuid, primary key, default gen_random_uuid())
      - `user_id` (uuid, foreign key to profiles.id)
      - `resume_url` (text, not null)
      - `job_description` (text, not null)
      - `ats_score` (integer, not null)
      - `spelling_errors` (text array, default empty array)
      - `improvement_suggestions` (text array, default empty array)
      - `created_at` (timestamptz, default now)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Add policies for reading/writing user-specific data

  3. Indexes
    - Add indexes for frequently queried columns
    - Add composite indexes for user-specific queries
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text,
  skills text[] DEFAULT '{}',
  preferred_locations text[] DEFAULT '{}',
  resume_url text,
  certifications text[] DEFAULT '{}',
  achievements text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create job_analyses table
CREATE TABLE IF NOT EXISTS job_analyses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  job_description text NOT NULL,
  ats_score integer NOT NULL CHECK (ats_score >= 0 AND ats_score <= 100),
  matched_skills text[] DEFAULT '{}',
  missing_skills text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Create resume_analyses table
CREATE TABLE IF NOT EXISTS resume_analyses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  resume_url text NOT NULL,
  job_description text NOT NULL,
  ats_score integer NOT NULL CHECK (ats_score >= 0 AND ats_score <= 100),
  spelling_errors text[] DEFAULT '{}',
  improvement_suggestions text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE resume_analyses ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles table
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can delete own profile"
  ON profiles
  FOR DELETE
  TO authenticated
  USING (auth.uid() = id);

-- Create policies for job_analyses table
CREATE POLICY "Users can read own job analyses"
  ON job_analyses
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own job analyses"
  ON job_analyses
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own job analyses"
  ON job_analyses
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own job analyses"
  ON job_analyses
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policies for resume_analyses table
CREATE POLICY "Users can read own resume analyses"
  ON resume_analyses
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own resume analyses"
  ON resume_analyses
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own resume analyses"
  ON resume_analyses
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own resume analyses"
  ON resume_analyses
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS profiles_email_idx ON profiles(email);
CREATE INDEX IF NOT EXISTS profiles_updated_at_idx ON profiles(updated_at);

CREATE INDEX IF NOT EXISTS job_analyses_user_id_idx ON job_analyses(user_id);
CREATE INDEX IF NOT EXISTS job_analyses_created_at_idx ON job_analyses(created_at);
CREATE INDEX IF NOT EXISTS job_analyses_user_created_idx ON job_analyses(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS resume_analyses_user_id_idx ON resume_analyses(user_id);
CREATE INDEX IF NOT EXISTS resume_analyses_created_at_idx ON resume_analyses(created_at);
CREATE INDEX IF NOT EXISTS resume_analyses_user_created_idx ON resume_analyses(user_id, created_at DESC);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at for profiles
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();