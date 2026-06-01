// @ts-nocheck
"use client";

import React, { useMemo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Award, Bike, ChefHat, Clock, Heart, Image, Mail, MessageCircle, Minus, Plus, Search, ShoppingCart, Star, Trash2, Phone, PackageCheck, MapPin } from "lucide-react";
import { Button, Card, CardContent } from "@/components/ui";
import { categories } from "@/data/foodData";
import { supabase } from "@/lib/supabase";

const galleryImages = [
  "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1499028344343-cd173ffc68a9?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1200&auto=format&fit=crop",
];

function RestaurantWebsite() {
  const [page, setPage] = useState("Home");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [menuPageNum, setMenuPageNum] = useState(1);
  const [cart, setCart] = useState([]);
  const [trackingId, setTrackingId] = useState("");
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [foodItems, setFoodItems] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [userOrders, setUserOrders] = useState([]);

  // Load orders from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("userOrders");
    if (stored) {
      try {
        setUserOrders(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse stored orders", e);
      }
    }
  }, []);

  const addOrderToHistory = (orderId, customerName, phone, address, items, total) => {
    const newOrder = {
      id: orderId,
      customer_name: customerName,
      phone,
      address,
      items,
      total,
      status: "Pending",
      created_at: new Date().toISOString(),
    };
    const updated = [newOrder, ...userOrders];
    setUserOrders(updated);
    localStorage.setItem("userOrders", JSON.stringify(updated));
  };

  const loadProducts = async () => {
    setLoadingProducts(true);
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error) {
      setFoodItems(data || []);
    }

    setLoadingProducts(false);
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const delivery = subtotal > 0 ? 150 : 0;
  const total = subtotal + delivery;

  const filteredItems = useMemo(() => {
    return foodItems.filter((item) => {
      const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
      const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) || item.description.toLowerCase().includes(search.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, search]);

  // Pagination / load more behavior for menu
  const itemsPerPage = 12;
  const displayedItems = useMemo(() => {
    return filteredItems.slice(0, menuPageNum * itemsPerPage);
  }, [filteredItems, menuPageNum]);

  const hasMore = filteredItems.length > displayedItems.length;

  useEffect(() => {
    // simulate loading when filters/search change
    setMenuPageNum(1);
    setIsLoading(true);
    const t = setTimeout(() => setIsLoading(false), 300);
    return () => clearTimeout(t);
  }, [selectedCategory, search]);

  const addToCart = (item) => {
    const qtyToAdd = item.qty || 1;
    setCart((prev) => {
      const existing = prev.find((cartItem) => cartItem.id === item.id);
      if (existing) {
        return prev.map((cartItem) => cartItem.id === item.id ? { ...cartItem, qty: cartItem.qty + qtyToAdd } : cartItem);
      }
      return [...prev, { ...item, qty: qtyToAdd }];
    });
  };

  const updateQty = (id, change) => {
    setCart((prev) => prev
      .map((item) => item.id === id ? { ...item, qty: Math.max(1, item.qty + change) } : item)
      .filter((item) => item.qty > 0));
  };

  const removeItem = (id) => setCart((prev) => prev.filter((item) => item.id !== id));

  const navItems = ["Home", "Menu", "Categories", "My Orders", "Track Order", "About", "Contact", "FAQ"];
  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);
  const openQuickView = (item) => setSelectedItem(item);
  const closeQuickView = () => setSelectedItem(null);
  const loadMore = () => setMenuPageNum((p) => p + 1);

  return (
    <div className="bg-slate-950 text-slate-100">
      <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 lg:px-6">
          <button onClick={() => setPage("Home")} className="flex items-center gap-3 text-xl font-black tracking-tight text-white">
            <img src="https://scontent.flhe38-1.fna.fbcdn.net/v/t39.30808-6/299825356_429330659216310_8922120631896477365_n.jpg?_nc_cat=108&ccb=1-7&_nc_sid=6ee11a&_nc_eui2=AeHW8Hp33TSyrEAtJgbytZYUjJoZoxSqmOyMmhmjFKqY7DuBpf-ey-DBdSejrmvnv3wJdNP4-Q2JwnVMnv1yiQkR&_nc_ohc=w-OauadJs4YQ7kNvwFQEoUt&_nc_oc=AdqxQt_w5H-yOMW0DNri4DuEWR_FAUHv16sygi4mUSwbZNtVTnf6-Hrs81A7rGwl6Lg&_nc_zt=23&_nc_ht=scontent.flhe38-1.fna&_nc_gid=u9Lr_deTDW4pNZ6LZqd6yQ&_nc_ss=7b2a8&oh=00_Af9ZMUWdU9XlZrH_WbXCStkQozGFbnCgBYe8ZRPuSk5Rnw&oe=6A23CB2E" alt="Flafe Logo" className="h-12 w-12 rounded-3xl object-cover shadow-lg" />
            <div className="text-left text-sm leading-tight">
              <div className="font-black">Flafe</div>
              <div className="text-slate-400">فلافے</div>
            </div>
          </button>

          <nav className="hidden items-center gap-2 lg:flex">
            {navItems.map((item) => (
              <button key={item} onClick={() => setPage(item)} className={`rounded-full px-5 py-3 text-sm font-semibold transition ${page === item ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20" : "text-slate-300 hover:bg-slate-900 hover:text-white"}`}>
                {item}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Button onClick={openCart} className="rounded-full bg-orange-500 px-5 py-3 text-sm text-white shadow-lg shadow-orange-500/20 hover:bg-orange-400">
              <ShoppingCart size={18} /> Cart {cartCount > 0 && <span className="ml-2 rounded-full bg-slate-950 px-3 py-1 text-xs font-bold text-white">{cartCount}</span>}
            </Button>
          </div>
        </div>
      </header>

      <main className="relative overflow-hidden">
        {page === "Home" && <HomePage setPage={setPage} addToCart={addToCart} foodItems={foodItems} loadingProducts={loadingProducts} />}
        {page === "Menu" && (
          <MenuPage
            search={search}
            setSearch={setSearch}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            items={displayedItems}
            addToCart={addToCart}
            isLoading={isLoading || loadingProducts}
            loadMore={loadMore}
            hasMore={hasMore}
            openQuickView={openQuickView}
            cart={cart}
            subtotal={subtotal}
            total={total}
          />
        )}
        {page === "Categories" && <CategoriesPage setPage={setPage} setSelectedCategory={setSelectedCategory} />}
        {page === "Checkout" && <CheckoutPage total={total} cart={cart} setPage={setPage} clearCart={() => setCart([])} addOrderToHistory={addOrderToHistory} />}
        {page === "My Orders" && <MyOrdersPage userOrders={userOrders} setPage={setPage} setTrackingId={setTrackingId} />}
        {page === "Track Order" && <TrackingPage trackingId={trackingId} setTrackingId={setTrackingId} />}
        {page === "About" && <AboutPage />}
        {page === "Contact" && <ContactPage />}
        {page === "FAQ" && <FAQPage />}
      </main>

      <CartDrawer
        open={isCartOpen}
        onClose={closeCart}
        cart={cart}
        updateQty={updateQty}
        removeItem={removeItem}
        subtotal={subtotal}
        delivery={delivery}
        total={total}
        onCheckout={() => { setPage("Checkout"); closeCart(); }}
      />

      <QuickViewModal item={selectedItem} onClose={closeQuickView} addToCart={addToCart} />

      <MobileNav navItems={["Home", "Menu", "Categories", "Track Order"]} page={page} setPage={setPage} />
      <Footer setPage={setPage} />
    </div>
  );
}

function HomePage({ setPage, addToCart, foodItems = [], loadingProducts = false }) {
  const popular = foodItems.filter((item) => item.popular).slice(0, 4);

  if (loadingProducts && foodItems.length === 0) {
    return (
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-[2rem] border border-slate-800 bg-slate-900 p-12 text-center">
          <p className="text-white">Loading products...</p>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 px-4 py-12 sm:px-6 lg:px-8">
        <div className="absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_top,_rgba(249,115,22,0.18),_transparent_55%)]" />
        <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[0.9fr_1.1fr]">
          <motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7 }} className="relative z-10">
            <p className="mb-4 inline-flex rounded-full bg-orange-500/15 px-4 py-2 text-sm font-bold uppercase tracking-[0.35em] text-orange-300">Featured</p>
            <h1 className="text-5xl font-black tracking-tight text-white sm:text-6xl lg:text-7xl">Delicious meals, delivered with speed and style.</h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">Explore premium restaurant-quality dishes from burgers and pizza to biryani and desserts, all in one modern delivery experience.</p>
            <div className="mt-6 flex flex-wrap gap-4">
              <Button onClick={() => setPage("Menu")} className="rounded-full bg-orange-500 px-7 py-4 text-base text-white hover:bg-orange-400">Order now</Button>
              <Button onClick={() => setPage("Categories")} variant="outline" className="rounded-full border border-slate-700 bg-slate-950/70 px-7 py-4 text-base text-slate-100 hover:border-orange-500 hover:text-white">Browse categories</Button>
            </div>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-slate-700 bg-slate-900/50 p-4">
                <Star className="text-orange-400" size={20} />
                <p className="mt-3 font-black text-white">4.8 rating</p>
                <p className="text-xs text-slate-400">Trusted by foodies</p>
              </div>
              <div className="rounded-xl border border-slate-700 bg-slate-900/50 p-4">
                <Clock className="text-orange-400" size={20} />
                <p className="mt-3 font-black text-white">25 min</p>
                <p className="text-xs text-slate-400">Average delivery</p>
              </div>
              <div className="rounded-xl border border-slate-700 bg-slate-900/50 p-4">
                <Bike className="text-orange-400" size={20} />
                <p className="mt-3 font-black text-white">24/7</p>
                <p className="text-xs text-slate-400">Service always on</p>
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7 }} className="relative">
            <div className="absolute -left-10 top-12 h-72 w-72 rounded-full bg-orange-500/10 blur-3xl" />
            <div className="overflow-hidden rounded-[3rem] border border-white/10 bg-slate-950/80 shadow-2xl shadow-orange-500/10">
              <img className="w-full object-cover aspect-[11/10]" src="https://scontent.flhe38-1.fna.fbcdn.net/v/t39.30808-6/485727887_1040099368139433_718369802226856397_n.jpg?_nc_cat=101&ccb=1-7&_nc_sid=833d8c&_nc_eui2=AeGsSblrryOLZylT-NFd21nf6YFWC-tGBCLpgVYL60YEIks3yLpUEVsR6VMlFQFL25tSwagr073U6zFsQ9LDx6Qj&_nc_ohc=t03ygRW-Jx8Q7kNvwFLggxp&_nc_oc=AdowcJykFC--KLSIhnKGfoF-p1HLhqObJ9V5qlL2l45uIrSrxm2enm_qQ9MmxBGLnic&_nc_zt=23&_nc_ht=scontent.flhe38-1.fna&_nc_gid=wUj6RXla4zFW6KxXJX7jhQ&_nc_ss=7b2a8&oh=00_Af_ciysdk0bkbr9BMe8OBBJ_5ox62zXeAOtcWc518fcT5A&oe=6A23A8DE" alt="Hero food" />
              <div className="bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent px-8 py-8 text-white backdrop-blur-xl">
                <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-4">
                  <div>
                    <p className="text-sm uppercase tracking-[0.3em] text-orange-300">Chef's choice</p>
                    <h2 className="mt-2 text-2xl font-black">SpiceBite family platter</h2>
                  </div>
                  <span className="rounded-full bg-orange-500 px-4 py-2 text-sm font-black">Rs 1,750</span>
                </div>
                <div className="mt-6 grid grid-cols-3 gap-4 text-sm text-slate-200">
                  <div className="rounded-3xl bg-white/5 p-4 text-center">
                    <p className="font-bold">6+</p>
                    <p className="text-slate-400">Items</p>
                  </div>
                  <div className="rounded-3xl bg-white/5 p-4 text-center">
                    <p className="font-bold">100% </p>
                    <p className="text-slate-400">Fresh</p>
                  </div>
                  <div className="rounded-3xl bg-white/5 p-4 text-center">
                    <p className="font-bold">Popular</p>
                    <p className="text-slate-400">Choice</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <div className="mb-8 flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-orange-500/15 px-4 py-2 text-sm font-bold uppercase tracking-[0.3em] text-orange-200">Popular picks</span>
              <span className="text-sm text-slate-400">Chef favorites from our menu</span>
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              {popular.map((item) => (
                <Card key={item.id} className="overflow-hidden rounded-[2rem] border border-slate-800 bg-slate-950 text-white shadow-2xl">
                  <div className="relative">
                    <img src={item.image} alt={item.name} className="h-64 w-full object-cover" />
                    <div className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full bg-orange-500/90 px-3 py-2 text-xs font-bold uppercase tracking-[0.2em] text-white">Hot</div>
                  </div>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <h3 className="text-xl font-black">{item.name}</h3>
                        <p className="mt-2 text-sm text-slate-900">{item.category}</p>
                      </div>
                      <span className="rounded-3xl bg-slate-900 px-4 py-2 text-sm font-black text-orange-400">Rs {item.price}</span>
                    </div>
                    <p className="mt-4 text-sm leading-6 text-slate-700">{item.description}</p>
                    <div className="mt-6 flex items-center justify-between gap-4">
                      <span className="flex items-center gap-2 text-sm text-slate-500"><Star className="text-orange-400" size={16} /> {item.rating}</span>
                      <Button onClick={() => addToCart(item)} className="rounded-full bg-orange-500 px-5 py-3 text-sm text-white hover:bg-orange-400">Add</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <BannerCard title="Superfast delivery" subtitle="Track every step in real-time." icon={<Bike size={28} />} />
            <BannerCard title="Chef-curated menu" subtitle="Premium dishes made daily." icon={<ChefHat size={28} />} />
            <BannerCard title="Secure payments" subtitle="Safe checkout with instant confirmation." icon={<PackageCheck size={28} />} />
          </div>
        </div>
      </section>

      <section className="bg-slate-900 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-3">
            <Stat label="Average rating" value="4.8" />
            <Stat label="Delivery time" value="25 min" />
            <Stat label="Top dishes" value="8+" />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[0.95fr_0.85fr]">
          <div>
            <div className="mb-8 flex flex-col gap-3">
              <p className="text-sm uppercase tracking-[0.3em] text-orange-500">Customer reviews</p>
              <h2 className="text-4xl font-black text-white">Loved by diners across the city</h2>
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              <ReviewCard author="Ayesha Khan" rating="5.0" feedback="Amazing food and super fast delivery. The packaging looked premium and every bite was flavorful." />
              <ReviewCard author="Bilal Ahmed" rating="4.9" feedback="Best biryani in town. The app design feels modern and ordering was effortless." />
            </div>
          </div>

          <div>
            <div className="rounded-[2rem] bg-slate-950 p-8 text-slate-100 shadow-2xl">
              <p className="text-sm uppercase tracking-[0.3em] text-orange-400">Gallery</p>
              <h3 className="mt-4 text-3xl font-black">Meals worth scrolling</h3>
              <p className="mt-3 text-slate-400">A showcase of our most photographed dishes and signature combos.</p>
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {galleryImages.map((src, index) => (
                  <div key={index} className="overflow-hidden rounded-[2rem] bg-slate-900">
                    <img src={src} alt={`Gallery ${index + 1}`} className="h-44 w-full object-cover transition duration-500 hover:scale-105" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function MenuPage({ search, setSearch, selectedCategory, setSelectedCategory, items = [], addToCart, isLoading, loadMore, hasMore, openQuickView, cart, subtotal, total }) {
  return (
    <div className="bg-slate-950 pb-8">
      <section className="border-b border-slate-800 bg-slate-950/95 px-4 py-4 backdrop-blur-xl sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="text"
                  placeholder="Search dishes, restaurants..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-full border border-slate-700 bg-slate-900/50 py-3 pl-12 pr-6 text-white placeholder-slate-500 shadow-sm focus:border-orange-500 focus:outline-none"
                />
              </div>

              <div className="mt-2 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-bold transition ${selectedCategory === category ? "bg-orange-500 text-white shadow" : "bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white"}`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            <div className="hidden lg:block lg:w-72">
              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4 text-center">
                <p className="text-sm text-slate-400">Restaurant Rating</p>
                <div className="mt-2 flex items-center justify-center gap-2">
                  <Star className="text-orange-400" />
                  <div className="text-lg font-black">4.8</div>
                  <div className="text-sm text-slate-400">(1.2k reviews)</div>
                </div>
                <div className="mt-3 text-sm text-slate-400">Fast delivery • Fresh ingredients • Top-rated chefs</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-12">
          <div className="lg:col-span-9">
            {isLoading ? (
              <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {Array.from({ length: 12 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            ) : items.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {items.map((item) => (
                  <motion.div key={item.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} whileHover={{ y: -6 }} className="">
                    <Card className="overflow-hidden rounded-[1.25rem] border border-slate-800 bg-slate-950 text-white shadow transition-transform hover:scale-[1.01] hover:shadow-2xl">
                      <div className="relative overflow-hidden bg-slate-900">
                        <img src={item.image} alt={item.name} className="h-44 w-full object-cover transition duration-500" />
                        {item.popular && <div className="absolute right-3 top-3 rounded-full bg-orange-500 px-3 py-1 text-xs font-bold text-white">Popular</div>}
                      </div>
                      <CardContent className="flex h-[220px] flex-col p-5">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <h3 className="text-md font-black truncate">{item.name}</h3>
                            <p className="mt-3 text-xs text-slate-700">{item.category}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-bold text-orange-400">Rs {item.price}</div>
                            <div className="text-xs text-slate-700">{item.prep}</div>
                          </div>
                        </div>
                       <p className="mt-3 min-h-[72px] text-sm text-slate-700 line-clamp-3">{item.description}</p>
                        <div className="mt-4 flex items-center gap-2">
                          <Button onClick={() => addToCart(item)} className="rounded-full bg-orange-500 px-3 py-2 text-sm text-white hover:bg-orange-400">Add</Button>
                          <Button variant="outline" onClick={() => openQuickView(item)} className="rounded-full px-3 py-2 text-sm">Quick view</Button>
                          <div className="ml-auto flex shrink-0 items-center gap-2 text-sm text-slate-600"><Star className="text-orange-400" size={14} />{item.rating}</div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center">
                <Search className="mx-auto mb-4 text-slate-500" size={48} />
                <h3 className="text-xl font-bold text-slate-300">No dishes found</h3>
                <p className="mt-2 text-slate-400">Try adjusting your search or category selection.</p>
              </div>
            )}

            <div className="mt-6 flex items-center justify-center">
              {hasMore ? (
                <Button onClick={loadMore} className="rounded-full bg-slate-800 px-6 py-3 text-sm text-white hover:bg-slate-700">Load more</Button>
              ) : (
                <div className="text-sm text-slate-500">No more items</div>
              )}
            </div>
          </div>

          <aside className="lg:col-span-3">
            <div className="sticky top-28 hidden space-y-4 lg:block">
              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-black text-white">Cart Summary</h4>
                    <p className="text-sm text-slate-400">{cart.length} items</p>
                  </div>
                  <div className="text-right">
                    <div className="font-black text-orange-400">Rs {subtotal}</div>
                    <div className="text-sm text-slate-400">Est. total Rs {total}</div>
                  </div>
                </div>
                <Button className="mt-4 w-full rounded-full bg-orange-500 py-3 text-white">Checkout</Button>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}

function CategoriesPage({ setPage, setSelectedCategory }) {
  const categoryImages = {
    Pizza: "https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=1200&auto=format&fit=crop",
    Burger: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?q=80&w=1200&auto=format&fit=crop",
    Biryani: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?q=80&w=1200&auto=format&fit=crop",
    "Fast Food": "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?q=80&w=1200&auto=format&fit=crop",
    Drinks: "https://images.unsplash.com/photo-1544145945-f90425340c7e?q=80&w=1200&auto=format&fit=crop",
    Desserts: "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?q=80&w=1200&auto=format&fit=crop",
    Deals: "https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?q=80&w=1200&auto=format&fit=crop",
  };

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-5xl font-black text-white">All Categories</h1>
        <p className="mt-3 text-slate-400">Explore every food type at a glance and find your favorite.</p>
      </motion.div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Object.entries(categoryImages).map(([cat, img], index) => (
          <motion.button
            key={cat}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => {
              setSelectedCategory(cat);
              setPage("Menu");
            }}
            className="group overflow-hidden rounded-[2rem] border border-slate-800 bg-slate-950 text-white transition hover:border-orange-500/50"
          >
            <div className="relative overflow-hidden bg-slate-900">
              <img src={img} alt={cat} className="h-56 w-full object-cover transition duration-500 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/0" />
            </div>
            <div className="relative px-6 py-8">
              <h3 className="text-2xl font-black">{cat}</h3>
              <p className="mt-2 text-slate-400">Explore {cat.toLowerCase()}</p>
              <ArrowRight className="absolute right-6 top-1/2 -translate-y-1/2 transition duration-300 group-hover:translate-x-1 group-hover:text-orange-500" size={24} />
            </div>
          </motion.button>
        ))}
      </div>
    </section>
  );
}

function CartDrawer({ open, onClose, cart, updateQty, removeItem, subtotal, delivery, total, onCheckout }) {
  return (
    <>
      {open && <div onClick={onClose} className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" />}
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: open ? 0 : "100%" }}
        transition={{ duration: 0.3 }}
        className="fixed right-0 top-0 z-50 flex h-full w-full flex-col border-l border-slate-800 bg-slate-950 shadow-2xl sm:w-full md:w-[450px]"
      >
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-6">
          <h2 className="text-2xl font-black text-white">Your Order</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <span className="text-3xl">×</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          {cart.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
              <ShoppingCart className="text-slate-700" size={48} />
              <div>
                <h3 className="text-lg font-bold text-slate-200">Cart is empty</h3>
                <p className="text-slate-900">Add items from menu to get started</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.map((item) => (
                <div key={item.id} className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
                  <div className="flex gap-4">
                    <img src={item.image} alt={item.name} className="h-20 w-20 rounded-lg object-cover" />
                    <div className="flex-1">
                      <h4 className="font-bold text-white">{item.name}</h4>
                      <p className="text-sm text-slate-400">Rs {item.price}</p>
                      <div className="mt-3 flex items-center gap-3">
                        <button onClick={() => updateQty(item.id, -1)} className="rounded bg-slate-800 p-1 text-slate-300 hover:text-white">
                          <Minus size={16} />
                        </button>
                        <span className="w-8 text-center font-bold text-white">{item.qty}</span>
                        <button onClick={() => updateQty(item.id, 1)} className="rounded bg-slate-800 p-1 text-slate-300 hover:text-white">
                          <Plus size={16} />
                        </button>
                        <button onClick={() => removeItem(item.id)} className="ml-auto text-slate-500 hover:text-red-500">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {cart.length > 0 && (
          <div className="border-t border-slate-800 bg-slate-900/50 px-6 py-6">
            <div className="space-y-3">
              <div className="flex justify-between text-sm text-slate-400">
                <span>Subtotal</span>
                <span>Rs {subtotal}</span>
              </div>
              <div className="flex justify-between text-sm text-slate-400">
                <span>Delivery</span>
                <span>Rs {delivery}</span>
              </div>
              <div className="border-t border-slate-800 pt-3">
                <div className="flex justify-between font-bold text-white">
                  <span>Total</span>
                  <span>Rs {total}</span>
                </div>
              </div>
            </div>
            <Button onClick={onCheckout} className="mt-6 w-full rounded-full bg-orange-500 py-4 text-base font-bold text-white hover:bg-orange-400">
              Proceed to Checkout
            </Button>
          </div>
        )}
      </motion.div>
    </>
  );
}

function CheckoutPage({ total, cart, setPage, clearCart, addOrderToHistory }) {
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [placed, setPlaced] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const placeOrder = async () => {
    if (!customerName || !phone || !address) {
      setError("Please fill in the required fields.");
      return;
    }
    if (cart.length === 0) {
      setError("Your cart is empty.");
      return;
    }

    setSaving(true);
    setError("");
    const generatedId = `SB-${Math.floor(100000 + Math.random() * 900000)}`;

    const { error: supabaseError } = await supabase.from("orders").insert([
      {
        id: generatedId,
        customer_name: customerName,
        phone,
        address: `${address}${notes ? ` | Notes: ${notes}` : ""}`,
        items: cart,
        total,
        status: "Pending",
        created_at: new Date().toISOString(),
      },
    ]);

    setSaving(false);

    if (supabaseError) {
      setError("Unable to place order. Please try again.");
      return;
    }

    setOrderId(generatedId);
    addOrderToHistory(generatedId, customerName, phone, address, cart, total);
    clearCart();
    setPlaced(true);
  };

  if (placed) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-[2rem] border border-slate-800 bg-slate-900 p-12 text-center shadow-2xl">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200 }}>
            <PackageCheck className="mx-auto text-orange-500" size={80} />
          </motion.div>
          <h1 className="mt-6 text-5xl font-black text-white">Order Placed!</h1>
          <p className="mt-4 text-lg text-slate-400">
            Your order ID is <span className="font-bold text-orange-400">{orderId}</span>
          </p>
          <p className="mt-2 text-slate-500">Track your order in real-time from the tracking page.</p>
          <Button onClick={() => setPage("Track Order")} className="mt-8 rounded-full bg-orange-500 px-8 py-4 text-base text-white hover:bg-orange-400">
            Track Order
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-5xl font-black text-white">Checkout</h1>
        <p className="mt-2 text-slate-400">Review and confirm your order details</p>
      </motion.div>

      <div className="mt-8 space-y-6">
        <div className="rounded-[2rem] border border-slate-800 bg-slate-900 p-8">
          <h2 className="mb-6 text-2xl font-black text-white">Delivery Details</h2>
          <div className="grid gap-6 md:grid-cols-2">
            <input value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Full Name" className="rounded-xl border border-slate-700 bg-slate-950 px-5 py-4 text-white placeholder-slate-500 focus:border-orange-500 focus:outline-none" />
            <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone (03xx xxxxxxx)" className="rounded-xl border border-slate-700 bg-slate-950 px-5 py-4 text-white placeholder-slate-500 focus:border-orange-500 focus:outline-none" />
            <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="House, street, area" className="col-span-full rounded-xl border border-slate-700 bg-slate-950 px-5 py-4 text-white placeholder-slate-500 focus:border-orange-500 focus:outline-none" />
            <input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Order notes (optional)" className="col-span-full rounded-xl border border-slate-700 bg-slate-950 px-5 py-4 text-white placeholder-slate-500 focus:border-orange-500 focus:outline-none" />
          </div>
          {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
        </div>

        <div className="rounded-[2rem] border border-slate-800 bg-slate-900 p-8">
          <h2 className="mb-6 text-2xl font-black text-white">Payment Method</h2>
          <label className="flex items-center gap-4 rounded-xl border border-slate-700 bg-slate-950/50 p-5 cursor-pointer hover:border-orange-500/50 transition">
            <input type="radio" defaultChecked className="h-5 w-5 accent-orange-500" />
            <div>
              <p className="font-bold text-white">Cash on Delivery</p>
              <p className="text-sm text-slate-400">Pay when your order arrives</p>
            </div>
          </label>
          <label className="mt-4 flex items-center gap-4 rounded-xl border border-slate-700 bg-slate-950/50 p-5 cursor-not-allowed opacity-50">
            <input type="radio" disabled className="h-5 w-5 accent-orange-500" />
            <div>
              <p className="font-bold text-slate-400">Online Payment</p>
              <p className="text-sm text-slate-500">Coming soon</p>
            </div>
          </label>
        </div>

        <div className="rounded-[2rem] border border-orange-500/30 bg-orange-500/5 p-8">
          <div className="space-y-3">
            <div className="flex justify-between text-slate-300">
              <span>Subtotal</span>
              <span>Rs {total}</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Delivery Fee</span>
              <span>Rs 150</span>
            </div>
            <div className="border-t border-slate-700 pt-3">
              <div className="flex justify-between text-2xl font-black text-white">
                <span>Total</span>
                <span className="text-orange-500">Rs {total + 150}</span>
              </div>
            </div>
          </div>
        </div>

        <Button onClick={placeOrder} disabled={saving} className="w-full rounded-full bg-orange-500 py-4 text-lg font-bold text-white hover:bg-orange-400 disabled:opacity-60">
          {saving ? "Placing order..." : `Place Order - Rs ${total + 150}`}
        </Button>
      </div>
    </section>
  );
}

function TrackingPage({ trackingId, setTrackingId }) {
  const [order, setOrder] = useState(null);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState("");

  const statusSteps = ["Pending", "Preparing", "Out for Delivery", "Delivered", "Cancelled"];

  const handleSearch = async () => {
    setError("");
    setOrder(null);
    if (!trackingId) {
      setError("Please enter your order ID.");
      return;
    }
    setSearching(true);
    const { data, error } = await supabase.from("orders").select("*").eq("id", trackingId).single();
    setSearching(false);

    if (error || !data) {
      setError("Order not found. Check your order ID.");
      return;
    }

    setOrder(data);
  };

  const currentIndex = order ? statusSteps.indexOf(order.status) : -1;

  return (
    <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-5xl font-black text-white">Track Order</h1>
        <p className="mt-2 text-slate-400">Enter your order ID to see real status updates.</p>
      </motion.div>

      <div className="mt-6 flex gap-3 flex-col sm:flex-row">
        <input
          value={trackingId}
          onChange={(e) => setTrackingId(e.target.value)}
          placeholder="Enter order ID"
          className="flex-1 rounded-full border border-slate-700 bg-slate-950 px-6 py-4 text-white placeholder-slate-500 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
        />
        <Button onClick={handleSearch} disabled={searching} className="rounded-full bg-orange-500 px-6 text-white hover:bg-orange-400 disabled:opacity-70">
          {searching ? "Searching..." : "Track"}
        </Button>
      </div>
      {error && <p className="mt-4 text-sm text-red-400">{error}</p>}

      {order && (
        <div className="mt-8 space-y-6">
          <div className="rounded-[2rem] border border-slate-800 bg-slate-900 p-8">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Order ID</p>
                <p className="mt-2 text-lg font-black text-white">{order.id}</p>
              </div>
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Status</p>
                <p className="mt-2 text-lg font-black text-orange-400">{order.status}</p>
              </div>
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Customer</p>
                <p className="mt-2 text-lg font-bold text-white">{order.customer_name}</p>
              </div>
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Total</p>
                <p className="mt-2 text-lg font-bold text-orange-400">Rs {order.total}</p>
              </div>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Phone</p>
                <p className="mt-2 text-slate-200">{order.phone}</p>
              </div>
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Address</p>
                <p className="mt-2 text-slate-200">{order.address}</p>
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-800 bg-slate-900 p-8">
            <h2 className="text-2xl font-black text-white">Order Progress</h2>
            <div className="mt-6 space-y-4">
              {statusSteps.map((step, index) => {
                const active = index <= currentIndex && currentIndex !== -1;
                return (
                  <div key={step} className="flex items-center gap-4">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-full text-lg font-black ${active ? "bg-orange-500 text-white" : "bg-slate-800 text-slate-500"}`}>
                      {active ? "✓" : index + 1}
                    </div>
                    <div>
                      <p className={`text-lg font-black ${active ? "text-white" : "text-slate-400"}`}>{step}</p>
                      <p className="text-sm text-slate-500">{index === currentIndex ? "Current status" : index < currentIndex ? "Completed" : "Pending"}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-800 bg-slate-900 p-8">
            <h2 className="text-2xl font-black text-white">Ordered Items</h2>
            <div className="mt-4 space-y-3">
              {(order.items || []).map((item, index) => (
                <div key={index} className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
                  <div className="flex items-center gap-4">
                    <img src={item.image} alt={item.name} className="h-16 w-16 rounded-xl object-cover" />
                    <div>
                      <p className="font-bold text-white">{item.name}</p>
                      <p className="text-sm text-slate-400">Qty {item.qty || 1} • Rs {item.price}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function AboutPage() {
  return (
    <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-[2rem] border border-slate-800 bg-slate-900 p-12">
        <h1 className="text-5xl font-black text-white">About SpiceBite</h1>
        <p className="mt-6 text-lg leading-8 text-slate-300">We are a modern restaurant focused on fresh ingredients, quick service and a smooth online ordering experience. From spicy biryani to cheesy pizza, every dish is made to feel generous, warm and memorable.</p>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <StatCard value="8+" label="Delicious items" />
          <StatCard value="25min" label="Avg delivery" />
          <StatCard value="4.8★" label="Customer rating" />
        </div>
      </motion.div>
    </section>
  );
}

function ContactPage() {
  return (
    <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-5xl font-black text-white">Contact Us</h1>
      </motion.div>

      <div className="mt-10 grid gap-6 md:grid-cols-3">
        <div className="rounded-[2rem] border border-slate-800 bg-slate-900 p-8">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-orange-500/20">
            <Phone className="text-orange-500" />
          </div>
          <h3 className="mt-4 font-black text-white">Phone</h3>
          <p className="mt-2 text-slate-400">+92 300 1234567</p>
        </div>
        <div className="rounded-[2rem] border border-slate-800 bg-slate-900 p-8">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-orange-500/20">
            <Mail className="text-orange-500" />
          </div>
          <h3 className="mt-4 font-black text-white">Email</h3>
          <p className="mt-2 text-slate-400">orders@spicebite.com</p>
        </div>
        <div className="rounded-[2rem] border border-slate-800 bg-slate-900 p-8">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-orange-500/20">
            <MapPin className="text-orange-500" />
          </div>
          <h3 className="mt-4 font-black text-white">Address</h3>
          <p className="mt-2 text-slate-400">Main Food Street, Faisalabad</p>
        </div>
      </div>

      <div className="mt-10 rounded-[2rem] border border-slate-800 bg-slate-900 p-10">
        <h2 className="text-2xl font-black text-white">Send Message</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <input placeholder="Your Name" className="rounded-xl border border-slate-700 bg-slate-950 px-5 py-4 text-white placeholder-slate-500 focus:border-orange-500 focus:outline-none" />
          <input placeholder="Your Email" className="rounded-xl border border-slate-700 bg-slate-950 px-5 py-4 text-white placeholder-slate-500 focus:border-orange-500 focus:outline-none" />
          <textarea placeholder="Your message" rows={4} className="col-span-full rounded-xl border border-slate-700 bg-slate-950 px-5 py-4 text-white placeholder-slate-500 focus:border-orange-500 focus:outline-none" />
        </div>
        <Button className="mt-6 rounded-full bg-orange-500 px-8 py-4 text-white hover:bg-orange-400">Send Message</Button>
      </div>
    </section>
  );
}

function FAQPage() {
  const faqs = [
    ["Delivery time kitna hota hai?", "Usually 25 to 40 minutes, depending on location and order size. Track your order in real-time from the tracking page."],
    ["Payment methods kya hain?", "Cash on delivery available hai. Online payment future version mein add ho sakti hai."],
    ["Order cancel ho sakta hai?", "Preparing start hone se pehle order cancel kiya ja sakta hai. Customer service se contact karen."],
    ["Minimum order amount kya hai?", "Demo website mein minimum amount set nahi, but real version mein add kar sakte hain."],
    ["Food quality guarantee?", "Haan, sab food fresh ingredients se banaya jata hai aur quality check ke baad hi deliver hota hai."],
    ["Return policy kya hai?", "Agar order mein problem ho to customer support se contact kar sakte hain within 30 minutes."],
  ];

  return (
    <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-5xl font-black text-white">Frequently Asked</h1>
        <p className="mt-3 text-slate-400">Get answers to common questions about SpiceBite</p>
      </motion.div>

      <div className="mt-10 space-y-4">
        {faqs.map(([q, a], index) => (
          <motion.div
            key={q}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="rounded-[2rem] border border-slate-800 bg-slate-900 p-6 transition hover:border-orange-500/50"
          >
            <h3 className="font-black text-white">{q}</h3>
            <p className="mt-3 text-slate-300">{a}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function MyOrdersPage({ userOrders, setPage, setTrackingId }) {
  if (userOrders.length === 0) {
    return (
      <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-5xl font-black text-white">My Orders</h1>
          <p className="mt-2 text-slate-400">Track and manage all your orders</p>
        </motion.div>

        <div className="mt-12 rounded-[2rem] border border-slate-800 bg-slate-900 p-12 text-center">
          <ShoppingCart className="mx-auto mb-4 text-slate-500" size={48} />
          <h2 className="text-2xl font-bold text-slate-300">No orders yet</h2>
          <p className="mt-2 text-slate-400">Start by ordering your favorite dishes!</p>
          <Button onClick={() => setPage("Menu")} className="mt-6 rounded-full bg-orange-500 px-8 py-3 text-white hover:bg-orange-400">
            Browse Menu
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-5xl font-black text-white">My Orders</h1>
        <p className="mt-2 text-slate-400">You have {userOrders.length} order{userOrders.length !== 1 ? 's' : ''}</p>
      </motion.div>

      <div className="mt-8 space-y-4">
        {userOrders.map((order, idx) => (
          <motion.div
            key={order.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="rounded-[2rem] border border-slate-800 bg-slate-900 p-6 transition hover:border-orange-500/50"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 flex-wrap">
                  <h3 className="text-xl font-black text-white">Order #{order.id}</h3>
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ${order.status === "Delivered" ? "bg-green-500/20 text-green-300" : order.status === "Cancelled" ? "bg-red-500/20 text-red-300" : "bg-orange-500/20 text-orange-300"}`}>
                    {order.status}
                  </span>
                </div>
                <p className="mt-2 text-sm text-slate-400">{order.customer_name} • {order.phone}</p>
                <p className="mt-1 text-sm text-slate-500">{new Date(order.created_at).toLocaleDateString()}</p>
                <p className="mt-2 text-sm text-slate-300">{order.items.length} item{order.items.length !== 1 ? 's' : ''} • <span className="font-bold text-orange-400">Rs {order.total}</span></p>
              </div>
              <Button
                onClick={() => {
                  setTrackingId(order.id);
                  setPage("Track Order");
                }}
                className="rounded-full bg-orange-500 px-6 py-3 text-sm text-white hover:bg-orange-400"
              >
                <PackageCheck size={16} className="mr-2" /> Track
              </Button>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

// Helper components
function BannerCard({ title, subtitle, icon }) {
  return (
    <div className="rounded-[2rem] border border-slate-800 bg-slate-900 p-8 transition hover:border-orange-500/50">
      <div className="grid h-16 w-16 place-items-center rounded-2xl bg-orange-500/20 text-orange-400">{icon}</div>
      <h3 className="mt-6 text-2xl font-black text-white">{title}</h3>
      <p className="mt-2 text-slate-400">{subtitle}</p>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-[2rem] border border-slate-800 bg-slate-900 p-8 text-center">
      <p className="text-5xl font-black text-orange-500">{value}</p>
      <p className="mt-3 text-slate-400">{label}</p>
    </motion.div>
  );
}

function StatCard({ value, label }) {
  return (
    <div className="rounded-xl border border-slate-700 bg-slate-950 p-6 text-center">
      <p className="text-3xl font-black text-orange-500">{value}</p>
      <p className="mt-2 text-sm text-slate-400">{label}</p>
    </div>
  );
}

function ReviewCard({ author, rating, feedback }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-[2rem] border border-slate-800 bg-slate-900 p-6">
      <div className="flex items-center gap-2">
        {[...Array(5)].map((_, i) => (
          <Star key={i} className={`${i < Math.floor(parseFloat(rating)) ? "fill-orange-400 text-orange-400" : "text-slate-700"}`} size={16} />
        ))}
      </div>
      <p className="mt-4 text-slate-300">{feedback}</p>
      <p className="mt-4 font-bold text-white">— {author}</p>
    </motion.div>
  );
}

function SkeletonCard() {
  return (
    <div className="animate-pulse">
      <div className="rounded-[1.25rem] border border-slate-800 bg-slate-900">
        <div className="h-44 w-full bg-slate-800" />
        <div className="p-4">
          <div className="h-4 w-3/4 rounded bg-slate-800" />
          <div className="mt-3 h-3 w-1/2 rounded bg-slate-800" />
          <div className="mt-4 flex items-center gap-2">
            <div className="h-8 w-20 rounded bg-slate-800" />
            <div className="h-8 w-16 rounded bg-slate-800" />
          </div>
        </div>
      </div>
    </div>
  );
}

function QuickViewModal({ item, onClose, addToCart }) {
  const [qty, setQty] = useState(1);
  if (!item) return null;

  return (
    <>
      <div onClick={onClose} className="fixed inset-0 z-50 bg-black/50" />
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.18 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
      >
        <div className="max-w-3xl rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <div className="grid gap-4 md:grid-cols-2">
            <img src={item.image} alt={item.name} className="h-64 w-full rounded-lg object-cover" />
            <div>
              <h3 className="text-2xl font-black text-white">{item.name}</h3>
              <p className="mt-2 text-sm text-slate-400">{item.category} • {item.prep}</p>
              <div className="mt-4 text-sm text-slate-300">{item.description}</div>
              <div className="mt-4 flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm text-slate-300"><Star className="text-orange-400" />{item.rating}</div>
                <div className="text-lg font-black text-orange-400">Rs {item.price}</div>
              </div>

              <div className="mt-6 flex items-center gap-3">
                <button onClick={() => setQty(Math.max(1, qty - 1))} className="rounded bg-slate-800 px-3 py-2">-</button>
                <div className="w-8 text-center font-bold">{qty}</div>
                <button onClick={() => setQty(qty + 1)} className="rounded bg-slate-800 px-3 py-2">+</button>
                <Button
                  onClick={() => {
                    addToCart({ ...item, qty });
                    onClose();
                  }}
                  className="ml-auto rounded-full bg-orange-500 px-4 py-2 text-white"
                >
                  Add {qty}
                </Button>
              </div>
            </div>
          </div>
          <div className="mt-4 text-right">
            <button onClick={onClose} className="text-sm text-slate-400 hover:text-white">Close</button>
          </div>
        </div>
      </motion.div>
    </>
  );
}

function MobileNav({ navItems, page, setPage }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-800 bg-slate-950 px-4 py-3 md:hidden">
      <div className="flex gap-2 overflow-x-auto">
        {navItems.map((item) => (
          <button
            key={item}
            onClick={() => setPage(item)}
            className={`whitespace-nowrap rounded-full px-5 py-2 text-sm font-bold transition ${
              page === item ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20" : "bg-slate-900 text-slate-400 hover:text-white"
            }`}
          >
            {item}
          </button>
        ))}
      </div>
    </div>
  );
}

function Footer({ setPage }) {
  return (
    <footer className="border-t border-slate-800 bg-slate-950 px-4 py-10 text-slate-300">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <h3 className="text-xl font-black text-white">SpiceBite</h3>
            <p className="mt-2 text-sm text-slate-500">Modern restaurant, delicious food, fast delivery.</p>
          </div>
          <div>
            <p className="font-bold text-white">Quick Links</p>
            <div className="mt-3 space-y-2">
              {["Menu", "Track Order", "Contact", "FAQ"].map((item) => (
                <button key={item} onClick={() => setPage(item)} className="block text-sm hover:text-orange-500">
                  {item}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="font-bold text-white">Hours</p>
            <p className="mt-3 text-sm">Open 10 AM - 11 PM</p>
            <p className="text-sm">7 days a week</p>
          </div>
          <div>
            <p className="font-bold text-white">Follow</p>
            <div className="mt-3 space-y-2">
              <p className="text-sm">Facebook</p>
              <p className="text-sm">Instagram</p>
            </div>
          </div>
        </div>
        <div className="mt-8 border-t border-slate-800 pt-6 text-center text-sm text-slate-500">
          <p>© 2024 SpiceBite. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

export default RestaurantWebsite;
