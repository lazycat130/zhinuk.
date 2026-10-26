import { Link } from "@tanstack/react-router";
import { useState, type ReactElement } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { categories } from "@/lib/catalog";
import { navLinks } from "./Header";
import { Phone } from "lucide-react";

export function MobileNavigation({ trigger }: { trigger: ReactElement }) {
  const [open, setOpen] = useState(false);
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent side="left" className="w-[86vw] max-w-sm overflow-y-auto p-0 flex flex-col justify-between">
        <div>
          <SheetHeader className="border-b border-border p-4 bg-muted/20">
            <SheetTitle className="flex items-center">
              <img
                src="/zhinuk-logo-transparent.png"
                alt="ঝিনুক"
                className="h-10 w-auto max-w-[150px] object-contain"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = "/zhinuk-original-logo.png";
                }}
              />
            </SheetTitle>
          </SheetHeader>
          <ul className="p-2 space-y-0.5">
            {navLinks.map((l) => (
              <li key={l.label}>
                <Link
                  to={l.to}
                  search={("search" in l ? l.search : {}) as never}
                  onClick={() => setOpen(false)}
                  className="flex items-center rounded-xl px-4 py-2.5 font-medium hover:bg-muted active:bg-muted/80 text-navy transition text-sm"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
          <p className="px-5 pt-3 pb-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">ক্যাটাগরি</p>
          <div className="grid grid-cols-4 gap-2 px-3 pb-4">
            {categories.map((c) => (
              <Link
                key={c.slug}
                to="/shop"
                search={{ cat: c.slug }}
                onClick={() => setOpen(false)}
                className="flex flex-col items-center gap-1.5 p-2 rounded-xl text-center text-xs hover:bg-ocean-soft/60 active:scale-95 transition"
              >
                <img src={c.image} alt={c.name} className="h-12 w-12 rounded-full border border-border bg-card object-contain p-1 shadow-xs" />
                <span className="font-medium text-navy text-[11px] truncate w-full">{c.name}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* General contact info in drawer bottom */}
        <div className="border-t border-border p-4 bg-ocean-soft/50 space-y-2">
          <p className="text-xs font-bold text-navy flex items-center gap-1.5">
            <Phone className="h-3.5 w-3.5 text-primary" /> সরাসরি কাস্টমার সহায়তা হেল্পলাইন:
          </p>
          <div className="flex flex-col gap-1.5 text-xs font-semibold text-navy">
            <a href="tel:+8801552541791" className="hover:text-primary transition flex items-center justify-between bg-card rounded-lg px-3 py-2 border border-border">
              <span>০১৫৫২-৫৪১৭৯১</span>
              <span className="text-[11px] text-muted-foreground font-normal">সরাসরি কল</span>
            </a>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
