import { Link } from "@tanstack/react-router";
import { Truck, ShieldCheck, ArrowRight, Sparkles } from "lucide-react";

export function PromotionalBanner() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-ocean/20 bg-gradient-to-r from-ocean-soft via-pearl to-white p-3.5 sm:p-4 shadow-sm transition hover:shadow-card">
      {/* Subtle ocean wave graphic decoration behind */}
      <svg
        className="pointer-events-none absolute -bottom-2 -left-6 h-16 w-48 text-ocean/10 select-none opacity-60"
        viewBox="0 0 200 40"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M0,20 C40,35 60,5 100,20 C140,35 160,5 200,20 L200,40 L0,40 Z" />
      </svg>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-6">
        {/* Left Side: Truthful, Clear Delivery & Service Announcement */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="grid h-10 w-10 sm:h-11 sm:w-11 place-items-center rounded-xl bg-primary text-primary-foreground shadow-xs shrink-0">
            <Truck className="h-5 w-5 sm:h-5 sm:w-5" />
          </div>

          <div className="min-w-0 text-center sm:text-left">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <span className="text-sm sm:text-base font-bold text-navy">
                সারা দেশে ক্যাশ অন ডেলিভারি
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-800">
                <ShieldCheck className="h-3 w-3" /> ১০০% নিরাপদ
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              পণ্য হাতে পেয়ে দেখে মূল্য পরিশোধ করুন • কোনো অগ্রিম পেমেন্ট নেই
            </p>
          </div>
        </div>

        {/* Right Side: Separate Distinct Promotional Offer & CTA */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="hidden md:flex flex-col text-right">
            <span className="inline-flex items-center justify-end gap-1 text-xs font-bold text-highlight">
              <Sparkles className="h-3.5 w-3.5" />
              পছন্দের পণ্যে বিশেষ ছাড়!
            </span>
            <span className="text-[11px] text-muted-foreground">বাছাইকৃত কালেকশন</span>
          </div>

          <Link
            to="/shop"
            search={{ offer: "1" }}
            className="inline-flex items-center gap-1.5 rounded-full bg-navy px-4 py-2 text-xs font-semibold text-navy-foreground shadow-xs transition hover:bg-primary active:scale-95 focus:outline-none focus:ring-2 focus:ring-ocean"
          >
            <span>পণ্য দেখুন</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
