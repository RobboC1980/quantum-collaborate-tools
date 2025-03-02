/**
 * Test Supabase Connection
 * 
 * This script tests if we can connect to Supabase with the service role key.
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import chalk from 'chalk';

// Load environment variables
dotenv.config();

console.log(chalk.blue('=== Testing Supabase Connection ==='));

// Get environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL;
console.log(`VITE_SUPABASE_URL: ${supabaseUrl ? 'Set' : 'Not set'}`);

const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
console.log(`VITE_SUPABASE_ANON_KEY: ${supabaseAnonKey ? 'Set' : 'Not set'}`);

const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_KEY;
console.log(`VITE_SUPABASE_SERVICE_KEY: ${supabaseServiceKey ? 'Set' : 'Not set'}`);

const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
console.log(`SUPABASE_SERVICE_ROLE_KEY: ${supabaseServiceRoleKey ? 'Set' : 'Not set'}`);

// Test connection with anon key
console.log(chalk.blue('\nTesting connection with anon key...'));
try {
  const anonClient = createClient(supabaseUrl, supabaseAnonKey);
  const { data: anonData, error: anonError } = await anonClient.from('profiles').select('*').limit(1);
  
  if (anonError) {
    console.log(chalk.red(`✗ Connection with anon key failed: ${anonError.message}`));
  } else {
    console.log(chalk.green('✓ Connection with anon key successful'));
    console.log(`Retrieved ${anonData.length} records from profiles table`);
  }
} catch (error) {
  console.log(chalk.red(`✗ Connection with anon key failed: ${error.message}`));
}

// Test connection with service key
console.log(chalk.blue('\nTesting connection with VITE_SUPABASE_SERVICE_KEY...'));
try {
  const serviceClient = createClient(supabaseUrl, supabaseServiceKey);
  const { data: serviceData, error: serviceError } = await serviceClient.from('profiles').select('*').limit(1);
  
  if (serviceError) {
    console.log(chalk.red(`✗ Connection with service key failed: ${serviceError.message}`));
  } else {
    console.log(chalk.green('✓ Connection with service key successful'));
    console.log(`Retrieved ${serviceData.length} records from profiles table`);
  }
} catch (error) {
  console.log(chalk.red(`✗ Connection with service key failed: ${error.message}`));
}

// Test connection with service role key
console.log(chalk.blue('\nTesting connection with SUPABASE_SERVICE_ROLE_KEY...'));
try {
  const serviceRoleClient = createClient(supabaseUrl, supabaseServiceRoleKey);
  const { data: serviceRoleData, error: serviceRoleError } = await serviceRoleClient.from('profiles').select('*').limit(1);
  
  if (serviceRoleError) {
    console.log(chalk.red(`✗ Connection with service role key failed: ${serviceRoleError.message}`));
  } else {
    console.log(chalk.green('✓ Connection with service role key successful'));
    console.log(`Retrieved ${serviceRoleData.length} records from profiles table`);
  }
} catch (error) {
  console.log(chalk.red(`✗ Connection with service role key failed: ${error.message}`));
}

// Test RPC function
console.log(chalk.blue('\nTesting RPC function call...'));
try {
  const serviceRoleClient = createClient(supabaseUrl, supabaseServiceRoleKey || supabaseServiceKey);
  const { data: rpcData, error: rpcError } = await serviceRoleClient.rpc('get_tables');
  
  if (rpcError) {
    console.log(chalk.red(`✗ RPC function call failed: ${rpcError.message}`));
  } else {
    console.log(chalk.green('✓ RPC function call successful'));
    console.log('Tables:', rpcData);
  }
} catch (error) {
  console.log(chalk.red(`✗ RPC function call failed: ${error.message}`));
} 