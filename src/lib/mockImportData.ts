export type MockMenuItem = {
  name: string;
  description: string;
  price: number;
  category: string;
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
    name: "Ribeye Steak",
    description: "16oz prime ribeye, dry-aged 28 days, served with truffle butter and roasted garlic mashed potatoes.",
    price: 54.00,
    category: "Mains",
    image_url: "https://source.unsplash.com/featured/?ribeye,steak,grilled",
    sort_order: 100,
  },
  {
    name: "Grilled Salmon",
    description: "Atlantic salmon fillet grilled over open flame with lemon-herb butter and seasonal vegetables.",
    price: 38.00,
    category: "Mains",
    image_url: "https://source.unsplash.com/featured/?grilled,salmon,fillet",
    sort_order: 101,
  },
  {
    name: "Gold Margarita",
    description: "Premium aged tequila, Cointreau, freshly squeezed lime, and a salted rim. Shaken to order.",
    price: 16.00,
    category: "Drinks",
    image_url: "https://source.unsplash.com/featured/?margarita,cocktail,tequila",
    sort_order: 102,
  },
  {
    name: "Kona Longboard",
    description: "Crisp, island-brewed lager with notes of tropical citrus and a smooth, refreshing finish.",
    price: 9.00,
    category: "Drinks",
    image_url: "https://source.unsplash.com/featured/?beer,lager,cold",
    sort_order: 103,
  },
];

export const MOCK_GALLERY_ITEMS: MockGalleryItem[] = [
  {
    image_url: "https://source.unsplash.com/featured/?restaurant,diners,happy",
    caption: "Guests enjoying a memorable evening",
  },
  {
    image_url: "https://source.unsplash.com/featured/?restaurant,people,dining",
    caption: "Laughter and great food, always",
  },
  {
    image_url: "https://source.unsplash.com/featured/?friends,dinner,restaurant",
    caption: "Celebrations made special",
  },
  {
    image_url: "https://source.unsplash.com/featured/?dining,room,interior,restaurant",
    caption: "Our welcoming dining room",
  },
  {
    image_url: "https://source.unsplash.com/featured/?restaurant,interior,elegant",
    caption: "Warm ambiance, every night",
  },
];

export const MOCK_RESTAURANT_INFO: MockRestaurantInfo = {
  business_name: "The Golden Fork",
  business_address: "88 Ocean Drive, Honolulu, HI 96815",
  business_phone: "(808) 555-0188",
};
