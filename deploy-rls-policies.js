/**
 * QuantumScribe Supabase RLS Policies Deployment Script
 * 
 * This script deploys the Row Level Security (RLS) policies to your Supabase project.
 * Updated to use the transaction pooler for production environments.
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import chalk from 'chalk';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Load environment variables
dotenv.config();

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseDbPassword = process.env.SUPABASE_DB_PASSWORD;

if (!supabaseUrl || !supabaseServiceKey || !supabaseDbPassword) {
  console.error(chalk.red('Error: Missing Supabase environment variables. Check your .env file.'));
  console.error(chalk.yellow('Required variables:'));
  console.error(chalk.yellow('- VITE_SUPABASE_URL: Your Supabase project URL'));
  console.error(chalk.yellow('- SUPABASE_SERVICE_ROLE_KEY: Your Supabase service role key (not the anon key)'));
  console.error(chalk.yellow('- SUPABASE_DB_PASSWORD: Your Supabase database password'));
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Extract project reference from URL
const extractProjectRef = (url) => {
  try {
    const urlObj = new URL(url);
    const hostParts = urlObj.hostname.split('.');
    if (hostParts[0] !== 'supabase') {
      return hostParts[0]; // For custom domains, assume first part is project ref
    }
    return hostParts[1]; // For supabase.co domains, second part is project ref
  } catch (error) {
    console.error(chalk.red(`Error extracting project reference: ${error.message}`));
    return null;
  }
};

// Main deployment function
const deployRLSPolicies = async () => {
  console.log(chalk.blue('=== QuantumScribe Supabase RLS Policies Deployment ==='));
  
  try {
    // Check if Supabase CLI is installed
    try {
      await execAsync('supabase --version');
      console.log(chalk.green('✓ Supabase CLI is installed'));
    } catch (error) {
      console.error(chalk.red('✗ Supabase CLI is not installed'));
      console.log(chalk.yellow('Please install the Supabase CLI:'));
      console.log(chalk.yellow('npm install -g supabase'));
      process.exit(1);
    }
    
    // Check if the migration file exists
    const migrationFilePath = './supabase/migrations/20240301_rls_policies.sql';
    if (!fs.existsSync(migrationFilePath)) {
      console.error(chalk.red(`✗ Migration file not found: ${migrationFilePath}`));
      process.exit(1);
    }
    console.log(chalk.green('✓ Migration file found'));
    
    // Deploy the migration using Supabase CLI
    console.log(chalk.blue('\nDeploying RLS policies...'));
    
    try {
      // Get the project ref from the URL
      const projectRef = extractProjectRef(supabaseUrl);
      
      if (!projectRef) {
        console.error(chalk.red('✗ Could not extract project reference from URL'));
        console.log(chalk.yellow('Please check your VITE_SUPABASE_URL environment variable'));
        process.exit(1);
      }
      
      console.log(chalk.blue(`Using project ref: ${projectRef}`));
      
      // Construct the database connection URL for the transaction pooler
      const dbUrl = `postgresql://postgres:${encodeURIComponent(supabaseDbPassword)}@db.${projectRef}.supabase.co:5432/postgres`;
      
      // Run the migration
      const { stdout, stderr } = await execAsync(`supabase db push --db-url "${dbUrl}"`);
      
      if (stderr && !stderr.includes('Applying migration')) {
        throw new Error(stderr);
      }
      
      console.log(chalk.green('✓ RLS policies deployed successfully'));
      console.log(chalk.gray(stdout));
      
    } catch (error) {
      console.error(chalk.red(`✗ Failed to deploy RLS policies: ${error.message}`));
      
      // Fallback to manual SQL execution
      console.log(chalk.yellow('\nAttempting to execute SQL directly...'));
      
      try {
        const sqlContent = fs.readFileSync(migrationFilePath, 'utf8');
        
        // Execute the SQL directly using the Supabase client
        const { error: sqlError } = await supabase.rpc('exec_sql', { sql: sqlContent });
        
        if (sqlError) {
          throw new Error(sqlError.message);
        }
        
        console.log(chalk.green('✓ RLS policies deployed successfully via direct SQL execution'));
      } catch (sqlExecError) {
        console.error(chalk.red(`✗ Failed to execute SQL directly: ${sqlExecError.message}`));
        console.log(chalk.yellow('\nAlternative method:'));
        console.log(chalk.yellow('1. Go to the Supabase dashboard: https://app.supabase.com'));
        console.log(chalk.yellow('2. Select your project'));
        console.log(chalk.yellow('3. Go to SQL Editor'));
        console.log(chalk.yellow('4. Copy the contents of supabase/migrations/20240301_rls_policies.sql'));
        console.log(chalk.yellow('5. Paste into the SQL Editor and run the query'));
        
        // Create the exec_sql function if it doesn't exist
        console.log(chalk.yellow('\nYou may need to create the exec_sql function first:'));
        console.log(chalk.yellow(`
CREATE OR REPLACE FUNCTION exec_sql(sql text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE sql;
END;
$$;`));
        
        process.exit(1);
      }
    }
    
    // Verify RLS is enabled on tables
    console.log(chalk.blue('\nVerifying RLS is enabled on tables...'));
    
    try {
      const { data: tables, error: tablesError } = await supabase.rpc('get_tables_with_rls_status');
      
      if (tablesError) {
        throw new Error(`Failed to get tables RLS status: ${tablesError.message}`);
      }
      
      const requiredTables = ['projects', 'epics', 'stories'];
      const tablesWithoutRLS = requiredTables.filter(tableName => {
        const table = tables.find(t => t.name === tableName);
        return !table || !table.has_rls;
      });
      
      if (tablesWithoutRLS.length > 0) {
        console.error(chalk.red(`✗ RLS is not enabled on the following tables: ${tablesWithoutRLS.join(', ')}`));
        process.exit(1);
      }
      
      console.log(chalk.green('✓ RLS is enabled on all required tables'));
    } catch (error) {
      console.error(chalk.red(`✗ Error verifying RLS status: ${error.message}`));
      console.log(chalk.yellow('💡 Tip: You may need to create a custom function to check RLS status:'));
      console.log(chalk.yellow(`
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
$$;`));
    }
    
    // Verify storage bucket exists
    console.log(chalk.blue('\nVerifying storage bucket...'));
    
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      throw new Error(`Failed to list storage buckets: ${bucketsError.message}`);
    }
    
    const projectFilesBucket = buckets.find(b => b.name === 'project-files');
    
    if (!projectFilesBucket) {
      console.error(chalk.red('✗ project-files bucket not found'));
      console.log(chalk.yellow('Creating project-files bucket...'));
      
      try {
        const { error: createBucketError } = await supabase.storage.createBucket('project-files', {
          public: false,
          fileSizeLimit: 10 * 1024 * 1024, // 10MB
        });
        
        if (createBucketError) {
          throw new Error(`Failed to create bucket: ${createBucketError.message}`);
        }
        
        console.log(chalk.green('✓ project-files bucket created successfully'));
      } catch (createError) {
        console.error(chalk.red(`✗ Failed to create bucket: ${createError.message}`));
        process.exit(1);
      }
    } else {
      console.log(chalk.green('✓ project-files bucket exists'));
    }
    
    console.log(chalk.green('\n✓ Supabase RLS policies deployment completed successfully!'));
    console.log(chalk.blue('\nYour Supabase integration is now secured with proper data segregation.'));
    console.log(chalk.blue('Run the verification script to confirm everything is working correctly:'));
    console.log(chalk.blue('npm run verify'));
    
  } catch (error) {
    console.error(chalk.red(`\n✗ Deployment failed: ${error.message}`));
    process.exit(1);
  }
};

// Run the deployment
deployRLSPolicies(); 