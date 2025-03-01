-- Storage RLS Policies Only
-- This script only adds the storage RLS policies with multiple approaches

-- Enable RLS on storage.objects table if not already enabled
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Approach 1: Using explicit casting for auth.uid()
-- If this approach fails, try Approach 2 below
BEGIN;
  -- Drop existing policies if they exist
  DROP POLICY IF EXISTS "Users can read their own files" ON storage.objects;
  DROP POLICY IF EXISTS "Users can upload their own files" ON storage.objects;
  DROP POLICY IF EXISTS "Users can update their own files" ON storage.objects;
  DROP POLICY IF EXISTS "Users can delete their own files" ON storage.objects;

  -- Create policies with explicit casting
  CREATE POLICY "Users can read their own files" ON storage.objects
    FOR SELECT USING (auth.uid()::text = owner);

  CREATE POLICY "Users can upload their own files" ON storage.objects
    FOR INSERT WITH CHECK (auth.uid()::text = owner);

  CREATE POLICY "Users can update their own files" ON storage.objects
    FOR UPDATE USING (auth.uid()::text = owner);

  CREATE POLICY "Users can delete their own files" ON storage.objects
    FOR DELETE USING (auth.uid()::text = owner);
COMMIT;

-- If the above approach fails, uncomment and run this block:
/*
-- Approach 2: Using direct UUID comparison
BEGIN;
  -- Drop existing policies if they exist
  DROP POLICY IF EXISTS "Users can read their own files" ON storage.objects;
  DROP POLICY IF EXISTS "Users can upload their own files" ON storage.objects;
  DROP POLICY IF EXISTS "Users can update their own files" ON storage.objects;
  DROP POLICY IF EXISTS "Users can delete their own files" ON storage.objects;

  -- Create policies without casting
  CREATE POLICY "Users can read their own files" ON storage.objects
    FOR SELECT USING (auth.uid() = owner::uuid);

  CREATE POLICY "Users can upload their own files" ON storage.objects
    FOR INSERT WITH CHECK (auth.uid() = owner::uuid);

  CREATE POLICY "Users can update their own files" ON storage.objects
    FOR UPDATE USING (auth.uid() = owner::uuid);

  CREATE POLICY "Users can delete their own files" ON storage.objects
    FOR DELETE USING (auth.uid() = owner::uuid);
COMMIT;
*/

-- Verify the changes
SELECT 
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE schemaname = 'storage' AND tablename = 'objects'; 