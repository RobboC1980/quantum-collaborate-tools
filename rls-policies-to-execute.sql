-- QuantumScribe RLS Policies
-- Execute these statements in the Supabase SQL Editor

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