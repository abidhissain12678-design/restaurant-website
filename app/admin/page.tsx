import Link from "next/link";

export default function AdminPage() {
  return (
    <main className="min-h-screen bg-slate-950 px-4 py-12 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="rounded-[2rem] border border-slate-800 bg-slate-900 p-8">
          <h1 className="text-5xl font-black">Admin Dashboard</h1>
          <p className="mt-3 text-slate-400">Manage products and orders from your Supabase backend.</p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <Link href="/admin/products" className="rounded-[2rem] border border-slate-800 bg-slate-900 p-8 transition hover:border-orange-500/50">
            <h2 className="text-2xl font-black text-white">Products</h2>
            <p className="mt-2 text-slate-400">Create, edit, and delete menu items.</p>
          </Link>
          <Link href="/admin/orders" className="rounded-[2rem] border border-slate-800 bg-slate-900 p-8 transition hover:border-orange-500/50">
            <h2 className="text-2xl font-black text-white">Orders</h2>
            <p className="mt-2 text-slate-400">View orders and update statuses.</p>
          </Link>
        </div>
      </div>
    </main>
  );
}
