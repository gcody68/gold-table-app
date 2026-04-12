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
  { name: "Signature Grilled Steak", description: "Premium cut, perfectly seared with herbs and house jus.", price: 28.95, category: "Mains", image_url: signatureDish, sort_order: 1 },
  { name: "Fresh Garden Bowl", description: "Mixed greens, avocado, cherry tomatoes, and citrus vinaigrette.", price: 14.50, category: "Mains", image_url: gardenBowl, sort_order: 2 },
  { name: "Grilled Fish Fillet", description: "Catch of the day with lemon butter sauce and fresh herbs.", price: 24.00, category: "Mains", image_url: grilledFish, sort_order: 3 },
  { name: "Teriyaki Chicken Plate", description: "Glazed chicken thigh with steamed rice and pickled ginger.", price: 18.50, category: "Mains", image_url: teriyakiChicken, sort_order: 4 },
  { name: "Classic Cheeseburger", description: "Angus beef patty, cheddar, lettuce, tomato, and special sauce.", price: 16.95, category: "Mains", image_url: cheeseburger, sort_order: 5 },
  { name: "Pasta Carbonara", description: "Creamy egg-based sauce with pancetta and fresh parmesan.", price: 19.00, category: "Mains", image_url: pastaCarbonara, sort_order: 6 },
  { name: "Grilled Atlantic Salmon", description: "Pan-seared salmon with asparagus and lemon dill sauce.", price: 26.50, category: "Mains", image_url: grilledSalmon, sort_order: 7 },
  { name: "BBQ Pulled Pork Sandwich", description: "Slow-smoked pork with tangy slaw on a brioche bun.", price: 17.50, category: "Mains", image_url: bbqPulledPork, sort_order: 8 },
  { name: "Mushroom Risotto", description: "Arborio rice with wild mushrooms and truffle oil.", price: 20.00, category: "Mains", image_url: mushroomRisotto, sort_order: 9 },
  { name: "Shrimp Tacos", description: "Grilled shrimp, cilantro lime slaw, and chipotle aioli.", price: 15.95, category: "Mains", image_url: shrimpTacos, sort_order: 10 },

  // === SIDES (9) ===
  { name: "Crispy Golden Fries", description: "Hand-cut fries served with our signature dipping sauce.", price: 6.95, category: "Sides", image_url: crispyFries, sort_order: 11 },
  { name: "Chicken Caesar Salad", description: "Romaine, grilled chicken, croutons, and caesar dressing.", price: 12.50, category: "Sides", image_url: caesarSalad, sort_order: 12 },
  { name: "Garlic Parmesan Fries", description: "Crispy fries tossed with roasted garlic and aged parmesan.", price: 8.50, category: "Sides", image_url: garlicFries, sort_order: 13 },
  { name: "Creamy Coleslaw", description: "Shredded cabbage and carrots in a tangy creamy dressing.", price: 5.50, category: "Sides", image_url: coleslaw, sort_order: 14 },
  { name: "Sweet Potato Wedges", description: "Roasted wedges with chipotle mayo dipping sauce.", price: 7.95, category: "Sides", image_url: sweetPotatoWedges, sort_order: 15 },
  { name: "Mac & Cheese", description: "Three-cheese blend baked to golden perfection.", price: 9.50, category: "Sides", image_url: macCheese, sort_order: 16 },
  { name: "Grilled Street Corn", description: "Charred corn with butter, lime, and cotija cheese.", price: 6.50, category: "Sides", image_url: grilledCorn, sort_order: 17 },
  { name: "Crispy Onion Rings", description: "Beer-battered rings with smoky ranch dipping sauce.", price: 7.50, category: "Sides", image_url: onionRings, sort_order: 18 },
  { name: "Steamed Jasmine Rice", description: "Fluffy jasmine rice with toasted sesame seeds.", price: 4.00, category: "Sides", image_url: steamedRice, sort_order: 19 },

  // === DRINKS (8) ===
  { name: "Berry Bliss Smoothie", description: "A refreshing blend of seasonal berries and fresh mint.", price: 8.50, category: "Drinks", image_url: freshSmoothie, sort_order: 20 },
  { name: "Iced Vanilla Latte", description: "Smooth espresso with vanilla cream over ice.", price: 6.00, category: "Drinks", image_url: icedLatte, sort_order: 21 },
  { name: "Tropical Mango Smoothie", description: "Fresh mango, pineapple, and coconut milk blended smooth.", price: 9.00, category: "Drinks", image_url: mangoSmoothie, sort_order: 22 },
  { name: "Iced Plantation Tea", description: "House-brewed black tea with lemon and a touch of honey.", price: 4.50, category: "Drinks", image_url: icedTea, sort_order: 23 },
  { name: "Fresh Squeezed Lemonade", description: "Classic lemonade with fresh mint and a hint of ginger.", price: 5.50, category: "Drinks", image_url: lemonade, sort_order: 24 },
  { name: "Double Espresso", description: "Rich and bold double shot pulled to order.", price: 4.00, category: "Drinks", image_url: espresso, sort_order: 25 },
  { name: "Sparkling Lime Water", description: "Chilled sparkling water with fresh lime wedge.", price: 3.50, category: "Drinks", image_url: sparklingWater, sort_order: 26 },
  { name: "Craft Ginger Beer", description: "Spicy-sweet house ginger beer served chilled.", price: 5.00, category: "Drinks", image_url: gingerBeer, sort_order: 27 },
  { name: "Hot Chocolate", description: "Rich dark chocolate with whipped cream and cocoa dust.", price: 5.50, category: "Drinks", image_url: hotChocolate, sort_order: 28 },
  { name: "Garden Side Salad", description: "Mixed baby greens with balsamic vinaigrette.", price: 6.50, category: "Sides", image_url: sideSalad, sort_order: 29 },
];
