/**
 * Deploy Final Setup to Supabase
 * 
 * This script deploys the storage RLS policies and recommended indexes
 * directly to your Supabase project using the service role key.
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import chalk from 'chalk';
import fs from 'fs';

// Load environment variables
dotenv.config();

// Prioritize VITE_ variables as they're working
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.VITE_SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log(chalk.blue('=== Deploying Final Setup to Supabase ==='));
console.log(chalk.blue('Using Supabase URL:'), SUPABASE_URL);

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error(chalk.red('Error: Missing required environment variables.'));
  console.log('Please ensure you have the following in your .env file:');
  console.log('- VITE_SUPABASE_URL or SUPABASE_URL');
  console.log('- VITE_SUPABASE_SERVICE_KEY or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Initialize Supabase client with service role key
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Read the SQL file
const sqlScript = fs.readFileSync('complete-setup-final.sql', 'utf8');

// Deploy the final setup
async function deployFinalSetup() {
  console.log(chalk.yellow('Deploying storage RLS policies and indexes to Supabase...'));
  
  try {
    const { error } = await supabase.rpc('exec_sql', { sql_query: sqlScript });
    
    if (error) {
      console.error(chalk.red(`Error deploying final setup: ${error.message}`));
      console.log(chalk.yellow('Please execute the SQL script manually in the Supabase Dashboard.'));
      console.log(chalk.yellow('SQL Script to execute:'));
      console.log(sqlScript);
      return;
    }
    
    console.log(chalk.green('Final setup deployed successfully!'));
    
    // Verify storage RLS policies
    console.log(chalk.yellow('\nVerifying storage RLS policies...'));
    const { data: policiesData, error: policiesError } = await supabase.rpc('exec_sql', { 
      sql_query: `
        SELECT policyname
        FROM pg_policies
        WHERE schemaname = 'storage' AND tablename = 'objects'
      `
    });
    
    if (policiesError) {
      console.error(chalk.red(`Error verifying storage RLS policies: ${policiesError.message}`));
    } else {
      console.log(chalk.green('Storage RLS policies verified!'));
    }
    
    // Verify indexes
    console.log(chalk.yellow('\nVerifying database indexes...'));
    const { data: indexesData, error: indexesError } = await supabase.rpc('exec_sql', { 
      sql_query: `
        SELECT indexname
        FROM pg_indexes
        WHERE schemaname = 'public' AND 
          indexname IN (
            'idx_projects_owner_id',
            'idx_epics_project_id',
            'idx_epics_owner_id',
            'idx_stories_epic_id',
            'idx_stories_assignee_id',
            'idx_stories_reporter_id'
          )
      `
    });
    
    if (indexesError) {
      console.error(chalk.red(`Error verifying database indexes: ${indexesError.message}`));
    } else {
      console.log(chalk.green('Database indexes verified!'));
    }
    
  } catch (error) {
    console.error(chalk.red(`Unexpected error: ${error.message}`));
    console.log(chalk.yellow('Please execute the SQL script manually in the Supabase Dashboard.'));
    console.log(chalk.yellow('SQL Script to execute:'));
    console.log(sqlScript);
  }
  
  console.log(chalk.blue('\n=== Deployment Summary ==='));
  console.log(chalk.green('✅ Final setup deployment completed.'));
  console.log(chalk.yellow('Run the production readiness check to verify all issues are fixed:'));
  console.log('npm run check-with-fixed-env');
}

// Run the deployment
deployFinalSetup().catch(error => {
  console.error(chalk.red(`❌ Unexpected error: ${error.message}`));
  process.exit(1);
}); 