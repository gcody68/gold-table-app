
/*
  # Link second admin user to the Gilded Table restaurant

  The user noedigc68@yahoo.com (e31bc366) has no restaurant linked.
  If they log in, they see Gilded Table's data via VITE_RESTAURANT_ID but cannot save.
  Create a separate restaurant_settings row for them so they get their own restaurant,
  OR if the intent is for them to co-own the same restaurant, update owner_id.

  For safety: insert a new restaurant for the second user only if they don't already have one.
*/
INSERT INTO restaurant_settings (business_name, owner_id)
SELECT 'My Restaurant', 'e31bc366-0b2c-40f1-8937-32538603a800'
WHERE NOT EXISTS (
  SELECT 1 FROM restaurant_settings WHERE owner_id = 'e31bc366-0b2c-40f1-8937-32538603a800'
);
