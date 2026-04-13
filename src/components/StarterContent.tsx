import signatureDish from "@/assets/starter/signature-dish.jpg";
import gardenBowl from "@/assets/starter/garden-bowl.jpg";
import grilledFish from "@/assets/starter/grilled-fish.jpg";
import crispyFries from "@/assets/starter/crispy-fries.jpg";
import freshSmoothie from "@/assets/starter/fresh-smoothie.jpg";
import icedLatte from "@/assets/starter/iced-latte.jpg";
import teriyakiChicken from "@/assets/starter/teriyaki-chicken.jpg";
import cheeseburger from "@/assets/starter/cheeseburger.jpg";
import pastaCarbonara from "@/assets/starter/pasta-carbonara.jpg";
import grilledSalmon from "@/assets/starter/grilled-salmon.jpg";
import bbqPulledPork from "@/assets/starter/bbq-pulled-pork.jpg";
import mushroomRisotto from "@/assets/starter/mushroom-risotto.jpg";
import shrimpTacos from "@/assets/starter/shrimp-tacos.jpg";
import caesarSalad from "@/assets/starter/caesar-salad.jpg";
import garlicFries from "@/assets/starter/garlic-fries.jpg";
import coleslaw from "@/assets/starter/coleslaw.jpg";
import sweetPotatoWedges from "@/assets/starter/sweet-potato-wedges.jpg";
import macCheese from "@/assets/starter/mac-cheese.jpg";
import grilledCorn from "@/assets/starter/grilled-corn.jpg";
import onionRings from "@/assets/starter/onion-rings.jpg";
import steamedRice from "@/assets/starter/steamed-rice.jpg";
import sideSalad from "@/assets/starter/side-salad.jpg";
import mangoSmoothie from "@/assets/starter/mango-smoothie.jpg";
import icedTea from "@/assets/starter/iced-tea.jpg";
import lemonade from "@/assets/starter/lemonade.jpg";
import espresso from "@/assets/starter/espresso.jpg";
import sparklingWater from "@/assets/starter/sparkling-water.jpg";
import gingerBeer from "@/assets/starter/ginger-beer.jpg";
import hotChocolate from "@/assets/starter/hot-chocolate.jpg";

export const STARTER_ITEMS = [
  // === MAINS (10) ===
  { name: "Huli Huli Chicken", description: "Hawaiian grilled chicken glazed with pineapple-soy sauce and served with steamed rice.", price: 18.95, category: "Mains", image_url: teriyakiChicken, sort_order: 1 },
  { name: "Loco Moco", description: "Rice, juicy beef patty, brown gravy, and a sunny-side-up egg. Island comfort food.", price: 16.50, category: "Mains", image_url: cheeseburger, sort_order: 2 },
  { name: "Garlic Shrimp Plate", description: "Buttery garlic shrimp sautéed North Shore style with jasmine rice.", price: 22.00, category: "Mains", image_url: shrimpTacos, sort_order: 3 },
  { name: "Kalua Pork Plate", description: "Slow-roasted pulled pork with cabbage, macaroni salad, and two scoops rice.", price: 19.50, category: "Mains", image_url: bbqPulledPork, sort_order: 4 },
  { name: "Ahi Poke Bowl", description: "Fresh cubed ahi tuna over sushi rice with avocado, edamame, and spicy mayo.", price: 24.95, category: "Mains", image_url: grilledFish, sort_order: 5 },
  { name: "Mahi Mahi Grilled", description: "Pan-seared mahi mahi with mango salsa, coconut rice, and grilled pineapple.", price: 26.50, category: "Mains", image_url: grilledSalmon, sort_order: 6 },
  { name: "Teriyaki Steak", description: "Premium ribeye glazed with house teriyaki, served with grilled vegetables.", price: 28.95, category: "Mains", image_url: signatureDish, sort_order: 7 },
  { name: "Spam Musubi Deluxe", description: "Crispy seared spam on sushi rice wrapped in nori, served in a trio.", price: 12.50, category: "Mains", image_url: pastaCarbonara, sort_order: 8 },
  { name: "Coconut Shrimp Basket", description: "Crispy coconut-crusted shrimp with sweet chili dipping sauce.", price: 17.95, category: "Mains", image_url: mushroomRisotto, sort_order: 9 },
  { name: "Island Veggie Bowl", description: "Roasted taro, sweet potato, avocado, quinoa, and macadamia nut pesto.", price: 15.50, category: "Mains", image_url: gardenBowl, sort_order: 10 },

  // === SIDES (10) ===
  { name: "Macaroni Salad", description: "Creamy Hawaiian-style mac salad — the essential plate lunch side.", price: 5.50, category: "Sides", image_url: coleslaw, sort_order: 11 },
  { name: "Garlic Edamame", description: "Steamed edamame tossed with roasted garlic and sea salt.", price: 6.95, category: "Sides", image_url: garlicFries, sort_order: 12 },
  { name: "Sweet Potato Fries", description: "Crispy sweet potato fries with li hing mui seasoning.", price: 7.95, category: "Sides", image_url: sweetPotatoWedges, sort_order: 13 },
  { name: "Pineapple Slaw", description: "Fresh cabbage slaw with pineapple, cilantro, and lime dressing.", price: 5.50, category: "Sides", image_url: caesarSalad, sort_order: 14 },
  { name: "Jasmine Rice (Two Scoops)", description: "Fluffy steamed jasmine rice, island-style double portion.", price: 3.50, category: "Sides", image_url: steamedRice, sort_order: 15 },
  { name: "Crispy Wonton Chips", description: "Fried wonton wrappers with sweet chili and wasabi cream.", price: 6.50, category: "Sides", image_url: crispyFries, sort_order: 16 },
  { name: "Grilled Corn on the Cob", description: "Charred corn with butter, furikake, and Kewpie mayo.", price: 6.50, category: "Sides", image_url: grilledCorn, sort_order: 17 },
  { name: "Kim Chee", description: "House-fermented spicy napa cabbage, tangy and crunchy.", price: 4.50, category: "Sides", image_url: sideSalad, sort_order: 18 },
  { name: "Taro Chips", description: "Thin-sliced taro root fried crisp with sea salt.", price: 7.50, category: "Sides", image_url: onionRings, sort_order: 19 },
  { name: "Mac & Cheese", description: "Three-cheese blend baked golden with panko breadcrumb topping.", price: 8.95, category: "Sides", image_url: macCheese, sort_order: 20 },

  // === DRINKS (9) ===
  { name: "POG Juice", description: "Classic passion fruit, orange, and guava blend — pure aloha in a glass.", price: 6.50, category: "Drinks", image_url: freshSmoothie, sort_order: 21 },
  { name: "Kona Coffee", description: "100% Kona-grown dark roast, served hot or iced.", price: 5.50, category: "Drinks", image_url: espresso, sort_order: 22 },
  { name: "Lilikoi Lemonade", description: "Fresh-squeezed lemonade with passion fruit and mint.", price: 6.00, category: "Drinks", image_url: lemonade, sort_order: 23 },
  { name: "Coconut Water", description: "Chilled fresh coconut water — naturally hydrating.", price: 4.50, category: "Drinks", image_url: sparklingWater, sort_order: 24 },
  { name: "Mango Smoothie", description: "Frozen mango, coconut milk, and banana blended smooth.", price: 8.50, category: "Drinks", image_url: mangoSmoothie, sort_order: 25 },
  { name: "Iced Matcha Latte", description: "Premium matcha whisked with oat milk over ice.", price: 6.50, category: "Drinks", image_url: icedLatte, sort_order: 26 },
  { name: "Hawaiian Sun Iced Tea", description: "Brewed black tea with tropical fruit infusion.", price: 4.50, category: "Drinks", image_url: icedTea, sort_order: 27 },
  { name: "Ginger Beer", description: "Spicy-sweet craft ginger beer, locally brewed.", price: 5.00, category: "Drinks", image_url: gingerBeer, sort_order: 28 },
  { name: "Hot Chocolate", description: "Rich dark chocolate with coconut whipped cream.", price: 5.50, category: "Drinks", image_url: hotChocolate, sort_order: 29 },
];
