-- Supabase Storage Setup for Development
-- Run these SQL commands in your Supabase SQL Editor

-- Option 1: Disable RLS for storage bucket (Development only)
-- This allows anyone to upload/download files - NOT for production!
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;
ALTER TABLE storage.buckets DISABLE ROW LEVEL SECURITY;

-- Option 2: Enable RLS with permissive policies (Recommended)
-- Comment out Option 1 above and use these instead:

-- Enable RLS
-- ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE storage.buckets ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to upload to 'onehacks' bucket
-- CREATE POLICY "Allow public uploads to onehacks bucket" ON storage.objects
--   FOR INSERT WITH CHECK (bucket_id = 'onehacks');

-- Create policy to allow anyone to view files in 'onehacks' bucket
-- CREATE POLICY "Allow public access to onehacks bucket" ON storage.objects
--   FOR SELECT USING (bucket_id = 'onehacks');

-- Create policy to allow anyone to delete files in 'onehacks' bucket
-- CREATE POLICY "Allow public deletes from onehacks bucket" ON storage.objects
--   FOR DELETE USING (bucket_id = 'onehacks');

-- Create policy to allow anyone to update files in 'onehacks' bucket
-- CREATE POLICY "Allow public updates to onehacks bucket" ON storage.objects
--   FOR UPDATE USING (bucket_id = 'onehacks');

-- Ensure the bucket exists and is public
-- INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
-- VALUES ('onehacks', 'onehacks', true, 52428800, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
-- ON CONFLICT (id) DO UPDATE SET public = true;