/*
  # Fix menu item images to use Pexels URLs

  ## Summary
  The previous image URLs used source.unsplash.com which is no longer functional.
  This migration replaces all menu item images with working Pexels photo URLs
  matched to each item's food category.

  ## Changes
  - Updated `image_url` for all menu items in Drinks, Mains, and Sides categories
*/

-- Drinks
UPDATE menu_items SET image_url = 'https://images.pexels.com/photos/1202490/pexels-photo-1202490.jpeg?auto=compress&cs=tinysrgb&w=400'
WHERE name = 'Coconut Water' AND category = 'Drinks';

UPDATE menu_items SET image_url = 'https://images.pexels.com/photos/3407777/pexels-photo-3407777.jpeg?auto=compress&cs=tinysrgb&w=400'
WHERE name = 'Ginger Beer' AND category = 'Drinks';

UPDATE menu_items SET image_url = 'https://images.pexels.com/photos/792613/pexels-photo-792613.jpeg?auto=compress&cs=tinysrgb&w=400'
WHERE name = 'Hawaiian Sun Iced Tea' AND category = 'Drinks';

UPDATE menu_items SET image_url = 'https://images.pexels.com/photos/312418/pexels-photo-312418.jpeg?auto=compress&cs=tinysrgb&w=400'
WHERE name = 'Hot Chocolate' AND category = 'Drinks';

UPDATE menu_items SET image_url = 'https://images.pexels.com/photos/3016428/pexels-photo-3016428.jpeg?auto=compress&cs=tinysrgb&w=400'
WHERE name = 'Iced Matcha Latte' AND category = 'Drinks';

UPDATE menu_items SET image_url = 'https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg?auto=compress&cs=tinysrgb&w=400'
WHERE name = 'Kona Coffee' AND category = 'Drinks';

UPDATE menu_items SET image_url = 'https://images.pexels.com/photos/2109099/pexels-photo-2109099.jpeg?auto=compress&cs=tinysrgb&w=400'
WHERE name = 'Lilikoi Lemonade' AND category = 'Drinks';

UPDATE menu_items SET image_url = 'https://images.pexels.com/photos/1132047/pexels-photo-1132047.jpeg?auto=compress&cs=tinysrgb&w=400'
WHERE name = 'Mango Smoothie' AND category = 'Drinks';

UPDATE menu_items SET image_url = 'https://images.pexels.com/photos/338713/pexels-photo-338713.jpeg?auto=compress&cs=tinysrgb&w=400'
WHERE name = 'POG Juice' AND category = 'Drinks';

-- Mains
UPDATE menu_items SET image_url = 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400'
WHERE name = 'Ahi Poke Bowl' AND category = 'Mains';

UPDATE menu_items SET image_url = 'https://images.pexels.com/photos/725991/pexels-photo-725991.jpeg?auto=compress&cs=tinysrgb&w=400'
WHERE name = 'Coconut Shrimp Basket' AND category = 'Mains';

UPDATE menu_items SET image_url = 'https://images.pexels.com/photos/1516415/pexels-photo-1516415.jpeg?auto=compress&cs=tinysrgb&w=400'
WHERE name = 'Garlic Shrimp Plate' AND category = 'Mains';

UPDATE menu_items SET image_url = 'https://images.pexels.com/photos/2338407/pexels-photo-2338407.jpeg?auto=compress&cs=tinysrgb&w=400'
WHERE name = 'Huli Huli Chicken' AND category = 'Mains';

UPDATE menu_items SET image_url = 'https://images.pexels.com/photos/1640772/pexels-photo-1640772.jpeg?auto=compress&cs=tinysrgb&w=400'
WHERE name = 'Island Veggie Bowl' AND category = 'Mains';

UPDATE menu_items SET image_url = 'https://images.pexels.com/photos/1639557/pexels-photo-1639557.jpeg?auto=compress&cs=tinysrgb&w=400'
WHERE name = 'Kalua Pork Plate' AND category = 'Mains';

UPDATE menu_items SET image_url = 'https://images.pexels.com/photos/1639562/pexels-photo-1639562.jpeg?auto=compress&cs=tinysrgb&w=400'
WHERE name = 'Loco Moco' AND category = 'Mains';

UPDATE menu_items SET image_url = 'https://images.pexels.com/photos/3763847/pexels-photo-3763847.jpeg?auto=compress&cs=tinysrgb&w=400'
WHERE name = 'Mahi Mahi Grilled' AND category = 'Mains';

UPDATE menu_items SET image_url = 'https://images.pexels.com/photos/357756/pexels-photo-357756.jpeg?auto=compress&cs=tinysrgb&w=400'
WHERE name = 'Spam Musubi Deluxe' AND category = 'Mains';

UPDATE menu_items SET image_url = 'https://images.pexels.com/photos/1352270/pexels-photo-1352270.jpeg?auto=compress&cs=tinysrgb&w=400'
WHERE name = 'Teriyaki Steak' AND category = 'Mains';

-- Sides
UPDATE menu_items SET image_url = 'https://images.pexels.com/photos/1633578/pexels-photo-1633578.jpeg?auto=compress&cs=tinysrgb&w=400'
WHERE name = 'Crispy Wonton Chips' AND category = 'Sides';

UPDATE menu_items SET image_url = 'https://images.pexels.com/photos/1640774/pexels-photo-1640774.jpeg?auto=compress&cs=tinysrgb&w=400'
WHERE name = 'Garlic Edamame' AND category = 'Sides';

UPDATE menu_items SET image_url = 'https://images.pexels.com/photos/1382102/pexels-photo-1382102.jpeg?auto=compress&cs=tinysrgb&w=400'
WHERE name = 'Grilled Corn on the Cob' AND category = 'Sides';

UPDATE menu_items SET image_url = 'https://images.pexels.com/photos/1640773/pexels-photo-1640773.jpeg?auto=compress&cs=tinysrgb&w=400'
WHERE name = 'Jasmine Rice (Two Scoops)' AND category = 'Sides';

UPDATE menu_items SET image_url = 'https://images.pexels.com/photos/1640775/pexels-photo-1640775.jpeg?auto=compress&cs=tinysrgb&w=400'
WHERE name = 'Kim Chee' AND category = 'Sides';

UPDATE menu_items SET image_url = 'https://images.pexels.com/photos/1633578/pexels-photo-1633578.jpeg?auto=compress&cs=tinysrgb&w=400'
WHERE name = 'Mac & Cheese' AND category = 'Sides';

UPDATE menu_items SET image_url = 'https://images.pexels.com/photos/3026808/pexels-photo-3026808.jpeg?auto=compress&cs=tinysrgb&w=400'
WHERE name = 'Macaroni Salad' AND category = 'Sides';

UPDATE menu_items SET image_url = 'https://images.pexels.com/photos/1640771/pexels-photo-1640771.jpeg?auto=compress&cs=tinysrgb&w=400'
WHERE name = 'Pineapple Slaw' AND category = 'Sides';

UPDATE menu_items SET image_url = 'https://images.pexels.com/photos/1893556/pexels-photo-1893556.jpeg?auto=compress&cs=tinysrgb&w=400'
WHERE name = 'Sweet Potato Fries' AND category = 'Sides';

UPDATE menu_items SET image_url = 'https://images.pexels.com/photos/1633578/pexels-photo-1633578.jpeg?auto=compress&cs=tinysrgb&w=400'
WHERE name = 'Taro Chips' AND category = 'Sides';
