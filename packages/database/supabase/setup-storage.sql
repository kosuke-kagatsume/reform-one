-- =====================================================
-- Reform One: Supabase Storage Setup
-- =====================================================
-- This script creates storage buckets and policies for
-- image uploads.
--
-- Run this in Supabase SQL Editor
-- =====================================================

-- =====================================================
-- STEP 1: Create storage bucket
-- =====================================================

-- Create the images bucket (public for reading)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'images',
  'images',
  true,  -- Public bucket (anyone can read)
  5242880,  -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp'];

-- =====================================================
-- STEP 2: Storage RLS Policies
-- =====================================================

-- Policy: Anyone can view images (public read)
CREATE POLICY "Public read access for images"
ON storage.objects FOR SELECT
USING (bucket_id = 'images');

-- Policy: Only service_role can upload (via API)
CREATE POLICY "Service role can upload images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'images'
  AND auth.role() = 'service_role'
);

-- Policy: Only service_role can update
CREATE POLICY "Service role can update images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'images'
  AND auth.role() = 'service_role'
);

-- Policy: Only service_role can delete
CREATE POLICY "Service role can delete images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'images'
  AND auth.role() = 'service_role'
);

-- =====================================================
-- VERIFICATION
-- =====================================================
-- Run this to verify the bucket was created:
--
-- SELECT * FROM storage.buckets WHERE id = 'images';
--
-- Run this to verify policies:
--
-- SELECT * FROM pg_policies WHERE tablename = 'objects';
-- =====================================================
