const BASE = "https://gold-table-app.vercel.app";

export const STARTER_ITEMS = [
  // === BREAKFAST (6) ===
  { name: "Eggs Benedict", description: "Poached eggs on toasted English muffin with Canadian bacon and house hollandaise sauce.", price: 15.00, category: "Breakfast", image_url: `${BASE}/eggs-benny.jpg.png`, sort_order: 1 },
  { name: "Avocado Toast", description: "Smashed avocado on sourdough with chili flakes, poached egg, and everything bagel seasoning.", price: 13.00, category: "Breakfast", image_url: `${BASE}/avocado-toast.jpg.png`, sort_order: 2 },
  { name: "Belgian Waffle", description: "Golden crispy waffle topped with fresh berries, whipped cream, and warm maple syrup.", price: 14.00, category: "Breakfast", image_url: `${BASE}/belgian-waffle.jpg.png`, sort_order: 3 },
  { name: "Berry Parfait", description: "Greek yogurt layered with house-made granola, mixed berries, and honey.", price: 10.00, category: "Breakfast", image_url: `${BASE}/berry-parfait.jpg.png`, sort_order: 4 },
  { name: "Salmon Bagel", description: "Everything bagel with cream cheese, smoked salmon, capers, red onion, and dill.", price: 16.00, category: "Breakfast", image_url: `${BASE}/salmon-bagel.jpg.png`, sort_order: 5 },
  { name: "Caramel Macchiato", description: "Espresso poured over velvety steamed milk with rich caramel drizzle.", price: 7.00, category: "Breakfast", image_url: `${BASE}/caramel-macch.jpg.png`, sort_order: 6 },

  // === LUNCH (5) ===
  { name: "Caesar Salad", description: "Romaine hearts, shaved parmesan, house-made croutons, and classic Caesar dressing.", price: 14.00, category: "Lunch", image_url: `${BASE}/photo-1514362545857-3bc16c4c7d1b.png`, sort_order: 7 },
  { name: "Wagyu Burger", description: "6oz wagyu beef patty with aged cheddar, caramelized onions, truffle aioli, on a brioche bun.", price: 22.00, category: "Lunch", image_url: `${BASE}/wagyu-burger.jpg.png`, sort_order: 8 },
  { name: "Fish Tacos", description: "Beer-battered cod with cabbage slaw, pico de gallo, and chipotle crema in warm corn tortillas.", price: 18.00, category: "Lunch", image_url: `${BASE}/fish-tacos.jpg.png`, sort_order: 9 },
  { name: "Pesto Pasta", description: "Al dente penne tossed in house-made basil pesto with sun-dried tomatoes and pine nuts.", price: 19.00, category: "Lunch", image_url: `${BASE}/pesto-pasta.jpg.png`, sort_order: 10 },
  { name: "Protein Bowl", description: "Quinoa, grilled chicken, roasted chickpeas, avocado, cucumber, and lemon tahini dressing.", price: 20.00, category: "Lunch", image_url: `${BASE}/protein-bowl.jpg.png`, sort_order: 11 },

  // === DINNER (5) ===
  { name: "Ribeye Steak", description: "16oz prime ribeye, dry-aged 28 days, served with truffle butter and garlic mashed potatoes.", price: 58.00, category: "Dinner", image_url: `${BASE}/ribeye-steak.jpg.png`, sort_order: 12 },
  { name: "Seared Scallops", description: "Pan-seared diver scallops on sweet corn purée with crispy prosciutto and microgreens.", price: 42.00, category: "Dinner", image_url: `${BASE}/scallops.jpg.png`, sort_order: 13 },
  { name: "Tiramisu", description: "Classic Italian dessert with espresso-soaked ladyfingers, mascarpone cream, and cocoa dust.", price: 12.00, category: "Dinner", image_url: `${BASE}/tiramisu.jpg.png`, sort_order: 14 },
  { name: "Lemon Tart", description: "Buttery shortcrust pastry filled with silky lemon curd and toasted Italian meringue.", price: 11.00, category: "Dinner", image_url: `${BASE}/lemon-tart.jpg.png`, sort_order: 15 },
  { name: "Apple Galette", description: "Rustic free-form pastry with spiced apple filling, caramel drizzle, and vanilla bean ice cream.", price: 13.00, category: "Dinner", image_url: `${BASE}/apple-galette.jpg.png`, sort_order: 16 },

  // === DRINKS (3) ===
  { name: "Raspberry Lemonade", description: "House-made lemonade with fresh raspberries, cane sugar, and a sprig of mint.", price: 6.00, category: "Drinks", image_url: `${BASE}/rasp-lemonade.jpg.png`, sort_order: 17 },
  { name: "Cheesecake Shake", description: "Thick milkshake blended with house cheesecake, graham cracker crumble, and whipped cream.", price: 10.00, category: "Drinks", image_url: `${BASE}/cheesecake.jpg.png`, sort_order: 18 },
];
