import { Link } from "@tanstack/react-router";
import { useRef } from "react";
import { ArrowRight, Banknote, ChevronLeft, ChevronRight, Flame, Gift, Headphones, Lock, RefreshCw, ShieldCheck, Truck, RotateCcw } from "lucide-react";
import hero from "@/assets/hero.jpg";
import ocean from "@/assets/ocean.jpg";
import bannerOffer from "@/assets/banner-offer.jpg";
import bannerFashion from "@/assets/banner-fashion.jpg";
import shell from "@/assets/shell-icon.png.asset.json";
import { categories, products, getProducts } from "@/lib/catalog";
import { CategorySidebar } from "./Navigation";
import { ProductCard } from "./ProductCard";

export function Hero() {
  return (
    <section className="mx-auto grid max-w-[1440px] gap-4 sm:gap-6 px-3 sm:px-4 pt-3 sm:pt-4 lg:grid-cols-[240px_minmax(0,1fr)] lg:px-8">
      <CategorySidebar />
      <div className="min-w-0 space-y-3 sm:space-y-4">
        <div className="relative flex flex-col-reverse overflow-hidden rounded-2xl sm:rounded-3xl bg-card shadow-card sm:block">
          <img src={hero} alt="হ্যান্ডব্যাগ, স্মার্টফোন, ঘড়ি, ঝিনুক, পারফিউম, জুতা ও হেডফোন" width={1792} height={768} className="h-[200px] sm:h-[360px] lg:h-[400px] w-full object-cover object-[78%_center] lg:object-center" />
          <div className="absolute inset-0 hidden bg-gradient-to-r from-card/85 via-card/30 to-transparent sm:block" />
          <div className="relative flex bg-gradient-to-b from-ocean-soft to-card sm:absolute sm:inset-0 sm:bg-none flex-col justify-center gap-2.5 sm:gap-3 p-4 sm:p-10 lg:max-w-[52%] lg:pl-14">
            <span className="w-fit rounded-full bg-navy px-3 py-0.5 sm:px-3.5 sm:py-1 text-[11px] font-semibold text-navy-foreground sm:text-xs shadow-xs">
              আপনার পছন্দ, ঝিনুকের সঙ্গে।
            </span>
            <h1 className="text-xl sm:text-3xl lg:text-4xl font-bold leading-snug text-navy">
              পছন্দের খোঁজে,<br />ঝিনুকের <span className="text-highlight">পথে।</span>
            </h1>
            <p className="max-w-sm text-xs sm:text-sm font-medium text-foreground sm:text-base leading-relaxed">
              আপনার প্রতিদিনের প্রয়োজন থেকে প্রিয় উপহার—খুঁজে নিন এক ঠিকানায়।
            </p>
            <div className="mt-1 flex flex-wrap gap-2.5 sm:gap-3">
              <Link to="/shop" className="flex h-10 sm:h-11 items-center justify-center gap-2 rounded-full bg-highlight px-5 sm:px-6 text-xs sm:text-sm font-semibold text-highlight-foreground shadow-lift transition hover:bg-highlight/90 w-full sm:w-auto">
                পছন্দের পণ্য খুঁজুন <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/shop" className="hidden h-11 items-center rounded-full border border-navy/30 bg-card/80 px-6 font-medium text-navy transition hover:bg-card sm:flex text-sm">
                সব কালেকশন দেখুন
              </Link>
            </div>
          </div>
          <p className="absolute right-8 top-6 hidden -rotate-12 font-script text-3xl leading-tight text-navy xl:block">ঝিনুক<br /><span className="pl-6 text-2xl">আপনার সঙ্গে</span></p>
        </div>
        <ServiceStrip />
      </div>
    </section>
  );
}

const services = [
  { Icon: Truck, t: "ঢাকার ভেতরে", d: "৳ ৮০ ডেলিভারি চার্জ" },
  { Icon: Truck, t: "ঢাকার বাইরে", d: "৳ ১২০ ডেলিভারি চার্জ" },
  { Icon: Banknote, t: "ক্যাশ অন ডেলিভারি", d: "(সারা বাংলাদেশে)" },
  { Icon: ShieldCheck, t: "নিরাপদ পেমেন্ট", d: "(বিকাশ, নগদ, কার্ড)" },
  { Icon: RefreshCw, t: "রিটার্ন ও এক্সচেঞ্জ", d: "(সহজ ও ঝামেলাহীন)" },
  { Icon: Gift, t: "প্রতি অর্ডারে", d: "বিশেষ উপহার" },
];

export function ServiceStrip() {
  return (
    <div className="no-scrollbar flex gap-2 sm:gap-3 overflow-x-auto rounded-xl sm:rounded-2xl border border-border bg-card/70 p-2 shadow-xs md:grid md:grid-cols-3 xl:grid-cols-6 scroll-smooth">
      {services.map(({ Icon, t, d }) => (
        <div key={t} className="flex min-w-[150px] sm:min-w-[180px] items-center gap-2.5 sm:gap-3 rounded-lg sm:rounded-xl border border-border bg-card px-2.5 sm:px-3 py-2 sm:py-3 shrink-0">
          <Icon className="h-6 w-6 sm:h-8 sm:w-8 shrink-0 text-primary" strokeWidth={1.5} />
          <div className="min-w-0 text-xs leading-snug sm:leading-relaxed">
            <p className="font-semibold text-navy text-[11px] sm:text-xs">{t}</p>
            <p className="text-[10px] sm:text-xs text-muted-foreground">{d}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export function CategoryCard({ c }: { c: (typeof categories)[number] }) {
  return (
    <Link to="/shop" search={{ cat: c.slug }} className="group flex w-18 shrink-0 flex-col items-center gap-1.5 text-center sm:w-24">
      <span className="grid aspect-square w-full place-items-center rounded-full border-2 border-card bg-gradient-to-b from-card to-ocean-soft p-2.5 sm:p-3 shadow-card ring-1 ring-border transition duration-300 group-hover:-translate-y-1 group-hover:shadow-lift group-hover:ring-ocean">
        <img src={c.image} alt={c.name} loading="lazy" className="h-full w-full object-contain mix-blend-multiply transition group-hover:scale-110" />
      </span>
      <span className="text-xs sm:text-sm font-medium group-hover:text-primary truncate w-full">{c.name}</span>
    </Link>
  );
}

export function SectionTitle({ title, sub, icon, to = true }: { title: string; sub?: string; icon?: boolean; to?: boolean }) {
  return (
    <div className="mb-3 sm:mb-4 flex items-end justify-between gap-2 sm:gap-4">
      <div className="min-w-0">
        <h2 className="flex items-center gap-1.5 sm:gap-2 text-lg font-bold text-navy sm:text-2xl">{icon && <Flame className="h-5 w-5 sm:h-6 sm:w-6 fill-highlight text-highlight shrink-0" />}{title}</h2>
        {sub && <p className="text-xs sm:text-sm text-muted-foreground truncate">{sub}</p>}
      </div>
      {to && <Link to="/shop" className="flex shrink-0 items-center gap-1 text-xs sm:text-sm font-semibold text-navy hover:text-ocean whitespace-nowrap">সকল পণ্য <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" /></Link>}
    </div>
  );
}

export function CategorySection() {
  return (
    <section className="mx-auto max-w-[1440px] px-3 sm:px-4 pt-8 sm:pt-10 lg:px-8">
      <SectionTitle title="ক্যাটাগরি" sub="আপনার পছন্দের ক্যাটাগরি বেছে নিন" to={false} />
      <div className="no-scrollbar -mx-3 sm:-mx-4 flex gap-3 sm:gap-5 overflow-x-auto px-3 sm:px-4 pb-2 lg:mx-0 lg:justify-between lg:px-0 scroll-smooth">
        {categories.map((c) => <CategoryCard key={c.slug} c={c} />)}
      </div>
    </section>
  );
}

export function PromoBanner({ img, eyebrow, title, text, cat }: { img: string; eyebrow: string; title: string; text: string; cat?: string }) {
  return (
    <Link to="/shop" search={cat ? { cat } : { offer: "1" }} className="group relative block overflow-hidden rounded-2xl sm:rounded-3xl shadow-card">
      <img src={img} alt="" loading="lazy" width={1280} height={640} className="h-44 sm:h-56 w-full object-cover object-right transition duration-700 group-hover:scale-105" />
      <div className="absolute inset-0 flex flex-col justify-center gap-1.5 p-4 sm:p-8 bg-gradient-to-r from-card/90 via-card/50 to-transparent">
        <span className="text-[11px] sm:text-xs font-semibold text-highlight">{eyebrow}</span>
        <h3 className="max-w-[75%] sm:max-w-[60%] text-base sm:text-2xl font-bold leading-snug text-navy">{title}</h3>
        <p className="max-w-[70%] sm:max-w-[55%] text-xs sm:text-sm text-foreground/80 line-clamp-2">{text}</p>
        <span className="mt-1 sm:mt-2 flex w-fit items-center gap-1.5 rounded-full bg-navy px-3.5 sm:px-5 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold text-navy-foreground transition group-hover:bg-primary">এখনই দেখুন <ArrowRight className="h-3.5 w-3.5" /></span>
      </div>
    </Link>
  );
}

export function PromoBanners() {
  return (
    <section className="mx-auto grid max-w-[1440px] gap-3 sm:gap-4 px-3 sm:px-4 pt-8 sm:pt-10 md:grid-cols-2 lg:px-8">
      <PromoBanner img={bannerOffer} eyebrow="সীমিত সময়ের জন্য" title="আজকের বিশেষ অফার" text="গ্যাজেট ও ইলেকট্রনিক্সে ২৫% পর্যন্ত ছাড়" />
      <PromoBanner img={bannerFashion} eyebrow="নতুন এসেছে" title="ফ্যাশনে নতুন কালেকশন" text="মার্জিত ব্যাগ, জুতা ও অ্যাক্সেসরিজ" cat="fashion" />
    </section>
  );
}

export function PopularProducts() {
  const ref = useRef<HTMLDivElement>(null);
  const scroll = (d: number) => ref.current?.scrollBy({ left: d * ref.current.clientWidth * 0.8, behavior: "smooth" });
  const allProducts = getProducts();
  return (
    <section className="mx-auto max-w-[1440px] px-3 sm:px-4 pt-8 sm:pt-10 lg:px-8">
      <SectionTitle icon title="জনপ্রিয় পণ্য" sub="সবার বেশি পছন্দ, সবার বেশি পরখ" />
      <div className="relative">
        <button aria-label="আগের" onClick={() => scroll(-1)} className="absolute -left-4 top-1/2 z-10 hidden h-9 w-9 -translate-y-1/2 place-items-center rounded-full border border-border bg-card shadow-card hover:text-primary lg:grid"><ChevronLeft className="h-5 w-5" /></button>
        <div ref={ref} className="no-scrollbar grid grid-cols-2 gap-2.5 sm:gap-3 sm:grid-cols-3 lg:flex lg:snap-x lg:gap-4 lg:overflow-x-auto lg:py-2">
          {allProducts.map((p) => (
            <div key={p.id} className="lg:w-[calc((100%-5*1rem)/6)] lg:shrink-0 lg:snap-start"><ProductCard product={p} /></div>
          ))}
        </div>
        <button aria-label="পরের" onClick={() => scroll(1)} className="absolute -right-4 top-1/2 z-10 hidden h-9 w-9 -translate-y-1/2 place-items-center rounded-full border border-border bg-card shadow-card hover:text-primary lg:grid"><ChevronRight className="h-5 w-5" /></button>
      </div>
    </section>
  );
}

const trust = [
  { Icon: Truck, t: "দ্রুত ডেলিভারি", d: "সারা দেশে দ্রুত ডেলিভারি" },
  { Icon: Lock, t: "নিরাপদ পেমেন্ট", d: "নিরাপদ ও নির্ভরযোগ্য পেমেন্ট" },
  { Icon: RotateCcw, t: "সহজ রিটার্ন", d: "সহজ রিটার্ন সুবিধা" },
  { Icon: Headphones, t: "কাস্টমার সাপোর্ট", d: "প্রয়োজনে আমরা পাশে আছি" },
];

export function ServiceFeatures() {
  return (
    <section className="mx-auto max-w-[1440px] px-4 pt-10 lg:px-8">
      <div className="grid grid-cols-2 gap-3 rounded-3xl border border-border bg-card p-4 shadow-card md:grid-cols-4 md:divide-x md:divide-border md:p-6">
        {trust.map(({ Icon, t, d }) => (
          <div key={t} className="flex items-center gap-3 md:justify-center md:px-4">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-ocean-soft text-primary"><Icon className="h-6 w-6" strokeWidth={1.6} /></span>
            <div className="min-w-0"><p className="font-semibold text-navy">{t}</p><p className="text-xs text-muted-foreground">{d}</p></div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function OceanBrandSection() {
  return (
    <section className="mx-auto max-w-[1440px] px-4 pt-10 lg:px-8">
      <div className="relative overflow-hidden rounded-3xl bg-navy text-navy-foreground shadow-lift">
        <img src={ocean} alt="সমুদ্রের ঢেউয়ে মুক্তাসহ ঝিনুক" loading="lazy" width={1792} height={768} className="absolute inset-0 h-full w-full object-cover object-[70%_center]" />
        <div className="absolute inset-0 bg-gradient-to-r from-navy/90 via-navy/50 to-transparent" />
        <div className="relative flex min-h-[320px] flex-col justify-center gap-4 p-6 sm:p-12 lg:max-w-[55%]">
          <img
            src="/zhinuk-logo-transparent.png"
            alt="ঝিনুক"
            className="h-14 sm:h-16 w-auto max-w-[200px] sm:max-w-[240px] object-contain drop-shadow-md"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = "/zhinuk-original-logo.png";
            }}
          />
          <h2 className="text-2xl font-bold leading-snug sm:text-4xl">ঝিনুক — ভালো পণ্যের<br />নির্ভরযোগ্য ঠিকানা</h2>
          <p className="max-w-md text-sm text-navy-foreground/85 sm:text-base">
            সমুদ্রের গভীরে ঝিনুক যেমন যত্নে মুক্তা লালন করে, তেমনি আমরাও প্রতিটি পণ্য বাছাই করি বিশুদ্ধতা, মান আর আস্থার সাথে।
          </p>
          <div className="flex flex-wrap gap-6 text-sm">
            <span><b className="block text-2xl">৫০,০০০+</b>সন্তুষ্ট গ্রাহক</span>
            <span><b className="block text-2xl">১০০%</b>অরিজিনাল পণ্য</span>
            <span><b className="block text-2xl">৬৪</b>জেলায় ডেলিভারি</span>
          </div>
          <Link to="/about" className="mt-2 flex w-fit items-center gap-2 rounded-full bg-pearl px-6 py-2.5 font-semibold text-navy transition hover:bg-card">আমাদের গল্প <ArrowRight className="h-4 w-4" /></Link>
        </div>
      </div>
    </section>
  );
}

