/**
 * Table Creation Script
 * 
 * This script creates the required tables in your Supabase database
 * using the create-tables.sql file.
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
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

// Main function to create tables
const createTables = async () => {
  console.log(chalk.blue('=== Creating Required Tables ==='));
  
  try {
    // Check if the SQL file exists
    const sqlFilePath = './create-tables.sql';
    if (!fs.existsSync(sqlFilePath)) {
      console.error(chalk.red(`✗ SQL file not found: ${sqlFilePath}`));
      process.exit(1);
    }
    
    // Read the SQL file
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
    console.log(chalk.green('✓ SQL file loaded'));
    
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
    
    // Verify tables were created
    console.log(chalk.blue('\nVerifying tables were created...'));
    
    // Execute a query to check if the required tables exist
    const { data, error } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .in('table_name', ['projects', 'epics', 'stories']);
    
    if (error) {
      console.error(chalk.red(`Error verifying tables: ${error.message}`));
    } else {
      const existingTables = data.map(row => row.table_name);
      const requiredTables = ['projects', 'epics', 'stories'];
      const missingTables = [];
      
      requiredTables.forEach(table => {
        if (!existingTables.includes(table)) {
          missingTables.push(table);
          console.log(chalk.red(`✗ Table '${table}' was not created`));
        } else {
          console.log(chalk.green(`✓ Table '${table}' was created successfully`));
        }
      });
      
      if (missingTables.length > 0) {
        console.log(chalk.yellow('\nSome tables were not created. Please check the error messages above.'));
      } else {
        console.log(chalk.green('\n✓ All tables were created successfully!'));
        console.log(chalk.green('You can now apply RLS policies.'));
      }
    }
    
    console.log(chalk.green('\n✓ Table creation completed!'));
    console.log(chalk.blue('\nNext steps:'));
    console.log(chalk.blue('1. Apply RLS policies: npm run deploy-rls-direct'));
    console.log(chalk.blue('2. Verify everything is working: npm run verify'));
    
  } catch (error) {
    console.error(chalk.red(`\n✗ Table creation failed: ${error.message}`));
    process.exit(1);
  }
};

// Run the table creation
createTables(); 