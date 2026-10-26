import { useState, useRef, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import {
  ShoppingCart,
  Truck,
  ShieldCheck,
  Zap,
  Star,
  CheckCircle,
  Clock,
  RotateCcw,
  Sparkles,
  Maximize2,
  X,
  User,
  Send,
} from "lucide-react";
import { formatPrice, getCategory, toBn, discountPct } from "@/lib/catalog";
import { useStore } from "@/lib/store";
import { dataService, type Product, type ProductReview } from "@/lib/data-service";
import { ProductGrid, WishlistButton } from "@/components/store/ProductCard";
import { DirectOrderForm } from "@/components/store/DirectOrderForm";
import { MobileStickyBar } from "@/components/store/MobileStickyBar";
import { trackViewContent, trackAddToCart } from "@/lib/meta-pixel";
import { toast } from "sonner";

type Props = {
  product: Product;
  relatedProducts: Product[];
};

export function ProductDetailView({ product, relatedProducts }: Props) {
  const { add } = useStore();
  const [selectedImage, setSelectedImage] = useState(product.image);
  const [selectedVariant, setSelectedVariant] = useState<string>(() => {
    if (product.variants && product.variants.length > 0) {
      return product.variants.map((v) => `${v.name}: ${v.options[0]}`).join(", ");
    }
    return "";
  });
  const [variantState, setVariantState] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    product.variants?.forEach((v) => {
      if (v.options[0]) initial[v.name] = v.options[0];
    });
    return initial;
  });

  const [qty, setQty] = useState(1);
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const [reviews, setReviews] = useState<ProductReview[]>(() => dataService.getProductReviews(product.id));

  // Review Form State
  const [reviewName, setReviewName] = useState("");
  const [reviewPhone, setReviewPhone] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const directOrderRef = useRef<HTMLDivElement>(null);
  const settings = dataService.getSettings();

  // Track ViewContent on load
  useEffect(() => {
    trackViewContent(product);
  }, [product.id]);

  // Keep selected image updated if product changes
  useEffect(() => {
    setSelectedImage(product.image);
    setReviews(dataService.getProductReviews(product.id));
  }, [product]);

  const handleVariantChange = (variantName: string, option: string) => {
    const updated = { ...variantState, [variantName]: option };
    setVariantState(updated);
    const combined = Object.entries(updated)
      .map(([k, v]) => `${k}: ${v}`)
      .join(", ");
    setSelectedVariant(combined);
  };

  const handleBuyNow = () => {
    if (directOrderRef.current) {
      directOrderRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      const input = directOrderRef.current.querySelector("input");
      if (input) input.focus();
    }
  };

  const handleAddToCart = () => {
    add(product.id, qty);
    trackAddToCart(product, qty);
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmittingReview) return;

    if (!reviewName.trim()) {
      toast.error("আপনার নাম লিখুন");
      return;
    }
    if (!reviewComment.trim() || reviewComment.trim().length < 5) {
      toast.error("কমপক্ষে ৫ অক্ষরের মন্তব্য লিখুন");
      return;
    }

    setIsSubmittingReview(true);
    const res = await dataService.submitReview({
      productId: product.id,
      customerName: reviewName,
      customerPhone: reviewPhone || undefined,
      rating: reviewRating,
      comment: reviewComment,
    });

    setIsSubmittingReview(false);
    if (res.success) {
      toast.success(res.message);
      setReviewComment("");
      setReviewName("");
      setReviewPhone("");
      setReviews(dataService.getProductReviews(product.id));
    } else {
      toast.error(res.message);
    }
  };

  const off = discountPct(product as any);
  const gallery = product.gallery && product.gallery.length > 0 ? product.gallery : [product.image];

  return (
    <div className="mx-auto max-w-[1440px] px-3 sm:px-4 py-5 sm:py-6 lg:px-8">
      {/* Breadcrumb */}
      <nav aria-label="ব্রেডক্রাম্ব" className="mb-5 text-xs sm:text-sm text-muted-foreground flex flex-wrap items-center gap-1.5">
        <Link to="/" className="hover:text-primary transition">হোম</Link>
        <span>/</span>
        <Link to="/shop" search={{ cat: product.category }} className="hover:text-primary transition">
          {getCategory(product.category)?.name || product.category}
        </Link>
        <span>/</span>
        <span className="text-foreground font-medium truncate max-w-[200px] sm:max-w-none">{product.name}</span>
      </nav>

      {/* Main 3-Column Responsive Layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8 items-start">
        {/* Left Column: Image Gallery (lg:col-span-4) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-4 shadow-card group">
            <button
              type="button"
              onClick={() => setIsZoomOpen(true)}
              className="w-full h-full block focus:outline-none focus:ring-2 focus:ring-ocean rounded-xl overflow-hidden"
              aria-label="ছবি বড় করে দেখুন"
            >
              <img
                src={selectedImage}
                alt={product.name}
                className="mx-auto aspect-square w-full max-w-md object-contain transition-transform duration-250 ease-out group-hover:scale-[1.06] cursor-zoom-in motion-reduce:transform-none motion-reduce:transition-none"
              />
            </button>
            <WishlistButton id={product.id} className="absolute right-3 top-3 h-10 w-10 border border-border bg-card/90" />
            <button
              onClick={() => setIsZoomOpen(true)}
              className="absolute left-3 top-3 grid h-8 w-8 place-items-center rounded-lg bg-card/80 text-muted-foreground hover:bg-card hover:text-foreground shadow-xs border border-border focus:outline-none focus:ring-2 focus:ring-ocean"
              title="বড় করে দেখুন"
              aria-label="বড় করে দেখুন"
            >
              <Maximize2 className="h-4 w-4" />
            </button>
            {off > 0 && (
              <span className="absolute bottom-3 left-3 rounded-full bg-highlight px-3 py-1 text-xs font-bold text-highlight-foreground shadow-sm">
                -{toBn(off)}% ডিসকাউন্ট
              </span>
            )}
          </div>

          {/* Thumbnails */}
          {gallery.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
              {gallery.map((img, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setSelectedImage(img)}
                  className={`h-16 w-16 shrink-0 overflow-hidden rounded-xl border p-1 transition ${
                    selectedImage === img
                      ? "border-primary ring-2 ring-primary/20 bg-ocean-soft"
                      : "border-border bg-card hover:border-ocean"
                  }`}
                >
                  <img src={img} alt={`${product.name} থাম্বনেইল ${i + 1}`} className="h-full w-full object-contain" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Center Column: Product Details & Purchase Actions (lg:col-span-5) */}
        <div className="lg:col-span-5 space-y-4">
          <div>
            {product.name_en && (
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{product.name_en}</p>
            )}
            <h1 className="text-2xl sm:text-3xl font-extrabold text-navy leading-snug">{product.name}</h1>
            {product.sku && (
              <p className="mt-1 text-xs text-muted-foreground">SKU: <span className="font-mono">{product.sku}</span></p>
            )}
          </div>

          {/* Ratings & Stock Status */}
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <div className="flex items-center gap-1 text-amber-500">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              <span className="font-bold text-foreground">{toBn(product.rating || 5.0)}</span>
              <span className="text-xs text-muted-foreground">({toBn(reviews.length || product.reviewCount || 0)} রিভিউ)</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1.5">
              {product.stockQuantity > 0 ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
                  <CheckCircle className="h-3.5 w-3.5" /> ইন স্টক ({toBn(product.stockQuantity)}টি মজুদ)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2.5 py-0.5 text-xs font-semibold text-destructive">
                  স্টক শেষ
                </span>
              )}
            </div>
          </div>

          {/* Pricing */}
          <div className="rounded-2xl bg-ocean-soft/60 p-4 border border-border">
            <div className="flex items-baseline gap-3">
              <span className="text-3xl sm:text-4xl font-extrabold text-navy">{formatPrice(product.price)}</span>
              {product.regularPrice && (
                <s className="text-lg text-muted-foreground">{formatPrice(product.regularPrice)}</s>
              )}
              {off > 0 && (
                <span className="rounded-full bg-highlight px-2.5 py-0.5 text-xs font-extrabold text-highlight-foreground">
                  -{toBn(off)}% সেভ
                </span>
              )}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">ক্যাশ অন ডেলিভারি সুবিধা সহ সারা দেশে ডেলিভারি</p>
          </div>

          {/* Truthful Trust & COD Delivery Assurance */}
          <div className="inline-flex items-center gap-2 rounded-full bg-ocean-soft px-3.5 py-1.5 text-xs font-semibold text-navy border border-ocean/20">
            <Truck className="h-3.5 w-3.5 text-primary shrink-0" />
            <span>সারা দেশে ক্যাশ অন ডেলিভারি • পণ্য হাতে পেয়ে মূল্য দিন</span>
          </div>

          {/* Short Description */}
          <p className="text-sm leading-relaxed text-muted-foreground">{product.description}</p>

          {/* Variants Selector */}
          {product.variants && product.variants.length > 0 && (
            <div className="space-y-3 pt-2">
              {product.variants.map((v) => (
                <div key={v.name} className="space-y-1.5">
                  <span className="text-xs font-bold text-foreground">
                    {v.name}: <span className="font-medium text-primary">{variantState[v.name] || v.options[0]}</span>
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {v.options.map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => handleVariantChange(v.name, opt)}
                        className={`rounded-xl border px-3.5 py-1.5 text-xs font-semibold transition ${
                          variantState[v.name] === opt
                            ? "border-primary bg-primary text-primary-foreground shadow-xs"
                            : "border-border bg-card text-foreground hover:bg-ocean-soft"
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Quantity Selector & Primary Actions */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-3">
              <div className="flex h-12 items-center rounded-xl border border-border bg-card shadow-xs">
                <button
                  type="button"
                  className="h-12 w-10 text-base font-bold text-foreground hover:bg-muted rounded-l-xl transition"
                  aria-label="পরিমাণ কমান"
                  onClick={() => setQty(Math.max(1, qty - 1))}
                >
                  −
                </button>
                <span className="w-10 text-center font-bold text-navy">{toBn(qty)}</span>
                <button
                  type="button"
                  className="h-12 w-10 text-base font-bold text-foreground hover:bg-muted rounded-r-xl transition"
                  aria-label="পরিমাণ বাড়ান"
                  onClick={() => setQty(Math.min(product.stockQuantity, qty + 1))}
                >
                  +
                </button>
              </div>

              {/* Primary Buy Now Button (High-converting orange) */}
              <button
                type="button"
                onClick={handleBuyNow}
                disabled={product.stockQuantity === 0}
                className="flex-1 flex h-12 items-center justify-center gap-2 rounded-xl bg-highlight font-bold text-highlight-foreground shadow-lift transition hover:bg-highlight/90 active:scale-98 disabled:opacity-50 text-base cursor-pointer"
              >
                <Zap className="h-5 w-5 fill-current" />
                <span>এখনই অর্ডার করুন</span>
              </button>
            </div>

            {/* Secondary Add to Cart Button */}
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={product.stockQuantity === 0}
              className="w-full flex h-11 items-center justify-center gap-2 rounded-xl border border-primary font-semibold text-primary hover:bg-ocean-soft transition shadow-xs cursor-pointer"
            >
              <ShoppingCart className="h-4 w-4" />
              <span>কার্টে যোগ করুন</span>
            </button>
          </div>

          {/* Trust Guarantees */}
          <div className="rounded-2xl border border-border bg-card p-4 space-y-2.5 text-xs text-muted-foreground shadow-xs">
            <div className="flex items-center gap-2.5">
              <Truck className="h-4 w-4 text-primary shrink-0" />
              <span>ডেলিভারি চার্জ: ঢাকায় <strong>{formatPrice(settings.deliveryDhaka)}</strong>, ঢাকার বাইরে <strong>{formatPrice(settings.deliveryOutside)}</strong></span>
            </div>
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="h-4 w-4 text-primary shrink-0" />
              <span>ক্যাশ অন ডেলিভারি — পণ্য দেখে মূল্য পরিশোধের সুবিধা</span>
            </div>
            <div className="flex items-center gap-2.5">
              <RotateCcw className="h-4 w-4 text-primary shrink-0" />
              <span>৭ দিনের সহজ রিটার্ন ও এক্সচেঞ্জ পলিসি</span>
            </div>
          </div>
        </div>

        {/* Right Column: Compact Direct Order Form (lg:col-span-3) */}
        <div ref={directOrderRef} className="lg:col-span-3 sticky top-20">
          <DirectOrderForm
            product={product}
            selectedVariant={selectedVariant}
            quantity={qty}
            className="w-full"
          />
        </div>
      </div>

      {/* Specifications & Description Tabs */}
      <div className="mt-12 rounded-3xl border border-border bg-card p-6 shadow-card">
        <h2 className="text-xl font-bold text-navy mb-4">পণ্যের বিবরণ ও বৈশিষ্ট্য</h2>
        <div className="prose prose-sm max-w-none text-muted-foreground space-y-4">
          <p className="leading-relaxed">{product.description}</p>
          {product.features && product.features.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-navy mb-2">মূল বৈশিষ্ট্যসমূহ:</h3>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 list-none p-0">
                {product.features.map((feat, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-foreground">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Product Reviews Section (Requirement 6) */}
      <div className="mt-8 rounded-3xl border border-border bg-card p-6 shadow-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
          <div>
            <h2 className="text-xl font-bold text-navy">কাস্টমার রিভিউ ({toBn(reviews.length)})</h2>
            <p className="text-xs text-muted-foreground mt-0.5">প্রকৃত ক্রেতাদের বাস্তব প্রতিক্রিয়া ও মূল্যায়ন</p>
          </div>
          <div className="flex items-center gap-2 bg-ocean-soft px-4 py-2 rounded-xl border border-border">
            <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
            <span className="text-xl font-bold text-navy">{toBn(product.rating || 5.0)}</span>
            <span className="text-xs text-muted-foreground">/ ৫.০</span>
          </div>
        </div>

        {/* Review list */}
        <div className="mt-6 space-y-4">
          {reviews.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border p-8 text-center">
              <Sparkles className="mx-auto h-8 w-8 text-muted-foreground" />
              <p className="mt-2 text-sm font-semibold text-foreground">এই পণ্যে এখনো কোনো রিভিউ নেই।</p>
              <p className="text-xs text-muted-foreground mt-1">পণ্যটি অর্ডার করে প্রথম রিভিউ আপনিই লিখুন!</p>
            </div>
          ) : (
            reviews.map((rev) => (
              <div key={rev.id} className="rounded-2xl border border-border/80 bg-muted/20 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="grid h-8 w-8 place-items-center rounded-full bg-primary/10 text-primary font-bold text-xs">
                      {rev.customerName.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-navy">{rev.customerName}</p>
                      {rev.isVerifiedPurchase && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                          <CheckCircle className="h-3 w-3" /> ভেরিফাইড ক্রেতা
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-3.5 w-3.5 ${star <= rev.rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground"}`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-foreground/90 pl-10 leading-relaxed">{rev.comment}</p>
                <p className="text-[10px] text-muted-foreground pl-10">
                  {new Date(rev.createdAt).toLocaleDateString("bn-BD", { year: "numeric", month: "long", day: "numeric" })}
                </p>
              </div>
            ))
          )}
        </div>

        {/* Write a review form */}
        <form onSubmit={handleReviewSubmit} className="mt-8 rounded-2xl border border-border bg-ocean-soft/40 p-5 space-y-3">
          <h3 className="text-sm font-bold text-navy">আপনার মতামত জানান</h3>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-muted-foreground">রেটিং দিন:</span>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setReviewRating(s)}
                  className="p-1 hover:scale-110 transition"
                  aria-label={`${s} স্টার রেটিং`}
                >
                  <Star className={`h-5 w-5 ${s <= reviewRating ? "fill-amber-400 text-amber-400" : "text-muted-foreground"}`} />
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              required
              value={reviewName}
              onChange={(e) => setReviewName(e.target.value)}
              placeholder="আপনার নাম"
              className="h-10 rounded-xl border border-input bg-card px-3 text-xs outline-none focus:border-ocean"
            />
            <input
              type="tel"
              value={reviewPhone}
              onChange={(e) => setReviewPhone(e.target.value)}
              placeholder="অর্ডারের ফোন নম্বর (ভেরিফাইড ব্যাজের জন্য)"
              className="h-10 rounded-xl border border-input bg-card px-3 text-xs outline-none focus:border-ocean"
            />
          </div>
          <textarea
            required
            rows={2}
            value={reviewComment}
            onChange={(e) => setReviewComment(e.target.value)}
            placeholder="পণ্যটি কেমন লাগলো? বিস্তারিত লিখুন..."
            className="w-full rounded-xl border border-input bg-card p-3 text-xs outline-none focus:border-ocean"
          />
          <button
            type="submit"
            disabled={isSubmittingReview}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2 text-xs font-semibold text-primary-foreground hover:bg-navy transition disabled:opacity-60"
          >
            <Send className="h-3.5 w-3.5" />
            <span>রিভিউ সাবমিট করুন</span>
          </button>
        </form>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="mt-12">
          <h2 className="mb-4 text-xl font-bold text-navy">সম্পর্কিত পণ্যসমূহ</h2>
          <ProductGrid products={relatedProducts as any} />
        </section>
      )}

      {/* Mobile Sticky Purchase Bar */}
      <MobileStickyBar product={product} onBuyNowClick={handleBuyNow} />

      {/* Full Image Zoom Modal */}
      {isZoomOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/80 p-4 backdrop-blur-sm">
          <div className="relative max-h-[90vh] max-w-2xl overflow-hidden rounded-3xl bg-card p-6 shadow-lift">
            <button
              onClick={() => setIsZoomOpen(false)}
              className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full bg-muted text-foreground hover:bg-muted/80"
              aria-label="বন্ধ করুন"
            >
              <X className="h-5 w-5" />
            </button>
            <img src={selectedImage} alt={product.name} className="mx-auto max-h-[75vh] w-auto object-contain" />
          </div>
        </div>
      )}
    </div>
  );
}
