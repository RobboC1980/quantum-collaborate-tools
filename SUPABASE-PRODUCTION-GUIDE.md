# QuantumScribe Supabase Production Integration Guide

This guide provides comprehensive instructions for setting up, verifying, and deploying your Supabase integration for QuantumScribe in a production environment.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Initial Setup](#initial-setup)
3. [Database Schema](#database-schema)
4. [Row Level Security (RLS)](#row-level-security-rls)
5. [Storage Configuration](#storage-configuration)
6. [Authentication Setup](#authentication-setup)
7. [Verification](#verification)
8. [Production Deployment Checklist](#production-deployment-checklist)
9. [Monitoring and Maintenance](#monitoring-and-maintenance)
10. [Troubleshooting](#troubleshooting)

## Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [Supabase CLI](https://supabase.com/docs/guides/cli)
- A Supabase account with a project created

## Initial Setup

1. **Install the Supabase CLI:**
   ```bash
   npm install -g supabase
   ```

2. **Login to Supabase:**
   ```bash
   supabase login
   ```

3. **Link your project:**
   ```bash
   supabase link --project-ref <your-project-id>
   ```

4. **Create a `.env` file:**
   Copy the `.env.example` file to `.env` and fill in your Supabase credentials:
   ```bash
   cp .env.example .env
   ```
   
   Then edit the `.env` file with your Supabase credentials:
   ```
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   SUPABASE_DB_PASSWORD=your-database-password
   ```

## Database Schema

The application uses the following core tables:

### Profiles Table

```sql
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'user'::text,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

### Projects Table

```sql
CREATE TABLE public.projects (
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
```

### Epics Table

```sql
CREATE TABLE public.epics (
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
```

### Stories Table

```sql
CREATE TABLE public.stories (
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
```

To create these tables, you can use the Supabase SQL Editor or run migrations using the Supabase CLI.

## Row Level Security (RLS)

Row Level Security is crucial for ensuring data segregation in a multi-user environment. We've provided a comprehensive set of RLS policies in the `supabase/migrations/20240301_rls_policies.sql` file.

To deploy these policies:

1. **Using the deployment script:**
   ```bash
   node deploy-rls-policies.js
   ```

2. **Manually via the Supabase Dashboard:**
   - Go to the SQL Editor in your Supabase Dashboard
   - Copy the contents of `supabase/migrations/20240301_rls_policies.sql`
   - Paste and execute the SQL

The RLS policies ensure:
- Users can only access their own projects, epics, and stories
- Data is properly segregated by user
- Storage files are only accessible to their owners

## Storage Configuration

1. **Create a storage bucket for project files:**
   ```sql
   INSERT INTO storage.buckets (id, name, public)
   VALUES ('project-files', 'project-files', false)
   ON CONFLICT (id) DO NOTHING;
   ```

2. **Set up RLS policies for storage:**
   The RLS policies in `20240301_rls_policies.sql` include storage policies that ensure:
   - Users can only access files in their own directory
   - Files are organized by user ID for proper segregation

3. **File path convention:**
   When uploading files, use the following path convention to ensure proper segregation:
   ```
   {user_id}/{file_name}
   ```

## Authentication Setup

1. **Configure authentication providers in the Supabase Dashboard:**
   - Go to Authentication > Providers
   - Enable Email provider
   - Configure Password settings (minimum length, etc.)
   - Set up redirect URLs for password reset and email confirmation

2. **Set up email templates:**
   - Go to Authentication > Email Templates
   - Customize the templates for:
     - Confirmation
     - Invitation
     - Magic Link
     - Reset Password

3. **Configure user management:**
   - Go to Authentication > Users
   - Set up initial admin users if needed

## Verification

To verify your Supabase integration is correctly set up and ready for production:

1. **Install verification dependencies:**
   ```bash
   cp supabase-verification-package.json package.json
   npm install
   ```

2. **Run the verification script:**
   ```bash
   node supabase-verification.js
   ```

The script will test:
- User authentication
- Data storage for projects, epics, and stories
- Data segregation between users
- Storage functionality and access control

See `SUPABASE-VERIFICATION.md` for detailed information about the verification process.

## Production Deployment Checklist

Before deploying to production, ensure:

### Security

- [ ] Row Level Security (RLS) policies are in place for all tables
- [ ] Storage buckets have appropriate access controls
- [ ] Authentication settings are properly configured
- [ ] Service role key is securely stored and not exposed in client-side code
- [ ] Password policies are sufficiently strong
- [ ] Email verification is enabled

### Performance

- [ ] Indexes are created for frequently queried columns:
  ```sql
  CREATE INDEX idx_projects_owner_id ON public.projects(owner_id);
  CREATE INDEX idx_epics_project_id ON public.epics(project_id);
  CREATE INDEX idx_epics_owner_id ON public.epics(owner_id);
  CREATE INDEX idx_stories_epic_id ON public.stories(epic_id);
  CREATE INDEX idx_stories_assignee_id ON public.stories(assignee_id);
  CREATE INDEX idx_stories_reporter_id ON public.stories(reporter_id);
  ```
- [ ] Database queries are optimized
- [ ] Supabase real-time features are used appropriately

### Reliability

- [ ] Error handling is implemented throughout the application
- [ ] Retry mechanisms are in place for critical operations
- [ ] Database backups are configured

### Monitoring

- [ ] Logging is set up to track important events
- [ ] Alerts are configured for critical errors
- [ ] Performance monitoring is in place

## Monitoring and Maintenance

### Regular Maintenance Tasks

1. **Monitor database size and performance:**
   - Check the Supabase Dashboard regularly
   - Monitor query performance
   - Optimize slow queries

2. **User management:**
   - Review user accounts periodically
   - Remove inactive users if appropriate
   - Audit user permissions

3. **Storage management:**
   - Monitor storage usage
   - Implement lifecycle policies for old files if needed

### Scaling Considerations

1. **Database scaling:**
   - Monitor connection limits
   - Consider upgrading your Supabase plan as user base grows

2. **Storage scaling:**
   - Monitor storage limits
   - Implement file size limits and validation

## Troubleshooting

### Common Issues

1. **Authentication Failures:**
   - Check that your Supabase URL and anon key are correct
   - Verify that email authentication is enabled in your Supabase project
   - Check browser console for specific errors

2. **Data Storage Failures:**
   - Ensure your database schema matches the expected structure
   - Check that the required tables exist
   - Verify that RLS policies are not too restrictive

3. **Data Segregation Issues:**
   - Verify that RLS policies are correctly set up
   - Check that the policies are enforcing the expected access controls
   - Test with multiple users to ensure proper segregation

4. **Storage Failures:**
   - Ensure that storage is enabled in your Supabase project
   - Verify that the storage bucket exists and has the correct permissions
   - Check file paths follow the correct convention

### Getting Help

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Discord Community](https://discord.supabase.com/)
- [Supabase GitHub Issues](https://github.com/supabase/supabase/issues)

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Storage Guide](https://supabase.com/docs/guides/storage)
- [Authentication Guide](https://supabase.com/docs/guides/auth)
- [Supabase CLI Guide](https://supabase.com/docs/guides/cli) 