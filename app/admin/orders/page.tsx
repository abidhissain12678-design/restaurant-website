// @ts-nocheck
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui";

const statuses = ["Pending", "Preparing", "Out for Delivery", "Delivered", "Cancelled"];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const loadOrders = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
    setLoading(false);
    if (!error) setOrders(data || []);
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const updateStatus = async (id, status) => {
    setLoading(true);
    const { error } = await supabase.from("orders").update({ status }).eq("id", id);
    setLoading(false);
    if (!error) {
      setMessage("Order status updated.");
      loadOrders();
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-12 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="rounded-[2rem] border border-slate-800 bg-slate-900 p-8">
          <h1 className="text-4xl font-black">Manage Orders</h1>
          <p className="mt-2 text-slate-400">View and update order status from Supabase.</p>
        </div>

        {message && <div className="rounded-[2rem] border border-orange-500/30 bg-orange-500/10 p-4 text-orange-200">{message}</div>}

        <div className="rounded-[2rem] border border-slate-800 bg-slate-900 p-8 overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-800 text-left text-sm text-slate-300">
            <thead>
              <tr>
                <th className="px-4 py-3">Order ID</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Created</th>
                <th className="px-4 py-3">Items</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {orders.map((order) => {
                const items = typeof order.items === "string" ? JSON.parse(order.items) : order.items || [];
                return (
                  <tr key={order.id} className="hover:bg-slate-950/70">
                    <td className="px-4 py-3">{order.id}</td>
                    <td className="px-4 py-3">{order.customer_name}</td>
                    <td className="px-4 py-3">{order.phone}</td>
                    <td className="px-4 py-3">Rs {order.total}</td>
                    <td className="px-4 py-3">
                      <select
                        value={order.status}
                        onChange={(e) => updateStatus(order.id, e.target.value)}
                        className="rounded-full border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white"
                      >
                        {statuses.map((status) => (
                          <option key={status} value={status}>{status}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">{new Date(order.created_at).toLocaleString()}</td>
                    <td className="px-4 py-3">{items.length}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
