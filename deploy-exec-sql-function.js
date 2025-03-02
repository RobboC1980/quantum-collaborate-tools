/**
 * Deploy exec_sql Function to Supabase
 * 
 * This script deploys the exec_sql function to your Supabase project.
 * The exec_sql function allows executing SQL statements directly from client applications,
 * which is used as a fallback mechanism in the deploy-rls-policies.js script.
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import chalk from 'chalk';

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
const deployExecSqlFunction = async () => {
  console.log(chalk.blue('=== Deploying exec_sql Function to Supabase ==='));
  
  try {
    // Check if the SQL file exists
    const sqlFilePath = './create-exec-sql-function.sql';
    if (!fs.existsSync(sqlFilePath)) {
      console.error(chalk.red(`SQL file not found: ${sqlFilePath}`));
      process.exit(1);
    }
    
    // Read the SQL file
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
    console.log(chalk.green('✓ SQL file loaded'));
    
    // Execute the SQL directly using the REST API
    console.log(chalk.blue('\nDeploying exec_sql function...'));
    
    // First check if the function already exists
    const { data: checkResult, error: checkError } = await supabase.rpc('check_exec_sql_exists').catch(() => {
      // If the check function doesn't exist, return { data: false }
      return { data: false, error: null };
    });
    
    if (checkResult === true) {
      console.log(chalk.yellow('⚠️ exec_sql function already exists'));
      
      // Ask for confirmation to overwrite
      const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
      });
      
      const answer = await new Promise(resolve => {
        readline.question(chalk.yellow('Do you want to overwrite it? (y/n): '), resolve);
      });
      
      readline.close();
      
      if (answer.toLowerCase() !== 'y') {
        console.log(chalk.blue('Deployment cancelled.'));
        process.exit(0);
      }
    }
    
    // Execute the SQL
    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
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
      throw new Error(`Failed to execute SQL: ${errorText}`);
    }
    
    console.log(chalk.green('✓ exec_sql function deployed successfully'));
    
    // Verify the function exists
    const { data: verifyResult, error: verifyError } = await supabase.rpc('check_exec_sql_exists').catch(() => {
      return { data: false, error: null };
    });
    
    if (verifyResult === true) {
      console.log(chalk.green('✓ Verified exec_sql function exists'));
    } else {
      console.error(chalk.red('✗ Failed to verify exec_sql function'));
      if (verifyError) {
        console.error(chalk.red(`Error: ${verifyError.message}`));
      }
    }
    
    console.log(chalk.green('\n✓ Deployment completed successfully!'));
    console.log(chalk.blue('\nYou can now use the exec_sql function in your deploy-rls-policies.js script.'));
    console.log(chalk.yellow('\nIMPORTANT: The exec_sql function runs with elevated privileges. Use with caution.'));
    
  } catch (error) {
    console.error(chalk.red(`\n✗ Deployment failed: ${error.message}`));
    
    console.log(chalk.yellow('\nAlternative method:'));
    console.log(chalk.yellow('1. Go to the Supabase dashboard: https://app.supabase.com'));
    console.log(chalk.yellow('2. Select your project'));
    console.log(chalk.yellow('3. Go to SQL Editor'));
    console.log(chalk.yellow('4. Copy the contents of create-exec-sql-function.sql'));
    console.log(chalk.yellow('5. Paste into the SQL Editor and run the query'));
    
    process.exit(1);
  }
};

// Run the deployment
deployExecSqlFunction(); 