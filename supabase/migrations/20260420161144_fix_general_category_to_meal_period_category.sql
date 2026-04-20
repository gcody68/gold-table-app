/*
  # Fix menu items with 'General' category

  Items imported without a recognized category defaulted to 'General',
  which is not a valid display category. This migration maps them to
  the correct category based on their meal_period value.

  - breakfast meal_period → Breakfast category
  - lunch meal_period → Lunch category
  - dinner meal_period → Dinner category
  - all-day meal_period → Specials category (catch-all for uncategorized items)
*/

UPDATE menu_items
SET category = CASE meal_period
  WHEN 'breakfast' THEN 'Breakfast'
  WHEN 'lunch'     THEN 'Lunch'
  WHEN 'dinner'    THEN 'Dinner'
  ELSE 'Specials'
END
WHERE category = 'General';
