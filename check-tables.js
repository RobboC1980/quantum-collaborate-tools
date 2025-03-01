/**
 * Script to check what tables exist in the Supabase database
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
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

const checkTables = async () => {
  console.log(chalk.blue('=== Checking Supabase Tables ==='));
  
  try {
    // Use SQL query to get tables
    const query = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
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
        query: query
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`SQL execution failed: ${errorText}`);
    }
    
    const data = await response.json();
    
    console.log(chalk.green('Tables in the public schema:'));
    
    if (data && data.length > 0) {
      data.forEach((table, index) => {
        console.log(chalk.cyan(`${index + 1}. ${table.table_name}`));
      });
    } else {
      console.log(chalk.yellow('No tables found in the public schema.'));
    }
    
    // Check if the specific tables we need exist
    const requiredTables = ['projects', 'epics', 'stories'];
    console.log(chalk.blue('\nChecking for required tables:'));
    
    requiredTables.forEach(tableName => {
      const exists = data && data.some(t => t.table_name === tableName);
      if (exists) {
        console.log(chalk.green(`✓ Table '${tableName}' exists`));
      } else {
        console.log(chalk.red(`✗ Table '${tableName}' does not exist`));
      }
    });
    
    // Try to get the actual table names that exist
    console.log(chalk.blue('\nTrying to get actual table names:'));
    
    // Try to access some common table names
    const commonTables = ['users', 'profiles', 'tasks', 'projects', 'epics', 'stories', 'items', 'products', 'orders'];
    
    for (const tableName of commonTables) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .limit(1);
        
        if (!error) {
          console.log(chalk.green(`✓ Table '${tableName}' exists and is accessible`));
        }
      } catch (error) {
        // Ignore errors
      }
    }
    
  } catch (error) {
    console.error(chalk.red(`\n✗ Error checking tables: ${error.message}`));
    
    // Try a different approach
    console.log(chalk.yellow('\nTrying a different approach to list tables...'));
    
    try {
      // Try to access some common table names
      const commonTables = ['users', 'profiles', 'tasks', 'projects', 'epics', 'stories', 'items', 'products', 'orders'];
      
      for (const tableName of commonTables) {
        try {
          const { data, error } = await supabase
            .from(tableName)
            .select('*')
            .limit(1);
          
          if (!error) {
            console.log(chalk.green(`✓ Table '${tableName}' exists and is accessible`));
          }
        } catch (error) {
          // Ignore errors
        }
      }
    } catch (fallbackError) {
      console.error(chalk.red(`\n✗ Fallback approach also failed: ${fallbackError.message}`));
    }
  }
};

// Run the check
checkTables(); 