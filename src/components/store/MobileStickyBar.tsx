import { useState, useEffect } from "react";
import { formatPrice, toBn } from "@/lib/catalog";
import type { Product } from "@/lib/data-service";
import { Zap } from "lucide-react";

type Props = {
  product: Product;
  onBuyNowClick: () => void;
};

export function MobileStickyBar({ product, onBuyNowClick }: Props) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Hide sticky bar when user scrolls past direct-order-form or form is in view
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        // If the direct order form is in view, hide the sticky bar so they don't compete
        setIsVisible(!entry.isIntersecting);
      },
      { threshold: 0.15 }
    );

    const target = document.getElementById("direct-order-form");
    if (target) {
      observer.observe(target);
    }

    return () => {
      if (target) observer.unobserve(target);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <aside
      aria-label="মোবাইল কুইক অর্ডার বার"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-border/80 bg-card/95 px-4 py-2.5 pb-[max(0.625rem,env(safe-area-inset-bottom))] shadow-lift backdrop-blur-md lg:hidden animate-in slide-in-from-bottom-4 duration-200"
    >
      <div className="flex items-center justify-between gap-3 max-w-lg mx-auto">
        <div className="flex flex-col">
          <span className="text-[11px] font-medium text-muted-foreground">ক্যাশ অন ডেলিভারি</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-lg font-extrabold text-navy">{formatPrice(product.price)}</span>
            {product.regularPrice && (
              <s className="text-xs text-muted-foreground">{formatPrice(product.regularPrice)}</s>
            )}
          </div>
        </div>

        <button
          onClick={onBuyNowClick}
          className="flex h-11 items-center justify-center gap-1.5 rounded-full bg-highlight px-6 text-sm font-bold text-highlight-foreground shadow-md transition-all active:scale-95 focus:outline-none focus:ring-4 focus:ring-highlight/30 cursor-pointer"
        >
          <Zap className="h-4 w-4 fill-current" />
          <span>এখনই অর্ডার করুন</span>
        </button>
      </div>
    </aside>
  );
}
