import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { CheckCircle2, ShieldCheck, Truck, ShoppingBag, ArrowLeft } from "lucide-react";
import confetti from "canvas-confetti";
import { DELIVERY_DHAKA, DELIVERY_OUTSIDE, formatPrice, toBn } from "@/lib/catalog";
import { useStore } from "@/lib/store";
import { dataService, type Order } from "@/lib/data-service";
import { trackInitiateCheckout } from "@/lib/meta-pixel";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "চেকআউট — ঝিনুক" },
      { name: "description", content: "ঠিকানা দিন ও ক্যাশ অন ডেলিভারিতে অর্ডার নিশ্চিত করুন।" },
      { property: "og:title", content: "চেকআউট — ঝিনুক" },
      { property: "og:description", content: "ক্যাশ অন ডেলিভারিতে অর্ডার নিশ্চিত করুন।" },
    ],
  }),
  component: Checkout,
});

const field = "h-11 w-full rounded-xl border border-input bg-card px-4 text-sm outline-none transition focus:border-ocean focus:ring-4 focus:ring-ocean/15";

function Checkout() {
  const { lines, subtotal, clear } = useStore();
  const [area, setArea] = useState<"dhaka" | "outside">("dhaka");
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [idempotencyKey] = useState(() => "chk_" + Math.random().toString(36).substring(2, 10));

  const [customer, setCustomer] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    district: "ঢাকা",
    area: "",
  });

  const settings = dataService.getSettings();
  const { deliveryCharge, discount, total: grandTotal } = dataService.calculateOrderTotal(subtotal, area, 0);

  // Track InitiateCheckout
  useState(() => {
    if (lines.length > 0) {
      trackInitiateCheckout(
        lines.map((l) => ({ id: l.product.id, price: l.product.price, quantity: l.qty })),
        grandTotal
      );
    }
  });

  const submitOrder = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (submitting) return;

    if (!customer.name.trim()) {
      toast.error("আপনার নাম লিখুন");
      return;
    }

    if (!dataService.isValidBDPhone(customer.phone)) {
      toast.error("সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন (যেমন: 01712345678)");
      return;
    }

    if (!customer.address.trim() || customer.address.trim().length < 5) {
      toast.error("সম্পূর্ণ ঠিকানা দিন");
      return;
    }

    if (!customer.district.trim() || !customer.area.trim()) {
      toast.error("জেলা এবং এলাকা দিন");
      return;
    }

    setSubmitting(true);

    try {
      // Consolidate any duplicate lines by product ID
      const consolidatedMap = new Map<string, { productId: string; quantity: number }>();
      for (const line of lines) {
        const existing = consolidatedMap.get(line.product.id);
        if (existing) {
          existing.quantity += line.qty;
        } else {
          consolidatedMap.set(line.product.id, { productId: line.product.id, quantity: line.qty });
        }
      }

      const result = await dataService.placeOrder({
        customerName: customer.name,
        customerPhone: customer.phone,
        customerEmail: customer.email || undefined,
        address: customer.address,
        district: customer.district,
        area: customer.area,
        deliveryZone: area,
        items: Array.from(consolidatedMap.values()),
        idempotencyKey,
      });

      if (!result.success || !result.order) {
        toast.error("অর্ডার সম্পন্ন করা যায়নি", {
          description: result.error || "পুনরায় চেষ্টা করুন।",
        });
        setSubmitting(false);
        return;
      }

      setConfirmedOrder(result.order);
      clear();

      try {
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 },
        });
      } catch {}
    } catch (err: any) {
      toast.error("অর্ডার ত্রুটি", {
        description: err?.message || "সার্ভারে সমস্যা হয়েছে।",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (confirmedOrder) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-emerald-100 text-emerald-600 shadow-sm">
          <CheckCircle2 className="h-12 w-12" />
        </div>
        <h1 className="mt-5 text-2xl sm:text-3xl font-extrabold text-navy">
          ধন্যবাদ! আপনার অর্ডার সম্পন্ন হয়েছে
        </h1>
        <p className="mt-2 text-base font-semibold text-primary">
          “আপনার পছন্দের পথে, ঝিনুক থাকুক পাশে।”
        </p>
        <p className="mt-1.5 text-muted-foreground text-sm">
          অর্ডার নম্বর: <strong className="font-mono text-navy text-base">#{confirmedOrder.orderNumber}</strong>।
          আমাদের প্রতিনিধি শীঘ্রই আপনাকে কল করে অর্ডারটি কনফার্ম করবেন।
        </p>

        <div className="mt-6 rounded-2xl border border-border bg-card p-5 text-left shadow-card space-y-3">
          <div className="flex justify-between text-sm border-b border-border pb-2.5">
            <span className="text-muted-foreground">অর্ডার তারিখ:</span>
            <span className="font-medium text-foreground">
              {new Date(confirmedOrder.createdAt).toLocaleDateString("bn-BD", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>
          <div className="space-y-1.5 text-sm">
            <span className="text-muted-foreground block text-xs font-semibold">অর্ডারকৃত পণ্য:</span>
            {confirmedOrder.items.map((item, idx) => (
              <div key={idx} className="flex justify-between gap-2 text-sm">
                <span className="truncate">{item.name} × {toBn(item.quantity)}</span>
                <span className="shrink-0 font-bold">{formatPrice(item.lineTotal)}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-between text-sm border-t border-border pt-2">
            <span className="text-muted-foreground">ডেলিভারি চার্জ:</span>
            <span>{formatPrice(confirmedOrder.deliveryCharge)}</span>
          </div>
          <div className="flex justify-between text-base font-bold text-navy border-t border-border pt-2">
            <span>সর্বমোট পরিশোধযোগ্য:</span>
            <span className="text-highlight font-extrabold">{formatPrice(confirmedOrder.total)}</span>
          </div>
          <div className="rounded-xl bg-ocean-soft p-3 text-xs text-navy font-medium text-center">
            পদ্ধতি: ক্যাশ অন ডেলিভারি (পণ্য হাতে পেয়ে মূল্য দিন)
          </div>
        </div>

        <Link
          to="/shop"
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-8 py-3 font-semibold text-primary-foreground hover:bg-navy transition shadow-lift"
        >
          <ShoppingBag className="h-4 w-4" /> আরও কেনাকাটা করুন
        </Link>
      </div>
    );
  }

  if (!lines.length) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-ocean-soft text-primary">
          <ShoppingBag className="h-8 w-8" />
        </div>
        <h2 className="mt-4 text-xl font-bold text-navy">আপনার কার্ট খালি</h2>
        <p className="mt-1 text-sm text-muted-foreground">চেকআউট করার আগে কার্টে পণ্য যোগ করুন।</p>
        <Link
          to="/shop"
          className="mt-6 inline-flex rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-navy transition"
        >
          শপে ফিরে যান
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-3 sm:px-4 py-6 sm:py-8">
      <Link to="/cart" className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline">
        <ArrowLeft className="h-3.5 w-3.5" /> কার্টে ফিরুন
      </Link>

      <form onSubmit={submitOrder} className="grid gap-4 sm:gap-6 md:grid-cols-[1fr_360px]">
        {/* Customer Information */}
        <div className="space-y-3.5 sm:space-y-4 rounded-2xl border border-border bg-card p-4 sm:p-6 shadow-card">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h1 className="text-lg sm:text-2xl font-bold text-navy">ডেলিভারি তথ্য</h1>
            <span className="rounded-full bg-highlight/15 px-2.5 py-0.5 text-xs font-bold text-highlight">
              ক্যাশ অন ডেলিভারি
            </span>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-foreground">আপনার নাম *</label>
            <input
              required
              minLength={2}
              className={field}
              placeholder="আপনার পূর্ণ নাম"
              value={customer.name}
              onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-foreground">মোবাইল নম্বর *</label>
            <input
              required
              type="tel"
              inputMode="tel"
              className={field}
              placeholder="01XXXXXXXXX"
              value={customer.phone}
              onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
            />
            <span className="text-[11px] text-muted-foreground">অর্ডার কনফার্মেশনের জন্য সচল নম্বর দিন</span>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-foreground">সম্পূর্ণ ডেলিভারি ঠিকানা *</label>
            <textarea
              required
              minLength={5}
              rows={2}
              className="w-full rounded-xl border border-input bg-card p-3 text-sm outline-none transition focus:border-ocean focus:ring-4 focus:ring-ocean/15"
              placeholder="বাসা নং, রোড নং, এলাকা/গ্রাম"
              value={customer.address}
              onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-semibold text-foreground">জেলা *</label>
              <input
                required
                className={field}
                placeholder="যেমন: ঢাকা"
                value={customer.district}
                onChange={(e) => {
                  const val = e.target.value;
                  setCustomer({ ...customer, district: val });
                  if (val.includes("ঢাকা") || val.toLowerCase().includes("dhaka")) {
                    setArea("dhaka");
                  } else if (val.trim()) {
                    setArea("outside");
                  }
                }}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-foreground">এলাকা / থানা *</label>
              <input
                required
                className={field}
                placeholder="যেমন: ধানমন্ডি"
                value={customer.area}
                onChange={(e) => setCustomer({ ...customer, area: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-foreground">ডেলিভারি চার্জ</label>
            <div className="grid grid-cols-2 gap-3">
              {(["dhaka", "outside"] as const).map((a) => (
                <label
                  key={a}
                  className={`flex cursor-pointer flex-col rounded-xl border p-3 text-sm transition ${
                    area === a ? "border-primary bg-ocean-soft" : "border-border hover:bg-muted/50"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="deliveryZone"
                      checked={area === a}
                      onChange={() => setArea(a)}
                    />
                    <span className="font-semibold">{a === "dhaka" ? "ঢাকার ভেতরে" : "ঢাকার বাইরে"}</span>
                  </div>
                  <span className="mt-1 font-bold text-navy pl-5">
                    {formatPrice(a === "dhaka" ? settings.deliveryDhaka : settings.deliveryOutside)}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-muted-foreground">ইমেইল (ঐচ্ছিক)</label>
            <input
              type="email"
              className={field}
              placeholder="আপনার ইমেইল এড্রেস"
              value={customer.email}
              onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
            />
          </div>

          <div>
            <h2 className="pt-2 font-semibold text-sm text-navy">পেমেন্ট পদ্ধতি</h2>
            <div className="mt-1.5 rounded-xl border border-primary bg-ocean-soft p-3 text-sm font-medium text-navy">
              ✓ ক্যাশ অন ডেলিভারি (COD)
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              পণ্য হাতে পেয়ে দেখে মূল্য পরিশোধ করুন।
            </p>
          </div>
        </div>

        {/* Order Summary */}
        <div className="h-fit space-y-4 rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-card">
          <h2 className="font-bold text-lg text-navy border-b border-border pb-3">অর্ডার সারাংশ</h2>
          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
            {lines.map(({ product, qty }) => (
              <div key={product.id} className="flex items-center justify-between gap-3 text-sm">
                <div className="flex items-center gap-2.5 min-w-0">
                  <img src={product.image} alt={product.name} className="h-10 w-10 rounded-lg object-contain bg-white border border-border p-0.5" />
                  <div className="truncate">
                    <p className="truncate font-medium">{product.name}</p>
                    <p className="text-xs text-muted-foreground">{formatPrice(product.price)} × {toBn(qty)}</p>
                  </div>
                </div>
                <span className="shrink-0 font-bold">{formatPrice(product.price * qty)}</span>
              </div>
            ))}
          </div>

          <hr className="border-border" />
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>পণ্যের সাবটোটাল</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-emerald-600 font-medium">
                <span>ডিসকাউন্ট</span>
                <span>-{formatPrice(discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-muted-foreground">
              <span>ডেলিভারি চার্জ ({area === "dhaka" ? "ঢাকার ভেতরে" : "ঢাকার বাইরে"})</span>
              <span className="font-semibold text-navy">{formatPrice(deliveryCharge)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold text-navy border-t border-border pt-2">
              <span>সর্বমোট পরিশোধযোগ্য</span>
              <span className="text-highlight font-extrabold">{formatPrice(grandTotal)}</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-highlight font-bold text-highlight-foreground shadow-lift transition hover:bg-highlight/90 active:scale-98 disabled:opacity-60 cursor-pointer text-base"
          >
            {submitting ? (
              <span className="inline-flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                অর্ডার সংরক্ষণ হচ্ছে…
              </span>
            ) : (
              "অর্ডার নিশ্চিত করুন"
            )}
          </button>

          <div className="space-y-1.5 text-center text-xs text-muted-foreground pt-1">
            <p className="flex items-center justify-center gap-1.5">
              <Truck className="h-4 w-4 text-primary" /> ১-২ দিনে ঢাকায়, ৩-৫ দিনে সারা দেশে
            </p>
            <p className="flex items-center justify-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-primary" /> ১০০% আসল পণ্য ও ৭ দিনের রিটার্ন
            </p>
          </div>
        </div>
      </form>
    </div>
  );
}
