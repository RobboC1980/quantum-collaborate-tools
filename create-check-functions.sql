-- Create functions for production readiness checks

-- Function to list tables with RLS status
CREATE OR REPLACE FUNCTION get_tables()
RETURNS TABLE (name text, has_rls boolean) 
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    tables.table_name::text,
    EXISTS (
      SELECT 1 FROM pg_tables 
      WHERE tablename = tables.table_name 
      AND rowsecurity = true
    ) as has_rls
  FROM information_schema.tables tables
  WHERE tables.table_schema = 'public';
END;
$$;

-- Function to check RLS status for tables
CREATE OR REPLACE FUNCTION get_tables_with_rls_status()
RETURNS TABLE (name text, has_rls boolean) 
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    tables.table_name::text,
    EXISTS (
      SELECT 1 FROM pg_tables 
      WHERE tablename = tables.table_name 
      AND rowsecurity = true
    ) as has_rls
  FROM information_schema.tables tables
  WHERE tables.table_schema = 'public';
END;
$$;

-- Function to list RLS policies
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
  WHERE p.schemaname = 'public';
END;
$$;

-- Function to list indexes
CREATE OR REPLACE FUNCTION get_indexes()
RETURNS TABLE (indexname text, tablename text) 
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    i.indexname::text,
    i.tablename::text
  FROM pg_indexes i
  WHERE i.schemaname = 'public';
END;
$$; 