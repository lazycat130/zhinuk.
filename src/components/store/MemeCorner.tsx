import { useState } from "react";
import { Smile, Copy, Check, Share2, Sparkles, Heart } from "lucide-react";
import { toast } from "sonner";

interface MemeStory {
  id: string;
  tag: string;
  title: string;
  quote: string;
  reaction: string;
  likes: number;
}

const MEMES: MemeStory[] = [
  {
    id: "m-1",
    tag: "#ডেলিভারি_মুহূর্ত",
    title: "পার্সেল আসার দিন",
    quote: "“ডেলিভারি ভাইয়ার ‘ভাইয়া নিচে নামেন’ ফোন কলটা আসলে যে আনন্দটা হয়, ছোটবেলার ঈদের চাঁদ দেখার অনুভূতির সাথেও তার তুলনা চলে না!”",
    reaction: "📦 একমত ১০০%",
    likes: 342,
  },
  {
    id: "m-2",
    tag: "#বাস্তব_শপিং",
    title: "উইশলিস্ট বনাম পকেট",
    quote: "“কার্টে পণ্য জমে আছে ২০টা, কিন্তু কেনার সময় মা রুমে এসে বললো—‘আগে নিজের পড়ার টেবিল গোছাও, তারপর শপিং!’”",
    reaction: "😅 খাঁটি বাঙালি গল্প",
    likes: 489,
  },
  {
    id: "m-3",
    tag: "#মায়ের_অনুমোদন",
    title: "মা যখন আনবক্সিং দেখেন",
    quote: "“‘অনলাইনে আবার কি ছাইপাশ আনাইলি?’ বলে প্যাকেটের ফিতা খুলে নিজেই ট্রাই করে বললেন—‘হুম, জিনিসটা কিন্তু ভালোই দিছে!’”",
    reaction: "❤️ সেরা ফিলিং",
    likes: 561,
  },
  {
    id: "m-4",
    tag: "#ঝিনুক_স্মাইল",
    title: "ঝিনুকের মুক্তা দর্শন",
    quote: "“অনলাইনে ছবি দেখে অর্ডার করে ঠিক ছবির মতোই চকচকে আসল জিনিস যখন হাতে পাই—মনটা একদম সমুদ্রের মতো শান্ত হয়ে যায়!”",
    reaction: "✨ অরিজিনাল ভালোবাসা",
    likes: 418,
  },
];

export function MemeCorner() {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [liked, setLiked] = useState<Record<string, boolean>>({});

  const copyMeme = (meme: MemeStory) => {
    const text = `${meme.title} — ঝিনুকের হাসির বাক্স\n\n${meme.quote}\n\nঝিনুক — আপনার পছন্দ, ঝিনুকের সঙ্গে। https://zhinuk.com`;
    navigator.clipboard.writeText(text);
    setCopiedId(meme.id);
    toast.success("হাসির গল্প কপি হয়েছে!", {
      description: "বন্ধুদের বা ফেসবুকে শেয়ার করতে পেস্ট করুন।",
    });
    setTimeout(() => setCopiedId(null), 2500);
  };

  const shareWhatsApp = (meme: MemeStory) => {
    const text = `${meme.title}\n${meme.quote}\n\n— ঝিনুক (https://zhinuk.com)`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  const toggleLike = (id: string) => {
    setLiked((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <section className="mx-auto max-w-[1440px] px-4 pt-12 pb-6 lg:px-8">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2 text-highlight font-semibold text-xs tracking-wider uppercase">
            <Sparkles className="h-4 w-4" />
            <span>হালকা আনন্দ ও হাসির এক ঝলক</span>
          </div>
          <h2 className="mt-1 flex items-center gap-2.5 text-2xl font-bold text-navy sm:text-3xl">
            <Smile className="h-7 w-7 text-highlight" />
            ঝিনুকের হাসির বাক্স
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            কেনাকাটার মজার অভিজ্ঞতা ও বাঙালি পরিবারের চেনা হাসিমুখের গল্প
          </p>
        </div>
        <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-ocean-soft px-3 py-1 text-xs font-semibold text-navy">
          আপনার পছন্দ, ঝিনুকের সঙ্গে
        </span>
      </div>

      {/* Grid of meme cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {MEMES.map((meme) => {
          const isLiked = liked[meme.id];
          const isCopied = copiedId === meme.id;

          return (
            <article
              key={meme.id}
              className="group relative flex flex-col justify-between rounded-2xl border border-border bg-card p-5 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-ocean hover:shadow-card"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="rounded-full bg-ocean-soft px-2.5 py-0.5 text-[11px] font-bold text-primary">
                    {meme.tag}
                  </span>
                  <span className="text-xs text-muted-foreground">{meme.reaction}</span>
                </div>

                <h3 className="text-base font-bold text-navy group-hover:text-primary transition-colors">
                  {meme.title}
                </h3>

                <p className="mt-2 text-sm text-foreground/85 leading-relaxed font-normal italic">
                  {meme.quote}
                </p>
              </div>

              <div className="mt-5 pt-3.5 border-t border-border flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => toggleLike(meme.id)}
                  className={`inline-flex items-center gap-1 text-xs font-medium transition-colors ${
                    isLiked ? "text-rose-600 font-bold" : "text-muted-foreground hover:text-rose-500"
                  }`}
                  aria-label="পছন্দ করুন"
                >
                  <Heart className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
                  <span>{meme.likes + (isLiked ? 1 : 0)}</span>
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => copyMeme(meme)}
                    className="inline-flex items-center gap-1 rounded-lg border border-border bg-background px-2.5 py-1 text-xs font-medium text-navy hover:bg-muted transition"
                    title="কপি করুন"
                  >
                    {isCopied ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-600" />
                        <span className="text-emerald-700 font-semibold">কপি হয়েছে</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        <span>কপি</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => shareWhatsApp(meme)}
                    className="inline-flex items-center rounded-lg bg-[#25D366]/15 p-1 text-[#25D366] hover:bg-[#25D366]/25 transition"
                    title="হোয়াটসঅ্যাপে শেয়ার করুন"
                    aria-label="হোয়াটসঅ্যাপে শেয়ার"
                  >
                    <Share2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
