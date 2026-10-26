import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { InfoPage } from "@/components/store/InfoPage";
import { dataService, type Order } from "@/lib/data-service";
import { formatPrice, toBn } from "@/lib/catalog";
import { User, Phone, Lock, Package, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/account")({
  head: () => ({
    meta: [
      { title: "আমার অ্যাকাউন্ট — ঝিনুক ZHINUK" },
      { name: "description", content: "আপনার ঝিনুক অ্যাকাউন্ট ও অর্ডারের ইতিহাস।" },
      { property: "og:title", content: "আমার অ্যাকাউন্ট — ঝিনুক" },
      { property: "og:description", content: "আপনার অর্ডার ও অ্যাকাউন্ট তথ্য।" },
    ],
  }),
  component: AccountPage,
});

function AccountPage() {
  const [phone, setPhone] = useState("");
  const [searched, setSearched] = useState(false);
  const [customerOrders, setCustomerOrders] = useState<Order[]>([]);

  const handleLookup = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = phone.trim();
    if (!clean) return;

    setSearched(true);
    const normalized = dataService.normalizePhone(clean);
    const orders = dataService.getOrders().filter((o) => o.customerPhone === normalized);
    setCustomerOrders(orders);
  };

  return (
    <InfoPage title="আমার অ্যাকাউন্ট ও অর্ডার">
      <div className="space-y-6">
        <p className="text-sm text-muted-foreground leading-relaxed">
          ঝিনুক-এ অতিথি (Guest) হিসেবে ঝামেলাহীন কেনাকাটা করা যায়। আপনার পূর্বে করা যেকোনো অর্ডারের বিস্তারিত দেখতে নিচে আপনার মোবাইল নম্বরটি লিখুন।
        </p>

        {/* Phone Lookup Box */}
        <form onSubmit={handleLookup} className="rounded-2xl border border-border bg-card p-5 shadow-xs space-y-3">
          <label className="block text-xs font-semibold text-foreground">
            আপনার মোবাইল নম্বর দিয়ে পূর্বে করা অর্ডার খুঁজুন
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="01XXXXXXXXX"
              className="h-11 flex-1 rounded-xl border border-input bg-card px-4 text-sm outline-none focus:border-ocean"
            />
            <button
              type="submit"
              className="h-11 rounded-xl bg-primary px-6 text-xs font-bold text-primary-foreground hover:bg-navy transition cursor-pointer"
            >
              অর্ডার দেখুন
            </button>
          </div>
        </form>

        {searched && (
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-navy">অর্ডারের তালিকা ({toBn(customerOrders.length)})</h3>
            {customerOrders.length === 0 ? (
              <p className="text-xs text-muted-foreground py-4 text-center rounded-xl border border-dashed border-border p-4">
                এই মোবাইল নম্বরে পূর্বে কোনো অর্ডার পাওয়া যায়নি।
              </p>
            ) : (
              customerOrders.map((o) => (
                <div key={o.id} className="rounded-xl border border-border bg-card p-4 space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-mono font-bold text-navy">#{o.orderNumber}</span>
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 font-bold text-emerald-800 uppercase text-[10px]">
                      {o.status}
                    </span>
                  </div>
                  <p className="text-muted-foreground">
                    তারিখ: {new Date(o.createdAt).toLocaleDateString("bn-BD")}
                  </p>
                  <p className="font-semibold text-foreground">
                    পণ্য: {o.items.map((i) => `${i.name} (×${toBn(i.quantity)})`).join(", ")}
                  </p>
                  <p className="font-bold text-navy">মোট: {formatPrice(o.total)}</p>
                </div>
              ))
            )}
          </div>
        )}

        {/* Quick Links */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-border">
          <Link
            to="/track"
            className="flex items-center justify-between rounded-xl border border-border bg-card p-4 hover:bg-ocean-soft transition text-xs font-semibold text-navy"
          >
            <div className="flex items-center gap-2.5">
              <Package className="h-4 w-4 text-primary" />
              <span>নির্দিষ্ট অর্ডার ট্র্যাকিং</span>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
          </Link>

          <Link
            to="/admin"
            className="flex items-center justify-between rounded-xl border border-border bg-card p-4 hover:bg-ocean-soft transition text-xs font-semibold text-navy"
          >
            <div className="flex items-center gap-2.5">
              <Lock className="h-4 w-4 text-highlight" />
              <span>অ্যাডমিন ম্যানেজমেন্ট লগইন</span>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
          </Link>
        </div>
      </div>
    </InfoPage>
  );
}
