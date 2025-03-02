/**
 * Table Verification Script
 * 
 * This script checks if the required tables exist in your Supabase database
 * before applying RLS policies.
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import chalk from 'chalk';

// Load environment variables
dotenv.config();

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error(chalk.red('Error: Missing Supabase environment variables. Check your .env file.'));
  console.error(chalk.yellow('Required variables:'));
  console.error(chalk.yellow('- VITE_SUPABASE_URL: Your Supabase project URL'));
  console.error(chalk.yellow('- VITE_SUPABASE_SERVICE_KEY or SUPABASE_SERVICE_ROLE_KEY: Your Supabase service role key'));
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Main verification function
const verifyTables = async () => {
  console.log(chalk.blue('=== Verifying Required Tables ==='));
  
  try {
    // Execute a query to check if the required tables exist
    const { data, error } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .in('table_name', ['projects', 'epics', 'stories', 'profiles']);
    
    if (error) {
      console.error(chalk.red(`Error querying tables: ${error.message}`));
      
      // Try alternative method using REST API
      console.log(chalk.yellow('Trying alternative method...'));
      
      const checkTablesQuery = `
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name IN ('projects', 'epics', 'stories', 'profiles');
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
          query: checkTablesQuery
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(chalk.red(`Failed to verify tables: ${errorText}`));
        process.exit(1);
      }
      
      const result = await response.json();
      
      if (!result || !Array.isArray(result)) {
        console.error(chalk.red('Failed to get table information'));
        process.exit(1);
      }
      
      const existingTables = result.map(row => row.table_name);
      checkRequiredTables(existingTables);
    } else {
      const existingTables = data.map(row => row.table_name);
      checkRequiredTables(existingTables);
    }
  } catch (error) {
    console.error(chalk.red(`Verification failed: ${error.message}`));
    process.exit(1);
  }
};

// Helper function to check required tables
const checkRequiredTables = (existingTables) => {
  console.log(chalk.blue('\nChecking required tables...'));
  
  const requiredTables = ['projects', 'epics', 'stories'];
  const missingTables = [];
  
  console.log(chalk.yellow('Existing tables:'));
  existingTables.forEach(table => {
    console.log(`- ${table}`);
  });
  
  requiredTables.forEach(table => {
    if (!existingTables.includes(table)) {
      missingTables.push(table);
      console.log(chalk.red(`✗ Table '${table}' is missing`));
    } else {
      console.log(chalk.green(`✓ Table '${table}' exists`));
    }
  });
  
  if (missingTables.length > 0) {
    console.log(chalk.yellow('\nSome required tables are missing. You need to create them before applying RLS policies.'));
    console.log(chalk.yellow('Run the following command to create the missing tables:'));
    console.log(chalk.blue('npm run create-tables'));
    
    console.log(chalk.yellow('\nOr use the Supabase Dashboard SQL Editor to run the create-tables.sql script.'));
  } else {
    console.log(chalk.green('\n✓ All required tables exist!'));
    console.log(chalk.green('You can now safely apply RLS policies.'));
  }
};

// Run the verification
verifyTables(); 