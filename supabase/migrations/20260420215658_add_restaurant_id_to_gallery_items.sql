/*
  # Add restaurant_id to gallery_items

  ## Summary
  Adds multi-tenancy support to the gallery_items table by linking each gallery
  photo to a specific restaurant.

  ## Changes
  - `gallery_items`: New `restaurant_id` column (uuid, FK → restaurant_settings.id)
  - Backfills existing rows with the first restaurant_settings.id for backwards compat
  - Updates RLS: read policy stays public but add index for performance
  - Write policies updated to require restaurant ownership (matching menu_items pattern)

  ## Notes
  - Existing gallery items are assigned to the first restaurant to avoid data loss
  - New items must be inserted with a valid restaurant_id owned by the authenticated user
*/

-- 1. Add restaurant_id column
ALTER TABLE gallery_items
  ADD COLUMN IF NOT EXISTS restaurant_id uuid REFERENCES restaurant_settings(id) ON DELETE CASCADE;

-- 2. Backfill existing rows
DO $$
DECLARE
  first_restaurant_id uuid;
BEGIN
  SELECT id INTO first_restaurant_id FROM restaurant_settings LIMIT 1;
  IF first_restaurant_id IS NOT NULL THEN
    UPDATE gallery_items SET restaurant_id = first_restaurant_id WHERE restaurant_id IS NULL;
  END IF;
END $$;

-- 3. Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_gallery_items_restaurant_id ON gallery_items(restaurant_id);

-- 4. Drop old permissive write policies if they exist
DROP POLICY IF EXISTS "Admins can insert gallery items" ON gallery_items;
DROP POLICY IF EXISTS "Admins can delete gallery items" ON gallery_items;
DROP POLICY IF EXISTS "Admins can update gallery items" ON gallery_items;

-- 5. New owner-scoped write policies
CREATE POLICY "Owner can insert gallery items"
  ON gallery_items FOR INSERT
  TO authenticated
  WITH CHECK (
    restaurant_id IN (
      SELECT id FROM restaurant_settings WHERE owner_id = auth.uid()
    )
    OR (auth.jwt() -> 'app_metadata' ->> 'super_admin')::boolean IS TRUE
  );

CREATE POLICY "Owner can update gallery items"
  ON gallery_items FOR UPDATE
  TO authenticated
  USING (
    restaurant_id IN (
      SELECT id FROM restaurant_settings WHERE owner_id = auth.uid()
    )
    OR (auth.jwt() -> 'app_metadata' ->> 'super_admin')::boolean IS TRUE
  )
  WITH CHECK (
    restaurant_id IN (
      SELECT id FROM restaurant_settings WHERE owner_id = auth.uid()
    )
    OR (auth.jwt() -> 'app_metadata' ->> 'super_admin')::boolean IS TRUE
  );

CREATE POLICY "Owner can delete gallery items"
  ON gallery_items FOR DELETE
  TO authenticated
  USING (
    restaurant_id IN (
      SELECT id FROM restaurant_settings WHERE owner_id = auth.uid()
    )
    OR (auth.jwt() -> 'app_metadata' ->> 'super_admin')::boolean IS TRUE
  );
