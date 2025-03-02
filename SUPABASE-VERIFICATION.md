# QuantumScribe Supabase Integration Verification

This document provides instructions for verifying that your Supabase integration for QuantumScribe is correctly set up and ready for production.

## Prerequisites

- Node.js v18 or higher
- npm or yarn
- A Supabase project with the QuantumScribe schema already set up
- Your Supabase URL and anon key

## Setup

1. **Create a `.env` file** in the same directory as the verification script with the following content:

```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

2. **Install dependencies**:

```bash
# If using the separate package.json for verification
cp supabase-verification-package.json package.json
npm install

# Or if adding to existing project
npm install @supabase/supabase-js chalk dotenv uuid
```

## Running the Verification

Run the verification script:

```bash
node supabase-verification.js
```

The script will perform a series of tests to verify that your Supabase integration is working correctly:

1. **Authentication Tests**:
   - Creating test users
   - Signing in with the test users
   - Verifying session management

2. **Data Storage Tests**:
   - Creating projects, epics, and stories
   - Verifying relationships between entities
   - Testing CRUD operations

3. **Data Segregation Tests**:
   - Verifying that users can only access their own data
   - Testing row-level security policies

4. **Storage Tests**:
   - Creating and accessing storage buckets
   - Uploading and downloading files
   - Verifying file access permissions

## Interpreting Results

The verification script will output the results of each test with a ✓ (pass) or ✗ (fail) indicator. If all tests pass, your Supabase integration is correctly set up and ready for production.

Example output:

```
=== QuantumScribe Supabase Integration Verification ===

1. Testing Authentication
✓ Sign up user 1
✓ Sign up user 2
✓ Sign in user 1
✓ Sign in user 2

2. Testing Data Storage
✓ Create project
✓ Create epic
✓ Create story

3. Testing Data Segregation
✓ User 1 can read own project
✓ User 2 cannot read user 1's project
✓ User 1 can read own epic
✓ User 2 cannot read user 1's epic
✓ User 1 can read own story
✓ User 2 cannot read user 1's story

4. Testing Storage
✓ Create or verify bucket
✓ User 1 uploads file
✓ User 1 can access own file
✓ User 2 cannot access user 1's file

5. Cleaning up test data
✓ Delete test file
✓ Delete test story
✓ Delete test epic
✓ Delete test project

✓ Supabase integration verification completed successfully!
```

## Troubleshooting

If any tests fail, the script will provide error messages to help you identify and fix the issues:

### Common Issues

1. **Authentication Failures**:
   - Check that your Supabase URL and anon key are correct
   - Verify that email authentication is enabled in your Supabase project

2. **Data Storage Failures**:
   - Ensure your database schema matches the expected structure
   - Check that the required tables (projects, epics, stories) exist

3. **Data Segregation Failures**:
   - Verify that row-level security (RLS) policies are correctly set up
   - Check that the policies are enforcing the expected access controls

4. **Storage Failures**:
   - Ensure that storage is enabled in your Supabase project
   - Verify that the storage bucket exists and has the correct permissions

## Production Readiness Checklist

Before deploying to production, ensure:

1. **Security**:
   - Row-level security (RLS) policies are in place for all tables
   - Storage buckets have appropriate access controls
   - Authentication settings are properly configured

2. **Performance**:
   - Indexes are created for frequently queried columns
   - Database queries are optimized

3. **Reliability**:
   - Error handling is implemented throughout the application
   - Retry mechanisms are in place for critical operations

4. **Monitoring**:
   - Logging is set up to track important events
   - Alerts are configured for critical errors

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Storage Guide](https://supabase.com/docs/guides/storage)
- [Authentication Guide](https://supabase.com/docs/guides/auth) 