-- Complete Setup Final Script
-- This script adds the missing storage RLS policies and recommended indexes

-- 1. Add Storage RLS Policies
-- Enable RLS on storage.objects table if not already enabled
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for storage
-- Note: We cast auth.uid() to text to match the owner column type
CREATE POLICY "Users can read their own files" ON storage.objects
  FOR SELECT USING (auth.uid()::text = owner);

CREATE POLICY "Users can upload their own files" ON storage.objects
  FOR INSERT WITH CHECK (auth.uid()::text = owner);

CREATE POLICY "Users can update their own files" ON storage.objects
  FOR UPDATE USING (auth.uid()::text = owner);

CREATE POLICY "Users can delete their own files" ON storage.objects
  FOR DELETE USING (auth.uid()::text = owner);

-- 2. Add Recommended Indexes
-- Projects table indexes
CREATE INDEX IF NOT EXISTS idx_projects_owner_id ON public.projects (owner_id);

-- Epics table indexes
CREATE INDEX IF NOT EXISTS idx_epics_project_id ON public.epics (project_id);
CREATE INDEX IF NOT EXISTS idx_epics_owner_id ON public.epics (owner_id);

-- Stories table indexes
CREATE INDEX IF NOT EXISTS idx_stories_epic_id ON public.stories (epic_id);
CREATE INDEX IF NOT EXISTS idx_stories_assignee_id ON public.stories (assignee_id);
CREATE INDEX IF NOT EXISTS idx_stories_reporter_id ON public.stories (reporter_id);

-- Verify the changes
SELECT 
  'Storage RLS Policies' as check_type,
  COUNT(*) as count
FROM pg_policies
WHERE schemaname = 'storage' AND tablename = 'objects';

SELECT 
  'Database Indexes' as check_type,
  COUNT(*) as count
FROM pg_indexes
WHERE schemaname = 'public' AND 
  indexname IN (
    'idx_projects_owner_id',
    'idx_epics_project_id',
    'idx_epics_owner_id',
    'idx_stories_epic_id',
    'idx_stories_assignee_id',
    'idx_stories_reporter_id'
  ); 