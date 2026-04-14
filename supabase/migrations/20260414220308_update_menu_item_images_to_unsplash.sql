/*
  # Update menu item image URLs to Unsplash

  ## Summary
  Replaces all local/hashed asset image URLs stored in menu_items with
  publicly accessible Unsplash featured photo URLs. This ensures images
  load correctly on any domain (Vercel, etc.) instead of relying on
  bundled asset filenames that only exist in the local build.

  ## Changes
  - Updates image_url for all 29 starter menu items matched by name
  - Uses https://source.unsplash.com/featured/?<keywords> format
  - Safe UPDATE-only operation, no rows are deleted or created
*/

UPDATE public.menu_items SET image_url = 'https://source.unsplash.com/featured/?teriyaki,chicken'    WHERE name = 'Huli Huli Chicken';
UPDATE public.menu_items SET image_url = 'https://source.unsplash.com/featured/?burger,beef'          WHERE name = 'Loco Moco';
UPDATE public.menu_items SET image_url = 'https://source.unsplash.com/featured/?shrimp,seafood'       WHERE name = 'Garlic Shrimp Plate';
UPDATE public.menu_items SET image_url = 'https://source.unsplash.com/featured/?pulled,pork'          WHERE name = 'Kalua Pork Plate';
UPDATE public.menu_items SET image_url = 'https://source.unsplash.com/featured/?poke,bowl,tuna'       WHERE name = 'Ahi Poke Bowl';
UPDATE public.menu_items SET image_url = 'https://source.unsplash.com/featured/?grilled,fish,salmon'  WHERE name = 'Mahi Mahi Grilled';
UPDATE public.menu_items SET image_url = 'https://source.unsplash.com/featured/?steak,grilled'        WHERE name = 'Teriyaki Steak';
UPDATE public.menu_items SET image_url = 'https://source.unsplash.com/featured/?sushi,rice'           WHERE name = 'Spam Musubi Deluxe';
UPDATE public.menu_items SET image_url = 'https://source.unsplash.com/featured/?coconut,shrimp,fried' WHERE name = 'Coconut Shrimp Basket';
UPDATE public.menu_items SET image_url = 'https://source.unsplash.com/featured/?vegetable,bowl,healthy' WHERE name = 'Island Veggie Bowl';

UPDATE public.menu_items SET image_url = 'https://source.unsplash.com/featured/?macaroni,salad,pasta'  WHERE name = 'Macaroni Salad';
UPDATE public.menu_items SET image_url = 'https://source.unsplash.com/featured/?edamame,green,beans'   WHERE name = 'Garlic Edamame';
UPDATE public.menu_items SET image_url = 'https://source.unsplash.com/featured/?sweet,potato,fries'    WHERE name = 'Sweet Potato Fries';
UPDATE public.menu_items SET image_url = 'https://source.unsplash.com/featured/?coleslaw,salad'        WHERE name = 'Pineapple Slaw';
UPDATE public.menu_items SET image_url = 'https://source.unsplash.com/featured/?steamed,rice,bowl'     WHERE name = 'Jasmine Rice (Two Scoops)';
UPDATE public.menu_items SET image_url = 'https://source.unsplash.com/featured/?crispy,chips,fried'    WHERE name = 'Crispy Wonton Chips';
UPDATE public.menu_items SET image_url = 'https://source.unsplash.com/featured/?grilled,corn,cob'      WHERE name = 'Grilled Corn on the Cob';
UPDATE public.menu_items SET image_url = 'https://source.unsplash.com/featured/?kimchi,fermented,cabbage' WHERE name = 'Kim Chee';
UPDATE public.menu_items SET image_url = 'https://source.unsplash.com/featured/?chips,snack,crispy'    WHERE name = 'Taro Chips';
UPDATE public.menu_items SET image_url = 'https://source.unsplash.com/featured/?mac,cheese,pasta'      WHERE name = 'Mac & Cheese';

UPDATE public.menu_items SET image_url = 'https://source.unsplash.com/featured/?tropical,juice,fruit'  WHERE name = 'POG Juice';
UPDATE public.menu_items SET image_url = 'https://source.unsplash.com/featured/?coffee,espresso,cup'   WHERE name = 'Kona Coffee';
UPDATE public.menu_items SET image_url = 'https://source.unsplash.com/featured/?lemonade,citrus,drink' WHERE name = 'Lilikoi Lemonade';
UPDATE public.menu_items SET image_url = 'https://source.unsplash.com/featured/?coconut,water,tropical' WHERE name = 'Coconut Water';
UPDATE public.menu_items SET image_url = 'https://source.unsplash.com/featured/?mango,smoothie,tropical' WHERE name = 'Mango Smoothie';
UPDATE public.menu_items SET image_url = 'https://source.unsplash.com/featured/?matcha,latte,iced'     WHERE name = 'Iced Matcha Latte';
UPDATE public.menu_items SET image_url = 'https://source.unsplash.com/featured/?iced,tea,drink'        WHERE name = 'Hawaiian Sun Iced Tea';
UPDATE public.menu_items SET image_url = 'https://source.unsplash.com/featured/?ginger,beer,drink'     WHERE name = 'Ginger Beer';
UPDATE public.menu_items SET image_url = 'https://source.unsplash.com/featured/?hot,chocolate,cocoa'   WHERE name = 'Hot Chocolate';
