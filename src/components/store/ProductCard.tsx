import { Link } from "@tanstack/react-router";
import { Heart, ShoppingCart, Star } from "lucide-react";
import { discountPct, formatPrice, getCategory, toBn, type Product } from "@/lib/catalog";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export function WishlistButton({ id, className }: { id: string; className?: string }) {
  const { wishlist, toggleWish } = useStore();
  const on = wishlist.includes(id);
  return (
    <button
      type="button"
      aria-label={on ? "পছন্দের তালিকা থেকে সরান" : "পছন্দের তালিকায় যোগ করুন"}
      aria-pressed={on}
      onClick={(e) => { e.preventDefault(); toggleWish(id); }}
      className={cn("grid h-8 w-8 place-items-center rounded-full bg-card/90 text-foreground transition hover:scale-110", className)}
    >
      <Heart className={cn("h-[18px] w-[18px] transition", on && "fill-destructive text-destructive")} />
    </button>
  );
}

export function Rating({ value, reviews }: { value: number; reviews?: string }) {
  return (
    <div className="flex items-center gap-1 text-xs text-muted-foreground">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} className={cn("h-3.5 w-3.5", i <= Math.round(value) ? "fill-star text-star" : "text-border")} />
      ))}
      <span className="ml-1">{toBn(value)}{reviews && ` (${toBn(reviews)})`}</span>
    </div>
  );
}

export function ProductCard({ product }: { product: Product }) {
  const { add } = useStore();
  const off = discountPct(product);
  return (
    <article className="group relative flex flex-col rounded-2xl border border-border bg-card p-2.5 sm:p-3 shadow-card transition duration-250 ease-out hover:-translate-y-1 hover:shadow-lift motion-reduce:transform-none motion-reduce:transition-none">
      <WishlistButton id={product.id} className="absolute right-2.5 top-2.5 sm:right-3 sm:top-3 z-10" />
      <Link to="/product/$id" params={{ id: product.id }} className="block">
        <div className="relative aspect-square overflow-hidden rounded-xl bg-card">
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            width={816}
            height={816}
            className="h-full w-full object-contain p-1.5 sm:p-2 transition-transform duration-250 ease-out group-hover:scale-[1.06] motion-reduce:transform-none motion-reduce:transition-none"
          />
          {off > 0 && (
            <span className="absolute right-0 top-1/2 grid h-8 w-8 sm:h-10 sm:w-10 -translate-y-1/2 place-items-center rounded-full bg-highlight text-[10px] sm:text-xs font-bold text-highlight-foreground shadow-xs">
              -{toBn(off)}%
            </span>
          )}
        </div>
        <p className="mt-1.5 sm:mt-2 text-[10px] sm:text-[11px] text-muted-foreground">{getCategory(product.category)?.name}</p>
        <h3 className="truncate text-xs sm:text-sm font-medium">{product.name}</h3>
      </Link>
      <div className="mt-1"><Rating value={product.rating} reviews={product.reviews} /></div>
      <div className="mt-1 flex flex-wrap items-baseline gap-x-1.5 sm:gap-x-2">
        <span className="font-bold text-xs sm:text-sm text-destructive">{formatPrice(product.price)}</span>
        {product.regularPrice && <s className="text-[10px] sm:text-xs text-muted-foreground">{formatPrice(product.regularPrice)}</s>}
      </div>
      <div className="mt-2.5 sm:mt-3 grid grid-cols-2 gap-1 sm:gap-1.5">
        <button
          type="button"
          onClick={() => add(product.id)}
          className="flex h-8 sm:h-9 min-w-0 items-center justify-center gap-1 rounded-xl border border-primary px-1 text-[11px] sm:text-xs font-semibold text-primary transition hover:bg-ocean-soft active:scale-95 cursor-pointer"
          title="কার্টে যোগ করুন"
        >
          <ShoppingCart className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0" />
          <span className="truncate">কার্ট</span>
        </button>
        <Link
          to="/product/$id"
          params={{ id: product.id }}
          className="flex h-8 sm:h-9 min-w-0 items-center justify-center rounded-xl bg-highlight px-1 text-[11px] sm:text-xs font-bold text-highlight-foreground shadow-xs transition hover:bg-highlight/90 active:scale-95 text-center"
        >
          <span className="truncate">অর্ডার করুন</span>
        </Link>
      </div>
    </article>
  );
}

export function ProductGrid({ products }: { products: Product[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-6">
      {products.map((p) => <ProductCard key={p.id} product={p} />)}
    </div>
  );
}
