/**
 * Deploy Check Functions to Supabase
 * 
 * This script deploys the custom functions needed for production readiness checks
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

console.log(chalk.blue('=== Deploying Check Functions to Supabase ==='));
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
const sqlScript = fs.readFileSync('create-check-functions.sql', 'utf8');

// Split the SQL script into individual function definitions
const functionDefinitions = sqlScript.split('CREATE OR REPLACE FUNCTION');

// Deploy each function
async function deployFunctions() {
  console.log(chalk.yellow('Deploying functions to Supabase...'));
  
  // First function doesn't start with CREATE OR REPLACE FUNCTION
  for (let i = 1; i < functionDefinitions.length; i++) {
    const functionDef = 'CREATE OR REPLACE FUNCTION' + functionDefinitions[i];
    const functionName = functionDef.split('(')[0].trim().split(' ').pop();
    
    console.log(chalk.yellow(`Deploying function: ${functionName}...`));
    
    try {
      const { error } = await supabase.rpc('exec_sql', { sql_query: functionDef });
      
      if (error) {
        console.error(chalk.red(`Error deploying function ${functionName}: ${error.message}`));
        console.log(chalk.yellow('Attempting to create exec_sql function first...'));
        
        // Create the exec_sql function if it doesn't exist
        const createExecSqlFn = `
CREATE OR REPLACE FUNCTION exec_sql(sql_query text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE sql_query;
END;
$$;`;
        
        const { error: execSqlError } = await supabase.rpc('exec_sql', { sql_query: createExecSqlFn });
        
        if (execSqlError) {
          console.error(chalk.red(`Could not create exec_sql function: ${execSqlError.message}`));
          console.log(chalk.yellow('Trying direct SQL execution...'));
          
          // Try direct SQL execution as a fallback
          try {
            // This is a workaround since we can't directly execute SQL with supabase-js
            // We'll use a simple query to test connection
            const { data, error: testError } = await supabase.from('profiles').select('*').limit(1);
            
            if (testError) {
              throw new Error(testError.message);
            }
            
            console.log(chalk.green('Connection successful, but cannot execute SQL directly.'));
            console.log(chalk.yellow('Please execute the SQL script manually in the Supabase Dashboard.'));
            console.log(chalk.yellow('SQL Script to execute:'));
            console.log(sqlScript);
            return;
          } catch (directError) {
            console.error(chalk.red(`Direct execution failed: ${directError.message}`));
            return;
          }
        } else {
          console.log(chalk.green('exec_sql function created successfully.'));
          console.log(chalk.yellow(`Retrying deployment of function: ${functionName}...`));
          
          const { error: retryError } = await supabase.rpc('exec_sql', { sql_query: functionDef });
          
          if (retryError) {
            console.error(chalk.red(`Error on retry: ${retryError.message}`));
          } else {
            console.log(chalk.green(`Function ${functionName} deployed successfully.`));
          }
        }
      } else {
        console.log(chalk.green(`Function ${functionName} deployed successfully.`));
      }
    } catch (error) {
      console.error(chalk.red(`Unexpected error deploying function ${functionName}: ${error.message}`));
    }
  }
  
  console.log(chalk.blue('\n=== Deployment Summary ==='));
  console.log(chalk.yellow('Verifying functions...'));
  
  // Verify functions exist
  try {
    const { data, error } = await supabase.rpc('get_tables');
    
    if (error) {
      console.error(chalk.red(`Function verification failed: ${error.message}`));
      console.log(chalk.yellow('You may need to execute the SQL script manually in the Supabase Dashboard.'));
    } else {
      console.log(chalk.green('✅ Functions deployed and verified successfully!'));
      console.log(chalk.green('You can now run the production readiness check.'));
    }
  } catch (error) {
    console.error(chalk.red(`Function verification failed: ${error.message}`));
    console.log(chalk.yellow('You may need to execute the SQL script manually in the Supabase Dashboard.'));
  }
}

// Run the deployment
deployFunctions().catch(error => {
  console.error(chalk.red(`❌ Unexpected error: ${error.message}`));
  process.exit(1);
}); 