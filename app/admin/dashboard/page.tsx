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

export default function AdminDashboardPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadOrders = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
    setLoading(false);
    if (!error) setOrders(data || []);
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const stats = useMemo(() => {
    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const thisWeekStart = new Date(startOfToday);
    thisWeekStart.setDate(thisWeekStart.getDate() - thisWeekStart.getDay());
    const weeklyBuckets = Array(7).fill(0);
    const monthlyBuckets = Array.from({ length: 12 }, () => 0);
    const topProductsMap = {};

    const summary = {
      today_orders: 0,
      today_sales: 0,
      today_profit: 0,
      pending_orders: 0,
      completed_orders: 0,
      cancelled_orders: 0,
      weekly_sales: weeklyBuckets,
      monthly_sales: monthlyBuckets,
      yearly_sales: 0,
      top_products: [],
      recent_orders: [],
    };

    for (const order of orders) {
      const created = new Date(order.created_at);
      const orderTotal = Number(order.total || 0);
      const orderProfit = Number(order.profit || 0);

      if (order.status === "Pending") summary.pending_orders += 1;
      if (order.status === "Delivered") summary.completed_orders += 1;
      if (order.status === "Cancelled") summary.cancelled_orders += 1;

      if (created >= startOfToday) {
        summary.today_orders += 1;
        summary.today_sales += orderTotal;
        summary.today_profit += orderProfit;
      }

      if (created >= thisWeekStart) {
        const dayIndex = Math.min(6, Math.max(0, created.getDay()));
        summary.weekly_sales[dayIndex] += orderTotal;
      }

      summary.monthly_sales[created.getMonth()] += orderTotal;
      summary.yearly_sales += orderTotal;

      const items = typeof order.items === "string" ? JSON.parse(order.items) : order.items || [];
      for (const item of items) {
        topProductsMap[item.name] = (topProductsMap[item.name] || 0) + Number(item.quantity || 1);
      }
    }

    summary.top_products = Object.entries(topProductsMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
    summary.recent_orders = orders.slice(0, 6);

    return summary;
  }, [orders]);

  const weeklyMax = Math.max(...stats.weekly_sales, 1);
  const monthlyMax = Math.max(...stats.monthly_sales, 1);

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-12 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="rounded-[2rem] border border-slate-800 bg-slate-900 p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-5xl font-black">POS Dashboard</h1>
              <p className="mt-2 text-slate-400">Live sales overview, performance metrics, and recent activity.</p>
            </div>
            <Button onClick={loadOrders} className="rounded-full bg-orange-500 px-6 py-3 text-sm text-white hover:bg-orange-400">
              Refresh
            </Button>
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {summaryCards.map((card) => {
            const Icon = card.icon;
            const value = card.key.includes("sales") || card.key.includes("profit")
              ? `Rs ${Math.round(stats[card.key] || 0)}`
              : stats[card.key];
            return (
              <div key={card.key} className="rounded-[2rem] border border-slate-800 bg-slate-900 p-6">
                <div className="flex items-center gap-4">
                  <div className="grid h-12 w-12 place-items-center rounded-3xl bg-orange-500/10 text-orange-300">
                    <Icon size={20} />
                  </div>
                  <div>
                    <p className="text-sm uppercase tracking-[0.25em] text-slate-500">{card.label}</p>
                    <p className="mt-2 text-3xl font-black text-white">{value}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <div className="rounded-[2rem] border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-2xl font-black text-white">Weekly Sales</h2>
            <div className="mt-6 space-y-4">
              {stats.weekly_sales.map((amount, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex items-center justify-between text-sm text-slate-400">
                    <span>{["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][index]}</span>
                    <span>Rs {Math.round(amount)}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                    <div className="h-full rounded-full bg-orange-500" style={{ width: `${Math.round((amount / weeklyMax) * 100)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-2xl font-black text-white">Monthly Sales</h2>
            <div className="mt-6 space-y-4">
              {stats.monthly_sales.map((amount, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex items-center justify-between text-sm text-slate-400">
                    <span>{new Date(0, index).toLocaleString("en-US", { month: "short" })}</span>
                    <span>Rs {Math.round(amount)}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                    <div className="h-full rounded-full bg-sky-500" style={{ width: `${Math.round((amount / monthlyMax) * 100)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
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
                <p className="text-slate-400">No product data yet.</p>
              )}
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-2xl font-black text-white">Recent Orders</h2>
            <div className="mt-6 space-y-3">
              {stats.recent_orders.length > 0 ? (
                stats.recent_orders.map((order) => (
                  <div key={order.id} className="rounded-3xl border border-slate-800 bg-slate-950 px-4 py-3">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="font-semibold text-white">#{order.id}</p>
                        <p className="text-sm text-slate-400">{order.customer_name || "Walk-in"}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-white">Rs {order.total}</p>
                        <p className="text-sm text-slate-400">{order.status}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-slate-400">No recent orders yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
