/**
 * Zhinuk Commerce Hub Data Service
 * 
 * Manages persistent products, orders, customers, reviews, and business settings.
 * Preserves the original 8 demo products while supporting real dynamic products,
 * server-side price validation, stock tracking, and idempotency protection.
 */

import { products as staticCatalog, formatPrice, toBn, type Product as StaticProduct } from "./catalog";
import { trackPurchase } from "./meta-pixel";
import { supabase, isSupabaseConfigured } from "@/integrations/supabase/client";

export type ProductStatus = "published" | "draft" | "archived";

export type Product = {
  id: string;
  name: string;
  name_en?: string;
  sku?: string;
  category: string;
  price: number;
  regularPrice?: number;
  rating: number;
  reviews: string;
  reviewCount: number;
  image: string;
  gallery: string[];
  description: string;
  features?: string[];
  stockQuantity: number;
  lowStockThreshold: number;
  variants?: { name: string; options: string[] }[];
  status: ProductStatus;
  is_demo: boolean;
  createdAt: string;
  updatedAt: string;
};

export type OrderStatus = "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled";
export type PaymentStatus = "unpaid" | "pending" | "paid" | "refunded";

export type OrderItem = {
  productId: string;
  name: string;
  variant?: Record<string, string> | string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  image?: string;
};

export type Order = {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  address: string;
  district: string;
  area: string;
  deliveryZone: "dhaka" | "outside";
  deliveryCharge: number;
  subtotal: number;
  discount: number;
  total: number;
  paymentMethod: "cod" | "bkash" | "nagad";
  paymentStatus: PaymentStatus;
  status: OrderStatus;
  items: OrderItem[];
  customerNote?: string;
  idempotencyKey?: string;
  createdAt: string;
  updatedAt: string;
  statusHistory: { status: OrderStatus; timestamp: string; note?: string }[];
};

export type Customer = {
  id: string;
  fullName: string;
  phoneNormalized: string;
  email?: string;
  address: string;
  district: string;
  area: string;
  totalOrders: number;
  totalSpent: number;
  createdAt: string;
  updatedAt: string;
};

export type ProductReview = {
  id: string;
  productId: string;
  customerName: string;
  customerPhone?: string;
  rating: number;
  comment: string;
  status: "approved" | "pending" | "rejected";
  isVerifiedPurchase: boolean;
  createdAt: string;
};

export type BusinessSettings = {
  deliveryDhaka: number;
  deliveryOutside: number;
  supportPhone: string;
  supportPhone2: string;
  supportEmail: string;
  whatsappNumber: string;
  whatsappVerified: boolean;
  metaPixelId: string;
  promoOfferEnabled: boolean;
  promoTitle: string;
  promoDeadline: string;
  returnPolicyText: string;
  codAvailable: boolean;
};

const DEFAULT_SETTINGS: BusinessSettings = {
  deliveryDhaka: 80,
  deliveryOutside: 120,
  supportPhone: "01823-824071",
  supportPhone2: "01552-541791",
  supportEmail: "email-admin@zhinuk.com",
  whatsappNumber: "8801823824071",
  whatsappVerified: false,
  metaPixelId: "",
  promoOfferEnabled: true,
  promoTitle: "বিশেষ অফার — সারা দেশে ক্যাশ অন ডেলিভারি!",
  promoDeadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  returnPolicyText: "পণ্য হাতে পেয়ে দেখে নেওয়ার সুবিধা এবং ৭ দিনের সহজ রিটার্ন বা এক্সচেঞ্জ গ্যারান্টি।",
  codAvailable: true,
};

// Map original static products into the extended Product structure
function mapStaticToProducts(): Product[] {
  return staticCatalog.map((p) => ({
    id: p.id,
    name: p.name,
    category: p.category,
    price: p.price,
    regularPrice: p.regularPrice,
    rating: p.rating,
    reviews: p.reviews,
    reviewCount: parseInt(p.reviews.replace(/[^0-9]/g, "") || "10", 10) * 100,
    image: p.image,
    gallery: [p.image],
    description: p.description,
    features: [
      "১০০% অরিজিনাল ও অথেনটিক পণ্য",
      "ক্যাশ অন ডেলিভারি সুবিধা",
      "সারা বাংলাদেশে দ্রুততম ডেলিভারি",
      "৭ দিনের ফ্রি এক্সচেঞ্জ সুবিধা",
    ],
    stockQuantity: 25,
    lowStockThreshold: 5,
    variants:
      p.category === "fashion" || p.category === "shoes"
        ? [{ name: "সাইজ", options: ["M", "L", "XL"] }, { name: "কালার", options: ["কালো", "নেভি ব্লু", "মেরুন"] }]
        : [{ name: "কালার", options: ["ক্লাসিক ব্ল্যাক", "ওশান ব্লু"] }],
    status: "published",
    is_demo: true,
    createdAt: "2026-10-23T00:00:00Z",
    updatedAt: "2026-10-23T00:00:00Z",
  }));
}

// Local storage keys
const STORAGE_KEYS = {
  PRODUCTS: "zh_products_v2",
  ORDERS: "zh_orders_v2",
  CUSTOMERS: "zh_customers_v2",
  REVIEWS: "zh_reviews_v2",
  SETTINGS: "zh_settings_v2",
};

class DataService {
  private products: Product[] = [];
  private orders: Order[] = [];
  private customers: Customer[] = [];
  private reviews: ProductReview[] = [];
  private settings: BusinessSettings = { ...DEFAULT_SETTINGS };
  private initialized = false;

  constructor() {
    this.init();
  }

  private init() {
    if (typeof window === "undefined") {
      this.products = mapStaticToProducts();
      return;
    }

    try {
      // Load Settings
      const storedSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (storedSettings) {
        this.settings = { ...DEFAULT_SETTINGS, ...JSON.parse(storedSettings) };
        // Migration: Ensure legacy 60 BDT for Dhaka is updated to the required 80 BDT
        if (this.settings.deliveryDhaka === 60) {
          this.settings.deliveryDhaka = 80;
          this.saveSettings(this.settings);
        }
      }

      // Load Products
      const storedProducts = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      if (storedProducts) {
        const parsed: Product[] = JSON.parse(storedProducts);
        // Ensure static demo products are present
        const staticList = mapStaticToProducts();
        const existingIds = new Set(parsed.map((p) => p.id));
        const merged = [...parsed];
        for (const sp of staticList) {
          if (!existingIds.has(sp.id)) {
            merged.push(sp);
          }
        }
        this.products = merged;
      } else {
        this.products = mapStaticToProducts();
        this.saveProducts();
      }

      // Load Orders
      const storedOrders = localStorage.getItem(STORAGE_KEYS.ORDERS);
      if (storedOrders) {
        this.orders = JSON.parse(storedOrders);
      }

      // Load Customers
      const storedCustomers = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
      if (storedCustomers) {
        this.customers = JSON.parse(storedCustomers);
      }

      // Load Reviews
      const storedReviews = localStorage.getItem(STORAGE_KEYS.REVIEWS);
      if (storedReviews) {
        this.reviews = JSON.parse(storedReviews);
      }
    } catch (e) {
      console.error("Failed to parse local database state:", e);
      this.products = mapStaticToProducts();
    }
    this.initialized = true;
  }

  // Persist helpers
  private saveProducts() {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(this.products));
    }
  }

  private saveOrders() {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(this.orders));
    }
  }

  private saveCustomers() {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(this.customers));
    }
  }

  private saveReviews() {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(this.reviews));
    }
  }

  public saveSettings(newSettings: Partial<BusinessSettings>) {
    this.settings = { ...this.settings, ...newSettings };
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(this.settings));
    }
    return this.settings;
  }

  public getSettings(): BusinessSettings {
    return this.settings;
  }

  // --- PRODUCTS ---
  public getProducts(includeUnpublished = false): Product[] {
    if (includeUnpublished) return [...this.products];
    return this.products.filter((p) => p.status === "published");
  }

  public getProduct(id: string): Product | undefined {
    return this.products.find((p) => p.id === id);
  }

  public saveProduct(productData: Partial<Product> & { name: string; price: number }): Product {
    const isEdit = Boolean(productData.id && this.getProduct(productData.id));
    const id = productData.id || productData.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + Date.now().toString(36);

    const now = new Date().toISOString();
    let product: Product;

    if (isEdit) {
      const existing = this.getProduct(id)!;
      product = {
        ...existing,
        ...productData,
        id,
        updatedAt: now,
      };
      this.products = this.products.map((p) => (p.id === id ? product : p));
    } else {
      product = {
        id,
        name: productData.name,
        name_en: productData.name_en,
        sku: productData.sku || "ZH-" + Math.floor(100000 + Math.random() * 900000),
        category: productData.category || "lifestyle",
        price: Number(productData.price),
        regularPrice: productData.regularPrice ? Number(productData.regularPrice) : undefined,
        rating: 5.0,
        reviews: "0",
        reviewCount: 0,
        image: productData.image || "/products/p-watch.jpg",
        gallery: productData.gallery || (productData.image ? [productData.image] : ["/products/p-watch.jpg"]),
        description: productData.description || "",
        features: productData.features || ["প্রিমিয়াম কোয়ালিটি", "৭ দিনের রিটার্ন সুবিধা"],
        stockQuantity: Number(productData.stockQuantity ?? 10),
        lowStockThreshold: Number(productData.lowStockThreshold ?? 3),
        variants: productData.variants || [],
        status: productData.status || "published",
        is_demo: false,
        createdAt: now,
        updatedAt: now,
      };
      this.products.unshift(product);
    }

    this.saveProducts();
    return product;
  }

  public updateProductStatus(id: string, status: ProductStatus): boolean {
    const p = this.getProduct(id);
    if (!p) return false;
    p.status = status;
    p.updatedAt = new Date().toISOString();
    this.saveProducts();
    return true;
  }

  public updateStock(id: string, quantity: number): boolean {
    const p = this.getProduct(id);
    if (!p) return false;
    p.stockQuantity = Math.max(0, quantity);
    p.updatedAt = new Date().toISOString();
    this.saveProducts();
    return true;
  }

  public deleteProduct(id: string): { success: boolean; message: string } {
    const p = this.getProduct(id);
    if (!p) return { success: false, message: "পণ্য পাওয়া যায়নি।" };

    // Check if product has historical orders
    const hasOrders = this.orders.some((o) => o.items.some((item) => item.productId === id));
    if (hasOrders) {
      // Soft-delete / archive instead of hard deleting to keep order history valid
      p.status = "archived";
      this.saveProducts();
      return {
        success: true,
        message: "পণ্যটিতে পূর্ববর্তী অর্ডার রয়েছে, তাই এটি মুছে ফেলার পরিবর্তে সফলভাবে আর্কাইভ করা হয়েছে।",
      };
    }

    this.products = this.products.filter((item) => item.id !== id);
    this.saveProducts();
    return { success: true, message: "পণ্যটি স্থায়ীভাবে মুছে ফেলা হয়েছে।" };
  }

  // --- ORDERS & CHECKOUT (Server-Authoritative Price & Stock) ---
  public normalizePhone(phone: string): string {
    const bnToEnMap: Record<string, string> = {
      "০": "0", "১": "1", "২": "2", "৩": "3", "৪": "4",
      "৫": "5", "৬": "6", "৭": "7", "৮": "8", "৯": "9",
    };
    let clean = (phone || "").replace(/[০-৯]/g, (d) => bnToEnMap[d] ?? d);
    clean = clean.replace(/\D/g, "");
    if (clean.startsWith("880")) clean = clean.slice(2);
    return clean;
  }

  public isValidBDPhone(phone: string): boolean {
    const normalized = this.normalizePhone(phone);
    return /^01[3-9]\d{8}$/.test(normalized);
  }

  public calculateOrderTotal(
    subtotal: number,
    deliveryZone: "dhaka" | "outside",
    discount: number = 0
  ): {
    subtotal: number;
    deliveryCharge: number;
    discount: number;
    total: number;
  } {
    const zone: "dhaka" | "outside" = deliveryZone === "outside" ? "outside" : "dhaka";
    // Authoritative single delivery fee per order: ৳80 inside Dhaka, ৳120 outside Dhaka
    const deliveryCharge = zone === "dhaka" ? this.settings.deliveryDhaka : this.settings.deliveryOutside;
    const safeDiscount = Math.max(0, Number(discount) || 0);
    // Final payable amount = product subtotal − applicable discounts + delivery charge
    const total = Math.max(0, subtotal - safeDiscount + deliveryCharge);
    return {
      subtotal,
      deliveryCharge,
      discount: safeDiscount,
      total,
    };
  }

  public async placeOrder(orderInput: {
    customerName: string;
    customerPhone: string;
    customerEmail?: string;
    address: string;
    district: string;
    area: string;
    deliveryZone: "dhaka" | "outside";
    items: { productId: string; quantity: number; variant?: string }[];
    discount?: number;
    customerNote?: string;
    idempotencyKey?: string;
  }): Promise<{ success: boolean; order?: Order; error?: string }> {
    // 1. Validation
    if (!orderInput.customerName || orderInput.customerName.trim().length < 2) {
      return { success: false, error: "অনুগ্রহ করে আপনার সঠিক নাম লিখুন (কমপক্ষে ২ অক্ষর)।" };
    }

    const normalizedPhone = this.normalizePhone(orderInput.customerPhone);
    if (!this.isValidBDPhone(normalizedPhone)) {
      return { success: false, error: "অনুগ্রহ করে বাংলাদেশের সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন (যেমন: 01712345678)।" };
    }

    if (!orderInput.address || orderInput.address.trim().length < 5) {
      return { success: false, error: "অনুগ্রহ করে বাসা ও রোড নম্বর সহ সম্পূর্ণ ঠিকানা দিন (কমপক্ষে ৫ অক্ষর)।" };
    }

    if (!orderInput.district || !orderInput.district.trim() || !orderInput.area || !orderInput.area.trim()) {
      return { success: false, error: "জেলা এবং এলাকার নাম উল্লেখ করুন।" };
    }

    if (!orderInput.items || orderInput.items.length === 0) {
      return { success: false, error: "অর্ডার করার মতো কোনো পণ্য নির্বাচিত নেই।" };
    }

    // Consolidate duplicate product entries to prevent duplicate line errors
    const consolidatedMap = new Map<string, { productId: string; quantity: number; variant?: string }>();
    for (const item of orderInput.items) {
      const existing = consolidatedMap.get(item.productId);
      if (existing) {
        existing.quantity += item.quantity;
      } else {
        consolidatedMap.set(item.productId, { ...item });
      }
    }
    const consolidatedItems = Array.from(consolidatedMap.values());

    for (const item of consolidatedItems) {
      if (item.quantity < 1 || item.quantity > 99) {
        return { success: false, error: "পণ্যের পরিমাণ ১ থেকে ৯৯ এর মধ্যে হতে হবে।" };
      }
    }

    // Validate delivery zone explicitly
    const zone: "dhaka" | "outside" = orderInput.deliveryZone === "outside" ? "outside" : "dhaka";
    // Authoritative single delivery fee per order: ৳80 inside Dhaka, ৳120 outside Dhaka
    const deliveryCharge = zone === "dhaka" ? 80 : 120;

    const idempotencyKey = orderInput.idempotencyKey || ("ord_" + Math.random().toString(36).substring(2, 10));

    // Check local memory cache first for idempotency
    const existing = this.orders.find((o) => o.idempotencyKey === idempotencyKey);
    if (existing) {
      return { success: true, order: existing };
    }

    // Verify catalog products and prices locally as first line of defense
    let localSubtotal = 0;
    const validatedItems: OrderItem[] = [];
    for (const item of consolidatedItems) {
      const product = this.getProduct(item.productId);
      if (!product || product.status !== "published") {
        return { success: false, error: "নির্বাচিত একটি পণ্য বর্তমানে বিক্রির জন্য উপলব্ধ নয়।" };
      }
      if (product.stockQuantity < item.quantity) {
        return {
          success: false,
          error: `দুঃখিত! “${product.name}”-এর পর্যাপ্ত স্টক নেই (মজুদ আছে: ${toBn(product.stockQuantity)}টি)।`,
        };
      }
      const unitPrice = product.price;
      const lineTotal = unitPrice * item.quantity;
      localSubtotal += lineTotal;
      validatedItems.push({
        productId: product.id,
        name: product.name,
        variant: item.variant,
        quantity: item.quantity,
        unitPrice,
        lineTotal,
        image: product.image,
      });
    }

    // 2. CENTRAL SUPABASE-BACKED ORDER FLOW
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.rpc("place_zhinuk_order", {
          p_name: orderInput.customerName.trim(),
          p_phone: normalizedPhone,
          p_email: orderInput.customerEmail?.trim() || null,
          p_address: orderInput.address.trim(),
          p_district: orderInput.district.trim(),
          p_area: orderInput.area.trim(),
          p_delivery_zone: zone,
          p_payment_method: "cod",
          p_delivery_charge: deliveryCharge,
          p_items: consolidatedItems.map((i) => ({
            product_id: i.productId,
            quantity: i.quantity,
            variant: i.variant ? { variant: i.variant } : {},
          })),
          p_idempotency_key: idempotencyKey,
          p_customer_note: orderInput.customerNote?.trim() || null,
        });

        if (error) {
          console.error("[Supabase order error]", error);
          let userMsg = error.message;
          if (userMsg.includes("পর্যাপ্ত স্টক নেই")) {
            // Already clean Bangla from SQL
          } else if (userMsg.includes("ডেলিভারি চার্জ")) {
            userMsg = "ডেলিভারি চার্জ সঠিক নয়। পৃষ্ঠা রিফ্রেশ করে আবার চেষ্টা করুন।";
          } else if (userMsg.includes("কার্ট খালি")) {
            userMsg = "কার্ট খালি! পণ্য যোগ করে আবার চেষ্টা করুন।";
          }
          return { success: false, error: userMsg || "সার্ভার থেকে অর্ডার তৈরি করা সম্ভব হয়নি।" };
        }

        if (!data || !(data as any).order_id) {
          return { success: false, error: "ডাটাবেজ থেকে অর্ডার কনফার্মেশন নিশ্চিত করা যায়নি।" };
        }

        const serverData = data as any;
        const now = new Date().toISOString();

        const confirmedOrder: Order = {
          id: serverData.order_id,
          orderNumber: serverData.order_number,
          customerId: "cust_" + normalizedPhone,
          customerName: orderInput.customerName.trim(),
          customerPhone: normalizedPhone,
          customerEmail: orderInput.customerEmail?.trim(),
          address: orderInput.address.trim(),
          district: orderInput.district.trim(),
          area: orderInput.area.trim(),
          deliveryZone: zone,
          deliveryCharge: Number(serverData.delivery_charge ?? deliveryCharge),
          subtotal: Number(serverData.subtotal ?? localSubtotal),
          discount: orderInput.discount ?? 0,
          total: Number(serverData.total),
          paymentMethod: "cod",
          paymentStatus: "unpaid",
          status: "pending",
          items: validatedItems,
          customerNote: orderInput.customerNote?.trim(),
          idempotencyKey,
          createdAt: now,
          updatedAt: now,
          statusHistory: [{ status: "pending", timestamp: now, note: "সেন্ট্রাল Supabase ডাটাবেজে সফলভাবে সংরক্ষিত ক্যাশ অন ডেলিভারি অর্ডার।" }],
        };

        // Deduct inventory in local memory cache
        for (const item of validatedItems) {
          const p = this.getProduct(item.productId);
          if (p) {
            p.stockQuantity = Math.max(0, p.stockQuantity - item.quantity);
            p.updatedAt = now;
          }
        }
        this.saveProducts();

        // Update local session cache
        this.orders.unshift(confirmedOrder);
        this.saveOrders();

        // Trigger Meta Pixel Purchase Event ONLY after backend confirmation
        trackPurchase({
          orderNumber: confirmedOrder.orderNumber,
          total: confirmedOrder.total,
          items: confirmedOrder.items.map((i) => ({
            product_id: i.productId,
            quantity: i.quantity,
            unit_price: i.unitPrice,
          })),
        });

        return { success: true, order: confirmedOrder };
      } catch (err: any) {
        console.error("[placeOrder exception]", err);
        return {
          success: false,
          error: err?.message || "সার্ভারের সাথে সংযোগ স্থাপন করা সম্ভব হয়নি। ইন্টারনেট সংযোগ পরীক্ষা করুন।",
        };
      }
    }

    // When Supabase is NOT configured:
    // Per requirement 2: "Never silently fall back to localStorage and tell the customer that a real order was placed."
    return {
      success: false,
      error: "সেন্ট্রাল ডাটাবেজ (Supabase) সংযোগ এখনও কনফিগার করা হয়নি। আপনার আসল অর্ডার কেন্দ্রীয় সার্ভারে সংরক্ষণ নিশ্চিত করতে অনুগ্রহ করে প্রোজেক্টের .env ফাইলে VITE_SUPABASE_URL এবং VITE_SUPABASE_PUBLISHABLE_KEY কনফিগার করুন।",
    };
  }

  public getOrders(): Order[] {
    return [...this.orders];
  }

  public getOrder(orderIdOrNumber: string): Order | undefined {
    return this.orders.find(
      (o) => o.id === orderIdOrNumber || o.orderNumber.toLowerCase() === orderIdOrNumber.toLowerCase()
    );
  }

  public updateOrderStatus(orderId: string, status: OrderStatus, note?: string): boolean {
    const order = this.orders.find((o) => o.id === orderId);
    if (!order) return false;

    const previousStatus = order.status;
    order.status = status;
    order.updatedAt = new Date().toISOString();
    order.statusHistory.push({
      status,
      timestamp: order.updatedAt,
      note: note || `অর্ডার স্ট্যাটাস পরিবর্তিত হয়েছে: ${status}`,
    });

    // If order was cancelled, restore inventory
    if (status === "cancelled" && previousStatus !== "cancelled") {
      for (const item of order.items) {
        const p = this.getProduct(item.productId);
        if (p) {
          p.stockQuantity += item.quantity;
          p.updatedAt = order.updatedAt;
        }
      }
      this.saveProducts();
    }

    this.saveOrders();
    return true;
  }

  public updatePaymentStatus(orderId: string, paymentStatus: PaymentStatus): boolean {
    const order = this.orders.find((o) => o.id === orderId);
    if (!order) return false;
    order.paymentStatus = paymentStatus;
    order.updatedAt = new Date().toISOString();
    this.saveOrders();
    return true;
  }

  // --- CUSTOMERS ---
  public getCustomers(): Customer[] {
    return [...this.customers];
  }

  public getCustomer(idOrPhone: string): Customer | undefined {
    const normalized = this.normalizePhone(idOrPhone);
    return this.customers.find((c) => c.id === idOrPhone || c.phoneNormalized === normalized);
  }

  public getCustomerOrders(customerId: string): Order[] {
    return this.orders.filter((o) => o.customerId === customerId);
  }

  // --- REVIEWS ---
  public getProductReviews(productId: string): ProductReview[] {
    return this.reviews.filter((r) => r.productId === productId && r.status === "approved");
  }

  public getAllReviews(): ProductReview[] {
    return [...this.reviews];
  }

  public submitReview(review: {
    productId: string;
    customerName: string;
    customerPhone?: string;
    rating: number;
    comment: string;
  }): { success: boolean; message: string } {
    if (!review.customerName || review.customerName.trim().length < 2) {
      return { success: false, message: "আপনার নাম লিখুন।" };
    }
    if (!review.comment || review.comment.trim().length < 5) {
      return { success: false, message: "অন্তত ৫ অক্ষরের মতামত লিখুন।" };
    }

    const normalizedPhone = review.customerPhone ? this.normalizePhone(review.customerPhone) : "";
    const isVerified = Boolean(
      normalizedPhone &&
        this.orders.some(
          (o) => o.customerPhone === normalizedPhone && o.items.some((i) => i.productId === review.productId)
        )
    );

    const newRev: ProductReview = {
      id: "rev_" + Date.now().toString(36),
      productId: review.productId,
      customerName: review.customerName.trim(),
      customerPhone: normalizedPhone ? (normalizedPhone.slice(0, 3) + "****" + normalizedPhone.slice(-4)) : undefined,
      rating: Math.min(5, Math.max(1, Math.round(review.rating))),
      comment: review.comment.trim(),
      status: "approved",
      isVerifiedPurchase: isVerified,
      createdAt: new Date().toISOString(),
    };

    if (isSupabaseConfigured()) {
      supabase
        .from("product_reviews")
        .insert({
          product_id: review.productId,
          customer_name: review.customerName.trim(),
          customer_phone_masked: newRev.customerPhone || null,
          rating: newRev.rating,
          comment: newRev.comment,
          status: "pending",
        })
        .then(({ error }) => {
          if (error) console.warn("[DataService] Review save to Supabase warning:", error.message);
        });
    }

    this.reviews.unshift(newRev);
    this.saveReviews();

    // Recalculate product rating
    const approved = this.reviews.filter((r) => r.productId === review.productId && r.status === "approved");
    const avg = approved.reduce((s, r) => s + r.rating, 0) / approved.length;
    const p = this.getProduct(review.productId);
    if (p) {
      p.rating = Math.round(avg * 10) / 10;
      p.reviewCount = approved.length;
      p.reviews = approved.length.toString();
      this.saveProducts();
    }

    return { success: true, message: "আপনার রিভিউ সফলভাবে যুক্ত হয়েছে! ধন্যবাদ।" };
  }

  public moderateReview(reviewId: string, status: "approved" | "rejected" | "deleted"): boolean {
    if (status === "deleted") {
      this.reviews = this.reviews.filter((r) => r.id !== reviewId);
    } else {
      const r = this.reviews.find((x) => x.id === reviewId);
      if (!r) return false;
      r.status = status;
    }
    this.saveReviews();
    return true;
  }

  // --- SUPABASE SYNCHRONIZATION ---
  public async syncProductsFromSupabase(): Promise<Product[]> {
    if (!isSupabaseConfigured()) return this.products;
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("status", "published")
        .order("created_at", { ascending: false });

      if (error) {
        console.warn("[DataService] Failed to fetch products from Supabase:", error.message);
        return this.products;
      }

      if (data && data.length > 0) {
        const dbProducts: Product[] = data.map((row) => ({
          id: row.id,
          name: row.name,
          name_en: row.name_en || undefined,
          sku: row.sku || undefined,
          category: row.category,
          price: Number(row.price),
          regularPrice: row.regular_price ? Number(row.regular_price) : undefined,
          rating: Number(row.rating || 5.0),
          reviews: String(row.review_count || 0),
          reviewCount: Number(row.review_count || 0),
          image: row.image_url || "/products/p-watch.jpg",
          gallery: Array.isArray(row.gallery_urls) && row.gallery_urls.length > 0 ? row.gallery_urls : [row.image_url || "/products/p-watch.jpg"],
          description: row.description || "",
          features: Array.isArray((row.specifications as any)?.features)
            ? (row.specifications as any).features
            : ["১০০% অরিজিনাল ও অথেনটিক পণ্য", "ক্যাশ অন ডেলিভারি সুবিধা"],
          stockQuantity: Number(row.stock_quantity ?? 10),
          lowStockThreshold: Number(row.low_stock_threshold ?? 3),
          variants: Array.isArray(row.variants) ? (row.variants as any) : [],
          status: row.status as ProductStatus,
          is_demo: Boolean(row.is_demo),
          createdAt: row.created_at,
          updatedAt: row.updated_at,
        }));

        // Keep static demo products present so catalog never appears blank
        const dbIds = new Set(dbProducts.map((p) => p.id));
        const staticList = mapStaticToProducts();
        const merged = [...dbProducts];
        for (const sp of staticList) {
          if (!dbIds.has(sp.id)) {
            merged.push(sp);
          }
        }
        this.products = merged;
        this.saveProducts();
      }
    } catch (e) {
      console.warn("[DataService] Supabase sync error:", e);
    }
    return this.products;
  }

  public async syncReviewsFromSupabase(productId?: string): Promise<ProductReview[]> {
    if (!isSupabaseConfigured()) return this.reviews;
    try {
      let query = supabase.from("product_reviews").select("*").eq("status", "approved").order("created_at", { ascending: false });
      if (productId) {
        query = query.eq("product_id", productId);
      }
      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        const dbReviews: ProductReview[] = data.map((r) => ({
          id: r.id,
          productId: r.product_id,
          customerName: r.customer_name,
          customerPhone: r.customer_phone_masked || undefined,
          rating: r.rating,
          comment: r.comment,
          status: r.status as any,
          isVerifiedPurchase: Boolean(r.customer_phone_masked),
          createdAt: r.created_at,
        }));
        const existingIds = new Set(this.reviews.map((x) => x.id));
        for (const rev of dbReviews) {
          if (!existingIds.has(rev.id)) {
            this.reviews.push(rev);
          }
        }
        this.saveReviews();
      }
    } catch (e) {
      console.warn("[DataService] Review sync warning:", e);
    }
    return this.reviews;
  }

  public async trackOrderRemote(orderQuery: string, phoneVerification?: string): Promise<any | null> {
    const clean = orderQuery.trim().replace(/^#/, "");
    if (!clean) return null;

    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.rpc("track_zhinuk_order", {
          p_order_query: clean,
          p_phone_verification: phoneVerification?.trim() || null,
        });
        if (!error && data) {
          return data;
        }
      } catch (e) {
        console.warn("[DataService] Remote track error:", e);
      }
    }

    const local = this.getOrder(clean);
    if (local) {
      return {
        ...local,
        is_verified: true,
      };
    }
    return null;
  }
}

export const dataService = new DataService();

import { setDynamicProductGetters } from "./catalog";
setDynamicProductGetters(
  (id) => dataService.getProduct(id) as any,
  () => dataService.getProducts() as any
);
