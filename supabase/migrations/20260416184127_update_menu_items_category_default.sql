/*
  # Update menu_items category default

  ## Changes
  - Changes the default value of the `category` column from 'Mains' to 'Breakfast'
    to align with the new service-period-based category system where Breakfast,
    Lunch, and Dinner are the primary time-based categories.

  ## Notes
  - Existing rows are NOT affected (only new inserts without an explicit category get this default)
  - Safe, non-destructive change
*/

ALTER TABLE menu_items ALTER COLUMN category SET DEFAULT 'Breakfast';
