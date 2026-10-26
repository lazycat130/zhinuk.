import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { getProduct, getProducts } from "@/lib/catalog";
import { ProductDetailView } from "@/components/store/ProductDetailView";
import { dataService, type Product } from "@/lib/data-service";

export const Route = createFileRoute("/product/$id")({
  loader: ({ params }) => {
    // Check dataService first, fallback to catalog
    const product = (dataService.getProduct(params.id) || getProduct(params.id)) as Product | undefined;
    if (!product) throw notFound();
    return { product };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.product.name} — ঝিনুক` },
          { name: "description", content: loaderData.product.description },
          { property: "og:title", content: `${loaderData.product.name} — ঝিনুক` },
          { property: "og:description", content: loaderData.product.description },
          { property: "og:image", content: loaderData.product.image },
        ]
      : [{ title: "পণ্য পাওয়া যায়নি — ঝিনুক" }, { name: "robots", content: "noindex" }],
  }),
  notFoundComponent: () => (
    <div className="py-24 text-center px-4">
      <h2 className="text-2xl font-bold text-navy">পণ্যটি পাওয়া যায়নি</h2>
      <p className="mt-2 text-muted-foreground">পণ্যটি হয়তো সরিয়ে নেওয়া হয়েছে বা লিংকটি সঠিক নয়।</p>
      <Link
        to="/shop"
        className="mt-6 inline-flex rounded-full bg-primary px-6 py-2.5 font-semibold text-primary-foreground hover:bg-navy transition"
      >
        সকল পণ্য দেখুন
      </Link>
    </div>
  ),
  component: ProductRouteComponent,
});

function ProductRouteComponent() {
  const { product } = Route.useLoaderData();
  const allProducts = dataService.getProducts();
  const related = allProducts.filter((p) => p.id !== product.id).slice(0, 4);

  return <ProductDetailView product={product} relatedProducts={related} />;
}
