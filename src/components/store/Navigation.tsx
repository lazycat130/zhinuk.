import { Link } from "@tanstack/react-router";
import { ChevronDown, ChevronRight, Menu } from "lucide-react";
import { Baby, BookOpen, Dumbbell, Flower2, Home, LayoutGrid, Shirt, Smartphone, Watch, Footprints, Briefcase, Headphones } from "lucide-react";
import { categories } from "@/lib/catalog";
import { navLinks } from "./Header";

const icons: Record<string, typeof Shirt> = {
  fashion: Shirt, electronics: Smartphone, beauty: Flower2, watch: Watch,
  bag: Briefcase, shoes: Footprints, gadget: Headphones, lifestyle: Home,
};

export function Navigation() {
  return (
    <nav className="mx-auto hidden max-w-[1440px] grid-cols-[240px_minmax(0,1fr)] items-center gap-6 px-8 lg:grid">
      <Link to="/shop" className="flex h-12 items-center gap-3 rounded-2xl bg-navy px-5 font-semibold text-navy-foreground shadow-card transition hover:bg-primary">
        <Menu className="h-5 w-5" /> সব ক্যাটাগরি <ChevronDown className="ml-auto h-4 w-4" />
      </Link>
      <ul className="flex items-center gap-1 xl:gap-4">
        {navLinks.map((l) => (
          <li key={l.label}>
            <Link
              to={l.to}
              search={("search" in l ? l.search : {}) as never}
              activeOptions={{ exact: true, includeSearch: true }}
              className="relative block px-3 py-3 font-medium text-foreground transition hover:text-ocean after:absolute after:inset-x-3 after:bottom-1 after:h-0.5 after:origin-left after:scale-x-0 after:rounded after:bg-ocean after:transition data-[status=active]:text-ocean data-[status=active]:after:scale-x-100 hover:after:scale-x-100"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function CategorySidebar() {
  const extra = [
    { name: "খেলাধুলা & আউটডোর", Icon: Dumbbell },
    { name: "বুকস & স্টেশনারি", Icon: BookOpen },
    { name: "বেবি & কিডস", Icon: Baby },
  ];
  return (
    <aside className="hidden rounded-2xl border border-border bg-card p-2 shadow-card lg:block">
      <ul>
        {categories.map((c) => {
          const Icon = icons[c.slug] ?? LayoutGrid;
          return (
            <li key={c.slug}>
              <Link to="/shop" search={{ cat: c.slug }} className="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition hover:bg-ocean-soft hover:text-primary">
                <Icon className="h-5 w-5 text-primary" strokeWidth={1.6} />
                <span className="flex-1">{c.name}</span>
                <ChevronRight className="h-4 w-4 text-muted-foreground transition group-hover:translate-x-0.5" />
              </Link>
            </li>
          );
        })}
        {extra.map(({ name, Icon }) => (
          <li key={name}>
            <Link to="/shop" className="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition hover:bg-ocean-soft">
              <Icon className="h-5 w-5 text-primary" strokeWidth={1.6} />
              <span className="flex-1">{name}</span>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </Link>
          </li>
        ))}
        <li>
          <Link to="/shop" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-primary hover:bg-ocean-soft">
            <LayoutGrid className="h-5 w-5" strokeWidth={1.6} /> <span className="flex-1">আরও দেখুন</span> <ChevronRight className="h-4 w-4" />
          </Link>
        </li>
      </ul>
    </aside>
  );
}
