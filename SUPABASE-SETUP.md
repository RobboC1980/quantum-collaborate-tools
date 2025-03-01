# Supabase Setup Guide for QuantumScribe

This document provides instructions for setting up and configuring Supabase for the QuantumScribe application.

## Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [Supabase CLI](https://supabase.com/docs/guides/cli)

## Local Development Setup

1. **Install the Supabase CLI:**
   ```bash
   npm install -g supabase
   ```

2. **Login to Supabase:**
   ```bash
   supabase login
   ```

3. **Link your project:**
   ```bash
   supabase link --project-ref <your-project-id>
   ```
   - For QuantumScribe2: `scyvurlnvjmzbnsdiozf`
   - For QuantumScribe: `rndqphsyauhqhvkzgqwn`

4. **Create a `.env` file:**
   Copy the `.env.example` file to `.env` and fill in your Supabase credentials:
   ```bash
   cp .env.example .env
   ```
   
   Then edit the `.env` file with your Supabase credentials:
   ```
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

## Database Schema

The application uses the following tables:

### Profiles Table

```sql
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'user'::text,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own profile" 
  ON public.profiles 
  FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
  ON public.profiles 
  FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" 
  ON public.profiles 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

## Edge Functions

The application uses the following Edge Functions:

1. **admin-operations**: Handles administrative operations like user management
2. **generate-epic-description**: Generates descriptions for epics using AI
3. **generate-epic-stories**: Generates stories for epics using AI

To deploy or update an Edge Function:

```bash
supabase functions deploy <function-name>
```

## Authentication Setup

The application uses Supabase Auth with email/password authentication. Configure it in the Supabase Dashboard:

1. Go to Authentication > Providers
2. Enable Email provider
3. Configure Password settings (minimum length, etc.)
4. Set up redirect URLs (for password reset, etc.)

## Authorization

The application uses a role-based access control system:

1. **User Roles**:
   - `admin`: Can perform all operations
   - `user`: Limited to basic operations

2. **Row-Level Security**:
   - Tables are protected with RLS policies
   - Access is controlled based on user roles and ownership

## Troubleshooting

### Common Issues

1. **Type Errors**:
   - Run `npm install --save-dev @supabase/supabase-js` to ensure type definitions are available

2. **Authentication Issues**:
   - Verify your .env configuration
   - Check browser console for specific errors
   - Ensure Supabase auth settings are correctly configured

3. **Edge Function Deployment Errors**:
   - Make sure you're logged in (`supabase login`)
   - Verify you've linked the correct project

### Getting Help

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Discord Community](https://discord.supabase.com/) 