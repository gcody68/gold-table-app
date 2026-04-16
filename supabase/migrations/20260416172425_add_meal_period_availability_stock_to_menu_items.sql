/*
  # Add Meal Period, Availability, and Daily Stock to Menu Items

  ## Summary
  Enhances menu items with three new features:
  1. Meal period tagging so items only appear during the correct time of day
  2. Quick disable toggle for admins to instantly hide sold-out or unavailable items
  3. Daily stock tracking that decrements when orders are placed

  ## New Columns on `menu_items`
  - `meal_period` (text, default 'all-day'): One of 'breakfast', 'lunch', 'dinner', 'all-day'
  - `is_available` (boolean, default true): Admin toggle to enable/disable the item
  - `daily_stock` (integer, nullable): Optional stock cap; null means unlimited

  ## Notes
  - Existing items default to 'all-day' and available=true to preserve current behaviour
  - daily_stock of NULL means no stock limit (unlimited)
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'menu_items' AND column_name = 'meal_period'
  ) THEN
    ALTER TABLE menu_items ADD COLUMN meal_period text NOT NULL DEFAULT 'all-day';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'menu_items' AND column_name = 'is_available'
  ) THEN
    ALTER TABLE menu_items ADD COLUMN is_available boolean NOT NULL DEFAULT true;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'menu_items' AND column_name = 'daily_stock'
  ) THEN
    ALTER TABLE menu_items ADD COLUMN daily_stock integer DEFAULT NULL;
  END IF;
END $$;
