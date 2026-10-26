import { createFileRoute } from "@tanstack/react-router";
import { InfoPage } from "@/components/store/InfoPage";
import { Truck, ShieldCheck, RotateCcw, HeartHandshake, Phone, Mail } from "lucide-react";
import { formatPrice } from "@/lib/catalog";
import { dataService } from "@/lib/data-service";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "আমাদের সম্পর্কে — ঝিনুক ZHINUK" },
      { name: "description", content: "ঝিনুক — ভালো পণ্যের নির্ভরযোগ্য ঠিকানা। জেনুইন কোয়ালিটি, ক্যাশ অন ডেলিভারি এবং ৭ দিনের সহজ রিটার্ন।" },
      { property: "og:title", content: "আমাদের সম্পর্কে — ঝিনুক ZHINUK" },
      { property: "og:description", content: "ঝিনুকের প্রতিশ্রুতি: শতভাগ আসল পণ্য ও বিশ্বস্ত কাস্টমার সাপোর্ট।" },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  const settings = dataService.getSettings();

  return (
    <InfoPage title="আমাদের সম্পর্কে ও প্রতিশ্রুতি">
      <div className="space-y-6 text-sm text-foreground/90 leading-relaxed">
        <p className="text-base font-medium text-navy">
          সমুদ্রের গভীরে ঝিনুক যেভাবে পরম যত্নে একটি মূল্যবান মুক্তাকে রূপ দেয়, ঠিক সেভাবেই আমরা আপনাদের জন্য প্রতিটি পণ্য যাচাই-বাছাই করে নিয়ে আসি।
        </p>

        <p className="text-muted-foreground">
          <strong>ঝিনুক (ZHINUK)</strong> একটি প্রিমিয়াম বাংলাদেশি ইকমার্স প্ল্যাটফর্ম। আমাদের মূল লক্ষ্য হল ফেসবুক বা অনলাইন কেনাকাটায় গ্রাহকদের শতভাগ নিরাপত্তা ও বিশ্বস্ততা নিশ্চিত করা। কোনো মিথ্যা প্রতিশ্রুতি নয়—আমরা যা দেখাই, তাই পৌঁছে দিই।
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-xs space-y-2">
            <div className="flex items-center gap-2.5 font-bold text-navy">
              <ShieldCheck className="h-5 w-5 text-primary" />
              <span>১০০% আসল পণ্য ও ক্যাশ অন ডেলিভারি</span>
            </div>
            <p className="text-xs text-muted-foreground">
              কোনো অগ্রিম পেমেন্ট নেই। পার্সেল হাতে পেয়ে পণ্য দেখে মূল্য পরিশোধ করুন।
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 shadow-xs space-y-2">
            <div className="flex items-center gap-2.5 font-bold text-navy">
              <Truck className="h-5 w-5 text-primary" />
              <span>স্বচ্ছ ডেলিভারি ফি</span>
            </div>
            <p className="text-xs text-muted-foreground">
              ঢাকার ভেতর ডেলিভারি মাত্র {formatPrice(settings.deliveryDhaka)} এবং ঢাকার বাইরে {formatPrice(settings.deliveryOutside)}। কোনো লুকানো চার্জ নেই।
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 shadow-xs space-y-2">
            <div className="flex items-center gap-2.5 font-bold text-navy">
              <RotateCcw className="h-5 w-5 text-primary" />
              <span>৭ দিনের রিটার্ন ও এক্সচেঞ্জ</span>
            </div>
            <p className="text-xs text-muted-foreground">
              পণ্য গ্রহণে কোনো অমিল বা সমস্যা দেখা দিলে ৭ দিনের মধ্যে সহজেই এক্সচেঞ্জ বা রিটার্ন করা যাবে।
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 shadow-xs space-y-2">
            <div className="flex items-center gap-2.5 font-bold text-navy">
              <HeartHandshake className="h-5 w-5 text-primary" />
              <span>সার্বক্ষণিক সহায়তা</span>
            </div>
            <p className="text-xs text-muted-foreground">
              হটলাইন: <a href="tel:+8801552541791" className="text-primary font-bold hover:underline">01552-541791</a>, ইমেইল: <a href="mailto:email-admin@zhinuk.com" className="text-primary font-bold hover:underline">email-admin@zhinuk.com</a>
            </p>
          </div>
        </div>
      </div>
    </InfoPage>
  );
}
