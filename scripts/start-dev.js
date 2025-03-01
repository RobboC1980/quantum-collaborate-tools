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

// Check if DASHSCOPE_API_KEY is set
const apiKeyLine = envLines.find(line => line.trim().startsWith('DASHSCOPE_API_KEY='));
if (!apiKeyLine || apiKeyLine.split('=')[1].trim() === '') {
  console.log(chalk.yellow(
    'Warning: DASHSCOPE_API_KEY is not set in your .env file.\n' +
    'AI features will not work properly without a valid DashScope API key.\n' +
    'Get your API key from the Alibaba Cloud DashScope service and add it to your .env file.'
  ));
}

// Check for API URL
const apiUrlLine = envLines.find(line => line.trim().startsWith('QWEN_API_URL='));
if (!apiUrlLine || !apiUrlLine.includes('dashscope-intl.aliyuncs.com')) {
  console.log(chalk.yellow(
    'Warning: QWEN_API_URL is not set to the DashScope API URL in your .env file.\n' +
    'Make sure it is set to https://dashscope-intl.aliyuncs.com/compatible-mode/v1'
  ));
}

// Check if proxy settings are enabled in the Vite config
const viteConfigPath = path.resolve(process.cwd(), 'vite.config.ts');
const viteConfigContent = fs.readFileSync(viteConfigPath, 'utf8');

if (!viteConfigContent.includes('/api/qwen')) {
  console.log(chalk.yellow(
    'Warning: Proxy configuration for AI API is not found in vite.config.ts.\n' +
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