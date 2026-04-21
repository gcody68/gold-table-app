
/*
  # Deduplicate menu items
  Keep only the earliest (lowest ctid) row per name+restaurant_id combination.
  Removes the duplicate rows created by multiple "Load Demo Items" / import clicks.
*/
DELETE FROM menu_items
WHERE id NOT IN (
  SELECT DISTINCT ON (name, restaurant_id) id
  FROM menu_items
  ORDER BY name, restaurant_id, created_at ASC
);
