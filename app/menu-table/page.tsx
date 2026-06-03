"use client";

import { useMemo, useState } from "react";
import { Button, Card, CardContent } from "@/components/ui";

type PizzaItem = {
  name: string;
  prices: Partial<Record<"S" | "M" | "L" | "XL", number>>;
};

type SimpleItem = {
  name: string;
  price: number;
};

type DealItem = {
  name: string;
  description: string;
  price: number;
};

type CartItem = {
  id: string;
  name: string;
  price: number;
  qty: number;
  category: string;
  size?: string;
};

const pizzaMenu: PizzaItem[] = [
  { name: "Kabab Special Pizza", prices: { M: 1450, L: 2050, XL: 2700 } },
  { name: "Donner Special Pizza", prices: { M: 1450, L: 2050, XL: 2700 } },
  { name: "Malai Donner Special Pizza", prices: { M: 1450, L: 2050, XL: 2700 } },
  { name: "Crown Crust Pizza", prices: { M: 1450, L: 2050, XL: 2700 } },
  { name: "White Flafe Special Pizza", prices: { S: 700, M: 1350, L: 1850, XL: 2500 } },
  { name: "Malai Boti Special Pizza", prices: { S: 700, M: 1350, L: 1850, XL: 2500 } },
  { name: "Chicken Tikka Pizza", prices: { S: 700, M: 1300, L: 1750, XL: 2400 } },
  { name: "Cheeze Lover Pizza", prices: { M: 1450, L: 2050, XL: 2700 } },
  { name: "Hot and Spicy Pizza", prices: { S: 700, M: 1350, L: 1850, XL: 2500 } },
  { name: "Chicken Fajita Pizza", prices: { S: 700, M: 1350, L: 1800, XL: 2500 } },
  { name: "Pizza Paratha", prices: { S: 550 } },
];

const extraToppings: SimpleItem[] = [
  { name: "50 topping", price: 50 },
  { name: "100 topping", price: 100 },
  { name: "150 topping", price: 150 },
  { name: "200 topping", price: 200 },
];

const burgers: SimpleItem[] = [
  { name: "Jumbo Zinger Burger", price: 380 },
  { name: "Student Zinger Burger", price: 320 },
  { name: "Sizzler Burger", price: 400 },
  { name: "Flafe Special Burger", price: 590 },
  { name: "Double Decker Burger", price: 590 },
  { name: "Chicken Paty Burger", price: 250 },
  { name: "Chicken Grill Burger", price: 590 },
  { name: "Fish Burger", price: 500 },
];

const shawarma: SimpleItem[] = [
  { name: "Chicken Shawarma", price: 270 },
  { name: "Zinger Shawarma", price: 350 },
  { name: "Chicken Pratha Roll", price: 350 },
  { name: "Zinger Pratha Roll", price: 350 },
];

const dips: SimpleItem[] = [
  { name: "B.B.Q Dip", price: 70 },
  { name: "Mayo Dip", price: 70 },
];

const wrapZilla: SimpleItem[] = [
  { name: "Bar B.Q Wrap", price: 400 },
  { name: "Garlic Mayo Wrap", price: 400 },
];

const fishAndChickenPcs: SimpleItem[] = [
  { name: "1 Fish Piece", price: 1100 },
  { name: "1 Chicken Piece", price: 250 },
  { name: "3 Chicken Pieces", price: 750 },
  { name: "5 Chicken Pieces", price: 1250 },
];

const hotWings: SimpleItem[] = [
  { name: "5 Pieces Hot Wings", price: 350 },
  { name: "10 Pieces Hot Wings", price: 700 },
  { name: "20 Pieces Hot Wings", price: 1400 },
  { name: "Oven Baked Wings 10 Pieces", price: 700 },
  { name: "Honey Wings 10 Pieces", price: 700 },
];

const fries: SimpleItem[] = [
  { name: "Loaded Fries", price: 650 },
  { name: "Masala Fries", price: 320 },
  { name: "Regular Fries", price: 300 },
  { name: "Family Fries", price: 600 },
  { name: "Garlic Mayo Fries Regular", price: 320 },
];

const drinks: SimpleItem[] = [
  { name: "Mint Margarita", price: 250 },
  { name: "1 Litre Drink", price: 190 },
  { name: "1.5 Litre Drink", price: 220 },
  { name: "Water Small", price: 70 },
  { name: "1 Litre Water", price: 130 },
  { name: "NR", price: 90 },
];

const nuggets: SimpleItem[] = [
  { name: "5 Pieces Nuggets", price: 300 },
  { name: "10 Pieces Nuggets", price: 600 },
  { name: "20 Pieces Nuggets", price: 1200 },
];

const bakedChickenPcs: SimpleItem[] = [
  { name: "1 Piece Baked Chicken", price: 250 },
  { name: "3 Pieces Baked Chicken", price: 750 },
  { name: "5 Pieces Baked Chicken", price: 1250 },
];

const sides: SimpleItem[] = [
  { name: "Chicken Cheese Stick", price: 650 },
  { name: "Coleslaw Salad", price: 150 },
  { name: "Flafe Special Alfredo Pasta", price: 550 },
  { name: "Russian Salad", price: 350 },
  { name: "Spin Rolls", price: 500 },
];

const specialPizzaDeals: DealItem[] = [
  { name: "Deal 1", description: "1 L Donner Pizza, 1 S Malai Boti Pizza, 1.5 Litre Pepsi", price: 2800 },
  { name: "Deal 2", description: "1 L Malai / White Flafe Special Pizza, 10 Wings / Nuggets, 1.5 Litre Pepsi", price: 2650 },
  { name: "Deal 3", description: "1 L Kabab / Donner / Crown Crust Pizza, 1 Russian Salad, 1.5 Litre Pepsi", price: 2500 },
  { name: "Deal 4", description: "2 L Kabab / Donner / Crown Crust Pizza, Coleslaw Salad, 1.5 Litre Pepsi", price: 4250 },
  { name: "Deal 5", description: "2 XL Any Special Pizza, 1.5 Litre Pepsi, Coleslaw Salad", price: 5500 },
  { name: "Deal 6", description: "2 L Malai Boti / White Flafe Special Pizza, 1.5 Litre Pepsi, Coleslaw Salad", price: 3800 },
];

const specialBurgerDeals: DealItem[] = [
  { name: "Deal 7", description: "1 Zinger Burger / 1 Chicken Piece, 1 Regular Drink", price: 620 },
  { name: "Deal 8", description: "1 Jumbo Zinger Burger, 1 Regular Drink", price: 460 },
  { name: "Deal 9", description: "2 Jumbo Zinger Burgers, 1 Regular Fries, 1 Litre Pepsi", price: 1200 },
  { name: "Deal 10", description: "2 Jumbo Zinger Burgers, 10 Wings, 1 Litre Pepsi", price: 1590 },
  { name: "Deal 11", description: "5 Zinger Burgers, 1.5 Litre Pepsi, Coleslaw Salad", price: 1850 },
  { name: "Deal 12", description: "5 Jumbo Zinger Burgers, 1.5 Litre Pepsi, Coleslaw Salad", price: 2150 },
];

const signatureFlavours: PizzaItem[] = [
  { name: "Kabab Special Pizza", prices: { M: 1450, L: 2050, XL: 2700 } },
  { name: "Donner Pizza", prices: { M: 1450, L: 2050, XL: 2700 } },
];

const pizzaSizes: Array<"S" | "M" | "L" | "XL"> = ["S", "M", "L", "XL"];

export default function MenuTablePage() {
  const [cart, setCart] = useState<CartItem[]>([]);

  const addToCart = (name: string, price: number, category: string, size?: string) => {
    setCart((current) => {
      const id = `${name}-${size ?? "default"}`;
      const existing = current.find((item) => item.id === id);
      if (existing) {
        return current.map((item) => item.id === id ? { ...item, qty: item.qty + 1 } : item);
      }
      return [...current, { id, name, price, category, size, qty: 1 }];
    });
  };

  const removeFromCart = (id: string) => {
    setCart((current) => current.filter((item) => item.id !== id));
  };

  const clearCart = () => setCart([]);

  const cartTotal = useMemo(() => cart.reduce((sum, item) => sum + item.price * item.qty, 0), [cart]);
  const cartCount = useMemo(() => cart.reduce((sum, item) => sum + item.qty, 0), [cart]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-10 rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-lg shadow-black/20">
          <p className="text-sm uppercase tracking-[0.35em] text-orange-400">Flafe Menu</p>
          <h1 className="mt-4 text-4xl font-black text-white sm:text-5xl">Restaurant Menu</h1>
          <p className="mt-3 max-w-3xl text-slate-400">Explore our complete category-wise menu with simple Add to Cart actions and a clean responsive layout.</p>
        </div>

        <div className="grid gap-8 xl:grid-cols-[1.7fr_0.9fr]">
          <div className="space-y-8">
            <CategorySection title="Pizza Menu" description="Choose from our signature pizzas and sizes." wide>
              <div className="overflow-x-auto rounded-3xl border border-slate-800 bg-slate-900 p-4">
                <table className="min-w-full border-separate border-spacing-0 text-left text-sm text-slate-200">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-300">
                      <th className="px-4 py-3">Item</th>
                      <th className="px-4 py-3">S</th>
                      <th className="px-4 py-3">M</th>
                      <th className="px-4 py-3">L</th>
                      <th className="px-4 py-3">XL</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pizzaMenu.map((item) => (
                      <tr key={item.name} className="border-b border-slate-800 last:border-b-0">
                        <td className="px-4 py-4 align-top text-white">{item.name}</td>
                        {pizzaSizes.map((size) => {
                          const price = item.prices[size];
                          return (
                            <td key={size} className="px-4 py-4 align-top">
                              {price ? (
                                <div className="flex flex-col gap-2">
                                  <span className="text-sm font-semibold text-white">Rs {price}</span>
                                  <Button
                                    onClick={() => addToCart(item.name, price, "Pizza", size)}
                                    className="rounded-full bg-orange-500 px-3 py-2 text-xs font-semibold text-white hover:bg-orange-400"
                                  >
                                    Add {size}
                                  </Button>
                                </div>
                              ) : (
                                <span className="text-slate-600">—</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CategorySection>

            <CategorySection title="Extra Pizza Topping" description="Add more flavor to your pizza." wide>
              <MenuTable items={extraToppings} category="Extra Pizza Topping" addToCart={addToCart} />
            </CategorySection>

            <CategorySection title="Burgers" description="Burgers crafted for maximum taste." wide>
              <MenuTable items={burgers} category="Burgers" addToCart={addToCart} />
            </CategorySection>

            <CategorySection title="Shawarma" description="Fresh shawarmas ready to enjoy." wide>
              <MenuTable items={shawarma} category="Shawarma" addToCart={addToCart} />
            </CategorySection>

            <CategorySection title="Dips" description="Perfect sides for your meal." wide>
              <MenuTable items={dips} category="Dips" addToCart={addToCart} />
            </CategorySection>

            <CategorySection title="Wrap Zilla" description="Big wraps with bold flavor." wide>
              <MenuTable items={wrapZilla} category="Wrap Zilla" addToCart={addToCart} />
            </CategorySection>

            <CategorySection title="Fish and Chicken PCS" description="Family-friendly portions of fish and chicken." wide>
              <MenuTable items={fishAndChickenPcs} category="Fish and Chicken PCS" addToCart={addToCart} />
            </CategorySection>

            <CategorySection title="Hot Wings" description="Wings with crispy spice and crunch." wide>
              <MenuTable items={hotWings} category="Hot Wings" addToCart={addToCart} />
            </CategorySection>

            <CategorySection title="Fries" description="Crispy sides for any order." wide>
              <MenuTable items={fries} category="Fries" addToCart={addToCart} />
            </CategorySection>

            <CategorySection title="Drinks" description="Refreshments to complete every meal." wide>
              <MenuTable items={drinks} category="Drinks" addToCart={addToCart} />
            </CategorySection>

            <CategorySection title="Nuggets" description="Crunchy nuggets for shareable snacking." wide>
              <MenuTable items={nuggets} category="Nuggets" addToCart={addToCart} />
            </CategorySection>

            <CategorySection title="Baked Chicken PCS" description="Oven-baked chicken by the piece." wide>
              <MenuTable items={bakedChickenPcs} category="Baked Chicken PCS" addToCart={addToCart} />
            </CategorySection>

            <CategorySection title="Sides" description="Extras for a richer meal experience." wide>
              <MenuTable items={sides} category="Sides" addToCart={addToCart} />
            </CategorySection>

            <CategorySection title="Special Pizza Deals" description="Value bundles with pizza, sides, and drinks." wide>
              <DealTable deals={specialPizzaDeals} category="Special Pizza Deals" addToCart={addToCart} />
            </CategorySection>

            <CategorySection title="Special Burger Deals" description="Burger combos with snacks and drinks." wide>
              <DealTable deals={specialBurgerDeals} category="Special Burger Deals" addToCart={addToCart} />
            </CategorySection>

            <CategorySection title="Signature Flavours" description="Our most popular signature pizza options." wide>
              <div className="overflow-x-auto rounded-3xl border border-slate-800 bg-slate-900 p-4">
                <table className="min-w-full border-separate border-spacing-0 text-left text-sm text-slate-200">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-300">
                      <th className="px-4 py-3">Item</th>
                      <th className="px-4 py-3">S</th>
                      <th className="px-4 py-3">M</th>
                      <th className="px-4 py-3">L</th>
                      <th className="px-4 py-3">XL</th>
                    </tr>
                  </thead>
                  <tbody>
                    {signatureFlavours.map((item) => (
                      <tr key={item.name} className="border-b border-slate-800 last:border-b-0">
                        <td className="px-4 py-4 align-top text-white">{item.name}</td>
                        {pizzaSizes.map((size) => {
                          const price = item.prices[size];
                          return (
                            <td key={size} className="px-4 py-4 align-top">
                              {price ? (
                                <div className="flex flex-col gap-2">
                                  <span className="text-sm font-semibold text-white">Rs {price}</span>
                                  <Button
                                    onClick={() => addToCart(item.name, price, "Signature Flavours", size)}
                                    className="rounded-full bg-orange-500 px-3 py-2 text-xs font-semibold text-white hover:bg-orange-400"
                                  >
                                    Add {size}
                                  </Button>
                                </div>
                              ) : (
                                <span className="text-slate-600">—</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CategorySection>
          </div>

          <aside className="order-2 xl:order-none">
            <Card className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
              <CardContent>
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm uppercase tracking-[0.35em] text-orange-400">Cart Summary</p>
                    <h2 className="mt-3 text-2xl font-black text-white">{cartCount} items</h2>
                  </div>
                  <div className="rounded-3xl bg-slate-950 px-4 py-3 text-right">
                    <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Total</p>
                    <p className="mt-2 text-2xl font-black text-white">Rs {cartTotal}</p>
                  </div>
                </div>

                <div className="mt-6 space-y-4">
                  {cart.length === 0 ? (
                    <div className="rounded-3xl border border-dashed border-slate-700 bg-slate-950 p-6 text-center text-slate-400">
                      Your cart is empty. Add an item to start your order.
                    </div>
                  ) : (
                    cart.map((item) => (
                      <div key={item.id} className="rounded-3xl border border-slate-800 bg-slate-950 p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-semibold text-white">{item.name}</p>
                            <p className="mt-1 text-sm text-slate-400">{item.category}{item.size ? ` • ${item.size}` : ""}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-white">Rs {item.price}</p>
                            <p className="text-sm text-slate-500">Qty {item.qty}</p>
                          </div>
                        </div>
                        <Button
                          onClick={() => removeFromCart(item.id)}
                          variant="outline"
                          className="mt-4 w-full rounded-full px-3 py-2 text-xs font-semibold"
                        >
                          Remove
                        </Button>
                      </div>
                    ))
                  )}
                </div>

                <div className="mt-6 flex flex-col gap-3">
                  <Button onClick={clearCart} variant="outline" className="rounded-full px-4 py-3 text-sm font-semibold">
                    Clear Cart
                  </Button>
                  
                  <Button
                    onClick={() => {
                      if (cart.length === 0) return;
                      // Placeholder: implement checkout flow here
                    }}
                    disabled={cart.length === 0}
                    className="rounded-full bg-orange-500 px-4 py-3 text-sm font-semibold text-white hover:bg-orange-400 disabled:opacity-50"
                  >
                    Proceed to Checkout
                  </Button>
                </div>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </div>
  );
}

function CategorySection({ title, description, children, wide }: { title: string; description: string; children: React.ReactNode; wide?: boolean }) {
  return (
    <section className={wide ? "space-y-4" : "space-y-4"}>
      <div>
        <p className="text-sm uppercase tracking-[0.35em] text-orange-400">{title}</p>
        <h2 className="mt-2 text-2xl font-black text-white">{description}</h2>
      </div>
      {children}
    </section>
  );
}

function MenuTable({ items, category, addToCart }: { items: SimpleItem[]; category: string; addToCart: (name: string, price: number, category: string) => void }) {
  return (
    <div className="overflow-x-auto rounded-3xl border border-slate-800 bg-slate-900 p-4">
      <table className="min-w-full border-separate border-spacing-0 text-left text-sm text-slate-200">
        <thead>
          <tr className="border-b border-slate-800 text-slate-300">
            <th className="px-4 py-3">Item</th>
            <th className="px-4 py-3">Price</th>
            <th className="px-4 py-3">Action</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.name} className="border-b border-slate-800 last:border-b-0">
              <td className="px-4 py-4 text-white">{item.name}</td>
              <td className="px-4 py-4 text-slate-200">Rs {item.price}</td>
              <td className="px-4 py-4">
                <Button onClick={() => addToCart(item.name, item.price, category)} className="rounded-full bg-orange-500 px-4 py-2 text-xs font-semibold text-white hover:bg-orange-400 sm:text-sm">
                  Add to Cart
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function DealTable({ deals, category, addToCart }: { deals: DealItem[]; category: string; addToCart: (name: string, price: number, category: string) => void }) {
  return (
    <div className="overflow-x-auto rounded-3xl border border-slate-800 bg-slate-900 p-4">
      <table className="min-w-full border-separate border-spacing-0 text-left text-sm text-slate-200">
        <thead>
          <tr className="border-b border-slate-800 text-slate-300">
            <th className="px-4 py-3">Deal</th>
            <th className="px-4 py-3">Description</th>
            <th className="px-4 py-3">Price</th>
            <th className="px-4 py-3">Action</th>
          </tr>
        </thead>
        <tbody>
          {deals.map((deal) => (
            <tr key={deal.name} className="border-b border-slate-800 last:border-b-0">
              <td className="px-4 py-4 text-white font-semibold">{deal.name}</td>
              <td className="px-4 py-4 text-slate-300">{deal.description}</td>
              <td className="px-4 py-4 text-slate-200">Rs {deal.price}</td>
              <td className="px-4 py-4">
                <Button onClick={() => addToCart(deal.name, deal.price, category)} className="rounded-full bg-orange-500 px-4 py-2 text-xs font-semibold text-white hover:bg-orange-400 sm:text-sm">
                  Add to Cart
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
