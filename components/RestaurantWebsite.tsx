// @ts-nocheck
"use client";

import React, { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Award, Bike, ChefHat, Clock, Heart, Image, Mail, MessageCircle, Minus, Plus, Search, ShoppingCart, Star, Trash2, Phone, PackageCheck, MapPin, Menu, X } from "lucide-react";
import { Button, Card, CardContent } from "@/components/ui";
import { useCart } from "@/components/CartContext";
import PWAInstallPrompt from "@/components/PWAInstallPrompt";
import { supabase } from "@/lib/supabase";

const galleryImages = [
  "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1499028344343-cd173ffc68a9?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1200&auto=format&fit=crop",
];

const categoryImages = {
  Pizza: "https://images.unsplash.com/photo-1542281286-9e0a16bb7366?q=80&w=800&auto=format&fit=crop",
  Burger: "https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=800&auto=format&fit=crop",
  Biryani: "https://images.unsplash.com/photo-1543353071-873f17a7a088?q=80&w=800&auto=format&fit=crop",
  "Fast Food": "https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=800&auto=format&fit=crop",
  Drinks: "https://images.unsplash.com/photo-1502741126161-b048400d6c11?q=80&w=800&auto=format&fit=crop",
  Desserts: "https://images.unsplash.com/photo-1505253211988-1a6b2f0fd0de?q=80&w=800&auto=format&fit=crop",
  Deals: "https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?q=80&w=800&auto=format&fit=crop",
  Default: "https://images.unsplash.com/photo-1498575207497-1dce7f9f7e08?q=80&w=800&auto=format&fit=crop",
};

const heroSlides = [
  {
    title: "Burger Deal",
    subtitle: "Get a juicy burger combo with crispy fries and a drink, delivered hot and fast.",
    cta: "Order Burger",
    image: "https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=1600&auto=format&fit=crop",
  },
  {
    title: "Pizza Deal",
    subtitle: "Premium hand-tossed pizzas with fresh toppings and signature sauces.",
    cta: "Order Pizza",
    image: "https://scontent.flhe38-1.fna.fbcdn.net/v/t39.30808-6/522631570_1131221672360535_6814571547132796139_n.jpg?_nc_cat=102&ccb=1-7&_nc_sid=127cfc&_nc_eui2=AeHAj4lkYDKdik3CRgbJk3yzAw08cpHg8a8DDTxykeDxr1LM8bEsTKywnxWStFHnaUZv1k5PNQ0GTHirizUXGM7P&_nc_ohc=VofnrsjC4k8Q7kNvwGByxVM&_nc_oc=Adr5ZpHsWDLuM_kV2ZYCE4l70vay2KZJFh5-P2epCZuaKQ-LxncQ0sViqYJ1EDvr5Ns&_nc_zt=23&_nc_ht=scontent.flhe38-1.fna&_nc_gid=5lKO38HZ1WJmvDXaeexC4g&_nc_ss=7b2a8&oh=00_Af88VXjILtKE8lMCYYECl4pk3ydgU-jfs41BANuhg_hPnQ&oe=6A24C8F0",
  },
  {
    title: "Family Combo",
    subtitle: "Share a generous family feast with favorites for everyone at the table.",
    cta: "Order Family Combo",
    image: "https://scontent.flhe38-1.fna.fbcdn.net/v/t39.30808-6/462040870_919136030235768_8994001254767627136_n.png?stp=dst-png_s960x960&_nc_cat=111&ccb=1-7&_nc_sid=cc71e4&_nc_eui2=AeEb4XMyHZByRqXPNDqHwg4RX0SFus9UgvZfRIW6z1SC9mzdrGvESQayH0ONAhASBwH3QUO50CHHQx3BhTABvj0s&_nc_ohc=zkyw0XoOgNcQ7kNvwFHoJya&_nc_oc=AdrOEHnNgQfMPi4YaQN-M7gycGR5iljPeIdrjAW4M5Hc73XOJpG7OpUMs_hWfoRp0hU&_nc_zt=23&_nc_ht=scontent.flhe38-1.fna&_nc_gid=Nimkpfvj3BIlTXawFGBOCg&_nc_ss=7b2a8&oh=00_Af-QWxl-oZA0QJzyxTUVgdzJYcCwofQ0C7K0pV0bUS5k9g&oe=6A258502",
  },
  {
    title: "Free Delivery",
    subtitle: "Enjoy fast delivery with no extra fee on all orders above Rs 1,000.",
    cta: "Start Free Delivery",
    image: "https://scontent.flhe38-1.fna.fbcdn.net/v/t39.30808-6/623360472_1281290140687020_2096769519967754830_n.jpg?_nc_cat=104&ccb=1-7&_nc_sid=127cfc&_nc_eui2=AeGHaLggTiD14zXPnbSJeuZGzGm3wvNDLTbMabfC80MtNrFmyBV284y9xsjFVKNvhnRHLR9sZyM2j8drU8AuulP8&_nc_ohc=5V8r1G4fLa8Q7kNvwHYXA7B&_nc_oc=AdoURqiBUTmuJHV6tm41L_q9iBFp7YlJCD1v1RJlyWcVejpWbqI6JkZfIsKrQRmj2i8&_nc_zt=23&_nc_ht=scontent.flhe38-1.fna&_nc_gid=UP0w0cqjZYR6_xIW7K1rLA&_nc_ss=7b2a8&oh=00_Af_YnbXutNGLC-c-MsQHl5YfLWC9_VuSRPBE4govm7-MJQ&oe=6A24DF9A",
  },
  {
    title: "Weekend Special",
    subtitle: "Reserve your weekend favorites with exclusive chef-curated combos.",
    cta: "Weekend Specials",
    image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1600&auto=format&fit=crop",
  },
];

const appCategories = ["All", "Burger", "Pizza", "Deals", "Biryani", "Fast Food", "Drinks", "Desserts"];

function RestaurantWebsite() {
  const [page, setPage] = useState("Home");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [menuPageNum, setMenuPageNum] = useState(1);
  const [trackingId, setTrackingId] = useState("");
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [foodItems, setFoodItems] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [userOrders, setUserOrders] = useState([]);

  const { cart, cartCount, subtotal, delivery, total, addToCart, removeFromCart, updateQty, clearCart } = useCart();
  const searchParams = useSearchParams();

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

  useEffect(() => {
    if (searchParams.get("showCart") === "true") {
      setIsCartOpen(true);
    }
  }, [searchParams]);

  const profit = cart.reduce((sum, item) => {
    const cost = Number(item.cost_price || item.cost || 0);
    return sum + (Number(item.price || 0) - cost) * Number(item.qty || 1);
  }, 0);

  const availableCategories = useMemo(() => appCategories, []);

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

  const removeItem = removeFromCart;

  const router = useRouter();
  const navItems = ["Home", "Menu Card"];
  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);
  const toggleMenu = () => setIsMenuOpen((value) => !value);
  const closeMenu = () => setIsMenuOpen(false);
  const openQuickView = (item) => setSelectedItem(item);
  const closeQuickView = () => setSelectedItem(null);
  const loadMore = () => setMenuPageNum((p) => p + 1);

  const handleNavClick = (item) => {
    if (item === "Menu Card") {
      router.push("/menu-card");
      return;
    }

    setPage(item);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-100 via-pink-50 to-rose-200 text-slate-900 overflow-x-hidden">
      <header className="sticky top-0 z-50 border-b border-rose-200 bg-white/90 backdrop-blur-xl shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8 lg:py-4">
          <button onClick={() => setPage("Home")} className="flex items-center gap-3 rounded-3xl bg-white px-3 py-2 shadow-sm shadow-rose-100 transition hover:shadow-rose-200 sm:px-4">
            <img src="https://scontent.flhe38-1.fna.fbcdn.net/v/t39.30808-6/299825356_429330659216310_8922120631896477365_n.jpg?_nc_cat=108&ccb=1-7&_nc_sid=6ee11a&_nc_eui2=AeHW8Hp33TSyrEAtJgbytZYUjJoZoxSqmOyMmhmjFKqY7DuBpf-ey-DBdSejrmvnv3wJdNP4-Q2JwnVMnv1yiQkR&_nc_ohc=w-OauadJs4YQ7kNvwFQEoUt&_nc_oc=AdqxQt_w5H-yOMW0DNri4DuEWR_FAUHv16sygi4mUSwbZNtVTnf6-Hrs81A7rGwl6Lg&_nc_zt=23&_nc_ht=scontent.flhe38-1.fna&_nc_gid=u9Lr_deTDW4pNZ6LZqd6yQ&_nc_ss=7b2a8&oh=00_Af9ZMUWdU9XlZrH_WbXCStkQozGFbnCgBYe8ZRPuSk5Rnw&oe=6A23CB2E" alt="Flafe Logo" className="h-11 w-11 rounded-3xl object-cover" />
            <div className="text-left leading-tight">
              <div className="text-base font-black text-slate-900">Flafe</div>
              <div className="text-[11px] uppercase tracking-[0.3em] text-slate-500">Restaurant</div>
            </div>
          </button>

          <nav className="hidden lg:flex flex-1 justify-center gap-2">
            {navItems.map((item) => (
              <button key={item} onClick={() => handleNavClick(item)} className={`rounded-full px-5 py-2 text-sm font-semibold transition ${page === item ? "bg-[#ff3b4f] text-white shadow-lg shadow-rose-300/50" : "text-slate-600 hover:bg-white hover:text-slate-900"}`}>
                {item}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <div className="hidden lg:inline-flex">
              <PWAInstallPrompt />
            </div>
            <Button onClick={openCart} className="inline-flex items-center justify-center rounded-full bg-[#ff3b4f] px-4 py-2 text-xs text-white shadow-lg shadow-rose-300/50 hover:bg-rose-600 sm:px-5 sm:py-3 sm:text-sm">
              <ShoppingCart size={16} />
              <span className="hidden sm:inline">Cart</span>
              {cartCount > 0 && <span className="ml-2 rounded-full bg-slate-900 px-2 py-0.5 text-xs font-bold text-white">{cartCount}</span>}
            </Button>
            <button
              type="button"
              onClick={toggleMenu}
              className="inline-flex items-center justify-center rounded-full bg-black text-white h-11 w-11"
              aria-label="Open menu"
            >
              <Menu size={20} />
            </button>
          </div>
        </div>
      </header>

      <main className="relative overflow-hidden">
        {page === "Home" && <HomePage setPage={handleNavClick} setSelectedCategory={setSelectedCategory} search={search} setSearch={setSearch} selectedCategory={selectedCategory} categories={availableCategories} addToCart={addToCart} openCart={openCart} foodItems={foodItems} loadingProducts={loadingProducts} />}
        {page === "Menu" && (
          <MenuPage
            search={search}
            setSearch={setSearch}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            categories={availableCategories}
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
        {page === "Categories" && (
          <CategoriesPage
            setPage={setPage}
            setSelectedCategory={setSelectedCategory}
            categories={availableCategories}
          />
        )}
        {page === "Checkout" && <CheckoutPage total={total} delivery={delivery} subtotal={subtotal} profit={profit} cart={cart} setPage={setPage} clearCart={() => setCart([])} addOrderToHistory={addOrderToHistory} />}
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

      <MobileNav page={page} setPage={handleNavClick} openCart={openCart} />
      <HamburgerMenu open={isMenuOpen} onClose={closeMenu} setPage={(pageName) => { handleNavClick(pageName); closeMenu(); }} />
      <Footer setPage={handleNavClick} />
    </div>
  );
}

function HomePage({ setPage, setSelectedCategory, search, setSearch, selectedCategory, categories = [], addToCart, openCart, foodItems = [], loadingProducts = false }) {
  const popularBurgers = foodItems.filter((item) => item.category?.toLowerCase().includes("burger")).slice(0, 4);
  const pizzaDeals = foodItems.filter((item) => item.category?.toLowerCase().includes("pizza") || item.category?.toLowerCase().includes("deal")).slice(0, 4);
  const recommended = foodItems.filter((item) => item.popular || item.rating >= 4.5).slice(0, 4);
  const recommendedItems = recommended.length ? recommended : foodItems.slice(0, 4);
  const menuCardItems = foodItems.slice(0, 6);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!isPaused) {
        setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [isPaused]);

  const goNextSlide = () => setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  const goPrevSlide = () => setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);

  if (loadingProducts && foodItems.length === 0) {
    return (
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-[2rem] bg-white p-12 text-center shadow-xl shadow-rose-200/40">
          <p className="text-slate-900">Loading products...</p>
        </div>
      </section>
    );
  }

  const hero = heroSlides[currentSlide];

  return (
    <>
      <section className="relative overflow-hidden pb-16">
        <div className="absolute inset-0 bg-gradient-to-br from-rose-100 via-pink-50 to-rose-200" />
        <div className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="overflow-hidden rounded-[2rem] bg-white shadow-[0_50px_120px_-80px_rgba(255,59,79,0.55)]">
            <div className="relative h-[420px] sm:h-[520px]">
              <img src={hero.image} alt={hero.title} className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
              <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-10">
                <span className="inline-flex rounded-full bg-[#ff3b4f]/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.35em] text-[#ff3b4f]">Top Deal</span>
                <h1 className="mt-4 text-4xl font-black leading-tight text-white sm:text-5xl">{hero.title}</h1>
                <p className="mt-4 max-w-2xl text-base leading-7 text-slate-100 sm:text-lg">{hero.subtitle}</p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Button onClick={() => setPage("Menu")} className="rounded-full bg-[#ff3b4f] px-6 py-3 text-sm text-white shadow-lg shadow-rose-300/40 hover:bg-rose-600">{hero.cta}</Button>
                  <Button onClick={openCart} variant="outline" className="rounded-full border border-white/20 bg-white/10 px-6 py-3 text-sm text-white hover:border-[#ff3b4f]">View Cart</Button>
                </div>
              </div>
            </div>
            <div className="mx-auto flex max-w-md items-center justify-center gap-3 p-6">
              {heroSlides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`h-2.5 rounded-full transition-all ${currentSlide === index ? "w-10 bg-[#ff3b4f]" : "w-3 bg-slate-300"}`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>

          <div className="mt-8">
            <div className="rounded-[2rem] bg-white p-5 shadow-lg shadow-rose-100">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="relative flex-1">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-rose-300" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search food, drinks or deals"
                    className="w-full rounded-full border border-rose-100 bg-rose-50 px-12 py-3 text-sm text-slate-900 shadow-sm focus:border-[#ff3b4f] focus:outline-none"
                  />
                </div>
                <Button onClick={openCart} className="w-full rounded-full bg-[#ff3b4f] px-5 py-3 text-sm text-white shadow-lg shadow-rose-200/40 hover:bg-rose-600 sm:w-auto">Open Cart</Button>
              </div>
              <div className="mt-4 flex gap-3 overflow-x-auto pb-3">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => {
                      setSelectedCategory(category);
                      setPage("Menu");
                    }}
                    className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition ${selectedCategory === category ? "bg-[#ff3b4f] text-white shadow" : "bg-rose-50 text-slate-700 hover:bg-rose-100"}`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-[#ff3b4f]">Popular Burgers</p>
            <h2 className="mt-3 text-3xl font-black text-slate-900">Best burgers in town</h2>
          </div>
          <Button onClick={() => { setSelectedCategory("Burger"); setPage("Menu"); }} className="rounded-full bg-[#ff3b4f] px-5 py-3 text-sm text-white shadow-lg shadow-rose-200/40 hover:bg-rose-600">Browse Burgers</Button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {popularBurgers.length > 0 ? popularBurgers.map((item) => (
            <Card key={item.id} className="overflow-hidden rounded-[2rem] border border-rose-100 bg-white shadow-lg">
              <div className="h-48 overflow-hidden bg-rose-50">
                <img src={item.image || categoryImages.Burger} alt={item.name} className="h-full w-full object-cover" />
              </div>
              <CardContent className="p-5">
                <p className="text-xs uppercase tracking-[0.35em] text-rose-300">{item.category}</p>
                <h3 className="mt-3 text-lg font-black text-slate-900">{item.name}</h3>
                <p className="mt-2 text-sm text-slate-500 line-clamp-3">{item.description || "Savory burger with premium toppings."}</p>
                <div className="mt-4 flex items-center justify-between gap-3">
                  <span className="text-sm font-black text-[#ff3b4f]">Rs {item.price}</span>
                  <Button onClick={() => addToCart(item)} className="rounded-full bg-[#ff3b4f] px-4 py-2 text-sm text-white hover:bg-rose-600">Add</Button>
                </div>
              </CardContent>
            </Card>
          )) : (
            <div className="rounded-[2rem] border border-rose-100 bg-white p-8 text-center text-slate-500">No burger recommendations available yet.</div>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-[#ff3b4f]">Pizza Deals</p>
            <h2 className="mt-3 text-3xl font-black text-slate-900">Hot pizza offers</h2>
          </div>
          <Button onClick={() => { setSelectedCategory("Pizza"); setPage("Menu"); }} className="rounded-full bg-[#ff3b4f] px-5 py-3 text-sm text-white shadow-lg shadow-rose-200/40 hover:bg-rose-600">See all pizzas</Button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {pizzaDeals.length > 0 ? pizzaDeals.map((item) => (
            <Card key={item.id} className="overflow-hidden rounded-[2rem] border border-rose-100 bg-white shadow-lg">
              <div className="h-48 overflow-hidden bg-rose-50">
                <img src={item.image || categoryImages.Pizza} alt={item.name} className="h-full w-full object-cover" />
              </div>
              <CardContent className="p-5">
                <p className="text-xs uppercase tracking-[0.35em] text-rose-300">{item.category}</p>
                <h3 className="mt-3 text-lg font-black text-slate-900">{item.name}</h3>
                <p className="mt-2 text-sm text-slate-500 line-clamp-3">{item.description || "Grab this pizza deal with fresh toppings and sides."}</p>
                <div className="mt-4 flex items-center justify-between gap-3">
                  <span className="text-sm font-black text-[#ff3b4f]">Rs {item.price}</span>
                  <Button onClick={() => addToCart(item)} className="rounded-full bg-[#ff3b4f] px-4 py-2 text-sm text-white hover:bg-rose-600">Add</Button>
                </div>
              </CardContent>
            </Card>
          )) : (
            <div className="rounded-[2rem] border border-rose-100 bg-white p-8 text-center text-slate-500">No pizza deals found.</div>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-[#ff3b4f]">Menu Card</p>
            <h2 className="mt-3 text-3xl font-black text-slate-900">Explore our menu cards</h2>
          </div>
          <Button onClick={() => router.push("/menu-card")} className="rounded-full bg-[#ff3b4f] px-5 py-3 text-sm text-white shadow-lg shadow-rose-200/40 hover:bg-rose-600">Full Menu Card</Button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {menuCardItems.length > 0 ? menuCardItems.map((item) => (
            <Card key={item.id} className="overflow-hidden rounded-[2rem] border border-rose-100 bg-white shadow-lg">
              <div className="h-44 overflow-hidden bg-rose-50">
                <img src={item.image || categoryImages.Default} alt={item.name} className="h-full w-full object-cover" />
              </div>
              <CardContent className="p-5">
                <p className="text-xs uppercase tracking-[0.35em] text-rose-300">{item.category}</p>
                <h3 className="mt-3 text-lg font-black text-slate-900">{item.name}</h3>
                <p className="mt-2 text-sm text-slate-500 line-clamp-3">{item.description || "Order from our fresh selection of favorites."}</p>
                <div className="mt-4 flex items-center justify-between gap-3">
                  <span className="text-sm font-black text-[#ff3b4f]">Rs {item.price}</span>
                  <Button onClick={() => addToCart(item)} className="rounded-full bg-[#ff3b4f] px-4 py-2 text-sm text-white hover:bg-rose-600">Add</Button>
                </div>
              </CardContent>
            </Card>
          )) : (
            <div className="rounded-[2rem] border border-rose-100 bg-white p-8 text-center text-slate-500">Loading menu cards...</div>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-[#ff3b4f]">Recommended</p>
            <h2 className="mt-3 text-3xl font-black text-slate-900">Handpicked for you</h2>
          </div>
          <Button onClick={() => setPage("Menu")} className="rounded-full bg-[#ff3b4f] px-5 py-3 text-sm text-white shadow-lg shadow-rose-200/40 hover:bg-rose-600">More picks</Button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {recommendedItems.map((item) => (
            <Card key={item.id} className="overflow-hidden rounded-[2rem] border border-rose-100 bg-white shadow-lg">
              <div className="h-48 overflow-hidden bg-rose-50">
                <img src={item.image || categoryImages.Default} alt={item.name} className="h-full w-full object-cover" />
              </div>
              <CardContent className="p-5">
                <p className="text-xs uppercase tracking-[0.35em] text-rose-300">{item.category}</p>
                <h3 className="mt-3 text-lg font-black text-slate-900">{item.name}</h3>
                <p className="mt-2 text-sm text-slate-500 line-clamp-3">{item.description || "A delicious choice made for your appetite."}</p>
                <div className="mt-4 flex items-center justify-between gap-3">
                  <span className="text-sm font-black text-[#ff3b4f]">Rs {item.price}</span>
                  <Button onClick={() => addToCart(item)} className="rounded-full bg-[#ff3b4f] px-4 py-2 text-sm text-white hover:bg-rose-600">Add</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-[#ff3b4f]">Why Choose Us</p>
            <h2 className="mt-3 text-3xl font-black text-slate-900">Your Foodie advantage</h2>
          </div>
          <p className="max-w-2xl text-sm leading-7 text-slate-600">A mobile-first ordering experience with fast delivery, curated deals, and a bright food menu designed for easy browsing.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <BannerCard title="Fast delivery" subtitle="Hot food arrives quickly." icon={<Bike size={24} />} />
          <BannerCard title="Fresh ingredients" subtitle="Premium produce every day." icon={<Heart size={24} />} />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
        <div className="mb-10">
          <p className="text-xs uppercase tracking-[0.35em] text-[#ff3b4f]">Reviews</p>
          <h2 className="mt-3 text-3xl font-black text-slate-900">Loved by diners</h2>
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          <ReviewCard author="Ayesha Khan" rating="5.0" feedback="Amazing food and super fast delivery. The packaging felt premium and every bite was flavorful." />
          <ReviewCard author="Bilal Ahmed" rating="4.9" feedback="Best biryani in town. Ordering was effortless and the presentation was exceptional." />
          <ReviewCard author="Sara Malik" rating="5.0" feedback="Perfect balance of spice and freshness — the ideal order for family dinners." />
        </div>
      </section>
    </>
  );
}

function MenuPage({ search, setSearch, selectedCategory, setSelectedCategory, categories = [], items = [], addToCart, isLoading, loadMore, hasMore, openQuickView, cart, subtotal, total }) {
  return (
    <div className="bg-rose-50 pb-24">
      <section className="border-b border-rose-200 bg-white/90 px-4 py-4 backdrop-blur-xl sm:px-6 lg:px-8 lg:py-6">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex-1">
              <p className="text-xs uppercase tracking-[0.35em] text-[#ff3b4f]">Browse Menu</p>
              <h1 className="mt-2 text-3xl font-black text-slate-900 sm:text-4xl">Order your favorites</h1>
            </div>
            <Button onClick={() => setSearch("")} className="rounded-full bg-[#ff3b4f] px-5 py-3 text-sm text-white shadow-lg shadow-rose-200/40 hover:bg-rose-600">Reset Filters</Button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="rounded-[2rem] bg-white p-4 shadow-lg shadow-rose-100 sm:p-6">
          <div className="grid gap-4 lg:grid-cols-[1.6fr_0.9fr] lg:items-end">
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-rose-300" />
              <input
                type="text"
                placeholder="Search dishes..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-full border border-rose-100 bg-rose-50 px-12 py-3 text-sm text-slate-900 shadow-sm focus:border-[#ff3b4f] focus:outline-none"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition ${selectedCategory === category ? "bg-[#ff3b4f] text-white shadow" : "bg-rose-50 text-slate-700 hover:bg-rose-100"}`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {isLoading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : items.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {items.map((item) => (
              <motion.div key={item.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-full">
                <Card className="max-w-full overflow-hidden rounded-[2rem] border border-rose-100 bg-white shadow-lg">
                  <div className="h-56 min-h-0 overflow-hidden bg-rose-50">
                    <img src={item.image} alt={item.name} className="h-full w-full object-cover transition duration-500 hover:scale-105" />
                  </div>
                  <CardContent className="flex h-full flex-col p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs uppercase tracking-[0.35em] text-rose-300">{item.category}</p>
                        <h3 className="mt-2 text-lg font-black text-slate-900">{item.name}</h3>
                      </div>
                      <div className="text-right">
                        <p className="text-base font-black text-[#ff3b4f]">Rs {item.price}</p>
                      </div>
                    </div>
                    <p className="mt-3 flex-1 text-sm leading-6 text-slate-600 line-clamp-3">{item.description || "Delicious meal ready to order."}</p>
                    <div className="mt-4 flex items-center gap-3">
                      <Button onClick={() => addToCart(item)} className="rounded-full bg-[#ff3b4f] px-4 py-2 text-sm text-white hover:bg-rose-600">Add</Button>
                      <Button variant="outline" onClick={() => openQuickView(item)} className="rounded-full px-4 py-2 text-sm text-slate-700 hover:bg-rose-50">View</Button>
                      <div className="ml-auto flex items-center gap-1 text-sm text-slate-500">
                        <Star className="text-[#ff3b4f]" size={14} /> {item.rating || "4.8"}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="rounded-[2rem] bg-white p-12 text-center shadow-lg shadow-rose-100">
            <Search className="mx-auto text-rose-400" size={48} />
            <h3 className="mt-6 text-xl font-black text-slate-900">No items found</h3>
            <p className="mt-2 text-sm text-slate-500">Try a different category or search keyword.</p>
          </div>
        )}
      </section>

      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-bold text-slate-900">Order Summary</p>
            <p className="text-sm text-slate-500">{cart.length} items in cart</p>
          </div>
          <div className="rounded-full bg-white px-5 py-3 text-sm font-black text-[#ff3b4f] shadow-sm shadow-rose-100">Total Rs {total}</div>
        </div>
      </section>

    </div>
  );
}

function CategoriesPage({ setPage, setSelectedCategory, categories = [] }) {
  const categoryImages = {
    Pizza: "https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=1200&auto=format&fit=crop",
    Burger: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?q=80&w=1200&auto=format&fit=crop",
    Biryani: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?q=80&w=1200&auto=format&fit=crop",
    "Fast Food": "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?q=80&w=1200&auto=format&fit=crop",
    Drinks: "https://images.unsplash.com/photo-1544145945-f90425340c7e?q=80&w=1200&auto=format&fit=crop",
    Desserts: "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?q=80&w=1200&auto=format&fit=crop",
    Deals: "https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?q=80&w=1200&auto=format&fit=crop",
    Default: "https://images.unsplash.com/photo-1498575207497-1dce7f9f7e08?q=80&w=800&auto=format&fit=crop",
  };

  return (
    <section className="mx-auto max-w-7xl px-5 py-10 sm:px-6 lg:px-8 lg:py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6 lg:mb-8">
        <h1 className="text-4xl font-black text-white sm:text-5xl">All Categories</h1>
        <p className="mt-2 text-xs text-slate-400 sm:mt-3 sm:text-base">Explore every food type at a glance and find your favorite.</p>
      </motion.div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {categories.filter((cat) => cat !== "All").map((cat, index) => {
          const img = categoryImages[cat] || categoryImages.Default;
          return (
            <motion.button
              key={cat}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => {
                setSelectedCategory(cat);
                setPage("Menu");
              }}
              className="group max-w-full overflow-hidden rounded-[1.5rem] border border-slate-800 bg-slate-950 text-white transition hover:border-orange-500/50 sm:rounded-[2rem]"
            >
              <div className="relative h-56 min-h-0 w-full overflow-hidden bg-white">
                <img src={img} alt={cat} className="h-full w-full object-contain bg-white transition duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/0" />
              </div>
              <div className="relative px-4 py-6 sm:px-6 sm:py-8">
                <h3 className="text-xl font-black sm:text-2xl">{cat}</h3>
                <p className="mt-1 text-xs text-slate-400 sm:mt-2 sm:text-base">Explore {cat.toLowerCase()}</p>
                <ArrowRight className="absolute right-4 top-1/2 -translate-y-1/2 transition duration-300 group-hover:translate-x-1 group-hover:text-orange-500 sm:right-6" size={20} />
              </div>
            </motion.button>
          );
        })}
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
        className="fixed right-0 top-0 z-50 flex h-full w-full flex-col border-l border-slate-800 bg-slate-950 shadow-2xl sm:w-full md:w-[420px]"
      >
        <div className="flex items-center justify-between border-b border-slate-800 px-4 py-4 sm:px-6 sm:py-6">
          <h2 className="text-xl font-black text-white sm:text-2xl">Your Order</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <span className="text-3xl">×</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-6">
          {cart.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
              <ShoppingCart className="text-slate-700" size={48} />
              <div>
                <h3 className="text-base font-bold text-slate-200 sm:text-lg">Cart is Empty</h3>
                <p className="text-xs text-slate-500 sm:text-sm">Add items from menu to get started</p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {cart.map((item) => (
                <div key={item.id} className="rounded-xl border border-slate-800 bg-slate-900/50 p-3 sm:p-4">
                  <div className="flex gap-3 sm:gap-4">
                    <img src={item.image} alt={item.name} className="h-16 w-16 rounded-lg object-cover sm:h-20 sm:w-20" />
                    <div className="flex-1">
                      <h4 className="text-sm font-bold text-white sm:text-base">{item.name}</h4>
                      <p className="text-xs text-slate-400 sm:text-sm">Rs {item.price}</p>
                      <div className="mt-2 flex items-center gap-2 sm:mt-3">
                        <button onClick={() => updateQty(item.id, -1)} className="rounded bg-slate-800 p-1 text-slate-300 hover:text-white">
                          <Minus size={14} />
                        </button>
                        <span className="w-6 text-center text-xs font-bold text-white sm:w-8">{item.qty}</span>
                        <button onClick={() => updateQty(item.id, 1)} className="rounded bg-slate-800 p-1 text-slate-300 hover:text-white">
                          <Plus size={14} />
                        </button>
                        <button onClick={() => removeItem(item.id)} className="ml-auto text-slate-500 hover:text-red-500">
                          <Trash2 size={16} />
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
          <div className="border-t border-slate-800 bg-slate-900/50 px-4 py-4 sm:px-6 sm:py-6">
            <div className="space-y-2 sm:space-y-3">
              <div className="flex justify-between text-xs text-slate-400 sm:text-sm">
                <span>Subtotal</span>
                <span>Rs {subtotal}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-400 sm:text-sm">
                <span>Delivery</span>
                <span>Rs {delivery}</span>
              </div>
              <div className="border-t border-slate-800 pt-2 sm:pt-3">
                <div className="flex justify-between text-sm font-bold text-white sm:text-base">
                  <span>Total</span>
                  <span>Rs {total}</span>
                </div>
              </div>
            </div>
            <Button onClick={onCheckout} className="mt-4 w-full rounded-full bg-orange-500 py-3 text-sm font-bold text-white hover:bg-orange-400 sm:mt-6 sm:py-4 sm:text-base">
              Checkout
            </Button>
          </div>
        )}
      </motion.div>
    </>
  );
}

function CheckoutPage({ total, delivery, subtotal, profit, cart, setPage, clearCart, addOrderToHistory }) {
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
        subtotal,
        delivery_fee: delivery,
        discount: 0,
        total,
        profit,
        payment_method: "Cash",
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
          {saving ? "Placing order..." : `Place Order - Rs ${total}`}
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
        <h1 className="text-5xl font-black text-white">About flafe</h1>
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
          <p className="mt-2 text-slate-400">orders@flafe.com</p>
        </div>
        <div className="rounded-[2rem] border border-slate-800 bg-slate-900 p-8">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-orange-500/20">
            <MapPin className="text-orange-500" />
          </div>
          <h3 className="mt-4 font-black text-white">Address</h3>
          <p className="mt-2 text-slate-400">Main Food Street, Zafarwal,Dhamthal</p>
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
        <p className="mt-3 text-slate-400">Get answers to common questions about Flafe</p>
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
    <div className="rounded-[1.5rem] border border-slate-800 bg-slate-900 p-5 transition hover:border-orange-500/50 sm:rounded-[2rem] sm:p-8">
      <div className="grid h-12 w-12 place-items-center rounded-xl bg-orange-500/20 text-orange-400 sm:h-16 sm:w-16 sm:rounded-2xl">{icon}</div>
      <h3 className="mt-4 text-lg font-black text-white sm:mt-6 sm:text-2xl">{title}</h3>
      <p className="mt-1 text-xs text-slate-400 sm:mt-2 sm:text-base">{subtitle}</p>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-[1.5rem] border border-slate-800 bg-slate-900 p-6 text-center sm:rounded-[2rem] sm:p-8">
      <p className="text-3xl font-black text-orange-500 sm:text-5xl">{value}</p>
      <p className="mt-2 text-xs text-slate-400 sm:mt-3 sm:text-base">{label}</p>
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

function MobileNav({ page, setPage, openCart }) {
  const mobileItems = ["Home", "Menu Card", "Menu"];

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 grid grid-cols-4 gap-3 lg:hidden">
      {mobileItems.map((item) => (
        <button
          key={item}
          onClick={() => setPage(item)}
          className={`rounded-full bg-white px-3 py-3 text-[10px] font-semibold text-slate-900 shadow-xl shadow-slate-200 transition ${
            page === item ? "bg-[#ff3b4f] text-white" : "hover:bg-slate-100"
          }`}
        >
          {item}
        </button>
      ))}
      <button
        onClick={openCart}
        className="rounded-full bg-[#ff3b4f] px-4 py-3 text-xs font-semibold text-white shadow-xl shadow-slate-200 transition hover:bg-rose-600"
      >
        Cart
      </button>
    </div>
  );
}

function HamburgerMenu({ open, onClose, setPage }) {
  const menuItems = ["Home", "Menu Card", "Menu", "Categories", "Track Order", "My Orders", "About", "Contact", "FAQ"];

  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm"
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 260, damping: 25 }}
            className="fixed right-0 top-0 z-50 h-full w-[min(92vw,20rem)] max-w-xs overflow-y-auto bg-slate-950 p-6 text-slate-100 shadow-2xl sm:w-[min(85vw,22rem)] sm:max-w-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-orange-400">Flafe Menu</p>
                <h2 className="mt-2 text-xl font-black text-white">Navigation</h2>
              </div>
              <button onClick={onClose} className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-800 bg-slate-900 text-slate-100 transition hover:bg-slate-800">
                <X size={20} />
              </button>
            </div>
            <div className="mt-8 space-y-3">
              {menuItems.map((item) => (
                <button
                  key={item}
                  onClick={() => setPage(item)}
                  className="flex w-full items-center justify-between rounded-3xl border border-slate-800 bg-slate-900 px-4 py-4 text-left text-sm font-semibold text-slate-100 transition hover:bg-slate-800"
                >
                  <span>{item}</span>
                  <span className="text-slate-500">›</span>
                </button>
              ))}
            </div>
            <div className="mt-8 rounded-3xl border border-slate-800 bg-slate-900 p-4">
              <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Install App</p>
              <button
                type="button"
                onClick={onClose}
                className="mt-3 w-full rounded-full bg-orange-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-orange-300"
              >
                Install App
              </button>
            </div>
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );
}

function Footer({ setPage }) {
  return (
    <footer className="border-t border-slate-800 bg-slate-950 px-4 py-10 text-slate-300">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <h3 className="text-xl font-black text-white">Flafe</h3>
            <p className="mt-2 text-sm text-slate-500">Modern restaurant, delicious food, fast delivery.</p>
          </div>
          <div>
            <p className="font-bold text-white">Quick Links</p>
            <div className="mt-3 space-y-2">
              {["Menu Card", "Menu", "Track Order", "Contact", "FAQ"].map((item) => (
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
          <p>© 2024 Flafe. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

export default RestaurantWebsite;
