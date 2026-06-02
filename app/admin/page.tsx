import Link from "next/link";
import { ArrowRight, BarChart3, LayoutDashboard, ShoppingBag, Wallet, Box } from "lucide-react";

const adminCards = [
  { title: "Dashboard", href: "/admin/dashboard", description: "View sales, orders, profit, and top products.", icon: LayoutDashboard },
  { title: "Orders", href: "/admin/orders", description: "Manage order status, invoices, and reports.", icon: ShoppingBag },
  { title: "Products", href: "/admin/products", description: "Manage menu items with pricing, cost, and stock.", icon: Box },
  { title: "Reports", href: "/admin/reports", description: "View sales reports by period and category.", icon: BarChart3 },
  { title: "POS", href: "/admin/pos", description: "Fast order entry for in-store POS billing.", icon: Wallet },
];

export default function AdminPage() {
  return (
    <main className="min-h-screen bg-slate-950 px-4 py-12 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="rounded-[2rem] border border-slate-800 bg-slate-900 p-8">
          <h1 className="text-5xl font-black">Admin Control Center</h1>
          <p className="mt-3 text-slate-400">Restaurant POS-style management for orders, products, reports, and billing.</p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {adminCards.map((card) => {
            const Icon = card.icon;
            return (
              <Link key={card.title} href={card.href} className="group rounded-[2rem] border border-slate-800 bg-slate-900 p-8 transition hover:border-orange-500/50">
                <div className="flex items-center gap-4">
                  <div className="grid h-14 w-14 place-items-center rounded-3xl bg-orange-500/15 text-orange-300 transition group-hover:bg-orange-500/20">
                    <Icon size={24} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-white">{card.title}</h2>
                    <p className="mt-1 text-slate-400">{card.description}</p>
                  </div>
                </div>
                <div className="mt-8 flex items-center gap-2 text-sm font-bold text-orange-400">
                  Open <ArrowRight size={16} />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </main>
  );
}
