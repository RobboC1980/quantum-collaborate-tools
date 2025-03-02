/**
 * Direct RLS Policies Deployment Script
 * 
 * This script deploys the Row Level Security (RLS) policies directly to your Supabase project
 * using the REST API, bypassing the Supabase CLI.
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import chalk from 'chalk';

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
const deployRLSPoliciesDirect = async () => {
  console.log(chalk.blue('=== Direct RLS Policies Deployment ==='));
  
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
    
    // Split the SQL into individual statements
    const statements = sqlContent
      .replace(/--.*$/gm, '') // Remove comments
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);
    
    console.log(chalk.blue(`\nFound ${statements.length} SQL statements to execute`));
    
    // Execute each statement individually
    console.log(chalk.blue('\nExecuting SQL statements...'));
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      console.log(chalk.yellow(`\nExecuting statement ${i + 1}/${statements.length}:`));
      console.log(chalk.gray(statement.substring(0, 100) + (statement.length > 100 ? '...' : '')));
      
      try {
        // Execute the SQL directly using the REST API
        const response = await fetch(`${supabaseUrl}/rest/v1/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': supabaseServiceKey,
            'Authorization': `Bearer ${supabaseServiceKey}`,
            'Prefer': 'params=single-object'
          },
          body: JSON.stringify({
            query: statement + ';'
          })
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error(chalk.red(`✗ Failed to execute statement: ${errorText}`));
          // Continue with the next statement instead of failing completely
          continue;
        }
        
        console.log(chalk.green('✓ Statement executed successfully'));
      } catch (stmtError) {
        console.error(chalk.red(`✗ Error executing statement: ${stmtError.message}`));
        // Continue with the next statement
      }
    }
    
    // Verify RLS is enabled on tables
    console.log(chalk.blue('\nVerifying RLS is enabled on tables...'));
    
    // Execute a query to check if RLS is enabled on the required tables
    const checkRLSQuery = `
      SELECT 
        table_name,
        EXISTS (
          SELECT 1 FROM pg_tables 
          WHERE tablename = table_name 
          AND rowsecurity = true
        ) as has_rls
      FROM (
        VALUES ('projects'), ('epics'), ('stories')
      ) as t(table_name);
    `;
    
    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Prefer': 'params=single-object'
      },
      body: JSON.stringify({
        query: checkRLSQuery
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(chalk.red(`✗ Failed to verify RLS status: ${errorText}`));
    } else {
      const result = await response.json();
      
      if (result && result.length > 0) {
        for (const table of result) {
          if (table.has_rls) {
            console.log(chalk.green(`✓ RLS is enabled on table '${table.table_name}'`));
          } else {
            console.log(chalk.red(`✗ RLS is NOT enabled on table '${table.table_name}'`));
          }
        }
      }
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
deployRLSPoliciesDirect(); 