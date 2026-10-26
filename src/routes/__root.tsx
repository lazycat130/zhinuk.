import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouterState,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import { useEffect } from "react";
import { StoreProvider } from "@/lib/store";
import { Header } from "@/components/store/Header";
import { Navigation } from "@/components/store/Navigation";
import { Footer } from "@/components/store/Footer";
import { CartDrawer } from "@/components/store/CartDrawer";
import { FloatingSupport } from "@/components/store/FloatingSupport";
import { PromotionalBanner } from "@/components/store/PromotionalBanner";
import { Toaster } from "@/components/ui/sonner";
import { trackPageView, initMetaPixel } from "@/lib/meta-pixel";
import { dataService } from "@/lib/data-service";

function NotFoundComponent() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-navy">৪০৪</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">পেজটি খুঁজে পাওয়া যায়নি</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          আপনি যে পেজটি খুঁজছেন তা সরানো হয়েছে অথবা লিংকটি সঠিক নয়।
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-navy"
          >
            হোমপেজে ফিরুন
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  console.error("Root route error:", error);
  return (
    <div className="flex min-h-[60vh] items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-bold text-navy">
          পেজটি লোড করা সম্ভব হয়নি
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          কিছুটা সময় অপেক্ষা করে আবার চেষ্টা করুন অথবা হোমপেজে যান।
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button
            onClick={() => reset()}
            className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-navy transition cursor-pointer"
          >
            আবার চেষ্টা করুন
          </button>
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-full border border-border bg-card px-6 py-2.5 text-sm font-semibold text-foreground hover:bg-ocean-soft transition"
          >
            হোমপেজ
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "ঝিনুক ZHINUK — প্রিমিয়াম অনলাইন শপ" },
      { name: "description", content: "ফ্যাশন, বিউটি, ইলেকট্রনিক্স ও লাইফস্টাইলের অরিজিনাল পণ্য — সারা বাংলাদেশে ডেলিভারি।" },
      { property: "og:title", content: "ঝিনুক ZHINUK — প্রিমিয়াম অনলাইন শপ" },
      { property: "og:description", content: "প্রিমিয়াম বাংলাদেশি অনলাইন শপ: হাই-কনভার্টিং প্রোডাক্ট পেজ, দ্রুত বাই-নাউ অর্ডার ও সুরক্ষিত অ্যাডমিন ড্যাশবোর্ড।" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const routerState = useRouterState();
  const pathname = routerState.location.pathname;

  // Initialize Meta Pixel and track page views
  useEffect(() => {
    // Synchronize catalog and reviews with Supabase when configured
    dataService.syncProductsFromSupabase();
    dataService.syncReviewsFromSupabase();

    const settings = dataService.getSettings();
    const envPixelId = (import.meta.env.VITE_META_PIXEL_ID || "").trim();
    const activePixelId = settings.metaPixelId || envPixelId;
    if (activePixelId) {
      initMetaPixel(activePixelId);
    }
    trackPageView(pathname);
  }, [pathname]);

  return (
    <QueryClientProvider client={queryClient}>
      <StoreProvider>
        <Header />
        <Navigation />

        {/* Top Promotional Notification Banner (shown globally except on admin page) */}
        {!pathname.startsWith("/admin") && (
          <div className="mx-auto max-w-[1440px] px-4 pt-3 lg:px-8">
            <PromotionalBanner />
          </div>
        )}

        <main className="min-h-[50vh]">
          <Outlet />
        </main>

        <Footer />
        <CartDrawer />
        <FloatingSupport />
        <Toaster position="top-center" />
      </StoreProvider>
    </QueryClientProvider>
  );
}
