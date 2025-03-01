# QuantumScribe Database Setup and RLS Policies Deployment Guide

This guide provides instructions for setting up the database schema and deploying Row Level Security (RLS) policies to your Supabase project for QuantumScribe.

## Important: Database Schema Setup

Before deploying RLS policies, you need to ensure that the required tables exist in your Supabase project. We've detected that your project currently doesn't have the `projects`, `epics`, and `stories` tables that the RLS policies are trying to secure.

### Verify Tables Existence

You can verify if the required tables exist in your Supabase project by running:

```
npm run verify-tables
```

This script will check if the `projects`, `epics`, and `stories` tables exist and provide guidance on next steps.

### Create Tables via Script

If the tables don't exist, you can create them by running:

```
npm run create-tables
```

This script will execute the SQL statements in the `create-tables.sql` file to create the necessary tables.

## Option 1: Complete Setup via Supabase Dashboard (Recommended)

1. Go to the [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to the SQL Editor
4. Copy the contents of the `complete-setup.sql` file
5. Paste into the SQL Editor and run the query

This script will:
1. Create the necessary tables (`projects`, `epics`, `stories`)
2. Set up indexes for better performance
3. Create trigger functions for timestamp updates
4. Enable Row Level Security on all tables
5. Apply RLS policies to ensure proper data segregation
6. Set up storage bucket and policies

## Option 2: Step-by-Step Setup

If you prefer to set up the database schema and RLS policies separately:

### Step 2.1: Create Tables

1. Go to the [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to the SQL Editor
4. Copy the contents of the `create-tables.sql` file
5. Paste into the SQL Editor and run the query

Alternatively, you can run:
```
npm run create-tables
```

### Step 2.2: Deploy RLS Policies

After creating the tables, you can deploy the RLS policies:

1. Go to the [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to the SQL Editor
4. Copy the contents of the `rls-policies-to-execute.sql` file
5. Paste into the SQL Editor and run the query

Alternatively, you can run one of the deployment scripts mentioned in Option 3.

## Option 3: Deploy via Script

We've provided several scripts to deploy the RLS policies, but they require the tables to exist first:

### Prerequisites

- Node.js v18 or higher
- npm
- Supabase project with the QuantumScribe schema
- Supabase URL and service role key

### Setup

1. Make sure your `.env` file contains the following variables:
   ```
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   VITE_SUPABASE_SERVICE_KEY=your-service-role-key
   SUPABASE_DB_PASSWORD=your-database-password
   ```

2. Install dependencies:
   ```
   npm install
   ```

### Deployment Options

#### Option 3.1: Direct SQL Deployment

```
npm run deploy-rls-sql
```

This script will attempt to execute the SQL statements directly via the Supabase API. If it fails, it will output the SQL statements that need to be executed manually.

#### Option 3.2: CLI-based Deployment

```
npm run deploy-rls
```

This script attempts to use the Supabase CLI to deploy the RLS policies. It requires the Supabase CLI to be installed.

#### Option 3.3: REST API Deployment

```
npm run deploy-rls-direct
```

This script attempts to deploy the RLS policies using the Supabase REST API.

## Verification

After deploying the RLS policies, you should verify that they are working correctly:

```
npm run verify
```

This will run a series of tests to ensure that the RLS policies are properly enforced.

## Recommended Workflow

For the most reliable setup, we recommend the following workflow:

1. Verify if tables exist: `npm run verify-tables`
2. If tables don't exist, create them: `npm run create-tables`
3. Deploy RLS policies: `npm run deploy-rls-direct`
4. Verify everything works: `npm run verify`

If any step fails, follow the manual instructions using the Supabase Dashboard.

## Troubleshooting

### Table Does Not Exist

If you see an error like `ERROR: 42P01: relation "public.projects" does not exist`, you need to create the tables first using the `complete-setup.sql` or `create-tables.sql` file.

Run `npm run verify-tables` to check which tables are missing, then run `npm run create-tables` to create them.

### Type Mismatch Error

If you see an error like `ERROR: 42883: operator does not exist: text = uuid`, this is due to a type mismatch between text and UUID. We've fixed this issue in the SQL scripts by adding explicit casting for UUID comparisons.

### Invalid API Key

If you see an "Invalid API key" error, check that your `VITE_SUPABASE_SERVICE_KEY` is correct in your `.env` file.

### Unsupported HTTP Method

If you see an "Unsupported HTTP method: POST" error, use Option 1 (Deploy via Supabase Dashboard) instead.

### Database Connection Issues

If you see database connection issues, check that your `SUPABASE_DB_PASSWORD` is correct in your `.env` file.

## What These Policies Do

The RLS policies enforce the following security rules:

1. **Projects**: Users can only view, create, update, and delete their own projects.
2. **Epics**: Users can only view, create, update, and delete epics in their own projects.
3. **Stories**: Users can only view, create, update, and delete stories in their own epics or projects.
4. **Storage**: Users can only read, upload, update, and delete files in their own directory.

These policies ensure proper data segregation and prevent unauthorized access to data. 