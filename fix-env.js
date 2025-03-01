/**
 * Fix Environment Variables
 * 
 * This script fixes the .env file by ensuring SUPABASE_URL matches VITE_SUPABASE_URL.
 */

import fs from 'fs';
import chalk from 'chalk';

console.log(chalk.blue('=== Fixing Environment Variables ==='));

try {
  // Read the .env file
  const envFile = fs.readFileSync('.env', 'utf8');
  
  // Extract the VITE_SUPABASE_URL
  const viteUrlMatch = envFile.match(/VITE_SUPABASE_URL=([^\n]+)/);
  
  if (!viteUrlMatch) {
    console.error(chalk.red('Error: Could not find VITE_SUPABASE_URL in .env file.'));
    process.exit(1);
  }
  
  const viteUrl = viteUrlMatch[1].trim();
  console.log(chalk.green(`Found VITE_SUPABASE_URL: ${viteUrl}`));
  
  // Check if SUPABASE_URL exists and is different
  const supabaseUrlMatch = envFile.match(/SUPABASE_URL=([^\n]+)/);
  
  if (supabaseUrlMatch) {
    const supabaseUrl = supabaseUrlMatch[1].trim();
    
    if (supabaseUrl !== viteUrl) {
      console.log(chalk.yellow(`SUPABASE_URL is different: ${supabaseUrl}`));
      
      // Update the SUPABASE_URL
      const updatedEnv = envFile.replace(
        /SUPABASE_URL=([^\n]+)/,
        `SUPABASE_URL=${viteUrl}`
      );
      
      // Write the updated .env file
      fs.writeFileSync('.env', updatedEnv);
      console.log(chalk.green(`Updated SUPABASE_URL to match VITE_SUPABASE_URL: ${viteUrl}`));
    } else {
      console.log(chalk.green('SUPABASE_URL already matches VITE_SUPABASE_URL.'));
    }
  } else {
    console.log(chalk.yellow('SUPABASE_URL not found in .env file.'));
    
    // Add SUPABASE_URL
    const updatedEnv = envFile.replace(
      /(VITE_SUPABASE_URL=([^\n]+))/,
      `$1\nSUPABASE_URL=${viteUrl}`
    );
    
    // Write the updated .env file
    fs.writeFileSync('.env', updatedEnv);
    console.log(chalk.green(`Added SUPABASE_URL to match VITE_SUPABASE_URL: ${viteUrl}`));
  }
  
  // Extract the VITE_SUPABASE_SERVICE_KEY
  const viteServiceKeyMatch = envFile.match(/VITE_SUPABASE_SERVICE_KEY=([^\n]+)/);
  
  if (!viteServiceKeyMatch) {
    console.error(chalk.red('Error: Could not find VITE_SUPABASE_SERVICE_KEY in .env file.'));
    process.exit(1);
  }
  
  const viteServiceKey = viteServiceKeyMatch[1].trim();
  console.log(chalk.green('Found VITE_SUPABASE_SERVICE_KEY'));
  
  // Check if SUPABASE_SERVICE_ROLE_KEY exists and is different
  const serviceRoleKeyMatch = envFile.match(/SUPABASE_SERVICE_ROLE_KEY=([^\n]+)/);
  
  if (serviceRoleKeyMatch) {
    const serviceRoleKey = serviceRoleKeyMatch[1].trim();
    
    if (serviceRoleKey !== viteServiceKey) {
      console.log(chalk.yellow('SUPABASE_SERVICE_ROLE_KEY is different'));
      
      // Update the SUPABASE_SERVICE_ROLE_KEY
      const updatedEnv = fs.readFileSync('.env', 'utf8').replace(
        /SUPABASE_SERVICE_ROLE_KEY=([^\n]+)/,
        `SUPABASE_SERVICE_ROLE_KEY=${viteServiceKey}`
      );
      
      // Write the updated .env file
      fs.writeFileSync('.env', updatedEnv);
      console.log(chalk.green('Updated SUPABASE_SERVICE_ROLE_KEY to match VITE_SUPABASE_SERVICE_KEY'));
    } else {
      console.log(chalk.green('SUPABASE_SERVICE_ROLE_KEY already matches VITE_SUPABASE_SERVICE_KEY.'));
    }
  } else {
    console.log(chalk.yellow('SUPABASE_SERVICE_ROLE_KEY not found in .env file.'));
    
    // Add SUPABASE_SERVICE_ROLE_KEY
    const updatedEnv = fs.readFileSync('.env', 'utf8').replace(
      /(VITE_SUPABASE_SERVICE_KEY=([^\n]+))/,
      `$1\nSUPABASE_SERVICE_ROLE_KEY=${viteServiceKey}`
    );
    
    // Write the updated .env file
    fs.writeFileSync('.env', updatedEnv);
    console.log(chalk.green('Added SUPABASE_SERVICE_ROLE_KEY to match VITE_SUPABASE_SERVICE_KEY'));
  }
  
  console.log(chalk.blue('\n=== Environment Variables Fixed ==='));
  console.log(chalk.green('✅ .env file has been updated successfully!'));
  console.log(chalk.yellow('Please restart any running processes to apply the changes.'));
  
} catch (error) {
  console.error(chalk.red(`Error fixing environment variables: ${error.message}`));
  process.exit(1);
} 