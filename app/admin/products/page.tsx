// @ts-nocheck
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui";

const initialForm = {
  name: "",
  category: "Pizza",
  price: "",
  cost_price: "",
  stock: "",
  image: "",
  description: "",
  rating: "4.5",
  prep: "20 min",
  popular: false,
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const loadProducts = async () => {
    setLoading(true);
    setMessage("");
    const { data, error } = await (
      supabase.from("products").select("*") as any
    ).order("created_at", { ascending: false });
    setLoading(false);
    if (error) {
      setMessage(`Failed to load products: ${error.message}`);
    } else {
      setProducts(data || []);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setForm(initialForm);
    setEditingId(null);
    setMessage("");
  };

  const handleEdit = (product) => {
    setEditingId(product.id);
    setForm({
      name: product.name || "",
      category: product.category || "Pizza",
      price: String(product.price || ""),
      cost_price: String(product.cost_price || ""),
      stock: String(product.stock || ""),
      image: product.image || "",
      description: product.description || "",
      rating: String(product.rating || "4.5"),
      prep: product.prep || "20 min",
      popular: !!product.popular,
    });
    setMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSave = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    const payload = {
      name: form.name,
      category: form.category,
      price: Number(form.price),
      cost_price: Number(form.cost_price),
      stock: Number(form.stock),
      profit: Number(form.price) - Number(form.cost_price),
      image: form.image,
      description: form.description,
      rating: Number(form.rating),
      prep: form.prep,
      popular: form.popular,
      created_at: new Date().toISOString(),
    };

    let error = null;

    if (editingId) {
      const response = await supabase.from("products").update(payload).eq("id", editingId).select();
      error = response.error;
      if (!error) setMessage("Product updated.");
    } else {
      const response = await supabase.from("products").insert([payload]).select();
      error = response.error;
      if (!error) setMessage("Product added.");
    }

    if (error) {
      setMessage(`Error saving product: ${error.message}`);
    } else {
      resetForm();
      loadProducts();
    }

    setLoading(false);
  };

  const handleDelete = async (id) => {
    setLoading(true);
    setMessage("");
    const { error } = await supabase.from("products").delete().eq("id", id);
    setLoading(false);
    if (error) {
      setMessage(`Error deleting product: ${error.message}`);
    } else {
      setMessage("Product deleted.");
      loadProducts();
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-12 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="rounded-[2rem] border border-slate-800 bg-slate-900 p-8">
          <h1 className="text-4xl font-black">Manage Products</h1>
          <p className="mt-2 text-slate-400">Create, edit, or remove menu items directly from Supabase.</p>
        </div>

        <form onSubmit={handleSave} className="rounded-[2rem] border border-slate-800 bg-slate-900 p-8">
          <div className="grid gap-6 lg:grid-cols-2">
            <input required value={form.name} onChange={(e) => handleChange("name", e.target.value)} placeholder="Name" className="rounded-3xl border border-slate-700 bg-slate-950 px-5 py-4 text-white" />
            <input required value={form.category} onChange={(e) => handleChange("category", e.target.value)} placeholder="Category" className="rounded-3xl border border-slate-700 bg-slate-950 px-5 py-4 text-white" />
            <input required value={form.price} onChange={(e) => handleChange("price", e.target.value)} placeholder="Price" type="number" step="0.01" className="rounded-3xl border border-slate-700 bg-slate-950 px-5 py-4 text-white" />
            <input required value={form.cost_price} onChange={(e) => handleChange("cost_price", e.target.value)} placeholder="Cost Price" type="number" step="0.01" className="rounded-3xl border border-slate-700 bg-slate-950 px-5 py-4 text-white" />
            <input required value={form.stock} onChange={(e) => handleChange("stock", e.target.value)} placeholder="Stock" type="number" className="rounded-3xl border border-slate-700 bg-slate-950 px-5 py-4 text-white" />
            <input required value={form.image} onChange={(e) => handleChange("image", e.target.value)} placeholder="Image URL" className="rounded-3xl border border-slate-700 bg-slate-950 px-5 py-4 text-white" />
            <input value={form.prep} onChange={(e) => handleChange("prep", e.target.value)} placeholder="Prep time" className="rounded-3xl border border-slate-700 bg-slate-950 px-5 py-4 text-white" />
            <input value={form.rating} onChange={(e) => handleChange("rating", e.target.value)} placeholder="Rating" type="number" step="0.1" className="rounded-3xl border border-slate-700 bg-slate-950 px-5 py-4 text-white" />
            <label className="flex items-center gap-3 rounded-3xl border border-slate-700 bg-slate-950 px-5 py-4">
              <input type="checkbox" checked={form.popular} onChange={(e) => handleChange("popular", e.target.checked)} className="h-5 w-5 accent-orange-500" />
              <span>Popular</span>
            </label>
          </div>
          <textarea required value={form.description} onChange={(e) => handleChange("description", e.target.value)} placeholder="Description" className="mt-6 min-h-[120px] w-full rounded-3xl border border-slate-700 bg-slate-950 px-5 py-4 text-white" />
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-slate-400">{editingId ? "Editing existing product" : "Add a new product"}</div>
            <div className="flex gap-3">
              {editingId && (
                <Button type="button" variant="outline" onClick={resetForm} className="rounded-full px-5 py-3">
                  Cancel
                </Button>
              )}
              <Button type="submit" disabled={loading} className="rounded-full px-6 py-3">
                {loading ? "Saving..." : editingId ? "Update Product" : "Add Product"}
              </Button>
            </div>
          </div>
          {message && <p className="mt-4 text-sm text-slate-300">{message}</p>}
        </form>

        <div className="rounded-[2rem] border border-slate-800 bg-slate-900 p-8">
          <h2 className="text-3xl font-black">Product List</h2>
          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-800 text-left text-sm text-slate-300">
              <thead>
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Price</th>
                  <th className="px-4 py-3">Cost</th>
                  <th className="px-4 py-3">Stock</th>
                  <th className="px-4 py-3">Profit</th>
                  <th className="px-4 py-3">Popular</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-slate-950/70">
                    <td className="px-4 py-3">{product.name}</td>
                    <td className="px-4 py-3">{product.category}</td>
                    <td className="px-4 py-3">Rs {product.price}</td>
                    <td className="px-4 py-3">Rs {product.cost_price ?? 0}</td>
                    <td className="px-4 py-3">{product.stock ?? 0}</td>
                    <td className="px-4 py-3">Rs {Math.round((product.price || 0) - (product.cost_price || 0))}</td>
                    <td className="px-4 py-3">{product.popular ? "Yes" : "No"}</td>
                    <td className="px-4 py-3 space-x-2">
                      <Button type="button" variant="outline" onClick={() => handleEdit(product)} className="rounded-full px-4 py-2">
                        Edit
                      </Button>
                      <Button type="button" variant="outline" onClick={() => handleDelete(product.id)} className="rounded-full px-4 py-2">
                        Delete
                      </Button>
                    </td>
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
