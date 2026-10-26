import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Heart, Lock, Menu, Search, ShieldCheck, ShoppingCart, Truck, User, ChevronDown, Phone } from "lucide-react";
import logo from "@/assets/zhinuk-logo.png.asset.json";
import { categories, toBn } from "@/lib/catalog";
import { useStore } from "@/lib/store";
import { MobileNavigation } from "./MobileNavigation";

export const navLinks = [
  { label: "হোম", to: "/" as const },
  { label: "সকল পণ্য", to: "/shop" as const },
  { label: "নতুন পণ্য", to: "/shop" as const, search: { cat: "electronics" } },
  { label: "অফার", to: "/shop" as const, search: { offer: "1" } },
  { label: "ফ্যাশন", to: "/shop" as const, search: { cat: "fashion" } },
  { label: "বিউটি", to: "/shop" as const, search: { cat: "beauty" } },
  { label: "আমাদের সম্পর্কে", to: "/about" as const },
  { label: "যোগাযোগ", to: "/contact" as const },
];

export function SearchBar({ className = "" }: { className?: string }) {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("");
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        navigate({ to: "/shop", search: { q: q || undefined, cat: cat || undefined } });
      }}
      className={`flex h-11 sm:h-12 items-center overflow-hidden rounded-full border border-input bg-card shadow-xs transition focus-within:border-ocean focus-within:ring-3 focus-within:ring-ocean/15 ${className}`}
    >
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="আপনি কী খুঁজছেন?"
        aria-label="পণ্য খুঁজুন"
        className="h-full min-w-0 flex-1 bg-transparent px-4 sm:px-5 text-xs sm:text-sm outline-none placeholder:text-muted-foreground"
      />
      <div className="relative hidden h-6 items-center border-l border-border pl-3 md:flex">
        <select
          value={cat}
          onChange={(e) => setCat(e.target.value)}
          aria-label="ক্যাটাগরি"
          className="appearance-none bg-transparent pr-7 text-xs sm:text-sm text-muted-foreground outline-none"
        >
          <option value="">সব ক্যাটাগরি</option>
          {categories.map((c) => (
            <option key={c.slug} value={c.slug}>{c.name}</option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-2 h-4 w-4 text-muted-foreground" />
      </div>
      <button
        type="submit"
        aria-label="খুঁজুন"
        className="ml-1 sm:ml-2 grid h-full w-12 sm:w-16 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground transition hover:bg-navy cursor-pointer"
      >
        <Search className="h-4 w-4 sm:h-5 sm:w-5" />
      </button>
    </form>
  );
}

export function Header() {
  const { count, wishlist, setCartOpen } = useStore();
  return (
    <header className="sticky top-0 z-40 lg:static">
      <div className="bg-topbar text-navy-foreground">
        <div className="mx-auto flex h-9 sm:h-10 max-w-[1440px] items-center justify-between gap-2 sm:gap-4 px-3 sm:px-4 text-xs sm:text-sm lg:px-8">
          <div className="flex min-w-0 items-center gap-3 sm:gap-6 overflow-hidden">
            <div className="flex shrink-0 items-center gap-1.5 sm:gap-2 font-semibold text-[11px] sm:text-xs">
              <Phone className="h-3.5 w-3.5 text-highlight shrink-0" />
              <span className="text-navy-foreground/75 hidden sm:inline">হটলাইন:</span>
              <a href="tel:+8801823824071" className="text-highlight hover:underline whitespace-nowrap">
                01823-824071
              </a>
            </div>
            <span className="hidden items-center gap-2 md:flex text-xs"><Truck className="h-3.5 w-3.5" /> সারা বাংলাদেশে ডেলিভারি</span>
            <span className="hidden items-center gap-2 lg:flex text-xs"><ShieldCheck className="h-3.5 w-3.5" /> ১০০% আসল পণ্য ও ক্যাশ অন ডেলিভারি</span>
          </div>
          <div className="flex shrink-0 items-center gap-3 sm:gap-5 text-[11px] sm:text-xs">
            <Link to="/track" className="hidden hover:underline sm:inline">অর্ডার ট্র্যাকিং</Link>
            <Link to="/contact" className="hidden hover:underline sm:inline">যোগাযোগ</Link>
            <Link to="/admin" className="flex items-center gap-1 font-medium hover:underline text-highlight">
              <Lock className="h-3 w-3 sm:h-3.5 sm:w-3.5" /> অ্যাডমিন
            </Link>
          </div>
        </div>
      </div>

      <div className="border-b border-border/60 bg-card/95 backdrop-blur-md lg:border-0 lg:bg-transparent lg:backdrop-blur-none">
        <div className="mx-auto grid max-w-[1440px] grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 lg:grid-cols-[240px_minmax(0,1fr)_auto] lg:gap-10 lg:px-8 lg:py-3">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <MobileNavigation trigger={
              <button
                aria-label="মেনু"
                className="grid h-10 w-10 shrink-0 place-items-center rounded-xl hover:bg-muted active:scale-95 transition lg:hidden touch-manipulation cursor-pointer"
              >
                <Menu className="h-6 w-6" />
              </button>
            } />
            <Link to="/" aria-label="ঝিনুক হোম" className="flex items-center group min-w-0">
              {/* Original Bangla ZHINUK Logo / Wordmark */}
              <img
                src="/zhinuk-logo-transparent.png"
                alt="ঝিনুক — Premium Pearls"
                className="h-10 sm:h-13 lg:h-16 w-auto max-w-[140px] min-[375px]:max-w-[170px] sm:max-w-[220px] object-contain transition-transform duration-250 ease-out group-hover:scale-102"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = "/zhinuk-original-logo.png";
                }}
              />
            </Link>
          </div>
          <SearchBar className="hidden max-w-[660px] lg:flex" />
          <div className="col-start-3 flex items-center gap-1.5 sm:gap-6">
            <Link
              to="/wishlist"
              aria-label="পছন্দের তালিকা"
              className="group relative flex h-10 w-10 sm:h-auto sm:w-auto items-center justify-center sm:flex-col sm:gap-1 text-sm text-foreground rounded-xl hover:bg-muted/50 sm:hover:bg-transparent"
            >
              <Heart className="h-6 w-6 sm:h-7 sm:w-7 text-primary transition group-hover:scale-110" strokeWidth={1.6} />
              {wishlist.length > 0 && <Badge n={wishlist.length} />}
              <span className="hidden sm:block text-xs">পছন্দের তালিকা</span>
            </Link>
            <button
              onClick={() => setCartOpen(true)}
              aria-label="শপিং কার্ট"
              className="group relative flex h-10 w-10 sm:h-auto sm:w-auto items-center justify-center sm:flex-col sm:gap-1 text-sm rounded-xl hover:bg-muted/50 sm:hover:bg-transparent cursor-pointer"
            >
              <ShoppingCart className="h-6 w-6 sm:h-7 sm:w-7 text-primary transition group-hover:scale-110" strokeWidth={1.6} />
              <Badge n={count} />
              <span className="hidden sm:block text-xs">কার্ট</span>
            </button>
          </div>
        </div>
        <div className="px-3 sm:px-4 pb-2.5 lg:hidden">
          <SearchBar />
        </div>
      </div>
    </header>
  );
}

function Badge({ n }: { n: number }) {
  return (
    <span key={n} className="absolute -right-2 -top-2 grid h-5 min-w-5 animate-in zoom-in place-items-center rounded-full bg-highlight px-1 text-[11px] font-semibold text-highlight-foreground">
      {toBn(n)}
    </span>
  );
}
