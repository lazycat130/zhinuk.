import { createFileRoute, Link } from "@tanstack/react-router";
import { categories, discountPct, getCategory, getProducts } from "@/lib/catalog";
import { ProductGrid } from "@/components/store/ProductCard";

type ShopSearch = { q?: string | undefined; cat?: string | undefined; offer?: string | undefined };

export const Route = createFileRoute("/shop")({
  validateSearch: (s: Record<string, unknown>): ShopSearch => ({
    q: typeof s["q"] === "string" && s["q"] ? s["q"] : undefined,
    cat: typeof s["cat"] === "string" && s["cat"] ? s["cat"] : undefined,
    offer: s["offer"] ? String(s["offer"]) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "সকল পণ্য — ঝিনুক ZHINUK" },
      { name: "description", content: "ঝিনুকের সকল পণ্য ক্যাটাগরি অনুযায়ী ব্রাউজ ও সার্চ করুন।" },
      { property: "og:title", content: "সকল পণ্য — ঝিনুক" },
      { property: "og:description", content: "ফ্যাশন, ইলেকট্রনিক্স, বিউটি, ঘড়ি, ব্যাগ ও জুতা।" },
    ],
  }),
  component: Shop,
});

function Shop() {
  const { q, cat, offer } = Route.useSearch();
  const term = q?.toLowerCase();
  const allProducts = getProducts();
  const list = allProducts.filter(
    (p) =>
      (!cat || p.category === cat) &&
      (!offer || discountPct(p) > 0) &&
      (!term || p.name.toLowerCase().includes(term) || p.id.includes(term) || getCategory(p.category)?.name.includes(term)),
  );
  const title = cat ? getCategory(cat)?.name : offer ? "অফার" : q ? `"${q}" এর ফলাফল` : "সকল পণ্য";
  return (
    <div className="mx-auto max-w-[1440px] px-3 sm:px-4 py-6 sm:py-8 lg:px-8">
      <h1 className="text-xl sm:text-2xl font-bold text-navy">{title}</h1>
      <div className="no-scrollbar my-3.5 sm:my-5 flex gap-1.5 sm:gap-2 overflow-x-auto pb-1 scroll-smooth">
        <Chip active={!cat} label="সব" search={{}} />
        {categories.map((c) => <Chip key={c.slug} active={cat === c.slug} label={c.name} search={{ cat: c.slug }} />)}
      </div>
      {list.length ? <ProductGrid products={list} /> : <p className="py-20 text-center text-muted-foreground">কোনো পণ্য পাওয়া যায়নি।</p>}
    </div>
  );
}

function Chip({ active, label, search }: { active: boolean; label: string; search: ShopSearch }) {
  return (
    <Link to="/shop" search={search} className={`shrink-0 rounded-full border px-3.5 sm:px-4 py-1.5 text-xs sm:text-sm font-medium transition ${active ? "border-navy bg-navy text-navy-foreground shadow-xs" : "border-border bg-card text-foreground hover:border-ocean"}`}>
      {label}
    </Link>
  );
}
