# Supabase Fix Guide

This guide provides step-by-step instructions to fix the issues with your Supabase configuration and make the production readiness checks work properly.

## Issue Summary

1. **Conflicting Supabase URLs in Environment Variables**
   - Your `.env` file contained two different Supabase URLs, causing connection failures.
   - The scripts were prioritizing the wrong URL.

2. **Missing Custom Database Functions**
   - The production readiness check script requires several custom functions to be created in your Supabase database.

3. **Missing Storage RLS Policies**
   - The storage bucket 'project-files' exists but lacks the required RLS policies.

4. **Missing Recommended Indexes**
   - Several recommended indexes for performance optimization are missing.

## Solution Steps

### Step 1: Fix Environment Variables ✅

We've updated the scripts to prioritize the working Supabase URL (`VITE_SUPABASE_URL`). The `.env` file has been checked to ensure consistency.

We've created two scripts to help with this:
- `fix-env.js` - Updates the `.env` file to ensure consistency
- `run-check-with-fixed-env.js` - Sets the environment variables directly and runs the check

### Step 2: Deploy Custom Functions to Supabase ✅

You need to create the custom functions in your Supabase database. You have two options:

#### Option A: Using the Supabase Dashboard (Recommended)

1. Log in to your [Supabase Dashboard](https://app.supabase.io)
2. Navigate to your project
3. Go to the SQL Editor
4. Copy the contents of `create-check-functions.sql`
5. Paste into the SQL Editor and run the query

Here's the SQL script for convenience:

```sql
-- Create functions for production readiness checks

-- Function to list tables with RLS status
CREATE OR REPLACE FUNCTION get_tables()
RETURNS TABLE (name text, has_rls boolean) 
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    tables.table_name::text,
    EXISTS (
      SELECT 1 FROM pg_tables 
      WHERE tablename = tables.table_name 
      AND rowsecurity = true
    ) as has_rls
  FROM information_schema.tables tables
  WHERE tables.table_schema = 'public';
END;
$$;

-- Function to check RLS status for tables
CREATE OR REPLACE FUNCTION get_tables_with_rls_status()
RETURNS TABLE (name text, has_rls boolean) 
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    tables.table_name::text,
    EXISTS (
      SELECT 1 FROM pg_tables 
      WHERE tablename = tables.table_name 
      AND rowsecurity = true
    ) as has_rls
  FROM information_schema.tables tables
  WHERE tables.table_schema = 'public';
END;
$$;

-- Function to list RLS policies
CREATE OR REPLACE FUNCTION get_policies()
RETURNS TABLE (tablename text, policyname text) 
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.tablename::text,
    p.policyname::text
  FROM pg_policies p
  WHERE p.schemaname = 'public';
END;
$$;

-- Function to list indexes
CREATE OR REPLACE FUNCTION get_indexes()
RETURNS TABLE (indexname text, tablename text) 
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    i.indexname::text,
    i.tablename::text
  FROM pg_indexes i
  WHERE i.schemaname = 'public';
END;
$$;
```

#### Option B: Using the Deployment Script

We've created a script to deploy the functions programmatically:

1. First, you need to create the `exec_sql` function in Supabase:
   - Go to the SQL Editor in your Supabase Dashboard
   - Copy the contents of `exec-sql-function.sql`
   - Paste into the SQL Editor and run the query

2. Run the deployment script:
   ```bash
   npm run deploy-check-functions
   ```

### Step 3: Add Storage RLS Policies and Recommended Indexes ⏳

Now that the environment variables and custom functions are working, we need to add the missing storage RLS policies and recommended indexes.

#### Option A: Using the Supabase Dashboard (Recommended)

1. Log in to your [Supabase Dashboard](https://app.supabase.io)
2. Navigate to your project
3. Go to the SQL Editor
4. Copy the contents of `complete-setup-final.sql`
5. Paste into the SQL Editor and run the query

Here's the SQL script for convenience:

```sql
-- Complete Setup Final Script
-- This script adds the missing storage RLS policies and recommended indexes

-- 1. Add Storage RLS Policies
-- Enable RLS on storage.objects table if not already enabled
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for storage
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
```

#### Option B: Using the Deployment Script

If you've already set up the `exec_sql` function, you can create a script to deploy these changes programmatically. However, for simplicity, we recommend using Option A.

### Step 4: Run the Production Readiness Check

After implementing all the fixes, run the production readiness check:

```bash
npm run check-with-fixed-env
```

This should now pass all checks or only show minor warnings.

## What We've Fixed

1. **Environment Variable Consistency** ✅
   - Updated scripts to prioritize `VITE_SUPABASE_URL` over `SUPABASE_URL`
   - Created `fix-env.js` to ensure `.env` file consistency
   - Created `run-check-with-fixed-env.js` to set environment variables directly

2. **Connection Issues** ✅
   - Fixed the URL mismatch problem
   - Verified connection to Supabase is working

3. **Custom Function Deployment** ✅
   - Created `create-check-functions.sql` with all required functions
   - Created `exec-sql-function.sql` to enable programmatic SQL execution
   - Created `deploy-check-functions.js` for programmatic deployment

4. **Storage RLS Policies** ⏳
   - Created policies for reading, uploading, updating, and deleting files
   - Ensured proper owner-based access control

5. **Database Performance** ⏳
   - Added recommended indexes for improved query performance
   - Optimized tables for common access patterns

## Verification

You can verify that all issues have been fixed by running:

```bash
npm run check-with-fixed-env
```

This should show all checks passing or only minor warnings.

## Files Created/Modified

1. `fix-env.js` - Script to fix environment variables in `.env` file
2. `run-check-with-fixed-env.js` - Script to run checks with fixed environment variables
3. `deploy-check-functions.js` - Script to deploy check functions programmatically
4. `exec-sql-function.sql` - SQL script to create the exec_sql function
5. `create-check-functions.sql` - SQL script to create custom functions for checks
6. `complete-setup-final.sql` - SQL script to add storage RLS policies and indexes
7. `SUPABASE-TROUBLESHOOTING.md` - Detailed troubleshooting guide
8. `SUPABASE-FIX-GUIDE.md` - This comprehensive fix guide

## Next Steps

After fixing these issues, you should be able to run the production readiness check successfully. If you encounter any other issues, refer to the troubleshooting section or the `SUPABASE-TROUBLESHOOTING.md` file for more detailed guidance. 