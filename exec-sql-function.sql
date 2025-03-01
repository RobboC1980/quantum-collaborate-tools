-- Create a function to execute SQL statements via RPC
-- This is needed for the deploy-check-functions.js script to work

CREATE OR REPLACE FUNCTION exec_sql(sql_query text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE sql_query;
END;
$$;

-- Grant usage to authenticated users
GRANT EXECUTE ON FUNCTION exec_sql(text) TO authenticated;

-- Test the function
SELECT exec_sql('SELECT 1');

-- Verify the function exists
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name = 'exec_sql'; 