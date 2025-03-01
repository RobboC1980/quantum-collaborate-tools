# Supabase Troubleshooting Guide

## Issues Identified

1. **Conflicting Supabase URLs in Environment Variables**
   - The `.env` file contained two different Supabase URLs:
     - `VITE_SUPABASE_URL=https://scyvurlnvjmzbnsdiozf.supabase.co` (working URL)
     - `SUPABASE_URL=https://caejehmaulzyypdxwvhy.supabase.co` (non-working URL)
   - The scripts were prioritizing `SUPABASE_URL` over `VITE_SUPABASE_URL`, causing connection failures.

2. **Missing Custom Database Functions**
   - The production readiness check script requires several custom functions to be created in your Supabase database:
     - `get_tables()`
     - `get_tables_with_rls_status()`
     - `get_policies()`
     - `get_indexes()`

## Solutions Applied

1. **Fixed URL Priority in Scripts**
   - Updated `check-production-readiness.js` to prioritize `VITE_SUPABASE_URL` over `SUPABASE_URL`.
   - Updated `debug-supabase-url.js` to prioritize `VITE_SUPABASE_URL` over `SUPABASE_URL`.

2. **Created SQL Script for Custom Functions**
   - The `create-check-functions.sql` file contains all the necessary functions for the production readiness checks.

## Next Steps

1. **Execute the Custom Functions SQL Script**
   - Log in to your Supabase Dashboard
   - Navigate to the SQL Editor
   - Copy the contents of `create-check-functions.sql`
   - Paste into the SQL Editor and run the query

2. **Run the Production Readiness Check Again**
   - After creating the custom functions, run `npm run check-production` again
   - This should now be able to check your database schema, RLS policies, and indexes

3. **Update Environment Variables (Optional)**
   - For consistency, you may want to update your `.env` file to use the same Supabase URL for both `VITE_SUPABASE_URL` and `SUPABASE_URL`.
   - Current recommendation: Keep using `VITE_SUPABASE_URL` as the primary URL.

## Verification

After executing the SQL script in Supabase, you can verify that the functions were created by running:

```sql
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_type = 'FUNCTION' 
AND routine_schema = 'public' 
AND routine_name IN ('get_tables', 'get_tables_with_rls_status', 'get_policies', 'get_indexes');
```

This query should return all four function names if they were created successfully.

## Troubleshooting Tips

- If you continue to experience "Invalid API key" errors, check that your service role key is correct and has not expired.
- If you get "Could not find function" errors, make sure you've executed the SQL script in the correct Supabase project.
- If you're unsure which Supabase URL to use, run the `debug-supabase-url.js` script to see which URL successfully connects. 