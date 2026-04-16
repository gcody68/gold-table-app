import type { MealPeriod } from "@/hooks/useMenuItems";

export type MockMenuItem = {
  name: string;
  description: string;
  price: number;
  category: string;
  meal_period: MealPeriod;
  image_url: string;
  sort_order: number;
};

export type MockGalleryItem = {
  image_url: string;
  caption: string;
};

export type MockRestaurantInfo = {
  business_name: string;
  business_address: string;
  business_phone: string;
};

export const MOCK_MENU_ITEMS: MockMenuItem[] = [
  {
    name: "Eggs Benedict",
    description: "Poached eggs on toasted English muffin with smoked ham and house hollandaise sauce.",
    price: 14.00,
    category: "Breakfast",
    meal_period: "breakfast",
    image_url: "https://images.pexels.com/photos/139746/pexels-photo-139746.jpeg",
    sort_order: 100,
  },
  {
    name: "Avocado Toast",
    description: "Smashed avocado on sourdough with chili flakes, poached egg, and everything bagel seasoning.",
    price: 12.00,
    category: "Breakfast",
    meal_period: "breakfast",
    image_url: "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg",
    sort_order: 101,
  },
  {
    name: "Fresh-Press Orange Juice",
    description: "Hand-squeezed Valencia oranges, served chilled with no added sugar.",
    price: 6.00,
    category: "Breakfast",
    meal_period: "breakfast",
    image_url: "https://images.pexels.com/photos/338713/pexels-photo-338713.jpeg",
    sort_order: 102,
  },
  {
    name: "Caesar Salad",
    description: "Romaine hearts, shaved parmesan, house-made croutons, and classic Caesar dressing.",
    price: 13.00,
    category: "Lunch",
    meal_period: "lunch",
    image_url: "https://images.pexels.com/photos/2097090/pexels-photo-2097090.jpeg",
    sort_order: 103,
  },
  {
    name: "Club Sandwich",
    description: "Triple-decker with turkey, bacon, lettuce, tomato, and aioli on toasted brioche.",
    price: 15.00,
    category: "Lunch",
    meal_period: "lunch",
    image_url: "https://images.pexels.com/photos/1639557/pexels-photo-1639557.jpeg",
    sort_order: 104,
  },
  {
    name: "Tomato Bisque",
    description: "Slow-roasted tomato soup with fresh basil cream and a warm sourdough roll.",
    price: 11.00,
    category: "Lunch",
    meal_period: "lunch",
    image_url: "https://images.pexels.com/photos/539451/pexels-photo-539451.jpeg",
    sort_order: 105,
  },
  {
    name: "Ribeye Steak",
    description: "16oz prime ribeye, dry-aged 28 days, served with truffle butter and garlic mashed potatoes.",
    price: 54.00,
    category: "Dinner",
    meal_period: "dinner",
    image_url: "https://images.pexels.com/photos/1251208/pexels-photo-1251208.jpeg",
    sort_order: 106,
  },
  {
    name: "Grilled Salmon",
    description: "Atlantic salmon fillet grilled over open flame with lemon-herb butter and seasonal vegetables.",
    price: 38.00,
    category: "Dinner",
    meal_period: "dinner",
    image_url: "https://images.pexels.com/photos/3655916/pexels-photo-3655916.jpeg",
    sort_order: 107,
  },
  {
    name: "Mushroom Risotto",
    description: "Arborio rice with wild mushrooms, white wine, parmesan, and fresh thyme.",
    price: 28.00,
    category: "Dinner",
    meal_period: "dinner",
    image_url: "https://images.pexels.com/photos/1437267/pexels-photo-1437267.jpeg",
    sort_order: 108,
  },
  {
    name: "Garlic Fries",
    description: "Crispy golden fries tossed in roasted garlic butter, parsley, and sea salt.",
    price: 8.00,
    category: "Sides",
    meal_period: "all-day",
    image_url: "https://images.pexels.com/photos/1583884/pexels-photo-1583884.jpeg",
    sort_order: 109,
  },
  {
    name: "Side Salad",
    description: "Mixed greens, cherry tomatoes, cucumber, and house vinaigrette.",
    price: 7.00,
    category: "Sides",
    meal_period: "all-day",
    image_url: "https://images.pexels.com/photos/1640774/pexels-photo-1640774.jpeg",
    sort_order: 110,
  },
  {
    name: "Gold Margarita",
    description: "Premium aged tequila, Cointreau, freshly squeezed lime, and a salted rim. Shaken to order.",
    price: 16.00,
    category: "Drinks",
    meal_period: "all-day",
    image_url: "https://images.pexels.com/photos/3407777/pexels-photo-3407777.jpeg",
    sort_order: 111,
  },
  {
    name: "Fresh Lemonade",
    description: "House-made lemonade with cane sugar syrup and a sprig of fresh mint.",
    price: 5.00,
    category: "Drinks",
    meal_period: "all-day",
    image_url: "https://images.pexels.com/photos/96974/pexels-photo-96974.jpeg",
    sort_order: 112,
  },
  {
    name: "Cold Brew Coffee",
    description: "Slow-steeped 18-hour cold brew served over ice with your choice of milk.",
    price: 6.00,
    category: "Drinks",
    meal_period: "all-day",
    image_url: "https://images.pexels.com/photos/312418/pexels-photo-312418.jpeg",
    sort_order: 113,
  },
];

export const MOCK_GALLERY_ITEMS: MockGalleryItem[] = [
  {
    image_url: "https://images.pexels.com/photos/262978/pexels-photo-262978.jpeg",
    caption: "Guests enjoying a memorable evening",
  },
  {
    image_url: "https://images.pexels.com/photos/696218/pexels-photo-696218.jpeg",
    caption: "Laughter and great food, always",
  },
  {
    image_url: "https://images.pexels.com/photos/941861/pexels-photo-941861.jpeg",
    caption: "Celebrations made special",
  },
  {
    image_url: "https://images.pexels.com/photos/67468/pexels-photo-67468.jpeg",
    caption: "Our welcoming dining room",
  },
  {
    image_url: "https://images.pexels.com/photos/1395967/pexels-photo-1395967.jpeg",
    caption: "Warm ambiance, every night",
  },
];

export const MOCK_RESTAURANT_INFO: MockRestaurantInfo = {
  business_name: "The Golden Fork",
  business_address: "88 Ocean Drive, Honolulu, HI 96815",
  business_phone: "(808) 555-0188",
};
