-- Create roles table
CREATE TABLE public.roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  is_default BOOLEAN DEFAULT FALSE,
  is_system BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create table comment for roles
COMMENT ON TABLE public.roles IS 'Stores user roles for the application';

-- Create permissions table
CREATE TABLE public.permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  category TEXT NOT NULL,
  action TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_category_action UNIQUE (category, action)
);

-- Create table comment for permissions
COMMENT ON TABLE public.permissions IS 'Stores permission definitions for the application';

-- Create role_permissions junction table
CREATE TABLE public.role_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id UUID NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
  permission_id UUID NOT NULL REFERENCES public.permissions(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_role_permission UNIQUE (role_id, permission_id)
);

-- Create table comment for role_permissions
COMMENT ON TABLE public.role_permissions IS 'Junction table linking roles to permissions';

-- Create user_roles junction table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_user_role UNIQUE (user_id, role_id)
);

-- Create table comment for user_roles
COMMENT ON TABLE public.user_roles IS 'Junction table linking users to roles';

-- Create projects table if not exists
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL,
  priority TEXT NOT NULL,
  progress INTEGER NOT NULL DEFAULT 0,
  start_date TIMESTAMP WITH TIME ZONE,
  target_date TIMESTAMP WITH TIME ZONE,
  completed_date TIMESTAMP WITH TIME ZONE,
  owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create table comment for projects
COMMENT ON TABLE public.projects IS 'Stores project information';

-- Create project_tags junction table if not exists
CREATE TABLE IF NOT EXISTS public.project_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  tag TEXT NOT NULL,
  CONSTRAINT unique_project_tag UNIQUE (project_id, tag)
);

-- Create epics table if not exists
CREATE TABLE IF NOT EXISTS public.epics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL,
  priority TEXT NOT NULL,
  progress INTEGER NOT NULL DEFAULT 0,
  start_date TIMESTAMP WITH TIME ZONE,
  target_date TIMESTAMP WITH TIME ZONE,
  completed_date TIMESTAMP WITH TIME ZONE,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create table comment for epics
COMMENT ON TABLE public.epics IS 'Stores epic information';

-- Create epic_tags junction table if not exists
CREATE TABLE IF NOT EXISTS public.epic_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  epic_id UUID NOT NULL REFERENCES public.epics(id) ON DELETE CASCADE,
  tag TEXT NOT NULL,
  CONSTRAINT unique_epic_tag UNIQUE (epic_id, tag)
);

-- Create stories table if not exists
CREATE TABLE IF NOT EXISTS public.stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL,
  status TEXT NOT NULL,
  priority TEXT NOT NULL,
  points INTEGER,
  epic_id UUID REFERENCES public.epics(id) ON DELETE SET NULL,
  sprint_id UUID REFERENCES public.sprints(id) ON DELETE SET NULL,
  assignee_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reporter_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  business_value INTEGER,
  risk_level TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create table comment for stories
COMMENT ON TABLE public.stories IS 'Stores user story information';

-- Create story_tags junction table if not exists
CREATE TABLE IF NOT EXISTS public.story_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID NOT NULL REFERENCES public.stories(id) ON DELETE CASCADE,
  tag TEXT NOT NULL,
  CONSTRAINT unique_story_tag UNIQUE (story_id, tag)
);

-- Create tasks table if not exists
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL,
  priority TEXT NOT NULL,
  story_id UUID REFERENCES public.stories(id) ON DELETE CASCADE,
  assignee_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  estimated_hours FLOAT,
  remaining_hours FLOAT,
  actual_hours FLOAT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create table comment for tasks
COMMENT ON TABLE public.tasks IS 'Stores task information';

-- Create sprints table if not exists
CREATE TABLE IF NOT EXISTS public.sprints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  goal TEXT,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create table comment for sprints
COMMENT ON TABLE public.sprints IS 'Stores sprint information';

-- Create acceptance_criteria table if not exists
CREATE TABLE IF NOT EXISTS public.acceptance_criteria (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID NOT NULL REFERENCES public.stories(id) ON DELETE CASCADE,
  criteria TEXT NOT NULL,
  is_satisfied BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create table comment for acceptance_criteria
COMMENT ON TABLE public.acceptance_criteria IS 'Stores acceptance criteria for stories';

-- Create story_dependencies junction table if not exists
CREATE TABLE IF NOT EXISTS public.story_dependencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID NOT NULL REFERENCES public.stories(id) ON DELETE CASCADE,
  depends_on_story_id UUID NOT NULL REFERENCES public.stories(id) ON DELETE CASCADE,
  CONSTRAINT unique_story_dependency UNIQUE (story_id, depends_on_story_id),
  CONSTRAINT no_self_dependency CHECK (story_id != depends_on_story_id)
);

-- Insert default system roles
INSERT INTO public.roles (name, description, is_default, is_system, created_at, updated_at)
VALUES 
  ('Administrator', 'Full access to all resources and settings', FALSE, TRUE, NOW(), NOW()),
  ('Project Manager', 'Can manage projects, epics, and team assignments', FALSE, TRUE, NOW(), NOW()),
  ('Team Member', 'Standard team member with access to assigned projects', TRUE, TRUE, NOW(), NOW()),
  ('Viewer', 'Read-only access to projects and tasks', FALSE, TRUE, NOW(), NOW())
ON CONFLICT (name) DO NOTHING;

-- Insert default permissions
INSERT INTO public.permissions (name, description, category, action, created_at, updated_at)
VALUES 
  -- Project permissions
  ('Create Projects', 'Can create new projects', 'project', 'create', NOW(), NOW()),
  ('View Projects', 'Can view project details', 'project', 'read', NOW(), NOW()),
  ('Edit Projects', 'Can edit project details', 'project', 'update', NOW(), NOW()),
  ('Delete Projects', 'Can delete projects', 'project', 'delete', NOW(), NOW()),
  ('Manage Projects', 'Can manage all aspects of projects', 'project', 'manage', NOW(), NOW()),
  
  -- Epic permissions
  ('Create Epics', 'Can create new epics', 'epic', 'create', NOW(), NOW()),
  ('View Epics', 'Can view epic details', 'epic', 'read', NOW(), NOW()),
  ('Edit Epics', 'Can edit epic details', 'epic', 'update', NOW(), NOW()),
  ('Delete Epics', 'Can delete epics', 'epic', 'delete', NOW(), NOW()),
  ('Manage Epics', 'Can manage all aspects of epics', 'epic', 'manage', NOW(), NOW()),
  
  -- Story permissions
  ('Create Stories', 'Can create new stories', 'story', 'create', NOW(), NOW()),
  ('View Stories', 'Can view story details', 'story', 'read', NOW(), NOW()),
  ('Edit Stories', 'Can edit story details', 'story', 'update', NOW(), NOW()),
  ('Delete Stories', 'Can delete stories', 'story', 'delete', NOW(), NOW()),
  ('Manage Stories', 'Can manage all aspects of stories', 'story', 'manage', NOW(), NOW()),
  
  -- Task permissions
  ('Create Tasks', 'Can create new tasks', 'task', 'create', NOW(), NOW()),
  ('View Tasks', 'Can view task details', 'task', 'read', NOW(), NOW()),
  ('Edit Tasks', 'Can edit task details', 'task', 'update', NOW(), NOW()),
  ('Delete Tasks', 'Can delete tasks', 'task', 'delete', NOW(), NOW()),
  ('Manage Tasks', 'Can manage all aspects of tasks', 'task', 'manage', NOW(), NOW()),
  
  -- Team permissions
  ('View Team', 'Can view team details', 'team', 'read', NOW(), NOW()),
  ('Edit Team', 'Can edit team details', 'team', 'update', NOW(), NOW()),
  ('Assign Team Members', 'Can assign team members to projects', 'team', 'assign', NOW(), NOW()),
  ('Manage Team', 'Can manage all aspects of team', 'team', 'manage', NOW(), NOW()),
  
  -- System permissions
  ('System Settings', 'Can access and modify system settings', 'system', 'manage', NOW(), NOW()),
  ('Manage Roles', 'Can create and manage roles', 'system', 'manage', NOW(), NOW())
ON CONFLICT ON CONSTRAINT unique_category_action DO NOTHING;

-- Assign permissions to Administrator role (all permissions)
WITH admin_role AS (
  SELECT id FROM public.roles WHERE name = 'Administrator' LIMIT 1
),
all_permissions AS (
  SELECT id FROM public.permissions
)
INSERT INTO public.role_permissions (role_id, permission_id, created_at)
SELECT 
  (SELECT id FROM admin_role), 
  p.id, 
  NOW()
FROM all_permissions p
ON CONFLICT ON CONSTRAINT unique_role_permission DO NOTHING;

-- Assign permissions to Project Manager role
WITH pm_role AS (
  SELECT id FROM public.roles WHERE name = 'Project Manager' LIMIT 1
),
pm_permissions AS (
  SELECT id FROM public.permissions 
  WHERE 
    (category = 'project' AND action IN ('create', 'read', 'update', 'delete', 'manage')) OR
    (category = 'epic' AND action IN ('create', 'read', 'update', 'delete', 'manage')) OR
    (category = 'story' AND action IN ('create', 'read', 'update', 'delete', 'manage')) OR
    (category = 'task' AND action IN ('create', 'read', 'update', 'delete', 'manage')) OR
    (category = 'team' AND action IN ('read', 'assign'))
)
INSERT INTO public.role_permissions (role_id, permission_id, created_at)
SELECT 
  (SELECT id FROM pm_role), 
  p.id, 
  NOW()
FROM pm_permissions p
ON CONFLICT ON CONSTRAINT unique_role_permission DO NOTHING;

-- Assign permissions to Team Member role
WITH member_role AS (
  SELECT id FROM public.roles WHERE name = 'Team Member' LIMIT 1
),
member_permissions AS (
  SELECT id FROM public.permissions 
  WHERE 
    (category = 'project' AND action = 'read') OR
    (category = 'epic' AND action = 'read') OR
    (category = 'story' AND action IN ('create', 'read', 'update')) OR
    (category = 'task' AND action IN ('create', 'read', 'update')) OR
    (category = 'team' AND action = 'read')
)
INSERT INTO public.role_permissions (role_id, permission_id, created_at)
SELECT 
  (SELECT id FROM member_role), 
  p.id, 
  NOW()
FROM member_permissions p
ON CONFLICT ON CONSTRAINT unique_role_permission DO NOTHING;

-- Assign permissions to Viewer role
WITH viewer_role AS (
  SELECT id FROM public.roles WHERE name = 'Viewer' LIMIT 1
),
viewer_permissions AS (
  SELECT id FROM public.permissions 
  WHERE 
    (category = 'project' AND action = 'read') OR
    (category = 'epic' AND action = 'read') OR
    (category = 'story' AND action = 'read') OR
    (category = 'task' AND action = 'read') OR
    (category = 'team' AND action = 'read')
)
INSERT INTO public.role_permissions (role_id, permission_id, created_at)
SELECT 
  (SELECT id FROM viewer_role), 
  p.id, 
  NOW()
FROM viewer_permissions p
ON CONFLICT ON CONSTRAINT unique_role_permission DO NOTHING;

-- Create RLS policies for roles table
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to roles"
  ON public.roles FOR SELECT
  USING (true);

CREATE POLICY "Allow admin to create roles"
  ON public.roles FOR INSERT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.user_roles ur
      JOIN public.role_permissions rp ON ur.role_id = rp.role_id
      JOIN public.permissions p ON rp.permission_id = p.id
      WHERE ur.user_id = auth.uid()
      AND p.category = 'system'
      AND p.action = 'manage'
    )
  );

CREATE POLICY "Allow admin to update roles"
  ON public.roles FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.user_roles ur
      JOIN public.role_permissions rp ON ur.role_id = rp.role_id
      JOIN public.permissions p ON rp.permission_id = p.id
      WHERE ur.user_id = auth.uid()
      AND p.category = 'system'
      AND p.action = 'manage'
    )
  );

CREATE POLICY "Allow admin to delete non-system roles"
  ON public.roles FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.user_roles ur
      JOIN public.role_permissions rp ON ur.role_id = rp.role_id
      JOIN public.permissions p ON rp.permission_id = p.id
      WHERE ur.user_id = auth.uid()
      AND p.category = 'system'
      AND p.action = 'manage'
    )
    AND is_system = false
  );

-- Create RLS policies for permissions table
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to permissions"
  ON public.permissions FOR SELECT
  USING (true);

CREATE POLICY "Allow admin to manage permissions"
  ON public.permissions FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.user_roles ur
      JOIN public.role_permissions rp ON ur.role_id = rp.role_id
      JOIN public.permissions p ON rp.permission_id = p.id
      WHERE ur.user_id = auth.uid()
      AND p.category = 'system'
      AND p.action = 'manage'
    )
  );

-- Create RLS policies for role_permissions table
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to role_permissions"
  ON public.role_permissions FOR SELECT
  USING (true);

CREATE POLICY "Allow admin to manage role_permissions"
  ON public.role_permissions FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.user_roles ur
      JOIN public.role_permissions rp ON ur.role_id = rp.role_id
      JOIN public.permissions p ON rp.permission_id = p.id
      WHERE ur.user_id = auth.uid()
      AND p.category = 'system'
      AND p.action = 'manage'
    )
  );

-- Create RLS policies for user_roles table
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow users to view their own roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());
  
CREATE POLICY "Allow admin to view all user roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.user_roles ur
      JOIN public.role_permissions rp ON ur.role_id = rp.role_id
      JOIN public.permissions p ON rp.permission_id = p.id
      WHERE ur.user_id = auth.uid()
      AND p.category = 'system'
      AND p.action = 'manage'
    )
  );

CREATE POLICY "Allow admin to manage user roles"
  ON public.user_roles FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.user_roles ur
      JOIN public.role_permissions rp ON ur.role_id = rp.role_id
      JOIN public.permissions p ON rp.permission_id = p.id
      WHERE ur.user_id = auth.uid()
      AND p.category = 'system'
      AND p.action = 'manage'
    )
  ); 