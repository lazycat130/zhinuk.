import { Link } from "@tanstack/react-router";
import { Facebook, Instagram, Mail, MapPin, Phone, Youtube, Lock, Truck, Headphones, Sparkles } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-14">
      {/* Top Value Strip */}
      <div className="mx-auto max-w-[1440px] px-4 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-4 rounded-t-3xl border border-b-0 border-border bg-card/90 px-6 py-4 sm:grid-cols-2 lg:grid-cols-5 shadow-xs">
          <div className="flex items-center gap-3">
            <img
              src="/zhinuk-logo-transparent.png"
              alt="ঝিনুক"
              className="h-14 w-auto max-w-[100px] object-contain"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = "/zhinuk-original-logo.png";
              }}
            />
            <div>
              <p className="text-xl font-black text-navy font-script">ঝিনুক</p>
              <p className="text-[10px] font-bold text-primary tracking-widest">ZHINUK COMMERCE</p>
            </div>
          </div>
          {[
            { Icon: Lock, t: "নিরাপদ পেমেন্ট", d: "১০০% ক্যাশ অন ডেলিভারি" },
            { Icon: Truck, t: "দ্রুত ডেলিভারি", d: "সারা বাংলাদেশে হোম ডেলিভারি" },
            { Icon: Headphones, t: "সহায়তা হটলাইন", d: "সরাসরি ফোন সাপোর্ট" },
          ].map(({ Icon, t, d }) => (
            <div key={t} className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-ocean-soft text-primary shrink-0">
                <Icon className="h-5 w-5" strokeWidth={1.75} />
              </div>
              <div className="text-sm">
                <p className="font-semibold text-navy">{t}</p>
                <p className="text-xs text-muted-foreground">{d}</p>
              </div>
            </div>
          ))}
          <p className="-rotate-3 font-script text-2xl text-navy text-center sm:text-right">
            ঝিনুক<br />
            <span className="text-lg text-primary font-normal">থাকুক আপনার পাশে</span>
          </p>
        </div>
      </div>

      {/* Main Ocean Navy Footer */}
      <div className="relative bg-navy text-navy-foreground overflow-hidden">
        {/* Subtle ocean wave graphic decoration at the top edge */}
        <div className="absolute top-0 inset-x-0 h-2 overflow-hidden leading-none opacity-30 pointer-events-none select-none">
          <svg className="w-full h-full text-ocean" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M0,0 C150,90 350,-40 500,45 C650,130 900,10 1200,50 L1200,0 L0,0 Z" fill="currentColor" />
          </svg>
        </div>

        <div className="relative mx-auto grid max-w-[1440px] gap-8 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4 lg:px-8">
          {/* Brand Info & Transparent Logo */}
          <div className="space-y-4">
            <div className="flex flex-col gap-2">
              <Link to="/" className="inline-block group focus:outline-none focus-visible:ring-2 focus-visible:ring-highlight rounded-md" aria-label="ঝিনুক হোম">
                {/* Clean transparent logo: No white card, no border, 30-50% larger, pure pearl white against deep navy */}
                <img
                  src="/zhinuk-logo-transparent.png"
                  alt="ঝিনুক ZHINUK"
                  className="h-16 sm:h-20 w-auto max-w-[200px] sm:max-w-[240px] object-contain transition-transform duration-200 group-hover:scale-105"
                  onError={(e) => {
                    // Fallback to original logo if transparent file is ever missing
                    (e.currentTarget as HTMLImageElement).src = "/zhinuk-original-logo.png";
                  }}
                />
              </Link>
              <p className="text-xs font-semibold text-highlight flex items-center gap-1.5">
                <Sparkles className="h-3 w-3" /> আপনার পছন্দ, ঝিনুকের সঙ্গে।
              </p>
            </div>
            
            <p className="text-sm leading-relaxed text-navy-foreground/85">
              ঝিনুক একটি প্রিমিয়াম বাংলাদেশি অনলাইন শপ — ফ্যাশন, বিউটি, ইলেকট্রনিক্স ও লাইফস্টাইলের আসল পণ্য, ক্যাশ অন ডেলিভারিতে আপনার দোরগোড়ায়।
            </p>

            <div className="flex items-center gap-3 pt-1">
              {[
                { Icon: Facebook, label: "ফেসবুক", href: "#" },
                { Icon: Instagram, label: "ইনস্টাগ্রাম", href: "#" },
                { Icon: Youtube, label: "ইউটিউব", href: "#" },
              ].map(({ Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="grid h-9 w-9 place-items-center rounded-full bg-navy-foreground/10 text-navy-foreground/90 transition hover:bg-highlight hover:text-highlight-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-highlight"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <FooterCol
            title="দ্রুত লিংক"
            links={[
              ["হোম", "/"],
              ["আমাদের সম্পর্কে", "/about"],
              ["সকল পণ্য ও শপ", "/shop"],
              ["যোগাযোগ ও সাহায্য", "/contact"],
            ]}
          />

          {/* Customer Service */}
          <FooterCol
            title="কাস্টমার সার্ভিস"
            links={[
              ["সাহায্য কেন্দ্র", "/contact"],
              ["অর্ডার ট্র্যাকিং", "/track"],
              ["ডেলিভারি তথ্য", "/about"],
              ["রিটার্ন ও এক্সচেঞ্জ পলিসি", "/about"],
            ]}
          />

          {/* Contact Details */}
          <div className="relative">
            <h4 className="mb-4 font-bold text-white text-base">যোগাযোগ হটলাইন</h4>
            <ul className="space-y-3 text-sm text-navy-foreground/85">
              <li className="flex items-start gap-2.5">
                <Phone className="h-4 w-4 shrink-0 text-highlight mt-0.5" />
                <div>
                  <a
                    href="tel:+8801552541791"
                    className="text-base font-bold text-white hover:text-highlight transition hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-highlight rounded-sm inline-block"
                  >
                    ০১৫৫২-৫৪১৭৯১
                  </a>
                  <p className="text-xs text-navy-foreground/70 mt-0.5">কাস্টমার কেয়ার ও সাপোর্ট (সকাল ৯টা - রাত ১০টা)</p>
                </div>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 shrink-0 text-highlight" />
                <a
                  href="mailto:email-admin@zhinuk.com"
                  className="hover:text-highlight transition hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-highlight rounded-sm"
                >
                  email-admin@zhinuk.com
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin className="h-4 w-4 shrink-0 text-highlight mt-0.5" />
                <span>গুলশান-২, ঢাকা ১২১২, বাংলাদেশ</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Copyright & Guarantee Strip */}
        <div className="border-t border-navy-foreground/15 py-4 px-4 text-center text-xs text-navy-foreground/70">
          <p>© ২০২৬ ZHINUK. সর্বস্বত্ব সংরক্ষিত। আপনার পছন্দের পথে, ঝিনুক থাকুক পাশে।</p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: [string, "/" | "/about" | "/contact" | "/shop" | "/track"][] }) {
  return (
    <div>
      <h4 className="mb-4 font-bold text-white text-base">{title}</h4>
      <ul className="space-y-2.5 text-sm text-navy-foreground/80">
        {links.map(([label, to]) => (
          <li key={label}>
            <Link
              to={to}
              className="transition-colors hover:text-highlight hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-highlight rounded-sm"
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
