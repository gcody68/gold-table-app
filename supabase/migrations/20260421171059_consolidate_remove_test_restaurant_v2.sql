
/*
  # Consolidate restaurants - remove test account and merge data

  Migrates all data from the old test account (admin@admin.local, restaurant 69efaa6b)
  into the real account (admin@gmail.com, restaurant a9213ba1), then removes the
  old restaurant and auth user.
*/

-- Re-point all orders to the real restaurant
UPDATE orders
SET restaurant_id = 'a9213ba1-1703-496d-8b3e-07c39a5ed77e'
WHERE restaurant_id = '69efaa6b-e669-4cb4-8062-ed7a33713f84';

-- Move unique menu items from old restaurant to real restaurant
UPDATE menu_items
SET restaurant_id = 'a9213ba1-1703-496d-8b3e-07c39a5ed77e'
WHERE restaurant_id = '69efaa6b-e669-4cb4-8062-ed7a33713f84'
  AND name NOT IN (
    SELECT name FROM menu_items
    WHERE restaurant_id = 'a9213ba1-1703-496d-8b3e-07c39a5ed77e'
  );

-- Delete remaining duplicate menu items from old restaurant
DELETE FROM menu_items
WHERE restaurant_id = '69efaa6b-e669-4cb4-8062-ed7a33713f84';

-- Move gallery items
UPDATE gallery_items
SET restaurant_id = 'a9213ba1-1703-496d-8b3e-07c39a5ed77e'
WHERE restaurant_id = '69efaa6b-e669-4cb4-8062-ed7a33713f84';

-- Remove the old restaurant record
DELETE FROM restaurant_settings
WHERE id = '69efaa6b-e669-4cb4-8062-ed7a33713f84';

-- Remove the old test auth user
DELETE FROM auth.users
WHERE id = '7526926e-363f-4bbe-8197-a5342a49d7c3';
