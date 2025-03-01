/**
 * QuantumScribe Supabase RLS Policies Deployment Script
 * 
 * This script deploys the Row Level Security (RLS) policies to your Supabase project.
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

if (!supabaseUrl || !supabaseServiceKey) {
  console.error(chalk.red('Error: Missing Supabase environment variables. Check your .env file.'));
  console.error(chalk.yellow('Required variables:'));
  console.error(chalk.yellow('- VITE_SUPABASE_URL: Your Supabase project URL'));
  console.error(chalk.yellow('- SUPABASE_SERVICE_ROLE_KEY: Your Supabase service role key (not the anon key)'));
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

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
      // Get the project ref from config.toml
      const configPath = './supabase/config.toml';
      if (!fs.existsSync(configPath)) {
        console.error(chalk.red(`✗ Supabase config file not found: ${configPath}`));
        process.exit(1);
      }
      
      const configContent = fs.readFileSync(configPath, 'utf8');
      const projectRefMatch = configContent.match(/project_id\s*=\s*"([^"]+)"/);
      const projectRef = projectRefMatch ? projectRefMatch[1] : null;
      
      if (!projectRef) {
        console.error(chalk.red('✗ Could not find project_id in config.toml'));
        process.exit(1);
      }
      
      console.log(chalk.blue(`Using project ref: ${projectRef}`));
      
      // Run the migration
      const { stdout, stderr } = await execAsync(`supabase db push --db-url postgresql://postgres.${projectRef}:${process.env.SUPABASE_DB_PASSWORD}@aws-0-us-west-1.pooler.supabase.com:5432/postgres`);
      
      if (stderr && !stderr.includes('Applying migration')) {
        throw new Error(stderr);
      }
      
      console.log(chalk.green('✓ RLS policies deployed successfully'));
      console.log(chalk.gray(stdout));
      
    } catch (error) {
      console.error(chalk.red(`✗ Failed to deploy RLS policies: ${error.message}`));
      console.log(chalk.yellow('\nAlternative method:'));
      console.log(chalk.yellow('1. Go to the Supabase dashboard: https://app.supabase.com'));
      console.log(chalk.yellow('2. Select your project'));
      console.log(chalk.yellow('3. Go to SQL Editor'));
      console.log(chalk.yellow('4. Copy the contents of supabase/migrations/20240301_rls_policies.sql'));
      console.log(chalk.yellow('5. Paste into the SQL Editor and run the query'));
      process.exit(1);
    }
    
    // Verify RLS is enabled on tables
    console.log(chalk.blue('\nVerifying RLS is enabled on tables...'));
    
    const { data: tables, error: tablesError } = await supabase.rpc('get_tables_with_rls_status');
    
    if (tablesError) {
      throw new Error(`Failed to get tables RLS status: ${tablesError.message}`);
    }
    
    const requiredTables = ['projects', 'epics', 'stories'];
    const tablesWithoutRLS = requiredTables.filter(tableName => {
      const table = tables.find(t => t.table === tableName);
      return !table || !table.rls_enabled;
    });
    
    if (tablesWithoutRLS.length > 0) {
      console.error(chalk.red(`✗ RLS is not enabled on the following tables: ${tablesWithoutRLS.join(', ')}`));
      process.exit(1);
    }
    
    console.log(chalk.green('✓ RLS is enabled on all required tables'));
    
    // Verify storage bucket exists
    console.log(chalk.blue('\nVerifying storage bucket...'));
    
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      throw new Error(`Failed to list storage buckets: ${bucketsError.message}`);
    }
    
    const projectFilesBucket = buckets.find(b => b.name === 'project-files');
    
    if (!projectFilesBucket) {
      console.error(chalk.red('✗ project-files bucket not found'));
      process.exit(1);
    }
    
    console.log(chalk.green('✓ project-files bucket exists'));
    
    console.log(chalk.green('\n✓ Supabase RLS policies deployment completed successfully!'));
    console.log(chalk.blue('\nYour Supabase integration is now secured with proper data segregation.'));
    console.log(chalk.blue('Run the verification script to confirm everything is working correctly:'));
    console.log(chalk.blue('node supabase-verification.js'));
    
  } catch (error) {
    console.error(chalk.red(`\n✗ Deployment failed: ${error.message}`));
    process.exit(1);
  }
};

// Run the deployment
deployRLSPolicies(); 