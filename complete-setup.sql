-- QuantumScribe Complete Setup
-- This script creates the necessary tables and applies RLS policies for QuantumScribe

-- PART 1: CREATE TABLES
-- Create projects table
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  owner_id UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create epics table
CREATE TABLE IF NOT EXISTS public.epics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'open',
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create stories table
CREATE TABLE IF NOT EXISTS public.stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'todo',
  priority TEXT DEFAULT 'medium',
  points INTEGER,
  epic_id UUID NOT NULL REFERENCES public.epics(id) ON DELETE CASCADE,
  reporter_id UUID NOT NULL REFERENCES auth.users(id),
  assignee_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS projects_owner_id_idx ON public.projects (owner_id);
CREATE INDEX IF NOT EXISTS epics_project_id_idx ON public.epics (project_id);
CREATE INDEX IF NOT EXISTS epics_owner_id_idx ON public.epics (owner_id);
CREATE INDEX IF NOT EXISTS stories_epic_id_idx ON public.stories (epic_id);
CREATE INDEX IF NOT EXISTS stories_reporter_id_idx ON public.stories (reporter_id);
CREATE INDEX IF NOT EXISTS stories_assignee_id_idx ON public.stories (assignee_id);

-- Create trigger functions to update the updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for each table
DROP TRIGGER IF EXISTS update_projects_updated_at ON public.projects;
CREATE TRIGGER update_projects_updated_at
BEFORE UPDATE ON public.projects
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_epics_updated_at ON public.epics;
CREATE TRIGGER update_epics_updated_at
BEFORE UPDATE ON public.epics
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_stories_updated_at ON public.stories;
CREATE TRIGGER update_stories_updated_at
BEFORE UPDATE ON public.stories
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- PART 2: APPLY RLS POLICIES
-- Enable Row Level Security on all tables
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.epics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for projects table
-- Users can view their own projects
CREATE POLICY "Users can view their own projects"
  ON public.projects
  FOR SELECT
  USING (owner_id = auth.uid());

-- Users can create their own projects
CREATE POLICY "Users can create their own projects"
  ON public.projects
  FOR INSERT
  WITH CHECK (owner_id = auth.uid());

-- Users can update their own projects
CREATE POLICY "Users can update their own projects"
  ON public.projects
  FOR UPDATE
  USING (owner_id = auth.uid());

-- Users can delete their own projects
CREATE POLICY "Users can delete their own projects"
  ON public.projects
  FOR DELETE
  USING (owner_id = auth.uid());

-- Create RLS policies for epics table
-- Users can view epics in their projects
CREATE POLICY "Users can view epics in their projects"
  ON public.epics
  FOR SELECT
  USING (
    owner_id = auth.uid() OR
    project_id IN (
      SELECT id FROM public.projects
      WHERE owner_id = auth.uid()
    )
  );

-- Users can create epics in their projects
CREATE POLICY "Users can create epics in their projects"
  ON public.epics
  FOR INSERT
  WITH CHECK (
    owner_id = auth.uid() AND
    project_id IN (
      SELECT id FROM public.projects
      WHERE owner_id = auth.uid()
    )
  );

-- Users can update epics in their projects
CREATE POLICY "Users can update epics in their projects"
  ON public.epics
  FOR UPDATE
  USING (
    owner_id = auth.uid() OR
    project_id IN (
      SELECT id FROM public.projects
      WHERE owner_id = auth.uid()
    )
  );

-- Users can delete epics in their projects
CREATE POLICY "Users can delete epics in their projects"
  ON public.epics
  FOR DELETE
  USING (
    owner_id = auth.uid() OR
    project_id IN (
      SELECT id FROM public.projects
      WHERE owner_id = auth.uid()
    )
  );

-- Create RLS policies for stories table
-- Users can view stories in their epics or projects
CREATE POLICY "Users can view stories in their epics or projects"
  ON public.stories
  FOR SELECT
  USING (
    reporter_id = auth.uid() OR
    assignee_id = auth.uid() OR
    epic_id IN (
      SELECT id FROM public.epics
      WHERE owner_id = auth.uid() OR
      project_id IN (
        SELECT id FROM public.projects
        WHERE owner_id = auth.uid()
      )
    )
  );

-- Users can create stories in their epics or projects
CREATE POLICY "Users can create stories in their epics or projects"
  ON public.stories
  FOR INSERT
  WITH CHECK (
    reporter_id = auth.uid() AND
    epic_id IN (
      SELECT id FROM public.epics
      WHERE owner_id = auth.uid() OR
      project_id IN (
        SELECT id FROM public.projects
        WHERE owner_id = auth.uid()
      )
    )
  );

-- Users can update stories in their epics or projects
CREATE POLICY "Users can update stories in their epics or projects"
  ON public.stories
  FOR UPDATE
  USING (
    reporter_id = auth.uid() OR
    assignee_id = auth.uid() OR
    epic_id IN (
      SELECT id FROM public.epics
      WHERE owner_id = auth.uid() OR
      project_id IN (
        SELECT id FROM public.projects
        WHERE owner_id = auth.uid()
      )
    )
  );

-- Users can delete stories in their epics or projects
CREATE POLICY "Users can delete stories in their epics or projects"
  ON public.stories
  FOR DELETE
  USING (
    reporter_id = auth.uid() OR
    epic_id IN (
      SELECT id FROM public.epics
      WHERE owner_id = auth.uid() OR
      project_id IN (
        SELECT id FROM public.projects
        WHERE owner_id = auth.uid()
      )
    )
  );

-- Create storage bucket for project files if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('project-files', 'project-files', false)
ON CONFLICT (id) DO NOTHING;

-- Set up RLS for storage
-- Allow users to read their own files
CREATE POLICY "Users can read their own files"
  ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'project-files' AND
    (
      -- Files in user's directory
      (storage.foldername(name))[1] = auth.uid()::text
    )
  );

-- Allow users to upload their own files
CREATE POLICY "Users can upload their own files"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'project-files' AND
    (
      -- Files in user's directory
      (storage.foldername(name))[1] = auth.uid()::text
    )
  );

-- Allow users to update their own files
CREATE POLICY "Users can update their own files"
  ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'project-files' AND
    (
      -- Files in user's directory
      (storage.foldername(name))[1] = auth.uid()::text
    )
  );

-- Allow users to delete their own files
CREATE POLICY "Users can delete their own files"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'project-files' AND
    (
      -- Files in user's directory
      (storage.foldername(name))[1] = auth.uid()::text
    )
  ); 