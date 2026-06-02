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
  const [orderPayload, setOrderPayload] = useState(null);

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
    const generatedId = `POS-${Date.now()}`;

    const cost_total = cart.reduce((sum, item) => {
      const cost = Number(item.cost_price ?? item.cost ?? 0);
      return sum + cost * Number(item.quantity || 1);
    }, 0);

    const profit = cart.reduce((sum, item) => {
      const cost = Number(item.cost_price ?? item.cost ?? 0);
      return sum + (Number(item.price || 0) - cost) * Number(item.quantity || 1);
    }, 0);

    const payload = {
      id: generatedId,
      customer_name: "Walk-in Customer",
      phone: "N/A",
      address: "Counter Sale",
      items: cart,
      subtotal,
      delivery_fee: 0,
      discount: totalDiscount,
      total,
      cost_total,
      profit,
      cash_received: Number(cashReceived || 0),
      change: Number((Number(cashReceived || 0) - total) || 0),
      payment_method: paymentMethod,
      order_type: "POS",
      status: "Delivered",
      created_at: new Date().toISOString(),
    };

    const { error } = await supabase.from("orders").insert([payload]);

    setIsSaving(false);

    if (!error) {
      setMessage(`Order ${generatedId} saved successfully.`);
      setOrderCreated(generatedId);
      setOrderPayload(payload);
      setCart([]);
      setDiscount(0);
      setTax(0);
      setCashReceived(0);
    } else {
      console.error("POS order save error:", error);
      setMessage("Unable to save order. Please try again.");
    }
  };

  const printReceipt = () => {
    if (!orderPayload) {
      setMessage("No receipt available to print. Save an order first.");
      return;
    }

    const printContents = document.getElementById("receipt-print")?.innerHTML;
    if (!printContents) {
      setMessage("Receipt content not found.");
      return;
    }

    const win = window.open("", "", "width=400,height=600");
    if (!win) {
      setMessage("Unable to open print window. Please allow popups.");
      return;
    }

    win.document.write(`
      <html>
        <head>
          <title>Receipt</title>
          <style>
            @page {
              size: 80mm auto;
              margin: 0;
            }

            body {
              width: 80mm;
              margin: 0;
              padding: 8px;
              font-family: monospace;
              font-size: 12px;
            }

            table {
              width: 100%;
              border-collapse: collapse;
            }

            hr {
              border: none;
              border-top: 1px dashed #000;
            }

            .receipt-title {
              text-align: center;
              font-weight: 700;
              margin-bottom: 6px;
            }

            .receipt-line {
              display: flex;
              justify-content: space-between;
              margin-bottom: 2px;
            }

            .receipt-small {
              font-size: 11px;
            }
          </style>
        </head>
        <body>
          ${printContents}
        </body>
      </html>
    `);

    win.document.close();
    win.focus();

    setTimeout(() => {
      win.print();
      win.close();
    }, 500);
  };

  const downloadReceiptPDF = async () => {
    const order = orderPayload;
    if (!order) {
      setMessage("No receipt available to download. Save an order first.");
      return;
    }

    // dynamically load jsPDF if not available
    const ensureJsPDF = () => new Promise((resolve, reject) => {
      if (window.jspdf && window.jspdf.jsPDF) return resolve(window.jspdf.jsPDF);
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
      script.onload = () => {
        // @ts-ignore
        resolve(window.jspdf.jsPDF);
      };
      script.onerror = reject;
      document.body.appendChild(script);
    });

    try {
      const jsPDFClass = await ensureJsPDF();
      // @ts-ignore
      const doc = new jsPDFClass({ unit: 'mm', format: [80, 200] });
      const lineHeight = 5;
      let y = 8;
      doc.setFont('Courier');
      doc.setFontSize(11);
      doc.text('Flafe Restaurant', 40, y, { align: 'center' }); y += lineHeight;
      doc.setFontSize(9);
      doc.text('Phone: +92 300 0000000', 40, y, { align: 'center' }); y += lineHeight;
      doc.text('Address: Karachi, Pakistan', 40, y, { align: 'center' }); y += lineHeight * 1.2;

      doc.setFontSize(9);
      doc.text(`Order ID: ${order.id}`, 8, y); y += lineHeight;
      doc.text(`Date: ${new Date(order.created_at).toLocaleString()}`, 8, y); y += lineHeight;
      doc.text(`Customer: ${order.customer_name || 'Walk-in Customer'}`, 8, y); y += lineHeight * 1.2;

      doc.setFontSize(9);
      doc.text('Item                Qty   Price   Total', 8, y); y += lineHeight;
      doc.text('----------------------------------------', 8, y); y += lineHeight;
      (order.items || []).forEach((it) => {
        const name = (it.name || '').slice(0, 16).padEnd(18, ' ');
        const qty = String(it.quantity || it.qty || 1).padStart(3, ' ');
        const price = String(it.price || 0).padStart(6, ' ');
        const totalLine = String((it.price || 0) * (it.quantity || it.qty || 1)).padStart(7, ' ');
        doc.text(`${name}${qty}  ${price}  ${totalLine}`, 8, y);
        y += lineHeight;
      });

      y += lineHeight * 0.5;
      doc.text(`Subtotal: Rs ${order.subtotal || 0}`, 8, y); y += lineHeight;
      if (order.discount) { doc.text(`Discount: Rs ${order.discount}`, 8, y); y += lineHeight; }
      if (order.tax) { doc.text(`Tax: Rs ${order.tax}`, 8, y); y += lineHeight; }
      if (order.delivery_fee) { doc.text(`Delivery: Rs ${order.delivery_fee}`, 8, y); y += lineHeight; }
      doc.setFontSize(11);
      doc.text(`Total: Rs ${order.total}`, 8, y); y += lineHeight * 1.2;

      doc.setFontSize(9);
      doc.text(`Payment: ${order.payment_method || 'Cash'}`, 8, y); y += lineHeight;
      if (order.cash_received !== undefined) { doc.text(`Cash: Rs ${order.cash_received}`, 8, y); y += lineHeight; }
      if (order.change !== undefined) { doc.text(`Change: Rs ${order.change}`, 8, y); y += lineHeight; }

      y += lineHeight;
      doc.text('Thank you for ordering!', 40, y, { align: 'center' });

      const fileName = `receipt-${order.id}.pdf`;
      doc.save(fileName);
    } catch (e) {
      console.error('Failed to generate PDF receipt:', e);
      setMessage('Unable to generate PDF. Try printing instead.');
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-12 text-white sm:px-6 lg:px-8">
      <style>{`@media print {
        @page { size: 80mm auto; margin: 0; }
        body { margin: 0; padding: 0; }
        .receipt { width: 80mm; padding: 8px; font-size: 11px; font-family: monospace; }
        .no-print { display: none !important; }
      }
      @media screen {
        .receipt { display: none; }
      }
      `}</style>
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
            <Button onClick={handleCompleteOrder} disabled={isSaving} className="mt-6 w-full rounded-full bg-orange-500 px-6 py-4 text-base text-white hover:bg-orange-400 disabled:opacity-70 no-print">
              {isSaving ? "Saving order..." : "Complete Order"}
            </Button>
            <div className="mt-3 flex gap-3">
              <Button onClick={printReceipt} className="flex-1 rounded-full border border-slate-800 bg-slate-950 px-6 py-4 text-base text-white hover:border-orange-500 no-print">
                Print Receipt
              </Button>
              <Button onClick={downloadReceiptPDF} className="flex-1 rounded-full border border-slate-800 bg-slate-950 px-6 py-4 text-base text-white hover:border-orange-500 no-print">
                Download Receipt PDF
              </Button>
            </div>
            <div className="mt-4 text-sm text-slate-400">Change returned: Rs {change >= 0 ? change : 0}</div>
            {orderCreated && <div className="mt-3 rounded-3xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">Created order ID: {orderCreated}</div>}
          </div>
        </div>
      </div>

      {/* Thermal receipt markup - visible only for print */}
      <div id="receipt-print" className="receipt" aria-hidden={!orderPayload}>
        {orderPayload ? (
          <div>
            <div style={{ textAlign: 'center', marginBottom: 6 }}>
              <div style={{ fontWeight: 800 }}>Flafe Restaurant</div>
              <div style={{ fontSize: 11 }}>Phone: +92 300 0000000</div>
              <div style={{ fontSize: 11 }}>Address: Karachi, Pakistan</div>
            </div>

            <div style={{ fontSize: 11, marginBottom: 6 }}>
              <div>Order ID: {orderPayload.id}</div>
              <div>Date: {new Date(orderPayload.created_at).toLocaleString()}</div>
              <div>Customer: {orderPayload.customer_name || 'Walk-in Customer'}</div>
            </div>

            <div style={{ fontSize: 11 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
                <div style={{ width: '55%' }}>Item</div>
                <div style={{ width: '15%', textAlign: 'right' }}>Qty</div>
                <div style={{ width: '15%', textAlign: 'right' }}>Price</div>
                <div style={{ width: '15%', textAlign: 'right' }}>Total</div>
              </div>
              <div style={{ borderTop: '1px dashed #000', margin: '6px 0' }} />
              {(orderPayload.items || []).map((it, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 2 }}>
                  <div style={{ width: '55%' }}>{it.name}</div>
                  <div style={{ width: '15%', textAlign: 'right' }}>{it.quantity ?? it.qty ?? 1}</div>
                  <div style={{ width: '15%', textAlign: 'right' }}>Rs {it.price}</div>
                  <div style={{ width: '15%', textAlign: 'right' }}>Rs {(it.price || 0) * (it.quantity ?? it.qty ?? 1)}</div>
                </div>
              ))}
            </div>

            <div style={{ borderTop: '1px dashed #000', margin: '6px 0' }} />
            <div style={{ fontSize: 11 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><div>Subtotal</div><div>Rs {orderPayload.subtotal || 0}</div></div>
              {orderPayload.discount ? <div style={{ display: 'flex', justifyContent: 'space-between' }}><div>Discount</div><div>Rs {orderPayload.discount}</div></div> : null}
              {orderPayload.tax ? <div style={{ display: 'flex', justifyContent: 'space-between' }}><div>Tax</div><div>Rs {orderPayload.tax}</div></div> : null}
              {orderPayload.delivery_fee ? <div style={{ display: 'flex', justifyContent: 'space-between' }}><div>Delivery</div><div>Rs {orderPayload.delivery_fee}</div></div> : null}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, marginTop: 6 }}><div>Total</div><div>Rs {orderPayload.total}</div></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}><div>Payment</div><div>{orderPayload.payment_method}</div></div>
              {orderPayload.cash_received !== undefined ? <div style={{ display: 'flex', justifyContent: 'space-between' }}><div>Cash</div><div>Rs {orderPayload.cash_received}</div></div> : null}
              {orderPayload.change !== undefined ? <div style={{ display: 'flex', justifyContent: 'space-between' }}><div>Change</div><div>Rs {orderPayload.change}</div></div> : null}
            </div>

            <div style={{ textAlign: 'center', marginTop: 8 }}>Thank you for ordering!</div>
          </div>
        ) : (
          <div style={{ textAlign: 'center' }}>No receipt available</div>
        )}
      </div>
    </main>
  );
}
