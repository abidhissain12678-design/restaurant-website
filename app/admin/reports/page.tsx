// @ts-nocheck
"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui";
import { Download, Printer, FileText, CalendarDays } from "lucide-react";

const rangeOptions = ["Today", "Yesterday", "This Week", "This Month", "This Year", "Custom"];

function formatDateLabel(date) {
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function getRangeDates(range, customStart, customEnd) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay());
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const yearStart = new Date(today.getFullYear(), 0, 1);

  if (range === "Today") return [today, new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)];
  if (range === "Yesterday") return [yesterday, new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate() + 1)];
  if (range === "This Week") return [weekStart, new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)];
  if (range === "This Month") return [monthStart, new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)];
  if (range === "This Year") return [yearStart, new Date(today.getFullYear() + 1, 0, 1)];

  const start = customStart ? new Date(customStart) : today;
  const end = customEnd ? new Date(customEnd) : today;
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return [null, null];
  const endDate = new Date(end.getFullYear(), end.getMonth(), end.getDate() + 1);
  return [start, endDate];
}

export default function AdminReportsPage() {
  const [orders, setOrders] = useState([]);
  const [selectedRange, setSelectedRange] = useState("Today");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const loadOrdersForRange = async (range) => {
    const [start, end] = getRangeDates(range, customStart, customEnd);
    if (!start || !end) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .gte("created_at", start.toISOString())
      .lt("created_at", end.toISOString())
      .order("created_at", { ascending: false });
    setLoading(false);
    if (!error) setOrders(data || []);
  };

  useEffect(() => {
    if (selectedRange !== "Custom") {
      loadOrdersForRange(selectedRange);
    }
  }, [selectedRange]);

  const handleCustomApply = () => {
    if (!customStart || !customEnd) {
      setMessage("Please choose both a start and end date for custom range.");
      return;
    }
    setMessage("");
    setSelectedRange("Custom");
    loadOrdersForRange("Custom");
  };

  const [rangeStart, rangeEnd] = useMemo(() => getRangeDates(selectedRange, customStart, customEnd), [selectedRange, customStart, customEnd]);
  const rangeLabel = selectedRange === "Custom" && rangeStart && rangeEnd
    ? `${formatDateLabel(rangeStart)} - ${formatDateLabel(new Date(rangeEnd.getTime() - 1))}`
    : selectedRange;

  const summary = useMemo(() => {
    const totals = {
      totalOrders: 0,
      totalSales: 0,
      totalCost: 0,
      totalProfit: 0,
      totalDiscount: 0,
      averageOrder: 0,
      completedOrders: 0,
      cancelledOrders: 0,
      pendingOrders: 0,
      bestSelling: {},
      categorySales: {},
      paymentMethods: {},
      dailyMap: {},
    };

    for (const order of orders) {
      totals.totalOrders += 1;
      totals.totalSales += Number(order.total || 0);
      totals.totalCost += Number(order.cost_total || 0);
      totals.totalProfit += Number(order.profit || 0);
      totals.totalDiscount += Number(order.discount || 0);

      if (order.status === "Delivered") totals.completedOrders += 1;
      if (order.status === "Cancelled") totals.cancelledOrders += 1;
      if (order.status === "Pending") totals.pendingOrders += 1;

      const items = typeof order.items === "string" ? JSON.parse(order.items) : order.items || [];
      for (const item of items) {
        totals.bestSelling[item.name] = (totals.bestSelling[item.name] || 0) + Number(item.quantity || item.qty || 1);
        totals.categorySales[item.category] = (totals.categorySales[item.category] || 0) + Number(item.price || 0) * Number(item.quantity || item.qty || 1);
      }

      const dateKey = new Date(order.created_at).toISOString().slice(0, 10);
      const bucket = totals.dailyMap[dateKey] || { sales: 0, profit: 0, orders: 0 };
      bucket.sales += Number(order.total || 0);
      bucket.profit += Number(order.profit || 0);
      bucket.orders += 1;
      totals.dailyMap[dateKey] = bucket;

      const method = order.payment_method || "Cash";
      totals.paymentMethods[method] = (totals.paymentMethods[method] || 0) + Number(order.total || 0);
    }

    totals.averageOrder = totals.totalOrders ? totals.totalSales / totals.totalOrders : 0;
    totals.bestSelling = Object.entries(totals.bestSelling).sort((a, b) => b[1] - a[1]);
    totals.categorySales = Object.entries(totals.categorySales).sort((a, b) => b[1] - a[1]);
    totals.paymentSummary = Object.entries(totals.paymentMethods).sort((a, b) => b[1] - a[1]);

    const dailyBreakdown = [];
    if (rangeStart && rangeEnd) {
      const cursor = new Date(rangeStart);
      while (cursor < rangeEnd) {
        const key = cursor.toISOString().slice(0, 10);
        const bucket = totals.dailyMap[key] || { sales: 0, profit: 0, orders: 0 };
        dailyBreakdown.push({ label: formatDateLabel(cursor), ...bucket });
        cursor.setDate(cursor.getDate() + 1);
      }
    }

    totals.dailyBreakdown = dailyBreakdown;
    return totals;
  }, [orders, rangeStart, rangeEnd]);

  const exportCSV = () => {
    const headers = ["order_id", "customer_name", "phone", "total", "profit", "status", "payment_method", "order_type", "created_at"];
    const rows = orders.map((order) => [
      order.id,
      order.customer_name,
      order.phone,
      order.total,
      order.profit,
      order.status,
      order.payment_method,
      order.order_type,
      order.created_at,
    ]);
    const csvContent = [headers, ...rows]
      .map((row) => row.map((value) => `"${String(value || "").replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `report-${selectedRange.toLowerCase().replace(/\s+/g, "-")}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const downloadPDF = async () => {
    const generated = new Date().toLocaleString();
    const ensureJsPDF = () => new Promise((resolve, reject) => {
      if (window.jspdf && window.jspdf.jsPDF) return resolve(window.jspdf.jsPDF);
      const script = document.createElement("script");
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
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
      const doc = new jsPDFClass({ unit: "pt", format: "a4" });
      const lineHeight = 18;
      let y = 40;
      doc.setFontSize(16);
      doc.text("Flafe Restaurant", 40, y);
      y += lineHeight;
      doc.setFontSize(10);
      doc.text(`Report period: ${rangeLabel}`, 40, y);
      y += lineHeight;
      doc.text(`Generated: ${generated}`, 40, y);
      y += lineHeight * 1.5;
      doc.setFontSize(12);
      doc.text(`Total Orders: ${summary.totalOrders}`, 40, y); y += lineHeight;
      doc.text(`Sales: Rs ${Math.round(summary.totalSales)}`, 40, y); y += lineHeight;
      doc.text(`Profit: Rs ${Math.round(summary.totalProfit)}`, 40, y); y += lineHeight;
      doc.text(`Discount: Rs ${Math.round(summary.totalDiscount)}`, 40, y); y += lineHeight * 1.5;
      doc.text("Best Selling Products:", 40, y);
      y += lineHeight;
      summary.bestSelling.slice(0, 5).forEach(([name, qty]) => {
        doc.text(`${name} — ${qty}`, 48, y);
        y += lineHeight;
      });
      y += lineHeight;
      doc.setFontSize(11);
      doc.text("Order ID", 40, y);
      doc.text("Customer", 140, y);
      doc.text("Total", 300, y);
      doc.text("Profit", 360, y);
      doc.text("Status", 430, y);
      y += lineHeight;
      for (const order of orders.slice(0, 15)) {
        if (y > 760) {
          doc.addPage();
          y = 40;
        }
        doc.text(String(order.id), 40, y);
        doc.text(String(order.customer_name || "Walk-in"), 140, y, { maxWidth: 140 });
        doc.text(`Rs ${order.total || 0}`, 300, y);
        doc.text(`Rs ${order.profit || 0}`, 360, y);
        doc.text(String(order.status || ""), 430, y);
        y += lineHeight;
      }
      doc.save(`report-${selectedRange.toLowerCase().replace(/\s+/g, "-")}.pdf`);
    } catch (error) {
      console.error("PDF report generation failed:", error);
      setMessage("Unable to generate PDF report.");
    }
  };

  const printReport = () => {
    const printContents = document.getElementById("report-print")?.innerHTML;
    if (!printContents) {
      setMessage("Unable to print report.");
      return;
    }
    const win = window.open("", "", "width=1200,height=900");
    if (!win) {
      setMessage("Please allow popups to print the report.");
      return;
    }
    win.document.write(`
      <html>
        <head>
          <title>Report</title>
          <style>
            body { margin: 0; padding: 24px; font-family: Inter, system-ui, sans-serif; background: #0f172a; color: #f8fafc; }
            .report-container { width: 100%; max-width: 900px; margin: 0 auto; }
            .report-container h1, .report-container h2, .report-container h3 { color: #f8fafc; }
            .report-table { width: 100%; border-collapse: collapse; margin-top: 16px; }
            .report-table th, .report-table td { border: 1px solid #334155; padding: 8px; }
            .report-table th { background: #1e293b; }
            .no-print { display: none !important; }
          </style>
        </head>
        <body>
          <div class="report-container">${printContents}</div>
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

  const barMax = Math.max(...summary.dailyBreakdown.map((day) => day.sales), 1);
  const profitMax = Math.max(...summary.dailyBreakdown.map((day) => Math.abs(day.profit)), 1);
  const orderMax = Math.max(...summary.dailyBreakdown.map((day) => day.orders), 1);

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-12 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-5xl font-black">Reports</h1>
            <p className="mt-2 text-slate-400">Complete restaurant analytics and exportable reports.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button onClick={exportCSV} variant="outline" className="rounded-full px-5 py-3 text-sm no-print">
              <Download size={16} /> CSV
            </Button>
            <Button onClick={downloadPDF} variant="outline" className="rounded-full px-5 py-3 text-sm no-print">
              <FileText size={16} /> PDF
            </Button>
            <Button onClick={printReport} className="rounded-full bg-orange-500 px-5 py-3 text-sm text-white no-print hover:bg-orange-400">
              <Printer size={16} /> Print
            </Button>
          </div>
        </div>

        <div className="rounded-[2rem] border border-slate-800 bg-slate-900 p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap gap-2">
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
            {selectedRange === "Custom" && (
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 rounded-full border border-slate-700 bg-slate-950 px-4 py-3">
                  <CalendarDays size={18} />
                  <input type="date" value={customStart} onChange={(e) => setCustomStart(e.target.value)} className="bg-transparent text-white outline-none" />
                </div>
                <div className="flex items-center gap-2 rounded-full border border-slate-700 bg-slate-950 px-4 py-3">
                  <CalendarDays size={18} />
                  <input type="date" value={customEnd} onChange={(e) => setCustomEnd(e.target.value)} className="bg-transparent text-white outline-none" />
                </div>
                <Button onClick={handleCustomApply} className="rounded-full bg-orange-500 px-5 py-3 text-sm text-white hover:bg-orange-400">
                  Apply
                </Button>
              </div>
            )}
          </div>
          {message && <div className="mt-4 rounded-[2rem] border border-rose-500/30 bg-rose-500/10 px-6 py-4 text-slate-100">{message}</div>}
        </div>

        <div id="report-print" className="space-y-6">
          <div className="rounded-[2rem] border border-slate-800 bg-slate-900 p-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Report period</p>
                <h2 className="mt-2 text-2xl font-black text-white">{rangeLabel}</h2>
              </div>
              <div className="rounded-full bg-slate-950 px-4 py-3 text-sm text-slate-300">Orders: {summary.totalOrders}</div>
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {[
              { label: "Total Orders", value: summary.totalOrders },
              { label: "Total Sales", value: `Rs ${Math.round(summary.totalSales)}` },
              { label: "Total Profit", value: `Rs ${Math.round(summary.totalProfit)}` },
              { label: "Total Cost", value: `Rs ${Math.round(summary.totalCost)}` },
            ].map((card) => (
              <div key={card.label} className="rounded-[2rem] border border-slate-800 bg-slate-900 p-6">
                <p className="text-sm uppercase tracking-[0.25em] text-slate-500">{card.label}</p>
                <p className="mt-3 text-3xl font-black text-white">{card.value}</p>
              </div>
            ))}
          </div>

          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {[
              { label: "Total Discount", value: `Rs ${Math.round(summary.totalDiscount)}` },
              { label: "Average Order", value: `Rs ${Math.round(summary.averageOrder)}` },
              { label: "Completed", value: summary.completedOrders },
              { label: "Cancelled", value: summary.cancelledOrders },
            ].map((card) => (
              <div key={card.label} className="rounded-[2rem] border border-slate-800 bg-slate-900 p-6">
                <p className="text-sm uppercase tracking-[0.25em] text-slate-500">{card.label}</p>
                <p className="mt-3 text-3xl font-black text-white">{card.value}</p>
              </div>
            ))}
          </div>

          <div className="grid gap-6 xl:grid-cols-3">
            <div className="rounded-[2rem] border border-slate-800 bg-slate-900 p-6">
              <h3 className="text-2xl font-black text-white">Sales Trend</h3>
              <div className="mt-6 space-y-3">
                {summary.dailyBreakdown.map((day) => (
                  <div key={day.label} className="space-y-1">
                    <div className="flex items-center justify-between text-sm text-slate-400">
                      <span>{day.label}</span>
                      <span>Rs {Math.round(day.sales)}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                      <div className="h-full rounded-full bg-orange-500" style={{ width: `${Math.round((day.sales / barMax) * 100)}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[2rem] border border-slate-800 bg-slate-900 p-6">
              <h3 className="text-2xl font-black text-white">Profit Trend</h3>
              <div className="mt-6 space-y-3">
                {summary.dailyBreakdown.map((day) => (
                  <div key={day.label} className="space-y-1">
                    <div className="flex items-center justify-between text-sm text-slate-400">
                      <span>{day.label}</span>
                      <span>Rs {Math.round(day.profit)}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                      <div className="h-full rounded-full bg-emerald-500" style={{ width: `${Math.round((Math.abs(day.profit) / profitMax) * 100)}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[2rem] border border-slate-800 bg-slate-900 p-6">
              <h3 className="text-2xl font-black text-white">Order Volume</h3>
              <div className="mt-6 space-y-3">
                {summary.dailyBreakdown.map((day) => (
                  <div key={day.label} className="space-y-1">
                    <div className="flex items-center justify-between text-sm text-slate-400">
                      <span>{day.label}</span>
                      <span>{day.orders}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                      <div className="h-full rounded-full bg-sky-500" style={{ width: `${Math.round((day.orders / orderMax) * 100)}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="rounded-[2rem] border border-slate-800 bg-slate-900 p-6 lg:col-span-2">
              <h3 className="text-2xl font-black text-white">Orders</h3>
              <div className="mt-6 overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-800 text-left text-sm text-slate-300">
                  <thead>
                    <tr>
                      <th className="px-4 py-3">Order</th>
                      <th className="px-4 py-3">Customer</th>
                      <th className="px-4 py-3">Total</th>
                      <th className="px-4 py-3">Profit</th>
                      <th className="px-4 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {orders.map((order) => (
                      <tr key={order.id} className="hover:bg-slate-950/70">
                        <td className="px-4 py-3">{order.id}</td>
                        <td className="px-4 py-3">{order.customer_name || "Walk-in"}</td>
                        <td className="px-4 py-3">Rs {order.total}</td>
                        <td className="px-4 py-3">Rs {order.profit || 0}</td>
                        <td className="px-4 py-3">{order.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="rounded-[2rem] border border-slate-800 bg-slate-900 p-6">
              <h3 className="text-2xl font-black text-white">Top Selling Products</h3>
              <div className="mt-6 space-y-3">
                {summary.bestSelling.length > 0 ? summary.bestSelling.slice(0, 6).map(([name, qty]) => (
                  <div key={name} className="flex items-center justify-between rounded-3xl border border-slate-800 bg-slate-950 px-4 py-3">
                    <span className="text-slate-200">{name}</span>
                    <span className="text-slate-400">{qty}</span>
                  </div>
                )) : <p className="text-slate-400">No product data yet.</p>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
