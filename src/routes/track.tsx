import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { InfoPage } from "@/components/store/InfoPage";
import { dataService, type Order } from "@/lib/data-service";
import { formatPrice, toBn } from "@/lib/catalog";
import { Search, CheckCircle2, Clock, Truck, Package, Phone, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/track")({
  head: () => ({
    meta: [
      { title: "অর্ডার ট্র্যাকিং — ঝিনুক ZHINUK" },
      { name: "description", content: "আপনার ঝিনুক অর্ডারের অবস্থা এবং ট্র্যাকিং তথ্য জানুন।" },
      { property: "og:title", content: "অর্ডার ট্র্যাকিং — ঝিনুক" },
      { property: "og:description", content: "আপনার অর্ডারের অবস্থা জানুন।" },
    ],
  }),
  component: TrackOrderPage,
});

function TrackOrderPage() {
  const [orderQuery, setOrderQuery] = useState("");
  const [phoneQuery, setPhoneQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);
  const [foundOrder, setFoundOrder] = useState<any | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = orderQuery.trim().replace(/^#/, "");
    if (!clean) return;

    setSearching(true);
    setSearched(true);
    try {
      const order = await dataService.trackOrderRemote(clean, phoneQuery.trim() || undefined);
      setFoundOrder(order || null);
    } catch {
      setFoundOrder(null);
    } finally {
      setSearching(false);
    }
  };

  const getStatusStep = (status: string) => {
    switch (status) {
      case "pending": return 1;
      case "confirmed": return 2;
      case "processing": return 2;
      case "shipped": return 3;
      case "delivered": return 4;
      default: return 1;
    }
  };

  return (
    <InfoPage title="অর্ডার ট্র্যাকিং">
      <div className="space-y-6">
        <p className="text-sm text-muted-foreground leading-relaxed">
          আপনার অর্ডার নিশ্চিত করার সময় প্রাপ্ত অর্ডার নম্বরটি (যেমন: ZH-XXXXXX) নিচে দিয়ে বর্তমান অগ্রগতি ট্র্যাক করুন।
        </p>

        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              required
              value={orderQuery}
              onChange={(e) => setOrderQuery(e.target.value)}
              className="h-12 w-full rounded-2xl border border-input bg-card pl-11 pr-4 text-sm font-mono outline-none transition focus:border-ocean focus:ring-4 focus:ring-ocean/15"
              placeholder="অর্ডার নম্বর (যেমন: ZH-A1B2C3)"
            />
          </div>
          <div className="relative sm:w-56">
            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              value={phoneQuery}
              onChange={(e) => setPhoneQuery(e.target.value)}
              className="h-12 w-full rounded-2xl border border-input bg-card pl-11 pr-4 text-sm outline-none transition focus:border-ocean focus:ring-4 focus:ring-ocean/15"
              placeholder="মোবাইল নম্বর (ঐচ্ছিক)"
            />
          </div>
          <button
            type="submit"
            disabled={searching}
            className="flex h-12 items-center justify-center gap-2 rounded-2xl bg-primary px-8 text-sm font-bold text-primary-foreground hover:bg-navy transition cursor-pointer disabled:opacity-60"
          >
            {searching ? "অনুসন্ধান হচ্ছে..." : "অর্ডার খুঁজুন"}
          </button>
        </form>

        {searched && !foundOrder && (
          <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            <Package className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
            <p className="font-semibold text-foreground">কোনো অর্ডার পাওয়া যায়নি</p>
            <p className="mt-1 text-xs">অনুগ্রহ করে অর্ডার নম্বরটি মিলিয়ে আবার চেষ্টা করুন অথবা হেল্পলাইনে যোগাযোগ করুন।</p>
            <a href="tel:+8801552541791" className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline">
              <Phone className="h-3 w-3" /> হেল্পলাইন: 01552-541791
            </a>
          </div>
        )}

        {foundOrder && (
          <div className="rounded-2xl border border-border bg-card p-6 shadow-card space-y-5 animate-in fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
              <div>
                <span className="text-xs text-muted-foreground">অর্ডার নম্বর</span>
                <h3 className="text-xl font-bold font-mono text-navy">#{foundOrder.orderNumber}</h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">স্ট্যাটাস:</span>
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800 uppercase">
                  {foundOrder.status}
                </span>
              </div>
            </div>

            {/* Progress Timeline */}
            <div className="grid grid-cols-4 gap-2 text-center pt-2">
              {[
                { title: "অর্ডার গৃহীত", step: 1 },
                { title: "কনফার্মড", step: 2 },
                { title: "ডেলিভারিতে", step: 3 },
                { title: "সম্পন্ন", step: 4 },
              ].map(({ title, step }) => {
                const currentStep = getStatusStep(foundOrder.status);
                const isPassed = currentStep >= step;
                return (
                  <div key={step} className="flex flex-col items-center">
                    <div className={`grid h-8 w-8 place-items-center rounded-full text-xs font-bold ${
                      isPassed ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                    }`}>
                      {toBn(step)}
                    </div>
                    <span className="text-[11px] font-medium text-foreground mt-1.5">{title}</span>
                  </div>
                );
              })}
            </div>

            {/* Order Details & Privacy Protection */}
            {foundOrder.is_verified === false ? (
              <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4 text-xs text-amber-900 space-y-2">
                <div className="flex items-center gap-2 font-semibold">
                  <ShieldCheck className="h-4 w-4 text-amber-700" />
                  <span>তথ্য সুরক্ষায় ভেরিফিকেশন প্রয়োজন</span>
                </div>
                <p className="leading-relaxed text-amber-800">
                  আপনার অর্ডারের ডেলিভারি অগ্রগতি সফলভাবে প্রদর্শিত হয়েছে। নিরাপত্তার স্বার্থে সম্পূর্ণ পণ্য তালিকা, ডেলিভারি এলাকা ও আর্থিক হিসাব দেখতে উপরের ফর্মে অর্ডারে ব্যবহৃত মোবাইল নম্বর দিয়ে পুনরায় অনুসন্ধান করুন।
                </p>
              </div>
            ) : (
              <>
                <div className="rounded-xl bg-ocean-soft/50 p-4 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">ক্রেতার তথ্য:</span>
                    <span className="font-semibold text-foreground">{foundOrder.customerName || foundOrder.customer_name_masked || "সম্মানিত ক্রেতা"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">ডেলিভারি এলাকা:</span>
                    <span className="text-right text-foreground">{foundOrder.address ? `${foundOrder.address}, ${foundOrder.district}` : `${foundOrder.area || ''}, ${foundOrder.district || ''}`}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">পেমেন্ট মেথড:</span>
                    <span className="font-semibold text-navy">ক্যাশ অন ডেলিভারি (পণ্য পেয়ে টাকা দিন)</span>
                  </div>
                  {foundOrder.total !== undefined && (
                    <div className="flex justify-between font-bold text-sm text-navy pt-2 border-t border-border">
                      <span>সর্বমোট পরিশোধযোগ্য:</span>
                      <span className="text-highlight font-extrabold">{formatPrice(foundOrder.total)}</span>
                    </div>
                  )}
                </div>

                {/* Items */}
                {foundOrder.items && foundOrder.items.length > 0 && (
                  <div className="space-y-2 pt-1">
                    <h4 className="text-xs font-bold text-navy">অর্ডারকৃত পণ্যসমূহ:</h4>
                    {foundOrder.items.map((it: any, idx: number) => (
                      <div key={idx} className="flex justify-between items-center text-xs py-1 border-b border-border/50 last:border-0">
                        <span>{it.name} × {toBn(it.quantity)}</span>
                        <span className="font-bold text-navy">{formatPrice(it.lineTotal ?? ((it.unit_price || 0) * it.quantity))}</span>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </InfoPage>
  );
}
