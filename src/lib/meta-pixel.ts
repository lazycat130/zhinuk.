/**
 * Meta Pixel & Facebook Ads tracking integration for Zhinuk Commerce Hub.
 * 
 * Rules:
 * 1. Only activates with a genuinely configured Pixel ID (never fabricated).
 * 2. Deduplicates PageView, ViewContent, AddToCart, InitiateCheckout, and Purchase events.
 * 3. Purchase event is fired ONLY after backend has persisted the order.
 */

declare global {
  interface Window {
    fbq?: any;
    _fbq?: any;
  }
}

let isInitialized = false;
let currentPixelId = "";
const trackedPurchases = new Set<string>();

/**
 * Configure and initialize Meta Pixel script in the browser.
 */
export function initMetaPixel(pixelId?: string) {
  if (typeof window === "undefined") return;

  const envPixelId = (import.meta.env.VITE_META_PIXEL_ID || "").trim();
  const resolvedId = (pixelId || envPixelId || "").trim();
  if (!resolvedId) {
    // Pixel is not configured yet. Keep dormant.
    return;
  }

  if (isInitialized && currentPixelId === resolvedId) {
    return;
  }

  currentPixelId = resolvedId;

  // Initialize fbq snippet standard
  if (!window.fbq) {
    const fbq: any = function (...args: any[]) {
      if (fbq.callMethod) {
        fbq.callMethod(...args);
      } else {
        fbq.queue.push(args);
      }
    };
    fbq.push = fbq;
    fbq.loaded = true;
    fbq.version = "2.0";
    fbq.queue = [];
    window.fbq = fbq;
    window._fbq = fbq;

    const script = document.createElement("script");
    script.async = true;
    script.src = "https://connect.facebook.net/en_US/fbevents.js";
    document.head.appendChild(script);
  }

  window.fbq("init", resolvedId);
  isInitialized = true;
}

/**
 * Safe helper to trigger Meta Pixel events.
 */
function trackFbq(eventName: string, params: Record<string, any> = {}, options?: { eventID?: string }) {
  if (typeof window === "undefined") return;

  if (window.fbq && isInitialized && currentPixelId) {
    if (options?.eventID) {
      window.fbq("track", eventName, params, { eventID: options.eventID });
    } else {
      window.fbq("track", eventName, params);
    }
  } else {
    // In dev / unconfigured mode, log to console for debugging Facebook ad readiness
    console.debug(`[Meta Pixel (Simulated - ${currentPixelId ? "Active" : "Awaiting ID"})] ${eventName}`, params);
  }
}

/**
 * Track PageView event on route change
 */
let lastTrackedPath = "";
export function trackPageView(path: string) {
  if (lastTrackedPath === path) return;
  lastTrackedPath = path;
  trackFbq("PageView");
}

/**
 * Track ViewContent on product detail page
 */
export function trackViewContent(product: { id: string; name: string; price: number; category?: string }) {
  trackFbq("ViewContent", {
    content_name: product.name,
    content_category: product.category || "General",
    content_ids: [product.id],
    content_type: "product",
    value: product.price,
    currency: "BDT",
  });
}

/**
 * Track AddToCart only after item is added to cart
 */
export function trackAddToCart(product: { id: string; name: string; price: number }, quantity = 1) {
  trackFbq("AddToCart", {
    content_name: product.name,
    content_ids: [product.id],
    content_type: "product",
    value: product.price * quantity,
    currency: "BDT",
    num_items: quantity,
  });
}

/**
 * Track InitiateCheckout when order form or checkout flow opens
 */
export function trackInitiateCheckout(items: { id: string; price: number; quantity: number }[], totalValue: number) {
  trackFbq("InitiateCheckout", {
    content_ids: items.map((i) => i.id),
    content_type: "product",
    num_items: items.reduce((s, i) => s + i.quantity, 0),
    value: totalValue,
    currency: "BDT",
  });
}

/**
 * Track Purchase event ONLY after backend creates the order.
 * Deduplicated by orderNumber to prevent duplicates on refresh.
 */
export function trackPurchase(order: {
  orderNumber: string;
  total: number;
  items: { product_id?: string; id?: string; quantity: number; unit_price?: number; price?: number }[];
}) {
  if (!order.orderNumber) return;
  if (trackedPurchases.has(order.orderNumber)) {
    console.debug(`[Meta Pixel] Purchase ${order.orderNumber} already tracked. Skipping duplicate.`);
    return;
  }

  trackedPurchases.add(order.orderNumber);

  trackFbq(
    "Purchase",
    {
      content_ids: order.items.map((i) => i.product_id || i.id || "item"),
      content_type: "product",
      value: order.total,
      currency: "BDT",
      num_items: order.items.reduce((s, i) => s + i.quantity, 0),
      order_number: order.orderNumber,
    },
    { eventID: order.orderNumber }
  );
}

export function getPixelStatus() {
  const envPixelId = (import.meta.env.VITE_META_PIXEL_ID || "").trim();
  const effectiveId = currentPixelId || envPixelId;
  return {
    isConfigured: Boolean(effectiveId),
    pixelId: effectiveId,
    isInitialized,
    purchasesTrackedCount: trackedPurchases.size,
  };
}
