#!/usr/bin/env node

/**
 * Script to start the development server with proper configuration checking
 */

import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import chalk from 'chalk';
import { fileURLToPath } from 'url';

// Get current file directory in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Check if .env file exists
const envPath = path.resolve(process.cwd(), '.env');
const envExamplePath = path.resolve(process.cwd(), '.env.example');

if (!fs.existsSync(envPath)) {
  console.log(chalk.yellow('No .env file found. Creating one from .env.example...'));
  
  if (fs.existsSync(envExamplePath)) {
    fs.copyFileSync(envExamplePath, envPath);
    console.log(chalk.green('.env file created successfully!'));
  } else {
    console.log(chalk.red('No .env.example file found. Please create a .env file manually.'));
    process.exit(1);
  }
}

// Read the .env file
const envContent = fs.readFileSync(envPath, 'utf8');
const envLines = envContent.split('\n');

// Check if QWEN_API_KEY is set in the server-side variables
const apiKeyLine = envLines.find(line => line.trim().startsWith('QWEN_API_KEY='));
if (!apiKeyLine || apiKeyLine.split('=')[1].trim() === '') {
  console.log(chalk.yellow(
    'Warning: QWEN_API_KEY is not set in your .env file.\n' +
    'API requests will use the proxy configuration for development.\n' +
    'If you want to use direct API calls, add your API key to the .env file.'
  ));
}

// Check if proxy settings are enabled in the Vite config
const viteConfigPath = path.resolve(process.cwd(), 'vite.config.ts');
const viteConfigContent = fs.readFileSync(viteConfigPath, 'utf8');

if (!viteConfigContent.includes('/api/qwen')) {
  console.log(chalk.yellow(
    'Warning: Proxy configuration for QWEN API is not found in vite.config.ts.\n' +
    'API requests may fail due to CORS issues. Please update your Vite configuration.'
  ));
}

// Start the development server
console.log(chalk.green('Starting development server...'));
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const dev = spawn(npm, ['run', 'dev'], { stdio: 'inherit' });

dev.on('close', (code) => {
  if (code !== 0) {
    console.log(chalk.red(`Development server exited with code ${code}`));
    process.exit(code);
  }
});

process.on('SIGINT', () => {
  dev.kill('SIGINT');
  process.exit(0);
}); 