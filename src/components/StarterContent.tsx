import signatureDish from "@/assets/starter/signature-dish.jpg";
import gardenBowl from "@/assets/starter/garden-bowl.jpg";
import grilledFish from "@/assets/starter/grilled-fish.jpg";
import crispyFries from "@/assets/starter/crispy-fries.jpg";
import freshSmoothie from "@/assets/starter/fresh-smoothie.jpg";
import icedLatte from "@/assets/starter/iced-latte.jpg";

export const STARTER_ITEMS = [
  {
    name: "Signature Grilled Steak",
    description: "Premium cut, perfectly seared with herbs and house jus.",
    price: 28.95,
    category: "Mains",
    image_url: signatureDish,
    sort_order: 1,
  },
  {
    name: "Fresh Garden Bowl",
    description: "Mixed greens, avocado, cherry tomatoes, and citrus vinaigrette.",
    price: 14.50,
    category: "Mains",
    sort_order: 2,
    image_url: gardenBowl,
  },
  {
    name: "Grilled Fish Fillet",
    description: "Catch of the day with lemon butter sauce and fresh herbs.",
    price: 24.00,
    category: "Mains",
    sort_order: 3,
    image_url: grilledFish,
  },
  {
    name: "Crispy Golden Fries",
    description: "Hand-cut fries served with our signature dipping sauce.",
    price: 6.95,
    category: "Sides",
    sort_order: 4,
    image_url: crispyFries,
  },
  {
    name: "Berry Bliss Smoothie",
    description: "A refreshing blend of seasonal berries and fresh mint.",
    price: 8.50,
    category: "Drinks",
    sort_order: 5,
    image_url: freshSmoothie,
  },
  {
    name: "Iced Vanilla Latte",
    description: "Smooth espresso with vanilla cream over ice.",
    price: 6.00,
    category: "Drinks",
    sort_order: 6,
    image_url: icedLatte,
  },
];
