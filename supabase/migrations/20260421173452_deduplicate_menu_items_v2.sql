
/*
  # Deduplicate menu items (second pass)
  Keep only the earliest row per name+restaurant_id.
*/
DELETE FROM menu_items
WHERE id NOT IN (
  SELECT DISTINCT ON (name, restaurant_id) id
  FROM menu_items
  ORDER BY name, restaurant_id, created_at ASC
);
