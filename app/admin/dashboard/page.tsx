// @ts-nocheck
"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { ArrowUpRight, BarChart3, Clock, DollarSign, Package, PieChart, TrendingUp, Zap } from "lucide-react";
import { Button } from "@/components/ui";

const summaryCards = [
  { label: "Today Orders", key: "today_orders", icon: Package },
  { label: "Today Sales", key: "today_sales", icon: DollarSign },
  { label: "Today Profit", key: "today_profit", icon: TrendingUp },
  { label: "Pending Orders", key: "pending_orders", icon: Clock },
  { label: "Completed Orders", key: "completed_orders", icon: Zap },
  { label: "Cancelled Orders", key: "cancelled_orders", icon: ArrowUpRight },
];

const chartCards = [
  { title: "Weekly Sales", key: "weekly_sales" },
  { title: "Monthly Sales", key: "monthly_sales" },
  { title: "Yearly Sales", key: "yearly_sales" },
];

export default function AdminDashboardPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
    setLoading(false);
    if (!error) setOrders(data || []);
  };

  const today = new Date();
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();

  const stats = useMemo(() => {
    const summary = {
      today_orders: 0,
      today_sales: 0,
      today_profit: 0,
      pending_orders: 0,
      completed_orders: 0,
      cancelled_orders: 0,
      weekly_sales: [],
      monthly_sales: [],
      yearly_sales: [],
      top_products: {},
      low_products: {},
      recent_orders: [],
    };

    const productCounts = {};
    const ordersThisWeek = Array(7).fill(0);
    const ordersThisMonth = Array.from({ length: 12 }, () => 0);
    let yearlySales = 0;

    for (const order of orders) {
      const created = new Date(order.created_at);
      const dateKey = created.toISOString();
      const items = typeof order.items === "string" ? JSON.parse(order.items) : order.items || [];

      if (order.status === "Pending") summary.pending_orders += 1;
      if (order.status === "Delivered") summary.completed_orders += 1;
      if (order.status === "Cancelled") summary.cancelled_orders += 1;

      if (dateKey >= startOfDay) {
        summary.today_orders += 1;
        summary.today_sales += Number(order.total || 0);
        summary.today_profit += Number(order.profit || 0);
      }

      const dayIndex = (today.getDay() + 7 - created.getDay()) % 7;
      if (dayIndex < 7) ordersThisWeek[6 - dayIndex] += Number(order.total || 0);
      ordersThisMonth[created.getMonth()] += Number(order.total || 0);
      yearlySales += Number(order.total || 0);

      for (const item of items) {
        productCounts[item.name] = (productCounts[item.name] || 0) + Number(item.quantity || 1);
      }
    }

    summary.weekly_sales = ordersThisWeek;
    summary.monthly_sales = ordersThisMonth;
    summary.yearly_sales = yearlySales;

    const sortedProducts = Object.entries(productCounts).sort((a, b) => b[1] - a[1]);
    summary.top_products = sortedProducts.slice(0, 5);
    summary.low_products = sortedProducts.slice(-5).reverse();
    summary.recent_orders = orders.slice(0, 6);

    return summary;
  }, [orders, startOfDay, today]);

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-12 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="rounded-[2rem] border border-slate-800 bg-slate-900 p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-5xl font-black">POS Dashboard</h1>
              <p className="mt-2 text-slate-400">Sales summary, orders, and top product insights.</p>
            </div>
            <Button onClick={loadOrders} className="rounded-full bg-orange-500 px-6 py-3 text-sm text-white hover:bg-orange-400">Refresh</Button>
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {summaryCards.map((card) => {
            const Icon = card.icon;
            return (
              <div key={card.key} className="rounded-[2rem] border border-slate-800 bg-slate-900 p-6">
                <div className="flex items-center gap-4">
                  <div className="grid h-12 w-12 place-items-center rounded-3xl bg-orange-500/10 text-orange-300">
                    <Icon size={20} />
                  </div>
                  <div>
                    <p className="text-sm uppercase tracking-[0.25em] text-slate-500">{card.label}</p>
                    <p className="mt-2 text-3xl font-black text-white">
                      {card.key.includes("sales") || card.key.includes("profit")
                        ? `Rs ${Math.round(stats[card.key] || 0)}`
                        : stats[card.key] || 0}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <div className="rounded-[2rem] border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-2xl font-black text-white">Top Selling Products</h2>
            <div className="mt-6 space-y-3">
              {stats.top_products.length > 0 ? (
                stats.top_products.map(([name, count]) => (
                  <div key={name} className="flex items-center justify-between rounded-3xl border border-slate-800 bg-slate-950 px-4 py-3">
                    <span className="text-slate-200">{name}</span>
                    <span className="text-slate-400">{count} sold</span>
                  </div>
                ))
              ) : (
                <p className="text-slate-400">No data available yet.</p>
              )}
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-2xl font-black text-white">Low Selling Products</h2>
            <div className="mt-6 space-y-3">
              {stats.low_products.length > 0 ? (
                stats.low_products.map(([name, count]) => (
                  <div key={name} className="flex items-center justify-between rounded-3xl border border-slate-800 bg-slate-950 px-4 py-3">
                    <span className="text-slate-200">{name}</span>
                    <span className="text-slate-400">{count} sold</span>
                  </div>
                ))
              ) : (
                <p className="text-slate-400">No data available yet.</p>
              )}
            </div>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          {chartCards.map((chart) => (
            <div key={chart.key} className="rounded-[2rem] border border-slate-800 bg-slate-900 p-6">
              <h2 className="text-2xl font-black text-white">{chart.title}</h2>
              <div className="mt-6 h-48 rounded-[1.5rem] border border-slate-800 bg-slate-950 p-4 text-slate-400">
                <p>Chart placeholder</p>
                <p className="text-sm text-slate-500">Sales visualization can be added using a chart library.</p>
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-[2rem] border border-slate-800 bg-slate-900 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-black text-white">Recent Orders</h2>
              <p className="mt-1 text-sm text-slate-400">Latest order activity from your store.</p>
            </div>
            <span className="rounded-full bg-slate-950 px-4 py-2 text-sm text-slate-300">{orders.length} orders</span>
          </div>
          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-800 text-left text-sm text-slate-300">
              <thead>
                <tr>
                  <th className="px-4 py-3">Order ID</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Total</th>
                  <th className="px-4 py-3">Profit</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {stats.recent_orders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-950/70">
                    <td className="px-4 py-3">{order.id}</td>
                    <td className="px-4 py-3">{order.customer_name}</td>
                    <td className="px-4 py-3">Rs {order.total}</td>
                    <td className="px-4 py-3">Rs {order.profit || 0}</td>
                    <td className="px-4 py-3">{order.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}
