-- Indexes Only
-- This script only adds the recommended indexes

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
  indexname,
  tablename,
  indexdef
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