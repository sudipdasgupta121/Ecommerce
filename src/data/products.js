import { svgPlaceholder } from "../utils/placeholderImage.js";

// Product catalog seed data, loaded into Postgres by server/db/setup.js.
// The running app reads products from the database via /api/products, not this file.
export const CATEGORIES = ["Electronics", "Home & Kitchen", "Apparel", "Books"];

// Random stock photos don't match the product they're attached to. Instead, each
// product gets a placeholder image built from an emoji that actually represents it,
// on a background color tied to its category — so the image and the product always agree.
const CATEGORY_COLORS = {
  Electronics: "#dbeafe",
  "Home & Kitchen": "#fef3c7",
  Apparel: "#dcfce7",
  Books: "#fce7f3",
};

function productImage(category, emoji) {
  return svgPlaceholder({ emoji, bg: CATEGORY_COLORS[category] });
}

export const PRODUCTS = [
  {
    id: "p1",
    name: "Wireless Over-Ear Headphones",
    category: "Electronics",
    price: 89.99,
    stock: 14,
    image: productImage("Electronics", "🎧"),
    description:
      "Comfortable over-ear headphones with active noise cancellation and 30-hour battery life.",
  },
  {
    id: "p2",
    name: "Smart Fitness Watch",
    category: "Electronics",
    price: 129.0,
    stock: 8,
    image: productImage("Electronics", "⌚"),
    description:
      "Track workouts, heart rate, and sleep with a bright always-on display and 7-day battery.",
  },
  {
    id: "p3",
    name: "Portable Bluetooth Speaker",
    category: "Electronics",
    price: 45.5,
    stock: 22,
    image: productImage("Electronics", "🔊"),
    description: "Compact, waterproof speaker with surprisingly big sound. Pairs in seconds.",
  },
  {
    id: "p4",
    name: "USB-C Fast Charger (65W)",
    category: "Electronics",
    price: 24.99,
    stock: 40,
    image: productImage("Electronics", "🔌"),
    description: "Charge your laptop and phone at the same time with dual USB-C ports.",
  },
  {
    id: "p5",
    name: "Stainless Steel Cookware Set",
    category: "Home & Kitchen",
    price: 149.99,
    stock: 6,
    image: productImage("Home & Kitchen", "🍲"),
    description: "10-piece tri-ply cookware set that heats evenly and cleans up easily.",
  },
  {
    id: "p6",
    name: "Ceramic Nonstick Frying Pan",
    category: "Home & Kitchen",
    price: 29.99,
    stock: 18,
    image: productImage("Home & Kitchen", "🍳"),
    description: "PFOA-free nonstick coating that releases food effortlessly, oven-safe to 450°F.",
  },
  {
    id: "p7",
    name: "12-Cup Programmable Coffee Maker",
    category: "Home & Kitchen",
    price: 54.0,
    stock: 11,
    image: productImage("Home & Kitchen", "☕"),
    description: "Wake up to fresh coffee with a 24-hour programmable brew timer.",
  },
  {
    id: "p8",
    name: "Memory Foam Pillow (2-Pack)",
    category: "Home & Kitchen",
    price: 39.99,
    stock: 25,
    image: productImage("Home & Kitchen", "🛏️"),
    description: "Cooling gel-infused memory foam that contours to your neck and shoulders.",
  },
  {
    id: "p9",
    name: "Classic Cotton T-Shirt",
    category: "Apparel",
    price: 14.99,
    stock: 60,
    image: productImage("Apparel", "👕"),
    description: "Soft, breathable 100% cotton tee in a relaxed everyday fit.",
  },
  {
    id: "p10",
    name: "Water-Resistant Rain Jacket",
    category: "Apparel",
    price: 69.0,
    stock: 15,
    image: productImage("Apparel", "🧥"),
    description: "Lightweight packable jacket that keeps you dry without the bulk.",
  },
  {
    id: "p11",
    name: "Running Shoes",
    category: "Apparel",
    price: 79.99,
    stock: 20,
    image: productImage("Apparel", "👟"),
    description: "Responsive cushioning and breathable mesh for everyday training runs.",
  },
  {
    id: "p12",
    name: "Merino Wool Beanie",
    category: "Apparel",
    price: 19.99,
    stock: 33,
    image: productImage("Apparel", "🧢"),
    description: "Warm, itch-free merino wool beanie that packs flat for travel.",
  },
  {
    id: "p13",
    name: "Atomic Habits",
    category: "Books",
    price: 16.99,
    stock: 50,
    image: productImage("Books", "📘"),
    description: "A practical guide to building good habits and breaking bad ones.",
  },
  {
    id: "p14",
    name: "The Pragmatic Programmer",
    category: "Books",
    price: 34.99,
    stock: 12,
    image: productImage("Books", "📗"),
    description: "Timeless, practical advice for becoming a more effective software developer.",
  },
  {
    id: "p15",
    name: "Sourdough Baking Handbook",
    category: "Books",
    price: 22.5,
    stock: 9,
    image: productImage("Books", "🍞"),
    description: "A step-by-step guide to baking bakery-quality sourdough at home.",
  },
];

