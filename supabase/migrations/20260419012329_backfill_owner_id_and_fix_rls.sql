/*
  # Backfill owner_id and fix RLS for unclaimed restaurants

  ## Summary
  - Backfills the existing restaurant row with the admin@admin.local user's id
  - Adds an RLS policy that allows an authenticated user to claim a restaurant
    that has no owner yet (owner_id IS NULL), so the login backfill path works

  ## Changes
  - UPDATE restaurant_settings: set owner_id to the admin user for unowned rows
  - ADD POLICY: authenticated users can update restaurant rows where owner_id IS NULL
    (claim unowned restaurants)
*/

-- Backfill the single existing restaurant to the admin user
UPDATE restaurant_settings
SET owner_id = '7526926e-363f-4bbe-8197-a5342a49d7c3'
WHERE owner_id IS NULL;

-- Allow authenticated users to claim unowned restaurant rows
-- This covers the login backfill path
DROP POLICY IF EXISTS "Authenticated users can claim unowned restaurants" ON restaurant_settings;

CREATE POLICY "Authenticated users can claim unowned restaurants"
  ON restaurant_settings FOR UPDATE
  TO authenticated
  USING (owner_id IS NULL)
  WITH CHECK (auth.uid() = owner_id);
