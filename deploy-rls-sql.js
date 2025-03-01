/**
 * Direct RLS Policies Deployment Script using SQL API
 * 
 * This script deploys the Row Level Security (RLS) policies directly to your Supabase project
 * using the SQL API endpoint.
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import chalk from 'chalk';
import fetch from 'node-fetch';

// Load environment variables
dotenv.config();

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error(chalk.red('Error: Missing Supabase environment variables. Check your .env file.'));
  console.error(chalk.yellow('Required variables:'));
  console.error(chalk.yellow('- VITE_SUPABASE_URL: Your Supabase project URL'));
  console.error(chalk.yellow('- VITE_SUPABASE_SERVICE_KEY: Your Supabase service role key (not the anon key)'));
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Main deployment function
const deployRLSPoliciesSql = async () => {
  console.log(chalk.blue('=== Direct RLS Policies Deployment via SQL API ==='));
  
  try {
    // Check if the migration file exists
    const migrationFilePath = './supabase/migrations/20240301_rls_policies.sql';
    if (!fs.existsSync(migrationFilePath)) {
      console.error(chalk.red(`✗ Migration file not found: ${migrationFilePath}`));
      process.exit(1);
    }
    
    // Read the SQL file
    const sqlContent = fs.readFileSync(migrationFilePath, 'utf8');
    console.log(chalk.green('✓ Migration file loaded'));
    
    // Execute the SQL using the SQL API endpoint
    console.log(chalk.blue('\nExecuting SQL via SQL API...'));
    
    try {
      const response = await fetch(`${supabaseUrl}/rest/v1/rpc/pg_dump`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseServiceKey,
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'Prefer': 'params=single-object'
        },
        body: JSON.stringify({
          query: sqlContent
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`SQL execution failed: ${errorText}`);
      }
      
      console.log(chalk.green('✓ SQL executed successfully'));
    } catch (sqlError) {
      console.error(chalk.red(`✗ Failed to execute SQL: ${sqlError.message}`));
      
      // Try alternative approach - split into individual statements
      console.log(chalk.yellow('\nAttempting to execute SQL statements individually...'));
      
      // Split the SQL into individual statements
      const statements = sqlContent
        .replace(/--.*$/gm, '') // Remove comments
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0);
      
      console.log(chalk.blue(`Found ${statements.length} SQL statements to execute`));
      
      // Try executing each statement via the dashboard
      console.log(chalk.yellow('\nPlease execute these statements in the Supabase SQL Editor:'));
      console.log(chalk.yellow('1. Go to the Supabase dashboard: https://app.supabase.com'));
      console.log(chalk.yellow('2. Select your project'));
      console.log(chalk.yellow('3. Go to SQL Editor'));
      console.log(chalk.yellow('4. Copy and execute each statement:'));
      
      statements.forEach((stmt, index) => {
        console.log(chalk.cyan(`\n-- Statement ${index + 1}/${statements.length}:`));
        console.log(stmt + ';');
      });
      
      process.exit(1);
    }
    
    // Verify storage bucket exists
    console.log(chalk.blue('\nVerifying storage bucket...'));
    
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error(chalk.red(`✗ Failed to list storage buckets: ${bucketsError.message}`));
    } else {
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
            console.error(chalk.red(`✗ Failed to create bucket: ${createBucketError.message}`));
          } else {
            console.log(chalk.green('✓ project-files bucket created successfully'));
          }
        } catch (createError) {
          console.error(chalk.red(`✗ Failed to create bucket: ${createError.message}`));
        }
      } else {
        console.log(chalk.green('✓ project-files bucket exists'));
      }
    }
    
    console.log(chalk.green('\n✓ RLS policies deployment completed!'));
    console.log(chalk.blue('\nYour Supabase integration is now secured with proper data segregation.'));
    console.log(chalk.blue('Run the verification script to confirm everything is working correctly:'));
    console.log(chalk.blue('npm run verify'));
    
  } catch (error) {
    console.error(chalk.red(`\n✗ Deployment failed: ${error.message}`));
    process.exit(1);
  }
};

// Run the deployment
deployRLSPoliciesSql(); 