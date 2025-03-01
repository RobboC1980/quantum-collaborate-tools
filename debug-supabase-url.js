/**
 * Debug Supabase URL
 * 
 * This script checks what URL is actually being used when the Supabase client is initialized.
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import chalk from 'chalk';

// Load environment variables
dotenv.config();

console.log(chalk.blue('=== Debugging Supabase URL ==='));

// Get environment variables
const envVars = {
  'process.env.VITE_SUPABASE_URL': process.env.VITE_SUPABASE_URL,
  'process.env.SUPABASE_URL': process.env.SUPABASE_URL,
  'process.env.VITE_SUPABASE_SERVICE_KEY': process.env.VITE_SUPABASE_SERVICE_KEY ? 'Set (hidden)' : 'Not set',
  'process.env.SUPABASE_SERVICE_ROLE_KEY': process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Set (hidden)' : 'Not set',
};

console.log(chalk.yellow('Environment Variables:'));
Object.entries(envVars).forEach(([key, value]) => {
  console.log(`${key}: ${value}`);
});

// Check if there's a mismatch between the URL in the environment and what's being used
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.VITE_SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log(chalk.yellow('\nURL being used for Supabase client:'));
console.log(`SUPABASE_URL: ${SUPABASE_URL}`);

// Check if there's a hardcoded URL in the check-production-readiness.js file
console.log(chalk.yellow('\nChecking for hardcoded URL in check-production-readiness.js:'));
import fs from 'fs';

try {
  const fileContent = fs.readFileSync('check-production-readiness.js', 'utf8');
  const urlMatches = fileContent.match(/https:\/\/[a-zA-Z0-9-]+\.supabase\.co/g);
  
  if (urlMatches && urlMatches.length > 0) {
    console.log(chalk.red('Found hardcoded URLs:'));
    urlMatches.forEach(url => console.log(`- ${url}`));
  } else {
    console.log(chalk.green('No hardcoded URLs found.'));
  }
} catch (error) {
  console.log(chalk.red(`Error reading file: ${error.message}`));
}

// Check if the URL is being overridden somewhere
console.log(chalk.yellow('\nInitializing Supabase client to check actual URL used:'));
try {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  console.log(chalk.green(`Supabase client initialized with URL: ${SUPABASE_URL}`));
  
  // Try to make a simple request
  console.log(chalk.yellow('\nTesting connection:'));
  supabase.from('profiles').select('*', { count: 'exact', head: true })
    .then(({ count, error }) => {
      if (error) {
        console.log(chalk.red(`Connection error: ${error.message}`));
      } else {
        console.log(chalk.green(`Connection successful. Found ${count} profiles.`));
      }
    })
    .catch(error => {
      console.log(chalk.red(`Connection error: ${error.message}`));
    });
} catch (error) {
  console.log(chalk.red(`Error initializing Supabase client: ${error.message}`));
} 