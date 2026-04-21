import type { MealPeriod } from "@/hooks/useMenuItems";

export type StarterItem = {
  name: string;
  description: string;
  price: number;
  category: string;
  meal_period: MealPeriod;
  image_url: string;
  sort_order: number;
};

export const STARTER_ITEMS: StarterItem[] = [
  // === BREAKFAST ===
  {
    name: "Classic Eggs Benedict",
    description: "Two poached eggs with Canadian bacon on toasted English muffins topped with hollandaise.",
    price: 14.50,
    category: "Breakfast",
    meal_period: "breakfast",
    image_url: "https://images.pexels.com/photos/139746/pexels-photo-139746.jpeg?auto=compress&cs=tinysrgb&w=800",
    sort_order: 1,
  },
  {
    name: "Belgian Waffle Stack",
    description: "Thick malted waffles topped with fresh strawberries, whipped cream, and maple syrup.",
    price: 12.00,
    category: "Breakfast",
    meal_period: "breakfast",
    image_url: "https://images.pexels.com/photos/376464/pexels-photo-376464.jpeg?auto=compress&cs=tinysrgb&w=800",
    sort_order: 2,
  },
  {
    name: "Smoked Salmon Bagel",
    description: "Toasted everything bagel with cream cheese, capers, red onion, and lox.",
    price: 15.00,
    category: "Breakfast",
    meal_period: "breakfast",
    image_url: "https://images.pexels.com/photos/3491078/pexels-photo-3491078.jpeg?auto=compress&cs=tinysrgb&w=800",
    sort_order: 3,
  },
  {
    name: "Sunrise Protein Bowl",
    description: "Quinoa base with kale, sweet potato, black beans, and a sunny-side-up egg.",
    price: 13.25,
    category: "Specials",
    meal_period: "breakfast",
    image_url: "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=800",
    sort_order: 4,
  },
  {
    name: "Caramel Macchiato",
    description: "Double shot of espresso with steamed milk and a buttery caramel drizzle.",
    price: 5.50,
    category: "Drinks",
    meal_period: "all-day",
    image_url: "https://images.pexels.com/photos/312418/pexels-photo-312418.jpeg?auto=compress&cs=tinysrgb&w=800",
    sort_order: 5,
  },

  // === LUNCH ===
  {
    name: "Avocado Sourdough Toast",
    description: "Smashed avocado with radish, chili flakes, and a squeeze of lime on rustic sourdough.",
    price: 11.50,
    category: "Lunch",
    meal_period: "lunch",
    image_url: "https://images.pexels.com/photos/1640770/pexels-photo-1640770.jpeg?auto=compress&cs=tinysrgb&w=800",
    sort_order: 6,
  },
  {
    name: "Pesto Pasta Primavera",
    description: "Penne pasta with seasonal roasted vegetables and nut-free basil pesto.",
    price: 14.00,
    category: "Lunch",
    meal_period: "lunch",
    image_url: "https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg?auto=compress&cs=tinysrgb&w=800",
    sort_order: 7,
  },
  {
    name: "Turkey Club",
    description: "Turkey club sandwich on sourdough bread with three different types of cheese.",
    price: 8.50,
    category: "Lunch",
    meal_period: "lunch",
    image_url: "https://images.pexels.com/photos/1639557/pexels-photo-1639557.jpeg?auto=compress&cs=tinysrgb&w=800",
    sort_order: 8,
  },
  {
    name: "Fish Tacos",
    description: "Beer-battered cod with cabbage slaw, pico de gallo, and chipotle crema in warm corn tortillas.",
    price: 10.00,
    category: "Lunch",
    meal_period: "lunch",
    image_url: "https://images.pexels.com/photos/2092507/pexels-photo-2092507.jpeg?auto=compress&cs=tinysrgb&w=800",
    sort_order: 9,
  },

  // === DINNER ===
  {
    name: "Herb-Crusted Ribeye",
    description: "12oz prime ribeye with garlic mashed potatoes and grilled asparagus.",
    price: 32.00,
    category: "Dinner",
    meal_period: "dinner",
    image_url: "https://images.pexels.com/photos/1251208/pexels-photo-1251208.jpeg?auto=compress&cs=tinysrgb&w=800",
    sort_order: 10,
  },
  {
    name: "Pan-Seared Scallops",
    description: "Jumbo scallops over creamy mushroom risotto with a lemon butter drizzle.",
    price: 28.50,
    category: "Dinner",
    meal_period: "dinner",
    image_url: "https://images.pexels.com/photos/3655916/pexels-photo-3655916.jpeg?auto=compress&cs=tinysrgb&w=800",
    sort_order: 11,
  },
  {
    name: "Wagyu Burger",
    description: "Premium wagyu beef with truffle aioli, aged cheddar, and brioche bun.",
    price: 22.00,
    category: "Dinner",
    meal_period: "dinner",
    image_url: "https://images.pexels.com/photos/1639565/pexels-photo-1639565.jpeg?auto=compress&cs=tinysrgb&w=800",
    sort_order: 12,
  },

  // === DESSERTS ===
  {
    name: "New York Cheesecake",
    description: "Classic creamy cheesecake with a graham cracker crust and macerated strawberries.",
    price: 10.50,
    category: "Desserts",
    meal_period: "all-day",
    image_url: "https://images.pexels.com/photos/1126359/pexels-photo-1126359.jpeg?auto=compress&cs=tinysrgb&w=800",
    sort_order: 13,
  },
  {
    name: "Tiramisu Classico",
    description: "Layers of espresso-soaked ladyfingers and mascarpone cream dusted with cocoa.",
    price: 9.50,
    category: "Desserts",
    meal_period: "all-day",
    image_url: "https://images.pexels.com/photos/6880219/pexels-photo-6880219.jpeg?auto=compress&cs=tinysrgb&w=800",
    sort_order: 14,
  },
  {
    name: "Mixed Berry Parfait",
    description: "Greek yogurt layered with house-made granola, honey, and seasonal berries.",
    price: 8.50,
    category: "Desserts",
    meal_period: "all-day",
    image_url: "https://images.pexels.com/photos/1132558/pexels-photo-1132558.jpeg?auto=compress&cs=tinysrgb&w=800",
    sort_order: 15,
  },
  {
    name: "Apple Galette",
    description: "Rustic tart with spiced apples and a flaky, buttery crust.",
    price: 9.00,
    category: "Desserts",
    meal_period: "all-day",
    image_url: "https://images.pexels.com/photos/4110003/pexels-photo-4110003.jpeg?auto=compress&cs=tinysrgb&w=800",
    sort_order: 16,
  },

  // === DRINKS ===
  {
    name: "Fresh Lemonade",
    description: "House-made lemonade with cane sugar syrup and a sprig of fresh mint.",
    price: 5.00,
    category: "Drinks",
    meal_period: "all-day",
    image_url: "https://images.pexels.com/photos/96974/pexels-photo-96974.jpeg?auto=compress&cs=tinysrgb&w=800",
    sort_order: 17,
  },
  {
    name: "Peach Iced Tea",
    description: "Freshly brewed black tea infused with ripe peach, served over ice with a lemon wedge.",
    price: 5.00,
    category: "Drinks",
    meal_period: "all-day",
    image_url: "https://images.pexels.com/photos/792613/pexels-photo-792613.jpeg?auto=compress&cs=tinysrgb&w=800",
    sort_order: 18,
  },
  {
    name: "Mocha Hot Chocolate",
    description: "Rich dark chocolate blended with espresso and steamed milk.",
    price: 5.00,
    category: "Drinks",
    meal_period: "all-day",
    image_url: "https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg?auto=compress&cs=tinysrgb&w=800",
    sort_order: 19,
  },
  {
    name: "Green Tea",
    description: "Delicate whole-leaf green tea, gently steeped and served hot or over ice.",
    price: 5.00,
    category: "Drinks",
    meal_period: "all-day",
    image_url: "https://images.pexels.com/photos/1638280/pexels-photo-1638280.jpeg?auto=compress&cs=tinysrgb&w=800",
    sort_order: 20,
  },
];
