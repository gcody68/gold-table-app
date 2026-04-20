/*
  # Add Business Hours to Restaurant Settings

  ## Summary
  Adds a `business_hours` JSON column to `restaurant_settings` to store the
  restaurant's overall operating window (open time and close time).

  This is separate from `service_hours` (which controls meal period shifts like
  Breakfast/Lunch/Dinner). Business hours define the full day boundary used by
  the Kitchen view to scope "today's" orders and reset totals at opening time.

  ## New Columns
  - `restaurant_settings.business_hours` (jsonb, nullable)
    Shape: { "open": "HH:MM", "close": "HH:MM" }
    Example: { "open": "06:00", "close": "23:00" }
    When null, the Kitchen view falls back to calendar midnight (00:00).

  ## Notes
  - Default value seeds a typical 06:00–23:00 window matching the existing
    breakfast/dinner shift defaults so existing installs behave predictably.
  - No destructive changes — purely additive.
*/

ALTER TABLE restaurant_settings
  ADD COLUMN IF NOT EXISTS business_hours jsonb DEFAULT '{"open": "06:00", "close": "23:00"}'::jsonb;
