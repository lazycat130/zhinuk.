import { createFileRoute } from "@tanstack/react-router";
import { InfoPage } from "@/components/store/InfoPage";
import { Phone, Mail, MapPin, Clock, MessageCircle, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "যোগাযোগ — ঝিনুক ZHINUK" },
      { name: "description", content: "ঝিনুক কাস্টমার সাপোর্টের সাথে যোগাযোগ করুন। ফোন: 01552-541791, ইমেইল: email-admin@zhinuk.com" },
      { property: "og:title", content: "যোগাযোগ — ঝিনুক ZHINUK" },
      { property: "og:description", content: "ঝিনুক কাস্টমার সাপোর্ট হটলাইন ও যোগাযোগ মাধ্যম।" },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  return (
    <InfoPage title="যোগাযোগ ও কাস্টমার সাপোর্ট">
      <div className="space-y-6">
        <p className="text-sm leading-relaxed text-muted-foreground">
          ঝিনুক-এ কেনাকাটা সম্পর্কিত যেকোনো জিজ্ঞাসা, পণ্যের তথ্য বা অর্ডারের সহায়তার জন্য আমাদের ডেডিকেটেড সাপোর্ট টিম সদা প্রস্তুত।
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-xs flex items-start gap-3.5">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary shrink-0">
              <Phone className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground">ফোন সাপোর্ট হটলাইন</p>
              <div className="mt-1">
                <a href="tel:+8801552541791" className="text-lg font-bold text-navy hover:underline">
                  ০১৫৫২-৫৪১৭৯১
                </a>
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">সকাল ৯টা থেকে রাত ১০টা পর্যন্ত</p>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 shadow-xs flex items-start gap-3.5">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary shrink-0">
              <Mail className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground">ইমেইল ঠিকানা</p>
              <a href="mailto:email-admin@zhinuk.com" className="text-base font-bold text-navy hover:underline break-all">
                email-admin@zhinuk.com
              </a>
              <p className="text-[11px] text-muted-foreground mt-0.5">২৪ ঘণ্টার মধ্যে উত্তর দেওয়া হয়</p>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 shadow-xs flex items-start gap-3.5">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary shrink-0">
              <MapPin className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground">অফিস ঠিকানা</p>
              <p className="text-sm font-bold text-navy">গুলশান-২, ঢাকা ১২১২, বাংলাদেশ</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">কর্পোরেট হেডকোয়ার্টার</p>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 shadow-xs flex items-start gap-3.5">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-50 text-emerald-600 shrink-0">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground">ডেলিভারি ও ক্যাশ অন ডেলিভারি</p>
              <p className="text-sm font-bold text-navy">সারা দেশে ক্যাশ অন ডেলিভারি</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">ঢাকায় ২৪-৪৮ ঘণ্টা, ঢাকার বাইরে ৩-৫ দিন</p>
            </div>
          </div>
        </div>
      </div>
    </InfoPage>
  );
}
