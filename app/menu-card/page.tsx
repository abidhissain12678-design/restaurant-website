"use client";

import { useMemo, useState } from "react";

type PriceOption = {
  size: "S" | "M" | "L" | "XL";
  price: number;
};

type MenuItem = {
  id: string;
  name: string;
  category: string;
  prices: number | PriceOption[];
  description?: string;
};

type CartItem = {
  cartId: string;
  id: string;
  name: string;
  category: string;
  size?: string;
  price: number;
  qty: number;
};

const categories = [
  "All",
  "Pizza",
  "Burgers",
  "Shawarma",
  "Wraps",
  "Chicken",
  "Wings",
  "Fries",
  "Drinks",
  "Nuggets",
  "Sides",
  "Deals",
];

const recommendedIds = [
  "pizza-white-flafe-special",
  "burger-jumbo-zinger",
  "deal-2",
  "wings-honey-10",
];

const menuItems: MenuItem[] = [
  { id: "pizza-kabab-special", name: "Kabab Special Pizza", category: "Pizza", prices: [{ size: "M", price: 1450 }, { size: "L", price: 2050 }, { size: "XL", price: 2700 }], description: "Signature kabab pizza with premium toppings." },
  { id: "pizza-donner-special", name: "Donner Special Pizza", category: "Pizza", prices: [{ size: "M", price: 1450 }, { size: "L", price: 2050 }, { size: "XL", price: 2700 }], description: "Classic donner pizza loaded with flavor." },
  { id: "pizza-malai-donner-special", name: "Malai Donner Special Pizza", category: "Pizza", prices: [{ size: "M", price: 1450 }, { size: "L", price: 2050 }, { size: "XL", price: 2700 }], description: "Creamy malai donner pizza for a rich taste." },
  { id: "pizza-crown-crust", name: "Crown Crust Pizza", category: "Pizza", prices: [{ size: "M", price: 1450 }, { size: "L", price: 2050 }, { size: "XL", price: 2700 }], description: "Premium crown crust pizza for special occasions." },
  { id: "pizza-white-flafe-special", name: "White Flafe Special Pizza", category: "Pizza", prices: [{ size: "S", price: 700 }, { size: "M", price: 1350 }, { size: "L", price: 1850 }, { size: "XL", price: 2500 }], description: "White sauce pizza topped with Flafe special ingredients." },
  { id: "pizza-malai-boti-special", name: "Malai Boti Special Pizza", category: "Pizza", prices: [{ size: "S", price: 700 }, { size: "M", price: 1350 }, { size: "L", price: 1850 }, { size: "XL", price: 2500 }], description: "Tender malai boti pizza with signature flavor." },
  { id: "pizza-chicken-tikka", name: "Chicken Tikka Pizza", category: "Pizza", prices: [{ size: "S", price: 700 }, { size: "M", price: 1300 }, { size: "L", price: 1750 }, { size: "XL", price: 2400 }], description: "Spiced chicken tikka pizza with fresh melted cheese." },
  { id: "pizza-cheeze-lover", name: "Cheeze Lover Pizza", category: "Pizza", prices: [{ size: "M", price: 1450 }, { size: "L", price: 2050 }, { size: "XL", price: 2700 }], description: "Cheese lovers dream pizza with extra gooey cheese." },
  { id: "pizza-hot-and-spicy", name: "Hot and Spicy Pizza", category: "Pizza", prices: [{ size: "S", price: 700 }, { size: "M", price: 1350 }, { size: "L", price: 1850 }, { size: "XL", price: 2500 }], description: "A hot and spicy pizza with bold seasoning." },
  { id: "pizza-chicken-fajita", name: "Chicken Fajita Pizza", category: "Pizza", prices: [{ size: "S", price: 700 }, { size: "M", price: 1350 }, { size: "L", price: 1800 }, { size: "XL", price: 2500 }], description: "Fajita-style chicken pizza with crisp veggies." },
  { id: "pizza-paratha", name: "Pizza Paratha", category: "Pizza", prices: 550, description: "Crispy pizza paratha with cheese and spices." },

  { id: "extra-topping-50", name: "Extra Topping 50", category: "Sides", prices: 50 },
  { id: "extra-topping-100", name: "Extra Topping 100", category: "Sides", prices: 100 },
  { id: "extra-topping-150", name: "Extra Topping 150", category: "Sides", prices: 150 },
  { id: "extra-topping-200", name: "Extra Topping 200", category: "Sides", prices: 200 },

  { id: "burger-jumbo-zinger", name: "Jumbo Zinger Burger", category: "Burgers", prices: 380 },
  { id: "burger-student-zinger", name: "Student Zinger Burger", category: "Burgers", prices: 320 },
  { id: "burger-sizzler", name: "Sizzler Burger", category: "Burgers", prices: 400 },
  { id: "burger-flafe-special", name: "Flafe Special Burger", category: "Burgers", prices: 590 },
  { id: "burger-double-decker", name: "Double Decker Burger", category: "Burgers", prices: 590 },
  { id: "burger-chicken-paty", name: "Chicken Paty Burger", category: "Burgers", prices: 250 },
  { id: "burger-chicken-grill", name: "Chicken Grill Burger", category: "Burgers", prices: 590 },
  { id: "burger-fish", name: "Fish Burger", category: "Burgers", prices: 500 },

  { id: "shawarma-chicken", name: "Chicken Shawarma", category: "Shawarma", prices: 270 },
  { id: "shawarma-zinger", name: "Zinger Shawarma", category: "Shawarma", prices: 350 },
  { id: "shawarma-chicken-pratha-roll", name: "Chicken Pratha Roll", category: "Shawarma", prices: 350 },
  { id: "shawarma-zinger-pratha-roll", name: "Zinger Pratha Roll", category: "Shawarma", prices: 350 },

  { id: "dip-bbq", name: "B.B.Q Dip", category: "Sides", prices: 70 },
  { id: "dip-mayo", name: "Mayo Dip", category: "Sides", prices: 70 },

  { id: "wrap-bar-bq", name: "Bar B.Q Wrap", category: "Wraps", prices: 400 },
  { id: "wrap-garlic-mayo", name: "Garlic Mayo Wrap", category: "Wraps", prices: 400 },

  { id: "fishchicken-1-fish", name: "1 Fish Piece", category: "Chicken", prices: 1100 },
  { id: "fishchicken-1-chicken", name: "1 Chicken Piece", category: "Chicken", prices: 250 },
  { id: "fishchicken-3-chicken", name: "3 Chicken Pieces", category: "Chicken", prices: 750 },
  { id: "fishchicken-5-chicken", name: "5 Chicken Pieces", category: "Chicken", prices: 1250 },

  { id: "wings-5", name: "5 Pieces Hot Wings", category: "Wings", prices: 350 },
  { id: "wings-10", name: "10 Pieces Hot Wings", category: "Wings", prices: 700 },
  { id: "wings-20", name: "20 Pieces Hot Wings", category: "Wings", prices: 1400 },
  { id: "wings-oven-baked-10", name: "Oven Baked Wings 10 Pieces", category: "Wings", prices: 700 },
  { id: "wings-honey-10", name: "Honey Wings 10 Pieces", category: "Wings", prices: 700 },

  { id: "fries-loaded", name: "Loaded Fries", category: "Fries", prices: 650 },
  { id: "fries-masala", name: "Masala Fries", category: "Fries", prices: 320 },
  { id: "fries-regular", name: "Regular Fries", category: "Fries", prices: 300 },
  { id: "fries-family", name: "Family Fries", category: "Fries", prices: 600 },
  { id: "fries-garlic-mayo-regular", name: "Garlic Mayo Fries Regular", category: "Fries", prices: 320 },

  { id: "drink-mint-margarita", name: "Mint Margarita", category: "Drinks", prices: 250 },
  { id: "drink-1-litre", name: "1 Litre Drink", category: "Drinks", prices: 190 },
  { id: "drink-1-5-litre", name: "1.5 Litre Drink", category: "Drinks", prices: 220 },
  { id: "drink-water-small", name: "Water Small", category: "Drinks", prices: 70 },
  { id: "drink-1-litre-water", name: "1 Litre Water", category: "Drinks", prices: 130 },
  { id: "drink-nr", name: "NR", category: "Drinks", prices: 90 },

  { id: "nuggets-5", name: "5 Pieces Nuggets", category: "Nuggets", prices: 300 },
  { id: "nuggets-10", name: "10 Pieces Nuggets", category: "Nuggets", prices: 600 },
  { id: "nuggets-20", name: "20 Pieces Nuggets", category: "Nuggets", prices: 1200 },

  { id: "baked-1-piece", name: "1 Piece Baked Chicken", category: "Chicken", prices: 250 },
  { id: "baked-3-pieces", name: "3 Pieces Baked Chicken", category: "Chicken", prices: 750 },
  { id: "baked-5-pieces", name: "5 Pieces Baked Chicken", category: "Chicken", prices: 1250 },

  { id: "side-chicken-cheese-stick", name: "Chicken Cheese Stick", category: "Sides", prices: 650 },
  { id: "side-coleslaw-salad", name: "Coleslaw Salad", category: "Sides", prices: 150 },
  { id: "side-flafe-special-alfredo", name: "Flafe Special Alfredo Pasta", category: "Sides", prices: 550 },
  { id: "side-russian-salad", name: "Russian Salad", category: "Sides", prices: 350 },
  { id: "side-spin-rolls", name: "Spin Rolls", category: "Sides", prices: 500 },

  { id: "deal-1", name: "Deal 1", category: "Deals", prices: 2800, description: "1 L Donner Pizza, 1 S Malai Boti Pizza, 1.5 Litre Pepsi" },
  { id: "deal-2", name: "Deal 2", category: "Deals", prices: 2650, description: "1 L Malai / White Flafe Special Pizza, 10 Wings / Nuggets, 1.5 Litre Pepsi" },
  { id: "deal-3", name: "Deal 3", category: "Deals", prices: 2500, description: "1 L Kabab / Donner / Crown Crust Pizza, 1 Russian Salad, 1.5 Litre Pepsi" },
  { id: "deal-4", name: "Deal 4", category: "Deals", prices: 4250, description: "2 L Kabab / Donner / Crown Crust Pizza, Coleslaw Salad, 1.5 Litre Pepsi" },
  { id: "deal-5", name: "Deal 5", category: "Deals", prices: 5500, description: "2 XL Any Special Pizza, 1.5 Litre Pepsi, Coleslaw Salad" },
  { id: "deal-6", name: "Deal 6", category: "Deals", prices: 3800, description: "2 L Malai Boti / White Flafe Special Pizza, 1.5 Litre Pepsi, Coleslaw Salad" },
  { id: "deal-7", name: "Deal 7", category: "Deals", prices: 620, description: "1 Zinger Burger / 1 Chicken Piece, 1 Regular Drink" },
  { id: "deal-8", name: "Deal 8", category: "Deals", prices: 460, description: "1 Jumbo Zinger Burger, 1 Regular Drink" },
  { id: "deal-9", name: "Deal 9", category: "Deals", prices: 1200, description: "2 Jumbo Zinger Burgers, 1 Regular Fries, 1 Litre Pepsi" },
  { id: "deal-10", name: "Deal 10", category: "Deals", prices: 1590, description: "2 Jumbo Zinger Burgers, 10 Wings, 1 Litre Pepsi" },
  { id: "deal-11", name: "Deal 11", category: "Deals", prices: 1850, description: "5 Zinger Burgers, 1.5 Litre Pepsi, Coleslaw Salad" },
  { id: "deal-12", name: "Deal 12", category: "Deals", prices: 2150, description: "5 Jumbo Zinger Burgers, 1.5 Litre Pepsi, Coleslaw Salad" },
];

function formatCurrency(value: number) {
  return `Rs ${value.toLocaleString("en-US")}`;
}

export default function MenuCardPage() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);

  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
      const categoryMatch = selectedCategory === "All" || item.category === selectedCategory;
      const searchTerm = search.trim().toLowerCase();
      const textMatch =
        item.name.toLowerCase().includes(searchTerm) ||
        item.category.toLowerCase().includes(searchTerm) ||
        (item.description?.toLowerCase().includes(searchTerm) ?? false);
      return categoryMatch && (searchTerm.length === 0 || textMatch);
    });
  }, [selectedCategory, search]);

  const categoriesToShow = useMemo(() => {
    if (selectedCategory === "All") return categories.slice(1);
    return [selectedCategory];
  }, [selectedCategory]);

  const groupedItems = useMemo(() => {
    return categoriesToShow.map((category) => ({
      category,
      items: filteredItems.filter((item) => item.category === category),
    }));
  }, [categoriesToShow, filteredItems]);

  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);
  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  const addToCart = (item: MenuItem, size?: string, price?: number) => {
    const selectedPrice = price ?? (typeof item.prices === "number" ? item.prices : 0);
    const cartId = `${item.id}-${size ?? "base"}`;

    setCart((prev) => {
      const existing = prev.find((entry) => entry.cartId === cartId);
      if (existing) {
        return prev.map((entry) =>
          entry.cartId === cartId ? { ...entry, qty: entry.qty + 1 } : entry
        );
      }
      return [
        ...prev,
        {
          cartId,
          id: item.id,
          name: item.name,
          category: item.category,
          size,
          price: selectedPrice,
          qty: 1,
        },
      ];
    });
  };

  const removeCartItem = (cartId: string) => {
    setCart((prev) => prev.filter((entry) => entry.cartId !== cartId));
  };

  const clearCart = () => setCart([]);

  const categoryLabel = selectedCategory === "All" ? "All Categories" : selectedCategory;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 rounded-[2rem] border border-slate-800 bg-slate-900/80 p-6 shadow-xl shadow-orange-500/10 lg:flex lg:items-center lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-orange-400">Flafe Complete Menu</p>
            <h1 className="mt-3 text-4xl font-black text-white sm:text-5xl">Complete Menu</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base">
              Browse every Flafe category, compare sizes, and add items directly to your local cart.
            </p>
          </div>
          <div className="mt-6 flex flex-col gap-3 sm:mt-0 sm:flex-row sm:items-center">
            <div className="relative w-full sm:w-80">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search menu items"
                className="w-full rounded-full border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none ring-1 ring-slate-800 placeholder:text-slate-500 focus:border-orange-400 focus:ring-orange-400/40"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`rounded-full border px-4 py-2 text-xs font-semibold transition ${
                    selectedCategory === category
                      ? "border-orange-400 bg-orange-400 text-slate-950"
                      : "border-slate-800 bg-slate-950 text-slate-300 hover:border-orange-400 hover:text-white"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>

        <section className="mb-8 rounded-[2rem] border border-slate-800 bg-slate-900/80 p-6 shadow-xl shadow-orange-500/10">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-orange-400">Recommended for you</p>
              <h2 className="mt-2 text-3xl font-black text-white">Top picks from Flafe</h2>
            </div>
            <p className="max-w-xl text-sm leading-6 text-slate-400">
              Hand-picked favourites to help you order fast — made for sharing, meals, and bigger cravings.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {menuItems
              .filter((item) => recommendedIds.includes(item.id))
              .map((item) => (
                <div key={item.id} className="rounded-[1.75rem] border border-slate-800 bg-slate-950 p-5 shadow-sm shadow-black/10">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.35em] text-orange-400">{item.category}</p>
                      <h3 className="mt-2 text-lg font-black text-white">{item.name}</h3>
                    </div>
                    <span className="rounded-full bg-slate-800 px-3 py-2 text-sm text-orange-300">
                      {typeof item.prices === "number"
                        ? formatCurrency(item.prices)
                        : item.prices[0]
                        ? `${item.prices[0].size} ${formatCurrency(item.prices[0].price)}`
                        : "-"}
                    </span>
                  </div>
                  {item.description ? <p className="mt-3 text-sm text-slate-400">{item.description}</p> : null}
                  <button
                    onClick={() => addToCart(item, typeof item.prices === "number" ? undefined : item.prices[0]?.size, typeof item.prices === "number" ? item.prices : item.prices[0]?.price)}
                    className="mt-5 w-full rounded-full bg-orange-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-orange-300"
                  >
                    Add to Cart
                  </button>
                </div>
              ))}
          </div>
        </section>

        <div className="grid gap-8 lg:grid-cols-[1.75fr_0.95fr]">
          <div className="space-y-6">
            {groupedItems.map(({ category, items }) => (
              <section key={category} className="rounded-[1.75rem] border border-slate-800 bg-slate-900/80 p-6 shadow-lg shadow-orange-500/5">
                <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-sm uppercase tracking-[0.35em] text-orange-400">{category}</p>
                    <h2 className="mt-2 text-2xl font-black text-white">{category} Menu</h2>
                  </div>
                  <span className="rounded-full bg-slate-800 px-4 py-2 text-sm text-slate-300">{items.length} items</span>
                </div>

                {items.length === 0 ? (
                  <div className="rounded-3xl border border-slate-800 bg-slate-950 px-5 py-12 text-center text-slate-500">
                    No matching items in this category.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {items.map((item) => (
                      <div key={item.id} className="rounded-3xl border border-slate-800 bg-slate-950 p-5 sm:p-6">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                          <div className="min-w-0">
                            <h3 className="text-lg font-black text-white sm:text-xl">{item.name}</h3>
                            {item.description ? <p className="mt-2 text-sm text-slate-400">{item.description}</p> : null}
                          </div>
                          <div className="flex flex-wrap items-center gap-3 text-sm font-semibold text-slate-200">
                            {typeof item.prices === "number" ? (
                              <span className="rounded-full bg-slate-800 px-3 py-2 text-orange-300">{formatCurrency(item.prices)}</span>
                            ) : (
                              <div className="flex flex-wrap items-center gap-2">
                                {item.prices.map((priceOption) => (
                                  <span key={priceOption.size} className="rounded-full bg-slate-800 px-3 py-2 text-orange-300">
                                    {priceOption.size} {formatCurrency(priceOption.price)}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="mt-4 flex flex-wrap gap-3">
                          {typeof item.prices === "number" ? (
                            <button
                              onClick={() => addToCart(item, undefined, item.prices as number)}
                              className="rounded-full bg-orange-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-orange-300"
                            >
                              Add to Cart
                            </button>
                          ) : (
                            item.prices.map((priceOption) => (
                              <button
                                key={priceOption.size}
                                onClick={() => addToCart(item, priceOption.size, priceOption.price)}
                                className="rounded-full bg-orange-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-orange-300"
                              >
                                Add {priceOption.size}
                              </button>
                            ))
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            ))}
          </div>

          <aside className="flex flex-col gap-6">
            <div className="hidden rounded-[1.75rem] border border-slate-800 bg-slate-900/90 p-6 shadow-lg shadow-orange-500/10 lg:block">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.35em] text-orange-400">Cart Summary</p>
                  <h3 className="mt-2 text-2xl font-black text-white">Your Cart</h3>
                </div>
                <span className="rounded-full bg-slate-800 px-3 py-1 text-sm text-slate-300">{cartCount} items</span>
              </div>

              {cart.length === 0 ? (
                <div className="rounded-3xl border border-slate-800 bg-slate-950 px-5 py-12 text-center text-slate-500">
                  Your cart is empty.
                </div>
              ) : (
                <div className="space-y-4">
                  {cart.map((entry) => (
                    <div key={entry.cartId} className="rounded-3xl border border-slate-800 bg-slate-950 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-white">{entry.name}</p>
                          <p className="mt-1 text-xs text-slate-400">
                            {entry.size ? `${entry.size} • ` : ""}Qty {entry.qty}
                          </p>
                        </div>
                        <button
                          onClick={() => removeCartItem(entry.cartId)}
                          className="text-sm font-semibold text-orange-400 hover:text-orange-300"
                        >
                          Remove
                        </button>
                      </div>
                      <div className="mt-3 flex items-center justify-between text-sm text-slate-300">
                        <span>Unit</span>
                        <span>{formatCurrency(entry.price)}</span>
                      </div>
                      <div className="mt-2 flex items-center justify-between text-base font-bold text-white">
                        <span>Total</span>
                        <span>{formatCurrency(entry.price * entry.qty)}</span>
                      </div>
                    </div>
                  ))}

                  <div className="rounded-3xl border border-slate-800 bg-slate-950 p-4">
                    <div className="flex items-center justify-between text-sm text-slate-400">
                      <span>Subtotal</span>
                      <span>{formatCurrency(cartTotal)}</span>
                    </div>
                    <button
                      onClick={clearCart}
                      className="mt-4 w-full rounded-full bg-slate-800 px-4 py-3 text-sm font-semibold text-slate-100 transition hover:bg-slate-700"
                    >
                      Clear Cart
                    </button>
                    <button
                      onClick={() => alert("Use the main checkout flow to complete your order.")}
                      className="mt-3 w-full rounded-full bg-orange-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-orange-300"
                      disabled={cart.length === 0}
                    >
                      Checkout
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="lg:hidden rounded-[1.75rem] border border-slate-800 bg-slate-900/90 p-6 shadow-lg shadow-orange-500/10">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.35em] text-orange-400">Cart</p>
                  <p className="mt-2 text-lg font-black text-white">{cartCount} items</p>
                </div>
              </div>

              {cart.length === 0 ? (
                <div className="rounded-3xl border border-slate-800 bg-slate-950 px-5 py-12 text-center text-slate-500">
                  Empty cart.
                </div>
              ) : (
                <div className="space-y-4">
                  {cart.map((entry) => (
                    <div key={entry.cartId} className="rounded-3xl border border-slate-800 bg-slate-950 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-white">{entry.name}</p>
                          <p className="mt-1 text-xs text-slate-400">
                            {entry.size ? `${entry.size} • ` : ""}Qty {entry.qty}
                          </p>
                        </div>
                        <button
                          onClick={() => removeCartItem(entry.cartId)}
                          className="text-sm font-semibold text-orange-400 hover:text-orange-300"
                        >
                          Remove
                        </button>
                      </div>
                      <div className="mt-3 flex items-center justify-between text-sm text-slate-300">
                        <span>Unit</span>
                        <span>{formatCurrency(entry.price)}</span>
                      </div>
                      <div className="mt-2 flex items-center justify-between text-base font-bold text-white">
                        <span>Total</span>
                        <span>{formatCurrency(entry.price * entry.qty)}</span>
                      </div>
                    </div>
                  ))}

                  <div className="rounded-3xl border border-slate-800 bg-slate-950 p-4">
                    <div className="flex items-center justify-between text-sm text-slate-400">
                      <span>Subtotal</span>
                      <span>{formatCurrency(cartTotal)}</span>
                    </div>
                    <button
                      onClick={clearCart}
                      className="mt-4 w-full rounded-full bg-slate-800 px-4 py-3 text-sm font-semibold text-slate-100 transition hover:bg-slate-700"
                    >
                      Clear Cart
                    </button>
                    <button
                      onClick={() => alert("Use the main checkout flow to complete your order.")}
                      className="mt-3 w-full rounded-full bg-orange-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-orange-300"
                      disabled={cart.length === 0}
                    >
                      Checkout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
