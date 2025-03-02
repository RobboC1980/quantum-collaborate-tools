-- Function to execute SQL statements directly from client applications
-- This is used as a fallback mechanism in the deploy-rls-policies.js script

-- Create the function with SECURITY DEFINER to run with the privileges of the creator
CREATE OR REPLACE FUNCTION public.exec_sql(sql text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Execute the provided SQL statement
  EXECUTE sql;
END;
$$;

-- Add a comment to the function
COMMENT ON FUNCTION public.exec_sql(text) IS 'Executes SQL statements directly. Use with caution - this function runs with elevated privileges.';

-- Grant execute permission to authenticated users
-- This allows the function to be called via the Supabase client when authenticated
GRANT EXECUTE ON FUNCTION public.exec_sql(text) TO authenticated;

-- Add Row Level Security policy to restrict who can execute this function
-- Only allow users with the 'admin' role to execute this function
CREATE POLICY "Only admins can execute SQL" 
  ON public.exec_sql
  FOR ALL
  USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );

-- Create a helper function to check if the exec_sql function exists
CREATE OR REPLACE FUNCTION public.check_exec_sql_exists()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM pg_proc 
    WHERE proname = 'exec_sql' 
    AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
  );
END;
$$;

-- Output a success message
DO $$
BEGIN
  RAISE NOTICE 'exec_sql function created successfully.';
  RAISE NOTICE 'This function allows executing SQL statements directly from client applications.';
  RAISE NOTICE 'IMPORTANT: This function runs with elevated privileges. Use with caution.';
END $$; 