// @ts-nocheck
"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui";
import { Minus, Plus, Search, ShoppingCart } from "lucide-react";

export default function AdminPOSPage() {
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState([]);
  const [discount, setDiscount] = useState(0);
  const [tax, setTax] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [cashReceived, setCashReceived] = useState(0);
  const [message, setMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [orderCreated, setOrderCreated] = useState(null);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    const { data, error } = await supabase.from("products").select("*").order("created_at", { ascending: false });
    if (!error) setProducts(data || []);
  };

  const filteredProducts = useMemo(() => {
    return products.filter((item) => {
      const matchCategory = category === "All" || item.category === category;
      const matchSearch = item.name.toLowerCase().includes(search.toLowerCase());
      return matchCategory && matchSearch;
    });
  }, [products, category, search]);

  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) return prev.map((item) => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (id, delta) => {
    setCart((prev) => prev
      .map((item) => item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item)
      .filter((item) => item.quantity > 0));
  };

  const removeFromCart = (id) => setCart((prev) => prev.filter((item) => item.id !== id));

  const subtotal = useMemo(() => cart.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 1), 0), [cart]);
  const totalTax = useMemo(() => subtotal * (Number(tax) / 100), [subtotal, tax]);
  const totalDiscount = useMemo(() => Number(discount), [discount]);
  const total = subtotal + totalTax - totalDiscount;
  const change = useMemo(() => Number(cashReceived) - total, [cashReceived, total]);

  const handleCompleteOrder = async () => {
    if (cart.length === 0) {
      setMessage("Add items to the cart before completing the order.");
      return;
    }

    setIsSaving(true);
    const generatedId = `POS-${Math.floor(100000 + Math.random() * 900000)}`;
    const profit = cart.reduce((sum, item) => {
      const cost = Number(item.cost_price || item.cost || 0);
      return sum + (Number(item.price || 0) - cost) * Number(item.quantity || 1);
    }, 0);

    const { error } = await supabase.from("orders").insert([
      {
        id: generatedId,
        customer_name: "Walk-in Customer",
        phone: "N/A",
        address: "In-store pickup",
        items: cart,
        subtotal,
        tax: totalTax,
        discount: totalDiscount,
        total,
        profit,
        payment_method: paymentMethod,
        status: "Completed",
        created_at: new Date().toISOString(),
      },
    ]);

    setIsSaving(false);

    if (!error) {
      setMessage(`Order ${generatedId} saved successfully.`);
      setOrderCreated(generatedId);
      setCart([]);
      setCashReceived(0);
    } else {
      setMessage("Unable to save order. Please try again.");
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-12 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="rounded-[2rem] border border-slate-800 bg-slate-900 p-8">
          <h1 className="text-5xl font-black">POS Screen</h1>
          <p className="mt-2 text-slate-400">Fast order entry with product search, cart, discount, tax, and checkout.</p>
        </div>

        <div className="grid gap-6 xl:grid-cols-[0.7fr_0.3fr]">
          <div className="rounded-[2rem] border border-slate-800 bg-slate-900 p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-3 rounded-full border border-slate-800 bg-slate-950 px-4 py-3">
                <Search size={18} />
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products" className="bg-transparent text-white outline-none" />
              </div>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="rounded-full border border-slate-800 bg-slate-950 px-4 py-3 text-white">
                <option>All</option>
                {Array.from(new Set(products.map((item) => item.category))).map((cat) => (
                  <option key={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {filteredProducts.map((product) => (
                <div key={product.id} className="rounded-[2rem] border border-slate-800 bg-slate-950 p-4">
                  <div className="h-40 overflow-hidden rounded-3xl bg-slate-900">
                    <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
                  </div>
                  <div className="mt-4">
                    <h3 className="text-lg font-black text-white">{product.name}</h3>
                    <p className="mt-2 text-sm text-slate-400">{product.category}</p>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-lg font-bold text-orange-400">Rs {product.price}</span>
                      <Button onClick={() => addToCart(product)} className="rounded-full bg-orange-500 px-4 py-2 text-sm text-white hover:bg-orange-400">Add</Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-2xl font-black text-white">Bill</h2>
            <div className="mt-6 space-y-4">
              {message && <div className="rounded-3xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-sm text-slate-200">{message}</div>}
              <div className="rounded-[1.5rem] border border-slate-800 bg-slate-950 p-4">
                <div className="flex items-center justify-between text-slate-400">
                  <span>Subtotal</span>
                  <span>Rs {subtotal}</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Tax</span>
                  <span>{tax}%</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Discount</span>
                  <span>Rs {totalDiscount}</span>
                </div>
                <div className="mt-4 flex items-center justify-between text-xl font-black text-white">
                  <span>Total</span>
                  <span>Rs {Math.max(0, total)}</span>
                </div>
              </div>

              <div className="grid gap-4">
                <div className="rounded-[1.5rem] border border-slate-800 bg-slate-950 p-4">
                  <label className="text-sm text-slate-400">Discount</label>
                  <input type="number" value={discount} onChange={(e) => setDiscount(Number(e.target.value))} className="mt-2 w-full rounded-3xl border border-slate-800 bg-slate-900 px-4 py-3 text-white" />
                </div>
                <div className="rounded-[1.5rem] border border-slate-800 bg-slate-950 p-4">
                  <label className="text-sm text-slate-400">Tax (%)</label>
                  <input type="number" value={tax} onChange={(e) => setTax(Number(e.target.value))} className="mt-2 w-full rounded-3xl border border-slate-800 bg-slate-900 px-4 py-3 text-white" />
                </div>
                <div className="rounded-[1.5rem] border border-slate-800 bg-slate-950 p-4">
                  <label className="text-sm text-slate-400">Payment Method</label>
                  <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className="mt-2 w-full rounded-3xl border border-slate-800 bg-slate-900 px-4 py-3 text-white">
                    <option>Cash</option>
                    <option>Card</option>
                    <option>QR</option>
                  </select>
                </div>
                <div className="rounded-[1.5rem] border border-slate-800 bg-slate-950 p-4">
                  <label className="text-sm text-slate-400">Cash Received</label>
                  <input type="number" value={cashReceived} onChange={(e) => setCashReceived(Number(e.target.value))} className="mt-2 w-full rounded-3xl border border-slate-800 bg-slate-900 px-4 py-3 text-white" />
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-[1.5rem] border border-slate-800 bg-slate-950 p-4">
              <h3 className="text-lg font-bold text-white">Items</h3>
              <div className="mt-4 space-y-3">
                {cart.length === 0 ? (
                  <p className="text-sm text-slate-400">No items in bill yet.</p>
                ) : (
                  cart.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 rounded-3xl border border-slate-800 bg-slate-900 p-3">
                      <div className="flex-1">
                        <div className="font-bold text-white">{item.name}</div>
                        <div className="text-sm text-slate-400">Rs {item.price} x {item.quantity}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => updateQuantity(item.id, -1)} className="rounded-full bg-slate-800 p-2 text-slate-300 hover:text-white"><Minus size={16} /></button>
                        <span className="w-8 text-center font-bold text-white">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, 1)} className="rounded-full bg-slate-800 p-2 text-slate-300 hover:text-white"><Plus size={16} /></button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <Button onClick={handleCompleteOrder} disabled={isSaving} className="mt-6 w-full rounded-full bg-orange-500 px-6 py-4 text-base text-white hover:bg-orange-400 disabled:opacity-70">
              {isSaving ? "Saving order..." : "Complete Order"}
            </Button>
            <Button onClick={() => window.print()} className="mt-3 w-full rounded-full border border-slate-800 bg-slate-950 px-6 py-4 text-base text-white hover:border-orange-500">
              Print Receipt
            </Button>
            <div className="mt-4 text-sm text-slate-400">Change returned: Rs {change >= 0 ? change : 0}</div>
            {orderCreated && <div className="mt-3 rounded-3xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">Created order ID: {orderCreated}</div>}
          </div>
        </div>
      </div>
    </main>
  );
}
