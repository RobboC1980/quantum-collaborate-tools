#!/usr/bin/env node

/**
 * QuantumScribe Supabase Production Readiness Check
 * 
 * This script checks your Supabase configuration to ensure it's ready for production.
 * It verifies:
 * - Environment variables
 * - Database schema
 * - RLS policies
 * - Storage configuration
 * - Authentication settings
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import chalk from 'chalk';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';

const execAsync = promisify(exec);

// Load environment variables
dotenv.config();

// Check for required environment variables
// Prioritize VITE_SUPABASE_URL since it's working
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
// Prioritize VITE_SUPABASE_SERVICE_KEY since it's working
const SUPABASE_SERVICE_ROLE_KEY = process.env.VITE_SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

// Add debugging information
console.log(chalk.blue('Using Supabase URL:'), SUPABASE_URL);
console.log(chalk.blue('Service Key Available:'), !!SUPABASE_SERVICE_ROLE_KEY);

if (!SUPABASE_URL) {
  console.error(chalk.red('Error: SUPABASE_URL or VITE_SUPABASE_URL environment variable is required.'));
  console.error(chalk.yellow('Make sure it is defined in your .env file.'));
  process.exit(1);
}

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error(chalk.red('Error: VITE_SUPABASE_SERVICE_KEY or SUPABASE_SERVICE_ROLE_KEY environment variable is required.'));
  console.error(chalk.yellow('Make sure it is defined in your .env file.'));
  process.exit(1);
}

// Initialize Supabase client with service role key for admin access
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Required tables for the application
const REQUIRED_TABLES = ['profiles', 'projects', 'epics', 'stories'];

// Required RLS policies
const REQUIRED_RLS_POLICIES = [
  'Users can view their own projects',
  'Users can create their own projects',
  'Users can update their own projects',
  'Users can delete their own projects',
  'Users can view epics in their projects',
  'Users can create epics in their projects',
  'Users can update epics in their projects',
  'Users can delete epics in their projects',
  'Users can view stories in their epics or projects',
  'Users can create stories in their epics or projects',
  'Users can update stories in their epics or projects',
  'Users can delete stories in their epics or projects',
  'Users can read their own files',
  'Users can upload their own files',
  'Users can update their own files',
  'Users can delete their own files'
];

// Required storage buckets
const REQUIRED_STORAGE_BUCKETS = ['project-files'];

async function checkProductionReadiness() {
  console.log(chalk.blue('🔍 Starting Supabase Production Readiness Check...'));
  
  let allChecksPass = true;
  
  // Check 1: Verify database schema
  console.log(chalk.yellow('\n📊 Checking database schema...'));
  try {
    const { data: tables, error } = await supabase.rpc('get_tables');
    
    if (error) throw error;
    
    const tableNames = tables.map(table => table.name);
    
    for (const requiredTable of REQUIRED_TABLES) {
      if (tableNames.includes(requiredTable)) {
        console.log(chalk.green(`✅ Table '${requiredTable}' exists`));
      } else {
        console.log(chalk.red(`❌ Table '${requiredTable}' is missing`));
        allChecksPass = false;
      }
    }
  } catch (error) {
    console.error(chalk.red(`❌ Error checking database schema: ${error.message}`));
    console.log(chalk.yellow('💡 Tip: You may need to create a custom function to list tables:'));
    console.log(`
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
$$;`);
    allChecksPass = false;
  }
  
  // Check 2: Verify RLS is enabled on all tables
  console.log(chalk.yellow('\n🔒 Checking Row Level Security...'));
  try {
    const { data: tablesWithRls, error } = await supabase.rpc('get_tables_with_rls_status');
    
    if (error) throw error;
    
    for (const table of tablesWithRls) {
      if (REQUIRED_TABLES.includes(table.name)) {
        if (table.has_rls) {
          console.log(chalk.green(`✅ RLS is enabled on table '${table.name}'`));
        } else {
          console.log(chalk.red(`❌ RLS is NOT enabled on table '${table.name}'`));
          allChecksPass = false;
        }
      }
    }
  } catch (error) {
    console.error(chalk.red(`❌ Error checking RLS status: ${error.message}`));
    console.log(chalk.yellow('💡 Tip: You may need to create a custom function to check RLS status:'));
    console.log(`
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
$$;`);
    allChecksPass = false;
  }
  
  // Check 3: Verify RLS policies
  console.log(chalk.yellow('\n📜 Checking RLS policies...'));
  try {
    const { data: policies, error } = await supabase.rpc('get_policies');
    
    if (error) throw error;
    
    const policyNames = policies.map(policy => policy.policyname);
    
    for (const requiredPolicy of REQUIRED_RLS_POLICIES) {
      if (policyNames.includes(requiredPolicy)) {
        console.log(chalk.green(`✅ Policy '${requiredPolicy}' exists`));
      } else {
        console.log(chalk.red(`❌ Policy '${requiredPolicy}' is missing`));
        allChecksPass = false;
      }
    }
  } catch (error) {
    console.error(chalk.red(`❌ Error checking RLS policies: ${error.message}`));
    console.log(chalk.yellow('💡 Tip: You may need to create a custom function to list policies:'));
    console.log(`
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
$$;`);
    allChecksPass = false;
  }
  
  // Check 4: Verify storage buckets
  console.log(chalk.yellow('\n📁 Checking storage buckets...'));
  try {
    const { data: buckets, error } = await supabase.storage.listBuckets();
    
    if (error) throw error;
    
    const bucketNames = buckets.map(bucket => bucket.name);
    
    for (const requiredBucket of REQUIRED_STORAGE_BUCKETS) {
      if (bucketNames.includes(requiredBucket)) {
        console.log(chalk.green(`✅ Storage bucket '${requiredBucket}' exists`));
      } else {
        console.log(chalk.red(`❌ Storage bucket '${requiredBucket}' is missing`));
        allChecksPass = false;
      }
    }
  } catch (error) {
    console.error(chalk.red(`❌ Error checking storage buckets: ${error.message}`));
    allChecksPass = false;
  }
  
  // Check 5: Verify authentication settings
  console.log(chalk.yellow('\n🔑 Checking authentication settings...'));
  try {
    const { data: authSettings, error } = await supabase.auth.admin.listUsers();
    
    if (error) throw error;
    
    console.log(chalk.green('✅ Authentication is configured'));
  } catch (error) {
    console.error(chalk.red(`❌ Error checking authentication settings: ${error.message}`));
    console.log(chalk.yellow('💡 Tip: Make sure you are using the service role key, not the anon key'));
    allChecksPass = false;
  }
  
  // Check 6: Verify indexes for performance
  console.log(chalk.yellow('\n📈 Checking database indexes...'));
  try {
    const { data: indexes, error } = await supabase.rpc('get_indexes');
    
    if (error) throw error;
    
    const RECOMMENDED_INDEXES = [
      'idx_projects_owner_id',
      'idx_epics_project_id',
      'idx_epics_owner_id',
      'idx_stories_epic_id',
      'idx_stories_assignee_id',
      'idx_stories_reporter_id'
    ];
    
    const indexNames = indexes.map(index => index.indexname);
    
    for (const recommendedIndex of RECOMMENDED_INDEXES) {
      if (indexNames.includes(recommendedIndex)) {
        console.log(chalk.green(`✅ Index '${recommendedIndex}' exists`));
      } else {
        console.log(chalk.yellow(`⚠️ Recommended index '${recommendedIndex}' is missing`));
      }
    }
  } catch (error) {
    console.error(chalk.red(`❌ Error checking indexes: ${error.message}`));
    console.log(chalk.yellow('💡 Tip: You may need to create a custom function to list indexes:'));
    console.log(`
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
$$;`);
  }
  
  // Final summary
  console.log(chalk.blue('\n📋 Production Readiness Summary:'));
  if (allChecksPass) {
    console.log(chalk.green('✅ All critical checks passed! Your Supabase configuration appears ready for production.'));
  } else {
    console.log(chalk.red('❌ Some checks failed. Please address the issues above before deploying to production.'));
    console.log(chalk.yellow('💡 Tip: Refer to SUPABASE-PRODUCTION-GUIDE.md for detailed setup instructions.'));
  }
}

// Run the checks
checkProductionReadiness().catch(error => {
  console.error(chalk.red(`❌ Unexpected error: ${error.message}`));
  process.exit(1);
}); 