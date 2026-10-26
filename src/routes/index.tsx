import { createFileRoute } from "@tanstack/react-router";
import { CategorySection, Hero, OceanBrandSection, PopularProducts, PromoBanners, ServiceFeatures } from "@/components/store/Sections";
import { MemeCorner } from "@/components/store/MemeCorner";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ঝিনুক ZHINUK — আপনার পছন্দ, ঝিনুকের সঙ্গে।" },
      { name: "description", content: "প্রিমিয়াম বাংলাদেশি অনলাইন শপ: হ্যান্ডব্যাগ, স্মার্টফোন, ঘড়ি, পারফিউম, জুতা ও লাইফস্টাইল পণ্য। ক্যাশ অন ডেলিভারি।" },
      { property: "og:title", content: "ঝিনুক ZHINUK — পছন্দের খোঁজে, ঝিনুকের পথে।" },
      { property: "og:description", content: "মানসম্মত পণ্য, নিরাপদ কেনাকাটা ও সারা দেশে দ্রুত ডেলিভারি।" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <>
      <Hero />
      <CategorySection />
      <PromoBanners />
      <PopularProducts />
      <ServiceFeatures />
      <OceanBrandSection />
      <MemeCorner />
    </>
  );
}
