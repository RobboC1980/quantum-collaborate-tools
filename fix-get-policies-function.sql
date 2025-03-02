-- Update the get_policies function to include storage schema policies

-- Drop the existing function
DROP FUNCTION IF EXISTS get_policies();

-- Create an updated version that includes storage schema
CREATE OR REPLACE FUNCTION get_policies()
RETURNS TABLE (tablename text, policyname text) 
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.tablename::text,
    p.policyname::text
  FROM pg_policies p
  WHERE p.schemaname IN ('public', 'storage');
END;
$$;

-- Test the function
SELECT * FROM get_policies();

-- Verify that storage policies are included
SELECT 
  policyname,
  tablename,
  schemaname
FROM pg_policies
WHERE schemaname = 'storage' AND tablename = 'objects'; 