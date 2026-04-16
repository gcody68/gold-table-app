/*
  # Add logo_url to restaurant_settings

  ## Summary
  Adds a `logo_url` column to the `restaurant_settings` table to store the
  business logo uploaded by the admin. This logo is displayed in the navigation
  bar and on the order confirmation screen. If no logo is set, the business name
  is shown as a fallback.

  ## Changes
  - `restaurant_settings`
    - Added `logo_url` (text, nullable): URL to the uploaded business logo image
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'restaurant_settings' AND column_name = 'logo_url'
  ) THEN
    ALTER TABLE restaurant_settings ADD COLUMN logo_url text DEFAULT NULL;
  END IF;
END $$;
