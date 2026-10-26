import { useState, useId } from "react";
import { CheckCircle2, ShieldCheck, Truck, AlertCircle, ShoppingBag } from "lucide-react";
import confetti from "canvas-confetti";
import { dataService, type Product, type Order } from "@/lib/data-service";
import { formatPrice, toBn } from "@/lib/catalog";
import { trackInitiateCheckout } from "@/lib/meta-pixel";

type Props = {
  product: Product;
  selectedVariant?: string;
  quantity?: number;
  onSuccess?: (order: Order) => void;
  className?: string;
  isInline?: boolean;
};

export function DirectOrderForm({
  product,
  selectedVariant = "",
  quantity = 1,
  onSuccess,
  className = "",
  isInline = false,
}: Props) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [district, setDistrict] = useState("ঢাকা");
  const [area, setArea] = useState("");
  const [deliveryZone, setDeliveryZone] = useState<"dhaka" | "outside">("dhaka");
  const [qty, setQty] = useState(quantity);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);
  const [idempotencyKey] = useState(() => "ord_" + Math.random().toString(36).substring(2, 10));

  const settings = dataService.getSettings();
  const subtotal = product.price * qty;
  const { deliveryCharge, discount, total } = dataService.calculateOrderTotal(subtotal, deliveryZone, 0);

  // Track InitiateCheckout on render
  useState(() => {
    trackInitiateCheckout([{ id: product.id, price: product.price, quantity: qty }], total);
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setErrorMsg(null);

    // Validation
    if (!name.trim()) {
      setErrorMsg("অনুগ্রহ করে আপনার পুরো নাম লিখুন।");
      return;
    }

    if (!dataService.isValidBDPhone(phone)) {
      setErrorMsg("অনুগ্রহ করে বাংলাদেশের সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন (যেমন: 01712345678)।");
      return;
    }

    if (!address.trim() || address.trim().length < 5) {
      setErrorMsg("অনুগ্রহ করে আপনার বাসা/রোড সহ সম্পূর্ণ ডেলিভারি ঠিকানা লিখুন।");
      return;
    }

    if (!district.trim() || !area.trim()) {
      setErrorMsg("অনুগ্রহ করে জেলা এবং এলাকার নাম লিখুন।");
      return;
    }

    setSubmitting(true);

    try {
      const result = await dataService.placeOrder({
        customerName: name,
        customerPhone: phone,
        customerEmail: email || undefined,
        address,
        district,
        area,
        deliveryZone,
        items: [
          {
            productId: product.id,
            quantity: qty,
            variant: selectedVariant || undefined,
          },
        ],
        idempotencyKey,
      });

      if (!result.success || !result.order) {
        setErrorMsg(result.error || "অর্ডার সম্পন্ন করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।");
        setSubmitting(false);
        return;
      }

      // Success
      setConfirmedOrder(result.order);
      if (onSuccess) onSuccess(result.order);

      // Trigger Confetti
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {}
    } catch (err: any) {
      setErrorMsg(err?.message || "সার্ভারে সমস্যা হয়েছে। পুনরায় চেষ্টা করুন।");
    } finally {
      setSubmitting(false);
    }
  };

  // Render Confirmation State
  if (confirmedOrder) {
    return (
      <div className={`rounded-2xl border border-primary/20 bg-card p-6 text-center shadow-card ${className}`}>
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-100 text-emerald-600">
          <CheckCircle2 className="h-10 w-10" />
        </div>
        <h2 className="mt-4 text-2xl font-bold text-navy">ধন্যবাদ! আপনার অর্ডারটি নিশ্চিত হয়েছে</h2>
        <p className="mt-1.5 text-sm font-semibold text-primary">“আপনার পছন্দের পথে, ঝিনুক থাকুক পাশে।”</p>
        <div className="mt-4 rounded-xl border border-border bg-ocean-soft p-4 text-left space-y-2">
          <div className="flex justify-between border-b border-border/50 pb-2 text-sm">
            <span className="text-muted-foreground">অর্ডার নম্বর:</span>
            <span className="font-mono font-bold text-navy">#{confirmedOrder.orderNumber}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">পণ্য:</span>
            <span className="font-medium text-foreground">{product.name} × {toBn(qty)}</span>
          </div>
          {selectedVariant && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">ভেরিয়েন্ট:</span>
              <span className="text-foreground">{selectedVariant}</span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">প্রাপক:</span>
            <span className="text-foreground">{confirmedOrder.customerName} ({toBn(confirmedOrder.customerPhone)})</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">ডেলিভারি ঠিকানা:</span>
            <span className="text-foreground text-right max-w-[220px]">{confirmedOrder.address}, {confirmedOrder.area}, {confirmedOrder.district}</span>
          </div>
          <div className="flex justify-between border-t border-border/50 pt-2 text-base font-bold text-navy">
            <span>সর্বমোট পরিশোধযোগ্য:</span>
            <span className="text-highlight">{formatPrice(confirmedOrder.total)}</span>
          </div>
          <div className="text-center pt-1 text-xs font-medium text-emerald-700 bg-emerald-50 rounded-lg py-1.5">
            পদ্ধতি: ক্যাশ অন ডেলিভারি (পণ্য পেয়ে টাকা দিন)
          </div>
        </div>

        <p className="mt-4 text-xs text-muted-foreground leading-relaxed">
          আমাদের প্রতিনিধি শীঘ্রই <strong>{toBn(confirmedOrder.customerPhone)}</strong> নম্বরে কল করে অর্ডার নিশ্চিত করবেন।
        </p>

        <button
          onClick={() => {
            setConfirmedOrder(null);
            setQty(1);
          }}
          className="mt-5 inline-flex items-center justify-center gap-2 rounded-full border border-primary px-6 py-2.5 text-sm font-semibold text-primary hover:bg-ocean-soft"
        >
          <ShoppingBag className="h-4 w-4" /> আরেকটি অর্ডার করুন
        </button>
      </div>
    );
  }

  const fieldClass =
    "h-11 w-full rounded-xl border border-input bg-card px-3.5 text-sm outline-none transition focus:border-ocean focus:ring-4 focus:ring-ocean/15";

  return (
    <form
      onSubmit={handleSubmit}
      id="direct-order-form"
      className={`rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-card ${className}`}
    >
      <div className="mb-4 border-b border-border pb-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-navy">সরাসরি অর্ডার করুন</h3>
          <span className="rounded-full bg-highlight/15 px-2.5 py-0.5 text-xs font-bold text-highlight">
            ক্যাশ অন ডেলিভারি
          </span>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          কোনো অগ্রিম পেমেন্ট নেই! পণ্য হাতে পেয়ে মূল্য পরিশোধ করুন।
        </p>
      </div>

      {errorMsg && (
        <div className="mb-4 flex items-center gap-2 rounded-xl bg-destructive/10 p-3 text-xs font-medium text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Selected product summary line */}
      <div className="mb-4 flex items-center justify-between rounded-xl bg-ocean-soft p-3 text-xs">
        <div className="flex items-center gap-2.5 min-w-0">
          <img src={product.image} alt={product.name} className="h-10 w-10 shrink-0 rounded-lg object-contain bg-white p-0.5 border border-border" />
          <div className="truncate">
            <p className="font-bold text-navy truncate">{product.name}</p>
            {selectedVariant && <p className="text-muted-foreground">{selectedVariant}</p>}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex h-8 items-center rounded-lg border border-border bg-card">
            <button
              type="button"
              className="h-8 w-7 text-xs font-bold"
              onClick={() => setQty(Math.max(1, qty - 1))}
            >
              −
            </button>
            <span className="w-5 text-center font-bold text-xs">{toBn(qty)}</span>
            <button
              type="button"
              className="h-8 w-7 text-xs font-bold"
              onClick={() => setQty(Math.min(product.stockQuantity, qty + 1))}
            >
              +
            </button>
          </div>
          <span className="font-bold text-navy">{formatPrice(subtotal)}</span>
        </div>
      </div>

      <div className="space-y-3">
        {/* Name */}
        <div>
          <label className="mb-1 block text-xs font-semibold text-foreground">
            আপনার নাম <span className="text-destructive">*</span>
          </label>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="যেমন: মোঃ সাব্বির আহমেদ"
            className={fieldClass}
          />
        </div>

        {/* Mobile Number */}
        <div>
          <label className="mb-1 block text-xs font-semibold text-foreground">
            মোবাইল নম্বর <span className="text-destructive">*</span>
          </label>
          <input
            required
            type="tel"
            inputMode="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="01XXXXXXXXX"
            className={fieldClass}
          />
          <span className="text-[11px] text-muted-foreground">১১ ডিজিটের সচল মোবাইল নম্বর দিন</span>
        </div>

        {/* Delivery Address */}
        <div>
          <label className="mb-1 block text-xs font-semibold text-foreground">
            সম্পূর্ণ ঠিকানা <span className="text-destructive">*</span>
          </label>
          <textarea
            required
            rows={2}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="বাসা নং, রোড নং, এলাকা/গ্রাম"
            className="w-full rounded-xl border border-input bg-card p-3 text-sm outline-none transition focus:border-ocean focus:ring-4 focus:ring-ocean/15"
          />
        </div>

        {/* District & Area */}
        <div className="grid grid-cols-2 gap-2.5">
          <div>
            <label className="mb-1 block text-xs font-semibold text-foreground">
              জেলা <span className="text-destructive">*</span>
            </label>
            <input
              required
              value={district}
              onChange={(e) => {
                const val = e.target.value;
                setDistrict(val);
                if (val.includes("ঢাকা") || val.toLowerCase().includes("dhaka")) {
                  setDeliveryZone("dhaka");
                } else if (val.trim()) {
                  setDeliveryZone("outside");
                }
              }}
              placeholder="যেমন: ঢাকা"
              className={fieldClass}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-foreground">
              থানা / এলাকা <span className="text-destructive">*</span>
            </label>
            <input
              required
              value={area}
              onChange={(e) => setArea(e.target.value)}
              placeholder="যেমন: মিরপুর-১০"
              className={fieldClass}
            />
          </div>
        </div>

        {/* Delivery Zone Radio */}
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-foreground">ডেলিভারি এলাকা</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setDeliveryZone("dhaka")}
              className={`flex flex-col items-center justify-center rounded-xl border p-2 text-xs transition ${
                deliveryZone === "dhaka"
                  ? "border-primary bg-primary/10 font-bold text-primary"
                  : "border-border text-muted-foreground hover:bg-muted"
              }`}
            >
              <span>ঢাকার ভেতরে</span>
              <span className="mt-0.5 font-bold text-navy">{formatPrice(settings.deliveryDhaka)}</span>
            </button>
            <button
              type="button"
              onClick={() => setDeliveryZone("outside")}
              className={`flex flex-col items-center justify-center rounded-xl border p-2 text-xs transition ${
                deliveryZone === "outside"
                  ? "border-primary bg-primary/10 font-bold text-primary"
                  : "border-border text-muted-foreground hover:bg-muted"
              }`}
            >
              <span>ঢাকার বাইরে</span>
              <span className="mt-0.5 font-bold text-navy">{formatPrice(settings.deliveryOutside)}</span>
            </button>
          </div>
        </div>

        {/* Optional Email */}
        <div>
          <label className="mb-1 block text-xs font-semibold text-muted-foreground">
            ইমেইল (ঐচ্ছিক)
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="আপনার ইমেইল এড্রেস"
            className={fieldClass}
          />
        </div>

        {/* Order Price Breakdown */}
        <div className="rounded-xl border border-border bg-muted/40 p-3 text-xs space-y-1.5">
          <div className="flex justify-between text-muted-foreground">
            <span>পণ্যের মূল্য ({toBn(qty)}টি):</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>ডেলিভারি চার্জ ({deliveryZone === "dhaka" ? "ঢাকার ভেতরে" : "ঢাকার বাইরে"}):</span>
            <span className="font-semibold text-navy">{formatPrice(deliveryCharge)}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-emerald-600 font-medium">
              <span>ডিসকাউন্ট:</span>
              <span>-{formatPrice(discount)}</span>
            </div>
          )}
          <div className="flex justify-between border-t border-border pt-1.5 text-sm font-bold text-navy">
            <span>সর্বমোট প্রদেয় বিল:</span>
            <span className="text-highlight font-extrabold">{formatPrice(total)}</span>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={submitting || product.stockQuantity === 0}
          className="relative flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-highlight font-bold text-highlight-foreground shadow-lift transition hover:bg-highlight/90 active:scale-98 disabled:opacity-60 cursor-pointer text-base"
        >
          {submitting ? (
            <span className="inline-flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              অর্ডার প্রসেস হচ্ছে…
            </span>
          ) : product.stockQuantity === 0 ? (
            "স্টক শেষ"
          ) : (
            "অর্ডার কনফার্ম করুন"
          )}
        </button>

        <div className="flex items-center justify-center gap-3 pt-1 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1"><Truck className="h-3.5 w-3.5 text-primary" /> ক্যাশ অন ডেলিভারি</span>
          <span>•</span>
          <span className="flex items-center gap-1"><ShieldCheck className="h-3.5 w-3.5 text-primary" /> নিরাপদ চেকআউট</span>
        </div>
      </div>
    </form>
  );
}
