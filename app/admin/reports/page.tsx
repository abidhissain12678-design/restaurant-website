// @ts-nocheck
"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui";

const rangeOptions = ["Today", "Yesterday", "This Week", "This Month", "This Year"];

export default function AdminReportsPage() {
  const [orders, setOrders] = useState([]);
  const [selectedRange, setSelectedRange] = useState("Today");

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    const { data, error } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
    if (!error) setOrders(data || []);
  };

  const ranges = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const yearStart = new Date(today.getFullYear(), 0, 1);

    return {
      Today: [today, new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)],
      Yesterday: [yesterday, new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate() + 1)],
      "This Week": [weekStart, new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)],
      "This Month": [monthStart, new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)],
      "This Year": [yearStart, new Date(today.getFullYear() + 1, 0, 1)],
    };
  }, []);

  const filteredOrders = useMemo(() => {
    const [start, end] = ranges[selectedRange];
    return orders.filter((order) => {
      const created = new Date(order.created_at);
      return created >= start && created < end;
    });
  }, [orders, ranges, selectedRange]);

  const summary = useMemo(() => {
    const totalOrders = filteredOrders.length;
    const totalSales = filteredOrders.reduce((sum, order) => sum + Number(order.total || 0), 0);
    const totalCost = filteredOrders.reduce((sum, order) => sum + Number(order.cost_total || 0), 0);
    const totalProfit = filteredOrders.reduce((sum, order) => sum + Number(order.profit || 0), 0);
    const totalLoss = filteredOrders.reduce((sum, order) => sum + (order.profit < 0 ? Number(order.profit || 0) : 0), 0);
    const averageOrder = totalOrders ? totalSales / totalOrders : 0;

    const itemCounts = {};
    const categorySales = {};
    for (const order of filteredOrders) {
      const items = typeof order.items === "string" ? JSON.parse(order.items) : order.items || [];
      for (const item of items) {
        itemCounts[item.name] = (itemCounts[item.name] || 0) + Number(item.quantity || 1);
        categorySales[item.category] = (categorySales[item.category] || 0) + Number(item.price || 0) * Number(item.quantity || 1);
      }
    }

    return {
      totalOrders,
      totalSales,
      totalCost,
      totalProfit,
      totalLoss,
      averageOrder,
      bestSelling: Object.entries(itemCounts).sort((a, b) => b[1] - a[1]).slice(0, 5),
      categorySales: Object.entries(categorySales).sort((a, b) => b[1] - a[1]),
    };
  }, [filteredOrders]);

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-12 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="rounded-[2rem] border border-slate-800 bg-slate-900 p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-5xl font-black">Reports</h1>
              <p className="mt-2 text-slate-400">Sales, profit, and category reports by selected range.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              {rangeOptions.map((option) => (
                <Button
                  key={option}
                  onClick={() => setSelectedRange(option)}
                  variant={selectedRange === option ? "default" : "outline"}
                  className="rounded-full px-4 py-2 text-sm"
                >
                  {option}
                </Button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-[2rem] border border-slate-800 bg-slate-900 p-6">
            <p className="text-sm uppercase tracking-[0.25em] text-slate-500">Total Orders</p>
            <p className="mt-3 text-3xl font-black text-white">{summary.totalOrders}</p>
          </div>
          <div className="rounded-[2rem] border border-slate-800 bg-slate-900 p-6">
            <p className="text-sm uppercase tracking-[0.25em] text-slate-500">Total Sales</p>
            <p className="mt-3 text-3xl font-black text-white">Rs {Math.round(summary.totalSales)}</p>
          </div>
          <div className="rounded-[2rem] border border-slate-800 bg-slate-900 p-6">
            <p className="text-sm uppercase tracking-[0.25em] text-slate-500">Total Profit</p>
            <p className="mt-3 text-3xl font-black text-white">Rs {Math.round(summary.totalProfit)}</p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-[2rem] border border-slate-800 bg-slate-900 p-6">
            <p className="text-sm uppercase tracking-[0.25em] text-slate-500">Total Cost</p>
            <p className="mt-3 text-3xl font-black text-white">Rs {Math.round(summary.totalCost)}</p>
          </div>
          <div className="rounded-[2rem] border border-slate-800 bg-slate-900 p-6">
            <p className="text-sm uppercase tracking-[0.25em] text-slate-500">Total Loss</p>
            <p className="mt-3 text-3xl font-black text-white">Rs {Math.round(summary.totalLoss)}</p>
          </div>
          <div className="rounded-[2rem] border border-slate-800 bg-slate-900 p-6">
            <p className="text-sm uppercase tracking-[0.25em] text-slate-500">Average Order</p>
            <p className="mt-3 text-3xl font-black text-white">Rs {Math.round(summary.averageOrder)}</p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-[2rem] border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-2xl font-black text-white">Best Selling Items</h2>
            <div className="mt-6 space-y-3">
              {summary.bestSelling.length > 0 ? summary.bestSelling.map(([name, count]) => (
                <div key={name} className="flex items-center justify-between rounded-3xl border border-slate-800 bg-slate-950 px-4 py-3">
                  <span className="text-slate-200">{name}</span>
                  <span className="text-slate-400">{count}</span>
                </div>
              )) : <p className="text-slate-400">No items sold in this range.</p>}
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-2xl font-black text-white">Category-wise Sales</h2>
            <div className="mt-6 space-y-3">
              {summary.categorySales.length > 0 ? summary.categorySales.map(([category, amount]) => (
                <div key={category} className="flex items-center justify-between rounded-3xl border border-slate-800 bg-slate-950 px-4 py-3">
                  <span className="text-slate-200">{category}</span>
                  <span className="text-slate-400">Rs {Math.round(amount)}</span>
                </div>
              )) : <p className="text-slate-400">No category data for this range.</p>}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
