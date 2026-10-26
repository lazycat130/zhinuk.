import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Trash2 } from "lucide-react";
import { formatPrice } from "@/lib/catalog";
import { useStore } from "@/lib/store";
import { dataService } from "@/lib/data-service";
import { QtyControl } from "@/components/store/CartDrawer";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "শপিং কার্ট — ঝিনুক" },
      { name: "description", content: "আপনার কার্টের পণ্য দেখুন ও চেকআউট করুন।" },
      { property: "og:title", content: "শপিং কার্ট — ঝিনুক" },
      { property: "og:description", content: "আপনার কার্টের পণ্য দেখুন।" },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const { lines, subtotal, remove } = useStore();
  const [deliveryArea, setDeliveryArea] = useState<"dhaka" | "outside">("dhaka");
  const settings = dataService.getSettings();

  const { deliveryCharge, total } = dataService.calculateOrderTotal(subtotal, deliveryArea, 0);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-navy">শপিং কার্ট</h1>
        <p className="text-sm text-muted-foreground mt-0.5">পছন্দগুলো জমুক, আনন্দের ঝুলি ভরুক।</p>
      </div>
      {lines.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-12 text-center shadow-card space-y-3">
          <p className="text-base font-medium text-navy">আপনার ঝুলি এখনো খালি—পছন্দের কিছু যোগ করে নিন।</p>
          <Link to="/shop" className="inline-flex rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-navy transition">
            পছন্দের পণ্য খুঁজুন
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-[1fr_340px]">
          <ul className="divide-y divide-border rounded-2xl border border-border bg-card px-4 shadow-card">
            {lines.map(({ product, qty }) => (
              <li key={product.id} className="flex items-center gap-2.5 sm:gap-4 py-3 sm:py-4">
                <img src={product.image} alt={product.name} className="h-16 w-16 sm:h-20 sm:w-20 shrink-0 rounded-xl border border-border object-contain p-1" />
                <div className="min-w-0 flex-1">
                  <Link to="/product/$id" params={{ id: product.id }} className="block truncate text-xs sm:text-sm font-medium hover:text-primary">{product.name}</Link>
                  <p className="text-xs sm:text-sm font-bold text-destructive mt-0.5">{formatPrice(product.price)}</p>
                </div>
                <QtyControl id={product.id} qty={qty} />
                <p className="hidden w-24 text-right font-semibold sm:block text-sm">{formatPrice(product.price * qty)}</p>
                <button aria-label="সরান" onClick={() => remove(product.id)} className="text-muted-foreground hover:text-destructive p-1"><Trash2 className="h-4 w-4" /></button>
              </li>
            ))}
          </ul>

          <div className="h-fit space-y-4 rounded-2xl border border-border bg-card p-5 shadow-card">
            <h2 className="font-bold text-base text-navy border-b border-border pb-2.5">অর্ডার সারাংশ</h2>
            
            {/* Delivery Area Selection */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-foreground">ডেলিভারি এলাকা নির্বাচন করুন</label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setDeliveryArea("dhaka")}
                  className={`flex flex-col items-center justify-center rounded-xl border p-2.5 transition ${
                    deliveryArea === "dhaka"
                      ? "border-primary bg-primary/10 font-bold text-primary ring-1 ring-primary"
                      : "border-border text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <span>ঢাকার ভেতরে</span>
                  <span className="mt-0.5 font-bold text-navy">{formatPrice(settings.deliveryDhaka)}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDeliveryArea("outside")}
                  className={`flex flex-col items-center justify-center rounded-xl border p-2.5 transition ${
                    deliveryArea === "outside"
                      ? "border-primary bg-primary/10 font-bold text-primary ring-1 ring-primary"
                      : "border-border text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <span>ঢাকার বাইরে</span>
                  <span className="mt-0.5 font-bold text-navy">{formatPrice(settings.deliveryOutside)}</span>
                </button>
              </div>
            </div>

            <div className="space-y-2 border-t border-border pt-3 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>পণ্যের সাবটোটাল</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>ডেলিভারি চার্জ ({deliveryArea === "dhaka" ? "ঢাকার ভেতরে" : "ঢাকার বাইরে"})</span>
                <span className="font-semibold text-navy">{formatPrice(deliveryCharge)}</span>
              </div>
              <div className="flex justify-between border-t border-border pt-2 text-base font-bold text-navy">
                <span>সর্বমোট প্রদেয় বিল</span>
                <span className="text-highlight font-extrabold">{formatPrice(total)}</span>
              </div>
            </div>

            <p className="text-[11px] text-muted-foreground text-center">
              ডেলিভারি চার্জ প্রতি অর্ডারে একবারই প্রযোজ্য। ক্যাশ অন ডেলিভারি সুবিধা।
            </p>

            <Link
              to="/checkout"
              className="flex h-11 items-center justify-center rounded-full bg-primary font-semibold text-primary-foreground hover:bg-navy transition shadow-lift"
            >
              চেকআউটে এগিয়ে যান
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
