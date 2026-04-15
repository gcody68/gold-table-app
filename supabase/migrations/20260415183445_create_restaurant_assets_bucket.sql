/*
  # Create restaurant-assets public storage bucket

  ## Summary
  Creates a new public Supabase Storage bucket called 'restaurant-assets' to replace
  external URL image references. All uploaded images (menu items, gallery, headers)
  will be stored here and served via a stable Supabase CDN URL.

  ## Changes
  - New public bucket: restaurant-assets
  - Storage policies allowing public read and authenticated write/delete

  ## Notes
  - Uses IF NOT EXISTS pattern to be safe on re-runs
  - The bucket is public so images can be displayed without auth tokens
*/

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'restaurant-assets',
  'restaurant-assets',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public can view restaurant assets"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'restaurant-assets');

CREATE POLICY "Anyone can upload restaurant assets"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'restaurant-assets');

CREATE POLICY "Anyone can update restaurant assets"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'restaurant-assets');

CREATE POLICY "Anyone can delete restaurant assets"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'restaurant-assets');
