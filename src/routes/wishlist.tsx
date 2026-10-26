import { createFileRoute, Link } from "@tanstack/react-router";
import { products } from "@/lib/catalog";
import { useStore } from "@/lib/store";
import { ProductGrid } from "@/components/store/ProductCard";

export const Route = createFileRoute("/wishlist")({
  head: () => ({
    meta: [
      { title: "পছন্দের তালিকা — ঝিনুক" },
      { name: "description", content: "আপনার পছন্দের পণ্যগুলো এক জায়গায়।" },
      { property: "og:title", content: "পছন্দের তালিকা — ঝিনুক" },
      { property: "og:description", content: "আপনার পছন্দের পণ্য।" },
    ],
  }),
  component: Wishlist,
});

function Wishlist() {
  const { wishlist } = useStore();
  const list = products.filter((p) => wishlist.includes(p.id));
  return (
    <div className="mx-auto max-w-[1440px] px-4 py-8 lg:px-8">
      <h1 className="mb-6 text-2xl font-bold text-navy">পছন্দের তালিকা</h1>
      {list.length ? <ProductGrid products={list} /> : <p className="py-20 text-center text-muted-foreground">এখনো কিছু যোগ করেননি। <Link to="/shop" className="text-primary underline">পণ্য দেখুন</Link></p>}
    </div>
  );
}
