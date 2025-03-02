/**
 * Run Check Production with Fixed Environment Variables
 * 
 * This script sets the environment variables directly and then runs the check-production script.
 */

import { spawn } from 'child_process';
import chalk from 'chalk';

console.log(chalk.blue('=== Running Check Production with Fixed Environment Variables ==='));

// Set the correct environment variables
process.env.SUPABASE_URL = process.env.VITE_SUPABASE_URL;
process.env.SUPABASE_SERVICE_ROLE_KEY = process.env.VITE_SUPABASE_SERVICE_KEY;

console.log(chalk.green('Environment variables set:'));
console.log(`SUPABASE_URL: ${process.env.SUPABASE_URL}`);
console.log(`SUPABASE_SERVICE_ROLE_KEY: ${process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Set (hidden)' : 'Not set'}`);

// Run the check-production script
console.log(chalk.yellow('\nRunning check-production script...'));

const child = spawn('node', ['check-production-readiness.js'], {
  stdio: 'inherit',
  env: process.env
});

child.on('close', (code) => {
  if (code === 0) {
    console.log(chalk.green('\n✅ Check production completed successfully.'));
  } else {
    console.log(chalk.red(`\n❌ Check production failed with exit code ${code}.`));
  }
}); 