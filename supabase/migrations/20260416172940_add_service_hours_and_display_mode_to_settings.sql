/*
  # Add Service Hours and Unavailable Display Mode to Restaurant Settings

  ## Summary
  Extends restaurant_settings with two new JSONB/text columns:
  1. `service_hours` (jsonb): Stores start/end times and enabled state for each meal period
     (breakfast, lunch, dinner). Defaults to the standard hardcoded times.
  2. `unavailable_display` (text): Controls how out-of-period items are shown to customers.
     Either 'hide' (remove from view) or 'gray' (show grayed-out with a disabled button).

  ## New Columns on `restaurant_settings`
  - `service_hours` (jsonb, nullable): JSON object with breakfast/lunch/dinner entries,
     each containing { enabled: boolean, start: "HH:MM", end: "HH:MM" }
  - `unavailable_display` (text, default 'hide'): 'hide' or 'gray'

  ## Notes
  - Existing rows will have NULL service_hours until the admin saves new settings,
    at which point the app falls back to the default hardcoded schedule.
  - unavailable_display defaults to 'hide' to preserve existing behavior.
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'restaurant_settings' AND column_name = 'service_hours'
  ) THEN
    ALTER TABLE restaurant_settings ADD COLUMN service_hours jsonb DEFAULT NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'restaurant_settings' AND column_name = 'unavailable_display'
  ) THEN
    ALTER TABLE restaurant_settings ADD COLUMN unavailable_display text NOT NULL DEFAULT 'hide';
  END IF;
END $$;
