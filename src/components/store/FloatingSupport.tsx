import { useState, useEffect } from "react";
import { Phone, MessageCircle, X } from "lucide-react";
import { dataService } from "@/lib/data-service";

export function FloatingSupport() {
  const [settings, setSettings] = useState(() => dataService.getSettings());
  const [showWaNotice, setShowWaNotice] = useState(false);

  useEffect(() => {
    setSettings(dataService.getSettings());
  }, []);

  const phone = settings.supportPhone2 || "01552-541791";
  const rawDigits = phone.replace(/\D/g, "");
  const telLink = rawDigits.startsWith("88") ? `tel:+${rawDigits}` : `tel:+88${rawDigits}`;

  const handleWhatsAppClick = (e: React.MouseEvent) => {
    if (!settings.whatsappVerified) {
      e.preventDefault();
      setShowWaNotice(true);
      return;
    }
  };

  const waNumber = settings.whatsappNumber.replace(/\D/g, "");
  const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent("হ্যালো ঝিনুক, আমি একটি পণ্য সম্পর্কে জানতে আগ্রহী।")}`;

  return (
    <>
      {/* Floating Buttons: positioned safely above mobile sticky bar */}
      <aside
        aria-label="কাস্টমার সাপোর্ট"
        className="fixed bottom-24 right-4 z-40 flex flex-col items-center gap-2.5 sm:bottom-8 sm:right-6"
      >
        {/* WhatsApp Button */}
        <div className="relative group">
          <a
            href={settings.whatsappVerified ? waUrl : "#whatsapp-notice"}
            onClick={handleWhatsAppClick}
            target={settings.whatsappVerified ? "_blank" : undefined}
            rel="noopener noreferrer"
            aria-label="হোয়াটসঅ্যাপে যোগাযোগ করুন"
            className="flex h-12 w-12 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lift transition-all hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-[#25D366]/30"
          >
            <MessageCircle className="h-6 w-6 fill-current" />
          </a>
          <span className="pointer-events-none absolute right-14 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-lg bg-navy px-2.5 py-1 text-xs font-medium text-navy-foreground opacity-0 shadow-md transition-opacity group-hover:opacity-100 hidden sm:block">
            {settings.whatsappVerified ? "হোয়াটসঅ্যাপ চ্যাট" : "হোয়াটসঅ্যাপ সহায়তা"}
          </span>
        </div>

        {/* Phone Button */}
        <div className="relative group">
          <a
            href={telLink}
            aria-label={`সরাসরি কল করুন: ${phone}`}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-navy text-navy-foreground shadow-lift transition-all hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-navy/30"
          >
            <Phone className="h-5 w-5 animate-pulse" />
          </a>
          <div className="pointer-events-none absolute right-14 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-lg bg-navy px-3 py-1.5 text-xs text-navy-foreground opacity-0 shadow-md transition-opacity group-hover:opacity-100 hidden sm:flex flex-col gap-0.5">
            <span className="font-semibold text-highlight">হটলাইন:</span>
            <span>{phone}</span>
          </div>
        </div>
      </aside>

      {/* WhatsApp verification notice modal (shown when WhatsApp is unverified) */}
      {showWaNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/50 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-lift animate-in fade-in zoom-in-95">
            <button
              onClick={() => setShowWaNotice(false)}
              className="absolute right-4 top-4 rounded-full p-1 text-muted-foreground hover:bg-muted"
              aria-label="বন্ধ করুন"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-full bg-[#25D366]/15 text-[#25D366]">
                <MessageCircle className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-navy">সরাসরি সহায়তা হটলাইন</h3>
            </div>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
              যেকোনো অর্ডার, তথ্যের জিজ্ঞাসা বা কাস্টমার সাপোর্টের জন্য আমাদের ডেডিকেটেড নম্বরে সরাসরি কল করুন:
            </p>
            <div className="mt-4 rounded-xl bg-ocean-soft p-3 text-center">
              <p className="text-xs text-muted-foreground">কাস্টমার কেয়ার হটলাইন</p>
              <a href={telLink} className="text-lg font-bold text-navy hover:underline block mt-0.5">{phone}</a>
            </div>
            <div className="mt-5 flex gap-2">
              <a
                href={telLink}
                className="flex-1 rounded-xl bg-primary py-2.5 text-center text-sm font-semibold text-primary-foreground hover:bg-navy"
              >
                কল করুন
              </a>
              <button
                onClick={() => setShowWaNotice(false)}
                className="rounded-xl border border-border px-4 py-2.5 text-sm font-medium hover:bg-muted"
              >
                বন্ধ
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
