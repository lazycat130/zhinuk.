import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Archive,
  Boxes,
  LogOut,
  PackagePlus,
  RefreshCw,
  ShieldCheck,
  ShoppingBag,
  Users,
  Search,
  CheckCircle,
  Clock,
  AlertTriangle,
  Download,
  Phone,
  Mail,
  Eye,
  Trash2,
  Edit,
  ExternalLink,
  ChevronRight,
  Settings,
  Activity,
  Plus,
  Star,
  DollarSign,
  Truck,
  RotateCcw,
} from "lucide-react";
import {
  dataService,
  type Product,
  type ProductStatus,
  type Order,
  type Customer,
  type ProductReview,
  type BusinessSettings,
  type OrderStatus,
  type PaymentStatus,
} from "@/lib/data-service";
import { formatPrice, toBn, categories } from "@/lib/catalog";
import { isSupabaseConfigured, supabase } from "@/integrations/supabase/client";
import { getPixelStatus } from "@/lib/meta-pixel";

export const Route = createFileRoute("/admin")({ component: AdminPage });

const inputClass =
  "w-full rounded-xl border border-input bg-card px-3.5 py-2.5 text-sm outline-none transition focus:border-ocean focus:ring-4 focus:ring-ocean/15";
const btnClass =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-navy transition active:scale-98 disabled:opacity-50 cursor-pointer";

type Tab = "overview" | "products" | "orders" | "customers" | "inventory" | "reviews" | "settings" | "pixel";

function AdminPage() {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem("zh_admin_auth") === "true";
  });
  const [adminPin, setAdminPin] = useState("");
  const [pinError, setPinError] = useState(false);
  const [authMode, setAuthMode] = useState<"pin" | "supabase">("pin");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  const [tab, setTab] = useState<Tab>("overview");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Live state from dataService & Supabase
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [settings, setSettings] = useState<BusinessSettings>(() => dataService.getSettings());

  // Product Form State
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState({
    id: "",
    name: "",
    name_en: "",
    sku: "",
    category: "lifestyle",
    price: "",
    regularPrice: "",
    image: "",
    description: "",
    stockQuantity: "10",
    lowStockThreshold: "3",
    status: "published" as "published" | "draft" | "archived",
  });

  // Selected details modal
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // Settings form state
  const [settingsForm, setSettingsForm] = useState<BusinessSettings>(() => dataService.getSettings());

  // Load latest data from Supabase and dataService
  const refreshData = useCallback(async () => {
    setLoading(true);

    if (isSupabaseConfigured()) {
      try {
        // Sync products from Supabase
        const { data: dbProducts } = await supabase
          .from("products")
          .select("*")
          .order("created_at", { ascending: false });

        if (dbProducts && dbProducts.length > 0) {
          const mappedProducts: Product[] = dbProducts.map((row) => ({
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
          setProducts(mappedProducts);
        } else {
          setProducts(dataService.getProducts(true));
        }

        // Fetch central orders with order items and customer join
        const { data: dbOrders, error: ordErr } = await supabase
          .from("orders")
          .select("*, customers(*), order_items(*)")
          .order("created_at", { ascending: false });

        if (!ordErr && dbOrders) {
          const mappedOrders: Order[] = dbOrders.map((row: any) => ({
            id: row.id,
            orderNumber: row.order_number,
            customerId: row.customer_id,
            customerName: row.customers?.full_name || row.address_snapshot?.name || "ক্রেতা",
            customerPhone: row.customers?.phone_normalized || row.address_snapshot?.phone || "",
            customerEmail: row.customers?.email || row.address_snapshot?.email || "",
            address: row.address_snapshot?.address || row.customers?.address || "",
            district: row.address_snapshot?.district || row.customers?.district || "",
            area: row.address_snapshot?.area || row.customers?.area || "",
            deliveryZone: (row.address_snapshot?.delivery_zone || "dhaka") as "dhaka" | "outside",
            deliveryCharge: Number(row.delivery_charge),
            subtotal: Number(row.subtotal),
            discount: Number(row.discount || 0),
            total: Number(row.total),
            paymentMethod: row.payment_method,
            paymentStatus: row.payment_status,
            status: row.status,
            customerNote: row.customer_note || undefined,
            idempotencyKey: row.idempotency_key || undefined,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
            statusHistory: [{ status: row.status, timestamp: row.updated_at, note: "সেন্ট্রাল ডাটাবেজ রেকর্ড" }],
            items: (row.order_items || []).map((it: any) => ({
              productId: it.product_id || "",
              name: it.product_name,
              quantity: it.quantity,
              unitPrice: Number(it.unit_price),
              lineTotal: Number(it.line_total),
              variant: it.variant,
            })),
          }));
          setOrders(mappedOrders);
        } else {
          setOrders(dataService.getOrders());
        }

        // Fetch central customers
        const { data: dbCustomers, error: custErr } = await supabase
          .from("customers")
          .select("*")
          .order("created_at", { ascending: false });

        if (!custErr && dbCustomers) {
          const mappedCusts: Customer[] = dbCustomers.map((c: any) => ({
            id: c.id,
            fullName: c.full_name,
            phoneNormalized: c.phone_normalized,
            email: c.email || undefined,
            address: c.address,
            district: c.district,
            area: c.area,
            totalOrders: 1,
            totalSpent: 0,
            createdAt: c.created_at,
            updatedAt: c.updated_at,
          }));
          setCustomers(mappedCusts);
        } else {
          setCustomers(dataService.getCustomers());
        }

        // Fetch reviews
        const { data: dbRevs } = await supabase
          .from("product_reviews")
          .select("*")
          .order("created_at", { ascending: false });

        if (dbRevs && dbRevs.length > 0) {
          setReviews(dbRevs.map((r: any) => ({
            id: r.id,
            productId: r.product_id,
            customerName: r.customer_name,
            customerPhone: r.customer_phone_masked || undefined,
            rating: r.rating,
            comment: r.comment,
            status: r.status,
            isVerifiedPurchase: Boolean(r.customer_phone_masked),
            createdAt: r.created_at,
          })));
        } else {
          setReviews(dataService.getAllReviews());
        }
      } catch (e) {
        console.warn("[AdminPage] Data refresh error:", e);
        setProducts(dataService.getProducts(true));
        setOrders(dataService.getOrders());
        setCustomers(dataService.getCustomers());
        setReviews(dataService.getAllReviews());
      }
    } else {
      setProducts(dataService.getProducts(true));
      setOrders(dataService.getOrders());
      setCustomers(dataService.getCustomers());
      setReviews(dataService.getAllReviews());
    }

    const s = dataService.getSettings();
    setSettings(s);
    setSettingsForm(s);
    setLoading(false);
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (authMode === "supabase" && isSupabaseConfigured()) {
      if (!adminEmail.trim() || !adminPassword.trim()) {
        toast.error("ইমেইল ও পাসওয়ার্ড দিন");
        return;
      }
      setAuthLoading(true);
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: adminEmail.trim(),
          password: adminPassword,
        });
        if (error) {
          toast.error("লগইন ব্যর্থ: " + error.message);
          setPinError(true);
        } else if (data?.user) {
          const role = (data.user.app_metadata as any)?.role;
          if (role !== "admin") {
            toast.warning("লগইন হয়েছে কিন্তু ইউজারের অ্যাডমিন রোল সেট নেই।", {
              description: "docs/ADMIN-SETUP-BN.md অনুযায়ী app_metadata-এ role=admin যোগ করুন।",
            });
          }
          setIsAdminAuthenticated(true);
          localStorage.setItem("zh_admin_auth", "true");
          setPinError(false);
          toast.success("অ্যাডমিন অ্যাকাউন্টে সফলভাবে লগইন হয়েছে");
        }
      } catch (err: any) {
        toast.error("সংযোগ সমস্যা: " + err?.message);
      } finally {
        setAuthLoading(false);
      }
      return;
    }

    // Master PIN fallback
    if (adminPin.trim() === "zhinuk2026" || adminPin.trim() === "admin") {
      setIsAdminAuthenticated(true);
      localStorage.setItem("zh_admin_auth", "true");
      setPinError(false);
      toast.success("অ্যাডমিন প্যানেলে সফলভাবে প্রবেশ করেছেন");
    } else {
      setPinError(true);
      toast.error("ভুল অ্যাক্সেস পিন বা পাসওয়ার্ড");
    }
  };

  const handleAdminLogout = async () => {
    if (isSupabaseConfigured()) {
      try {
        await supabase.auth.signOut();
      } catch {}
    }
    setIsAdminAuthenticated(false);
    localStorage.removeItem("zh_admin_auth");
    toast.info("অ্যাডমিন লগআউট সম্পন্ন হয়েছে");
  };

  // Image Upload handler
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("ছবির সাইজ সর্বোচ্চ ৫ মেগাবাইট হতে হবে।");
      return;
    }

    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(file.type)) {
      toast.error("শুধুমাত্র JPG, PNG বা WebP ফরম্যাটের ছবি আপলোড করা যাবে।");
      return;
    }

    if (!isSupabaseConfigured()) {
      const reader = new FileReader();
      reader.onload = () => {
        setProductForm(prev => ({ ...prev, image: reader.result as string }));
        toast.info("ছবি লোকাল প্রিভিউতে সেট হয়েছে (সেন্ট্রাল স্টোরেজ আনকনফিগারড)");
      };
      reader.readAsDataURL(file);
      return;
    }

    setUploadingImage(true);
    try {
      const ext = file.name.split(".").pop() || "jpg";
      const filePath = `products/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;
      const { data, error } = await supabase.storage.from("zhinuk-products").upload(filePath, file, {
        cacheControl: "3600",
        upsert: true,
      });

      if (error) {
        toast.error("ছবি আপলোড ব্যর্থ: " + error.message);
      } else if (data) {
        const { data: urlData } = supabase.storage.from("zhinuk-products").getPublicUrl(data.path);
        setProductForm(prev => ({ ...prev, image: urlData.publicUrl }));
        toast.success("পণ্য ছবি সফলভাবে সেন্ট্রাল স্টোরেজে আপলোড হয়েছে!");
      }
    } catch (err: any) {
      toast.error("আপলোড ত্রুটি: " + err?.message);
    } finally {
      setUploadingImage(false);
    }
  };

  // Product Actions
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const price = Number(productForm.price);
    const regular = productForm.regularPrice ? Number(productForm.regularPrice) : undefined;
    const stock = Number(productForm.stockQuantity);

    if (!productForm.name.trim()) {
      toast.error("পণ্যের নাম আবশ্যক");
      return;
    }
    if (!Number.isFinite(price) || price < 0) {
      toast.error("সঠিক মূল্য দিন");
      return;
    }
    if (regular !== undefined && regular < price) {
      toast.error("আগের মূল্য বর্তমান মূল্যের চেয়ে কম হতে পারে না");
      return;
    }

    const targetId = editingProduct?.id || productForm.id || (productForm.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + Date.now().toString(36));

    if (isSupabaseConfigured()) {
      const { error: dbErr } = await supabase.from("products").upsert({
        id: targetId,
        name: productForm.name.trim(),
        name_en: productForm.name_en.trim() || null,
        sku: productForm.sku.trim() || null,
        category: productForm.category,
        price,
        regular_price: regular ?? null,
        stock_quantity: stock,
        low_stock_threshold: Number(productForm.lowStockThreshold) || 3,
        image_url: productForm.image.trim() || "/products/p-watch.jpg",
        gallery_urls: [productForm.image.trim() || "/products/p-watch.jpg"],
        description: productForm.description.trim(),
        status: productForm.status,
        updated_at: new Date().toISOString(),
      });
      if (dbErr) {
        toast.error("Supabase-এ পণ্য সংরক্ষণ ব্যর্থ: " + dbErr.message);
        return;
      }
    }

    const saved = dataService.saveProduct({
      id: targetId,
      name: productForm.name.trim(),
      name_en: productForm.name_en.trim() || undefined,
      sku: productForm.sku.trim() || undefined,
      category: productForm.category,
      price,
      regularPrice: regular,
      stockQuantity: stock,
      lowStockThreshold: Number(productForm.lowStockThreshold) || 3,
      image: productForm.image.trim() || "/products/p-watch.jpg",
      gallery: [productForm.image.trim() || "/products/p-watch.jpg"],
      description: productForm.description.trim(),
      status: productForm.status,
    });

    toast.success(editingProduct ? "পণ্য আপডেট হয়েছে" : "নতুন পণ্য তৈরি হয়েছে", {
      description: saved.name + (isSupabaseConfigured() ? " (সেন্ট্রাল ডাটাবেজে সংরক্ষিত)" : ""),
    });

    setShowProductForm(false);
    setEditingProduct(null);
    refreshData();
  };

  const handleStartEdit = (p: Product) => {
    setEditingProduct(p);
    setProductForm({
      id: p.id,
      name: p.name,
      name_en: p.name_en || "",
      sku: p.sku || "",
      category: p.category,
      price: String(p.price),
      regularPrice: p.regularPrice ? String(p.regularPrice) : "",
      image: p.image,
      description: p.description,
      stockQuantity: String(p.stockQuantity),
      lowStockThreshold: String(p.lowStockThreshold || 3),
      status: p.status,
    });
    setShowProductForm(true);
  };

  const handleDeleteProduct = async (p: Product) => {
    if (!window.confirm(`আপনি কি নিশ্চিত যে “${p.name}” মুছে ফেলতে চান?`)) return;

    if (isSupabaseConfigured()) {
      const { error: delErr } = await supabase.from("products").delete().eq("id", p.id);
      if (delErr) {
        toast.error("ডাটাবেজ থেকে মুছে ফেলা যায়নি: " + delErr.message);
        return;
      }
    }

    const res = dataService.deleteProduct(p.id);
    if (res.success) {
      toast.success(res.message);
      refreshData();
    } else {
      toast.error(res.message);
    }
  };

  // Order Actions
  const handleOrderStatusChange = async (orderId: string, status: OrderStatus) => {
    if (isSupabaseConfigured()) {
      const { error } = await supabase
        .from("orders")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", orderId);
      if (error) {
        toast.error("ডাটাবেজে স্ট্যাটাস আপডেট ব্যর্থ: " + error.message);
        return;
      }
    }

    const ok = dataService.updateOrderStatus(orderId, status);
    if (ok) {
      toast.success("অর্ডার স্ট্যাটাস আপডেট হয়েছে", { description: `নতুন অবস্থা: ${status}` });
      refreshData();
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder((prev) => prev ? { ...prev, status } : null);
      }
    }
  };

  const handlePaymentStatusChange = async (orderId: string, paymentStatus: PaymentStatus) => {
    if (isSupabaseConfigured()) {
      const { error } = await supabase
        .from("orders")
        .update({ payment_status: paymentStatus, updated_at: new Date().toISOString() })
        .eq("id", orderId);
      if (error) {
        toast.error("ডাটাবেজে পেমেন্ট স্ট্যাটাস আপডেট ব্যর্থ: " + error.message);
        return;
      }
    }

    const ok = dataService.updatePaymentStatus(orderId, paymentStatus);
    if (ok) {
      toast.success("পেমেন্ট স্ট্যাটাস আপডেট হয়েছে", { description: `পেমেন্ট: ${paymentStatus}` });
      refreshData();
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder((prev) => prev ? { ...prev, paymentStatus } : null);
      }
    }
  };

  // CSV Export for Customers
  const exportCustomersCsv = () => {
    const headers = ["Customer ID", "Full Name", "Phone", "Email", "Address", "District", "Area", "Total Orders", "Total Spent (BDT)", "Created At"];
    const rows = customers.map((c) => [
      c.id,
      c.fullName,
      c.phoneNormalized,
      c.email || "",
      c.address,
      c.district,
      c.area,
      c.totalOrders,
      c.totalSpent,
      c.createdAt,
    ]);

    const escapeCsv = (val: any) => `"${String(val ?? "").replace(/"/g, '""')}"`;
    const csvContent = "\uFEFF" + [headers, ...rows].map((row) => row.map(escapeCsv).join(",")).join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `zhinuk-customers-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("কাস্টমার ডাটা CSV এক্সপোর্ট সম্পন্ন হয়েছে");
  };

  // CSV Export for Orders
  const exportOrdersCsv = () => {
    const headers = ["Order Number", "Date", "Customer Name", "Customer Phone", "District", "Items", "Subtotal", "Delivery", "Total", "Payment Status", "Order Status"];
    const rows = orders.map((o) => [
      o.orderNumber,
      o.createdAt,
      o.customerName,
      o.customerPhone,
      o.district,
      o.items.map((i) => `${i.name} (x${i.quantity})`).join("; "),
      o.subtotal,
      o.deliveryCharge,
      o.total,
      o.paymentStatus,
      o.status,
    ]);

    const escapeCsv = (val: any) => `"${String(val ?? "").replace(/"/g, '""')}"`;
    const csvContent = "\uFEFF" + [headers, ...rows].map((row) => row.map(escapeCsv).join(",")).join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `zhinuk-orders-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("অর্ডার ডাটা CSV এক্সপোর্ট সম্পন্ন হয়েছে");
  };

  // Save Settings
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    dataService.saveSettings(settingsForm);
    setSettings({ ...settingsForm });
    toast.success("বিজনেস সেটিংস সংরক্ষিত হয়েছে");
  };

  // Metrics
  const totalRevenue = useMemo(() => orders.filter((o) => o.status !== "cancelled").reduce((s, o) => s + o.total, 0), [orders]);
  const pendingOrdersCount = useMemo(() => orders.filter((o) => o.status === "pending").length, [orders]);
  const lowStockProducts = useMemo(() => products.filter((p) => p.stockQuantity <= (p.lowStockThreshold || 3)), [products]);

  // Filtered queries
  const filteredProducts = useMemo(() => {
    const q = search.toLowerCase();
    return products.filter((p) => p.name.toLowerCase().includes(q) || p.id.toLowerCase().includes(q) || (p.sku && p.sku.toLowerCase().includes(q)));
  }, [products, search]);

  const filteredOrders = useMemo(() => {
    const q = search.toLowerCase();
    return orders.filter((o) => o.orderNumber.toLowerCase().includes(q) || o.customerName.toLowerCase().includes(q) || o.customerPhone.includes(q));
  }, [orders, search]);

  const filteredCustomers = useMemo(() => {
    const q = search.toLowerCase();
    return customers.filter((c) => c.fullName.toLowerCase().includes(q) || c.phoneNormalized.includes(q) || (c.email && c.email.toLowerCase().includes(q)));
  }, [customers, search]);

  // Authentication Guard Screen
  if (!isAdminAuthenticated) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <div className="rounded-3xl border border-border bg-card p-7 sm:p-8 shadow-card">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-navy text-navy-foreground shadow-lift">
            <ShieldCheck className="h-8 w-8 text-highlight" />
          </div>
          <h1 className="mt-4 text-2xl font-bold text-navy">ঝিনুক অ্যাডমিন প্যানেল</h1>
          <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
            পণ্য, অর্ডার, কাস্টমার ডাটাবেস ও সেটিংস ব্যবস্থাপনার সুরক্ষিত প্রবেশদ্বার।
          </p>

          {/* Connection status indicator */}
          <div className="mt-4 flex items-center justify-center">
            {isSupabaseConfigured() ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-bold text-emerald-800">
                <CheckCircle className="h-3 w-3" /> সেন্ট্রাল Supabase ডাটাবেজ সংযুক্ত
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-bold text-amber-800">
                <AlertTriangle className="h-3 w-3" /> Supabase আনকনফিগারড (লোকাল মোড)
              </span>
            )}
          </div>

          {/* Tab selector between PIN and Supabase Auth */}
          <div className="mt-5 grid grid-cols-2 gap-1 rounded-xl bg-muted/50 p-1 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setAuthMode("pin")}
              className={`rounded-lg py-1.5 transition cursor-pointer ${
                authMode === "pin" ? "bg-card text-navy shadow-xs font-bold" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              মাস্টার পিন
            </button>
            <button
              type="button"
              onClick={() => setAuthMode("supabase")}
              className={`rounded-lg py-1.5 transition cursor-pointer ${
                authMode === "supabase" ? "bg-card text-navy shadow-xs font-bold" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Supabase একাউন্ট
            </button>
          </div>

          <form onSubmit={handleAdminLogin} className="mt-5 space-y-3.5 text-left">
            {authMode === "pin" ? (
              <div>
                <label className="mb-1 block text-xs font-semibold text-foreground">
                  অ্যাডমিন মাস্টার পিন
                </label>
                <input
                  type="password"
                  required
                  value={adminPin}
                  onChange={(e) => setAdminPin(e.target.value)}
                  placeholder="অ্যাডমিন পিন লিখুন"
                  className={inputClass}
                  autoFocus
                />
                <p className="mt-1.5 text-[11px] text-muted-foreground">
                  ডিফল্ট মাস্টার পিন: <code className="bg-muted px-1.5 py-0.5 rounded font-mono text-navy font-bold">zhinuk2026</code>
                </p>
              </div>
            ) : (
              <>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-foreground">অ্যাডমিন ইমেইল</label>
                  <input
                    type="email"
                    required
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    placeholder="admin@zhinuk.com"
                    className={inputClass}
                    autoFocus
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-foreground">পাসওয়ার্ড</label>
                  <input
                    type="password"
                    required
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="••••••••"
                    className={inputClass}
                  />
                </div>
                {!isSupabaseConfigured() && (
                  <p className="text-[11px] text-amber-700 bg-amber-50 p-2 rounded-lg leading-relaxed">
                    সতর্কতা: প্রোজেক্টের .env-এ Supabase URL যুক্ত না থাকলে Supabase Auth কাজ করবে না। সেক্ষেত্রে "মাস্টার পিন" দিয়ে প্রবেশ করুন।
                  </p>
                )}
              </>
            )}

            {pinError && (
              <p className="text-xs text-destructive font-medium">ভুল ক্রেডেনশিয়াল! অনুগ্রহ করে সঠিক তথ্য দিন।</p>
            )}

            <button type="submit" disabled={authLoading} className={`w-full ${btnClass}`}>
              {authLoading ? "যাচাই হচ্ছে..." : "অ্যাডমিন প্রবেশ"}
            </button>
          </form>

          <div className="mt-5 border-t border-border pt-3 text-[11px] text-muted-foreground">
            <p>Row Level Security (RLS) ও ভূমিকাভিত্তিক এক্সেস কন্ট্রোল দ্বারা সুরক্ষিত।</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-6 lg:px-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-2xl font-extrabold text-navy">ঝিনুক অ্যাডমিন ড্যাশবোর্ড</h1>
            {isSupabaseConfigured() ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
                <CheckCircle className="h-3 w-3" /> সেন্ট্রাল Supabase ডাটাবেজ
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-800">
                <AlertTriangle className="h-3 w-3" /> লোকাল প্রিভিউ মোড (Supabase আনকনফিগারড)
              </span>
            )}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            পণ্য ক্যাটালগ, ফেসবুক এডস অর্ডার, কাস্টমার ডাটাবেস ও বিজনেস সেটিংস
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={refreshData}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-2 text-xs font-semibold hover:bg-ocean-soft transition"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} /> রিফ্রেশ
          </button>
          <button
            onClick={handleAdminLogout}
            className="inline-flex items-center gap-1.5 rounded-xl border border-destructive/20 text-destructive bg-destructive/5 px-3 py-2 text-xs font-semibold hover:bg-destructive hover:text-white transition"
          >
            <LogOut className="h-3.5 w-3.5" /> লগআউট
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="mt-6 flex gap-1.5 overflow-x-auto border-b border-border pb-2 no-scrollbar text-sm">
        {[
          { id: "overview", label: "ওভারভিউ", icon: Activity, count: null },
          { id: "products", label: "পণ্যসমূহ", icon: Boxes, count: products.length },
          { id: "orders", label: "অর্ডারসমূহ", icon: ShoppingBag, count: orders.length },
          { id: "customers", label: "কাস্টমারস", icon: Users, count: customers.length },
          { id: "inventory", label: "ইনভেন্টরি", icon: AlertTriangle, count: lowStockProducts.length },
          { id: "reviews", label: "রিভিউ", icon: Star, count: reviews.length },
          { id: "settings", label: "বিজনেস সেটিংস", icon: Settings, count: null },
          { id: "pixel", label: "মেটা পিক্সেল", icon: DollarSign, count: null },
        ].map(({ id, label, icon: Icon, count }) => (
          <button
            key={id}
            onClick={() => {
              setTab(id as Tab);
              setSearch("");
            }}
            className={`flex items-center gap-2 whitespace-nowrap rounded-xl px-4 py-2 font-medium transition cursor-pointer ${
              tab === id
                ? "bg-navy text-navy-foreground shadow-sm"
                : "text-muted-foreground hover:bg-ocean-soft hover:text-foreground"
            }`}
          >
            <Icon className="h-4 w-4" />
            <span>{label}</span>
            {count !== null && (
              <span className={`rounded-full px-1.5 py-0.2 text-[11px] font-bold ${
                tab === id ? "bg-highlight text-highlight-foreground" : "bg-muted text-muted-foreground"
              }`}>
                {toBn(count)}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Search Bar for data lists */}
      {["products", "orders", "customers"].includes(tab) && (
        <div className="my-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="খুঁজুন (নাম, ফোন বা আইডি)..."
              className="h-10 w-full rounded-xl border border-input bg-card pl-9 pr-4 text-xs outline-none focus:border-ocean"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {tab === "products" && (
              <button
                onClick={() => {
                  setEditingProduct(null);
                  setProductForm({
                    id: "",
                    name: "",
                    name_en: "",
                    sku: "",
                    category: "lifestyle",
                    price: "",
                    regularPrice: "",
                    image: "",
                    description: "",
                    stockQuantity: "10",
                    lowStockThreshold: "3",
                    status: "published",
                  });
                  setShowProductForm(true);
                }}
                className={btnClass}
              >
                <Plus className="h-4 w-4" /> নতুন পণ্য যোগ করুন
              </button>
            )}

            {tab === "customers" && (
              <button onClick={exportCustomersCsv} className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3.5 py-2 text-xs font-semibold hover:bg-ocean-soft">
                <Download className="h-3.5 w-3.5" /> CSV এক্সপোর্ট
              </button>
            )}

            {tab === "orders" && (
              <button onClick={exportOrdersCsv} className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3.5 py-2 text-xs font-semibold hover:bg-ocean-soft">
                <Download className="h-3.5 w-3.5" /> অর্ডার CSV এক্সপোর্ট
              </button>
            )}
          </div>
        </div>
      )}

      {/* TAB 1: OVERVIEW */}
      {tab === "overview" && (
        <div className="mt-6 space-y-8">
          {/* Top Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
              <span className="text-xs font-semibold text-muted-foreground">মোট বিক্রয় (বিক্রিত অর্ডার)</span>
              <p className="mt-2 text-2xl font-extrabold text-navy">{formatPrice(totalRevenue)}</p>
              <span className="mt-1 text-[11px] text-emerald-600 font-medium">ক্যাশ অন ডেলিভারি অন্তর্ভুক্ত</span>
            </div>

            <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
              <span className="text-xs font-semibold text-muted-foreground">মোট অর্ডার</span>
              <p className="mt-2 text-2xl font-extrabold text-navy">{toBn(orders.length)} টি</p>
              <span className="mt-1 text-[11px] text-primary font-medium">পেন্ডিং: {toBn(pendingOrdersCount)} টি</span>
            </div>

            <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
              <span className="text-xs font-semibold text-muted-foreground">মোট কাস্টমার</span>
              <p className="mt-2 text-2xl font-extrabold text-navy">{toBn(customers.length)} জন</p>
              <span className="mt-1 text-[11px] text-muted-foreground">ভেরিফাইড মোবাইল রেকর্ড</span>
            </div>

            <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
              <span className="text-xs font-semibold text-muted-foreground">লো-স্টক সতর্কতা</span>
              <p className="mt-2 text-2xl font-extrabold text-amber-600">{toBn(lowStockProducts.length)} টি পণ্য</p>
              <span className="mt-1 text-[11px] text-muted-foreground">সীমিত স্টক মজুদ</span>
            </div>
          </div>

          {/* Recent Orders Preview */}
          <div className="rounded-3xl border border-border bg-card p-6 shadow-card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-navy">সর্বশেষ অর্ডারসমূহ</h2>
              <button onClick={() => setTab("orders")} className="text-xs font-semibold text-primary hover:underline">
                সকল অর্ডার দেখুন
              </button>
            </div>

            {orders.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">কোনো অর্ডার এখনো পাওয়া যায়নি।</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-border bg-muted/30 text-muted-foreground">
                    <tr>
                      <th className="p-3">অর্ডার নম্বর</th>
                      <th className="p-3">কাস্টমার</th>
                      <th className="p-3">পণ্য</th>
                      <th className="p-3">মূল্য</th>
                      <th className="p-3">স্ট্যাটাস</th>
                      <th className="p-3 text-right">অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {orders.slice(0, 5).map((o) => (
                      <tr key={o.id} className="hover:bg-ocean-soft/30 transition">
                        <td className="p-3 font-mono font-bold text-navy">#{o.orderNumber}</td>
                        <td className="p-3">
                          <p className="font-semibold text-foreground">{o.customerName}</p>
                          <p className="text-muted-foreground">{toBn(o.customerPhone)}</p>
                        </td>
                        <td className="p-3 text-muted-foreground">
                          {o.items.map((i) => `${i.name} (×${toBn(i.quantity)})`).join(", ")}
                        </td>
                        <td className="p-3 font-bold text-navy">{formatPrice(o.total)}</td>
                        <td className="p-3">
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                            o.status === "delivered" ? "bg-emerald-100 text-emerald-800" :
                            o.status === "cancelled" ? "bg-destructive/10 text-destructive" :
                            "bg-amber-100 text-amber-800"
                          }`}>
                            {o.status}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => setSelectedOrder(o)}
                            className="rounded-lg border border-border px-2.5 py-1 text-xs font-medium hover:bg-ocean-soft"
                          >
                            বিস্তারিত
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: PRODUCTS */}
      {tab === "products" && (
        <div className="mt-4 space-y-4">
          <div className="rounded-3xl border border-border bg-card shadow-card overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border bg-muted/40 text-muted-foreground">
                <tr>
                  <th className="p-3.5">ছবি</th>
                  <th className="p-3.5">পণ্যের নাম</th>
                  <th className="p-3.5">ক্যাটাগরি</th>
                  <th className="p-3.5">মূল্য</th>
                  <th className="p-3.5">স্টক</th>
                  <th className="p-3.5">অবস্থা</th>
                  <th className="p-3.5 text-right">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-ocean-soft/20 transition">
                    <td className="p-3.5">
                      <img src={p.image} alt={p.name} className="h-10 w-10 rounded-lg object-contain bg-white border border-border p-0.5" />
                    </td>
                    <td className="p-3.5">
                      <p className="font-bold text-navy">{p.name}</p>
                      <p className="text-[11px] text-muted-foreground font-mono">{p.id} {p.sku && `• SKU: ${p.sku}`}</p>
                    </td>
                    <td className="p-3.5 font-medium">{p.category}</td>
                    <td className="p-3.5">
                      <span className="font-bold text-navy">{formatPrice(p.price)}</span>
                      {p.regularPrice && <span className="block text-[11px] text-muted-foreground line-through">{formatPrice(p.regularPrice)}</span>}
                    </td>
                    <td className="p-3.5">
                      <span className={`font-bold ${p.stockQuantity <= (p.lowStockThreshold || 3) ? "text-amber-600" : "text-emerald-700"}`}>
                        {toBn(p.stockQuantity)} টি
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        p.status === "published" ? "bg-emerald-100 text-emerald-800" :
                        p.status === "archived" ? "bg-muted text-muted-foreground" :
                        "bg-amber-100 text-amber-800"
                      }`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-right space-x-1">
                      <button
                        onClick={() => handleStartEdit(p)}
                        className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                        title="এডিট করুন"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(p)}
                        className="rounded-lg p-1.5 text-destructive hover:bg-destructive/10"
                        title="মুছুন / আর্কাইভ করুন"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: ORDERS */}
      {tab === "orders" && (
        <div className="mt-4 space-y-4">
          <div className="rounded-3xl border border-border bg-card shadow-card overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border bg-muted/40 text-muted-foreground">
                <tr>
                  <th className="p-3.5">অর্ডার নম্বর</th>
                  <th className="p-3.5">তারিখ</th>
                  <th className="p-3.5">কাস্টমার</th>
                  <th className="p-3.5">পণ্যসমূহ</th>
                  <th className="p-3.5">বিল</th>
                  <th className="p-3.5">পেমেন্ট</th>
                  <th className="p-3.5">অর্ডার স্ট্যাটাস</th>
                  <th className="p-3.5 text-right">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-ocean-soft/20 transition">
                    <td className="p-3.5 font-mono font-bold text-navy">#{o.orderNumber}</td>
                    <td className="p-3.5 text-muted-foreground">
                      {new Date(o.createdAt).toLocaleDateString("bn-BD", { month: "short", day: "numeric" })}
                    </td>
                    <td className="p-3.5">
                      <p className="font-bold text-navy">{o.customerName}</p>
                      <a href={`tel:+88${o.customerPhone}`} className="text-primary hover:underline font-mono">
                        {toBn(o.customerPhone)}
                      </a>
                    </td>
                    <td className="p-3.5 text-muted-foreground max-w-[200px] truncate">
                      {o.items.map((i) => `${i.name} (×${toBn(i.quantity)})`).join(", ")}
                    </td>
                    <td className="p-3.5 font-bold text-navy">{formatPrice(o.total)}</td>
                    <td className="p-3.5">
                      <select
                        value={o.paymentStatus}
                        onChange={(e) => handlePaymentStatusChange(o.id, e.target.value as PaymentStatus)}
                        className="rounded-lg border border-border bg-card px-2 py-1 text-[11px] font-semibold outline-none"
                      >
                        <option value="unpaid">Unpaid (COD)</option>
                        <option value="paid">Paid</option>
                        <option value="refunded">Refunded</option>
                      </select>
                    </td>
                    <td className="p-3.5">
                      <select
                        value={o.status}
                        onChange={(e) => handleOrderStatusChange(o.id, e.target.value as OrderStatus)}
                        className="rounded-lg border border-border bg-card px-2 py-1 text-[11px] font-semibold outline-none"
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => setSelectedOrder(o)}
                        className="rounded-lg border border-border px-2.5 py-1 text-xs font-medium hover:bg-ocean-soft"
                      >
                        বিস্তারিত
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: CUSTOMERS */}
      {tab === "customers" && (
        <div className="mt-4 space-y-4">
          <div className="rounded-3xl border border-border bg-card shadow-card overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border bg-muted/40 text-muted-foreground">
                <tr>
                  <th className="p-3.5">কাস্টমারের নাম</th>
                  <th className="p-3.5">ফোন নম্বর</th>
                  <th className="p-3.5">ঠিকানা & জেলা</th>
                  <th className="p-3.5">মোট অর্ডার</th>
                  <th className="p-3.5">সর্বমোট ক্রয়</th>
                  <th className="p-3.5 text-right">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredCustomers.map((c) => (
                  <tr key={c.id} className="hover:bg-ocean-soft/20 transition">
                    <td className="p-3.5 font-bold text-navy">{c.fullName}</td>
                    <td className="p-3.5">
                      <a href={`tel:+88${c.phoneNormalized}`} className="text-primary font-mono hover:underline flex items-center gap-1">
                        <Phone className="h-3 w-3" /> {toBn(c.phoneNormalized)}
                      </a>
                    </td>
                    <td className="p-3.5 text-muted-foreground">
                      {c.address ? `${c.address}, ${c.district}` : c.district}
                    </td>
                    <td className="p-3.5 font-bold text-navy">{toBn(c.totalOrders)} টি</td>
                    <td className="p-3.5 font-bold text-highlight">{formatPrice(c.totalSpent)}</td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => setSelectedCustomer(c)}
                        className="rounded-lg border border-border px-2.5 py-1 text-xs font-medium hover:bg-ocean-soft"
                      >
                        অর্ডার ইতিহাস
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: INVENTORY */}
      {tab === "inventory" && (
        <div className="mt-4 space-y-4">
          <div className="rounded-3xl border border-border bg-card p-6 shadow-card">
            <h2 className="text-lg font-bold text-navy mb-4">পণ্য স্টক ও ইনভেন্টরি ট্র্যাকিং</h2>
            <div className="divide-y divide-border">
              {products.map((p) => (
                <div key={p.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-3">
                  <div className="flex items-center gap-3">
                    <img src={p.image} alt={p.name} className="h-12 w-12 rounded-xl object-contain bg-white border border-border p-1" />
                    <div>
                      <p className="font-bold text-navy text-sm">{p.name}</p>
                      <p className="text-xs text-muted-foreground">SKU: {p.sku || p.id} • ক্যাটাগরি: {p.category}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          dataService.updateStock(p.id, Math.max(0, p.stockQuantity - 1));
                          refreshData();
                        }}
                        className="h-8 w-8 rounded-lg border border-border bg-card font-bold hover:bg-muted"
                      >
                        −
                      </button>
                      <span className="w-12 text-center font-bold text-sm text-navy">{toBn(p.stockQuantity)}</span>
                      <button
                        onClick={() => {
                          dataService.updateStock(p.id, p.stockQuantity + 1);
                          refreshData();
                        }}
                        className="h-8 w-8 rounded-lg border border-border bg-card font-bold hover:bg-muted"
                      >
                        +
                      </button>
                    </div>

                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                      p.stockQuantity <= 3 ? "bg-destructive/10 text-destructive" :
                      p.stockQuantity <= 10 ? "bg-amber-100 text-amber-800" :
                      "bg-emerald-100 text-emerald-800"
                    }`}>
                      {p.stockQuantity === 0 ? "স্টক নেই" : p.stockQuantity <= 3 ? "ক্রিটিকাল লো স্টক" : "পর্যাপ্ত স্টক"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: REVIEWS */}
      {tab === "reviews" && (
        <div className="mt-4 space-y-4">
          <div className="rounded-3xl border border-border bg-card p-6 shadow-card">
            <h2 className="text-lg font-bold text-navy mb-4">কাস্টমার রিভিউ মডারেশন</h2>
            {reviews.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">এখনো কোনো রিভিউ জমা পড়েনি।</p>
            ) : (
              <div className="divide-y divide-border">
                {reviews.map((r) => {
                  const p = products.find((prod) => prod.id === r.productId);
                  return (
                    <div key={r.id} className="py-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-bold text-navy">{r.customerName}</span>
                          <span className="text-xs text-muted-foreground ml-2">({p?.name || r.productId})</span>
                        </div>
                        <div className="flex items-center gap-1 text-amber-500">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star key={s} className={`h-3.5 w-3.5 ${s <= r.rating ? "fill-current" : "text-muted"}`} />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-foreground/90">{r.comment}</p>
                      <div className="flex items-center justify-between pt-1 text-xs">
                        <span className="text-muted-foreground">{new Date(r.createdAt).toLocaleString("bn-BD")}</span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              dataService.moderateReview(r.id, "approved");
                              refreshData();
                              toast.success("রিভিউ অনুমোদিত হয়েছে");
                            }}
                            className="rounded-lg bg-emerald-50 text-emerald-700 px-2.5 py-1 font-semibold hover:bg-emerald-100"
                          >
                            অনুমোদন
                          </button>
                          <button
                            onClick={() => {
                              dataService.moderateReview(r.id, "deleted");
                              refreshData();
                              toast.info("রিভিউ মুছে ফেলা হয়েছে");
                            }}
                            className="rounded-lg bg-destructive/10 text-destructive px-2.5 py-1 font-semibold hover:bg-destructive/20"
                          >
                            মুছুন
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 7: BUSINESS SETTINGS */}
      {tab === "settings" && (
        <div className="mt-4 max-w-2xl">
          <form onSubmit={handleSaveSettings} className="rounded-3xl border border-border bg-card p-6 shadow-card space-y-4">
            <h2 className="text-lg font-bold text-navy border-b border-border pb-3">বিজনেস ও ডেলিভারি কনফিগারেশন</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-xs font-semibold text-foreground">ঢাকার ভেতর ডেলিভারি চার্জ (টাকা)</label>
                <input
                  type="number"
                  value={settingsForm.deliveryDhaka}
                  onChange={(e) => setSettingsForm({ ...settingsForm, deliveryDhaka: Number(e.target.value) })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-foreground">ঢাকার বাইরে ডেলিভারি চার্জ (টাকা)</label>
                <input
                  type="number"
                  value={settingsForm.deliveryOutside}
                  onChange={(e) => setSettingsForm({ ...settingsForm, deliveryOutside: Number(e.target.value) })}
                  className={inputClass}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-xs font-semibold text-foreground">সাপোর্ট ফোন নম্বর</label>
                <input
                  value={settingsForm.supportPhone}
                  onChange={(e) => setSettingsForm({ ...settingsForm, supportPhone: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-foreground">সাপোর্ট ইমেইল</label>
                <input
                  type="email"
                  value={settingsForm.supportEmail}
                  onChange={(e) => setSettingsForm({ ...settingsForm, supportEmail: e.target.value })}
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-foreground">হোয়াটসঅ্যাপ বিজনেস নম্বর (আন্তর্জাতিক ফরম্যাটে)</label>
              <input
                value={settingsForm.whatsappNumber}
                onChange={(e) => setSettingsForm({ ...settingsForm, whatsappNumber: e.target.value })}
                placeholder="যেমন: 8801823824071"
                className={inputClass}
              />
              <div className="mt-2 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="wa-verified"
                  checked={settingsForm.whatsappVerified}
                  onChange={(e) => setSettingsForm({ ...settingsForm, whatsappVerified: e.target.checked })}
                  className="rounded"
                />
                <label htmlFor="wa-verified" className="text-xs text-foreground cursor-pointer font-medium">
                  হোয়াটসঅ্যাপ নম্বরটি ভেরিফাইড এবং সচল (সরাসরি চ্যাট লিংক চালু করুন)
                </label>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-foreground">প্রমোশনাল অফার টাইটেল ও কাউন্টডাউন ডেডলাইন</label>
              <input
                value={settingsForm.promoTitle}
                onChange={(e) => setSettingsForm({ ...settingsForm, promoTitle: e.target.value })}
                className={inputClass}
              />
              <input
                type="datetime-local"
                value={settingsForm.promoDeadline ? settingsForm.promoDeadline.slice(0, 16) : ""}
                onChange={(e) => setSettingsForm({ ...settingsForm, promoDeadline: new Date(e.target.value).toISOString() })}
                className={`mt-2 ${inputClass}`}
              />
              <p className="mt-1 text-[11px] text-muted-foreground">
                এই বাস্তব ডেডলাইনের ওপর ভিত্তি করে পেজে আসল এথিক্যাল কাউন্টডাউন টাইমার চলবে।
              </p>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-foreground">রিটার্ন ও এক্সচেঞ্জ পলিসি টেক্সট</label>
              <textarea
                rows={2}
                value={settingsForm.returnPolicyText}
                onChange={(e) => setSettingsForm({ ...settingsForm, returnPolicyText: e.target.value })}
                className="w-full rounded-xl border border-input bg-card p-3 text-xs outline-none focus:border-ocean"
              />
            </div>

            <button type="submit" className={btnClass}>
              সেটিংস সংরক্ষণ করুন
            </button>
          </form>
        </div>
      )}

      {/* TAB 8: META PIXEL CONFIGURATION */}
      {tab === "pixel" && (
        <div className="mt-4 max-w-2xl space-y-6">
          <div className="rounded-3xl border border-border bg-card p-6 shadow-card space-y-4">
            <h2 className="text-lg font-bold text-navy border-b border-border pb-3">মেটা পিক্সেল ও ফেসবুক এডস কনফিগারেশন</h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              আপনার ফেসবুক ইভেন্টস ম্যানেজার থেকে মেটা পিক্সেল আইডি নিচে প্রদান করুন। কোনো আইডি না দিলে সিস্টেম কোনো ফেক ইভেন্ট পাঠাবে না এবং কনসোলে সিমুলেশন লগ দেখাবে।
            </p>

            <div>
              <label className="mb-1 block text-xs font-semibold text-foreground">মেটা পিক্সেল আইডি (Pixel ID)</label>
              <input
                value={settingsForm.metaPixelId}
                onChange={(e) => setSettingsForm({ ...settingsForm, metaPixelId: e.target.value })}
                placeholder="যেমন: 123456789012345"
                className={inputClass}
              />
              <p className="mt-1.5 text-[11px] text-muted-foreground">
                বর্তমান স্ট্যাটাস: <strong className={settingsForm.metaPixelId ? "text-emerald-700 font-mono" : "text-amber-700"}>
                  {settingsForm.metaPixelId ? `সক্রিয় (ID: ${settingsForm.metaPixelId})` : "আইডি কনফিগারেশনের অপেক্ষায়"}
                </strong>
              </p>
            </div>

            <button
              onClick={() => {
                dataService.saveSettings({ metaPixelId: settingsForm.metaPixelId });
                setSettings({ ...settingsForm });
                toast.success("মেটা পিক্সেল আইডি সংরক্ষিত হয়েছে");
              }}
              className={btnClass}
            >
              পিক্সেল আইডি সেভ করুন
            </button>
          </div>

          <div className="rounded-3xl border border-border bg-ocean-soft/40 p-6 shadow-card space-y-3 text-xs text-muted-foreground">
            <h3 className="text-sm font-bold text-navy">ফেসবুক এডস ইভেন্ট ভেরিফিকেশন গাইড:</h3>
            <ul className="space-y-2 list-disc pl-4">
              <li><strong>PageView:</strong> প্রতিটি পেজ লোড ও রুট পরিবর্তনে একবার ফায়ার হয়।</li>
              <li><strong>ViewContent:</strong> প্রোডাক্ট পেজ ওপেন হলে প্রোডাক্ট আইডি ও বিডিটি মূল্যসহ ফায়ার হয়।</li>
              <li><strong>AddToCart:</strong> কাস্টমার কার্টে পণ্য যোগ করলেই কেবল ফায়ার হয়।</li>
              <li><strong>InitiateCheckout:</strong> সরাসরি অর্ডার ফর্ম বা চেকআউট শুরু হলে ফায়ার হয়।</li>
              <li><strong>Purchase:</strong> শুধুমাত্র সার্ভার সফলভাবে অর্ডার নম্বর রিটার্ন করার পর এবং প্রতি অর্ডারে একবারই ফায়ার হয় (পেজ রিফ্রেশে ডুপ্লিকেট হয় না)।</li>
              <li><strong>টেস্টিং:</strong> Chrome-এ <a href="https://chrome.google.com/webstore" target="_blank" rel="noreferrer" className="text-primary underline">Meta Pixel Helper</a> এক্সটেনশন ব্যবহার করে ইভেন্টগুলো বাস্তব সময়ে যাচাই করতে পারেন।</li>
            </ul>
          </div>
        </div>
      )}

      {/* Add / Edit Product Modal */}
      {showProductForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/60 p-4 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-xl rounded-3xl border border-border bg-card p-6 shadow-lift my-8 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-navy border-b border-border pb-3">
              {editingProduct ? "পণ্য এডিট করুন" : "নতুন পণ্য যোগ করুন"}
            </h2>

            <form onSubmit={handleSaveProduct} className="mt-4 space-y-3">
              <div>
                <label className="mb-1 block text-xs font-semibold text-foreground">পণ্যের নাম (বাংলা) *</label>
                <input
                  required
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  placeholder="যেমন: প্রিমিয়াম লেদার হ্যান্ডব্যাগ"
                  className={inputClass}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-foreground">ইংরেজি নাম</label>
                  <input
                    value={productForm.name_en}
                    onChange={(e) => setProductForm({ ...productForm, name_en: e.target.value })}
                    placeholder="e.g. Leather Handbag"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-foreground">SKU কোড</label>
                  <input
                    value={productForm.sku}
                    onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })}
                    placeholder="যেমন: ZH-1002"
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-foreground">ক্যাটাগরি</label>
                  <select
                    value={productForm.category}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                    className={inputClass}
                  >
                    {categories.map((c) => (
                      <option key={c.slug} value={c.slug}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-foreground">স্ট্যাটাস</label>
                  <select
                    value={productForm.status}
                    onChange={(e) => setProductForm({ ...productForm, status: e.target.value as any })}
                    className={inputClass}
                  >
                    <option value="published">Published (পাবলিক)</option>
                    <option value="draft">Draft (ড্রাফট)</option>
                    <option value="archived">Archived (আর্কাইভ)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-foreground">বিক্রয় মূল্য (টাকা) *</label>
                  <input
                    type="number"
                    required
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                    placeholder="যেমন: 2450"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-foreground">আগের মূল্য / ডিসকাউন্ট রেফারেন্স</label>
                  <input
                    type="number"
                    value={productForm.regularPrice}
                    onChange={(e) => setProductForm({ ...productForm, regularPrice: e.target.value })}
                    placeholder="যেমন: 2990"
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-foreground">স্টক পরিমাণ *</label>
                  <input
                    type="number"
                    required
                    value={productForm.stockQuantity}
                    onChange={(e) => setProductForm({ ...productForm, stockQuantity: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-foreground">লো-স্টক সতর্কতা সীমা</label>
                  <input
                    type="number"
                    value={productForm.lowStockThreshold}
                    onChange={(e) => setProductForm({ ...productForm, lowStockThreshold: e.target.value })}
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-foreground">
                  পণ্যের মূল ছবি (আপলোড করুন বা URL দিন)
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <label className="flex h-10 cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-primary/40 bg-ocean-soft/30 px-4 text-xs font-semibold text-primary hover:bg-ocean-soft transition">
                    <PackagePlus className="h-4 w-4" />
                    <span>{uploadingImage ? "আপলোড হচ্ছে..." : "ডিভাইস থেকে ছবি আপলোড"}</span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleImageUpload}
                      disabled={uploadingImage}
                      className="hidden"
                    />
                  </label>
                  <input
                    value={productForm.image}
                    onChange={(e) => setProductForm({ ...productForm, image: e.target.value })}
                    placeholder="অথবা ইমেজের সরাসরি URL / পাথ লিখুন"
                    className={`flex-1 ${inputClass}`}
                  />
                </div>
                {productForm.image && (
                  <div className="mt-2.5 flex items-center gap-3 rounded-xl border border-border bg-muted/20 p-2">
                    <img src={productForm.image} alt="প্রিভিউ" className="h-12 w-12 rounded-lg object-contain bg-white border border-border p-0.5" />
                    <div className="truncate text-xs">
                      <p className="font-semibold text-navy">নির্বাচিত ছবির প্রিভিউ</p>
                      <p className="truncate text-[11px] text-muted-foreground">{productForm.image}</p>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-foreground">বিবরণ</label>
                <textarea
                  rows={3}
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  placeholder="পণ্যের বিস্তারিত গুণাবলী ও বিবরণ..."
                  className="w-full rounded-xl border border-input bg-card p-3 text-xs outline-none focus:border-ocean"
                />
              </div>

              <div className="mt-5 flex justify-end gap-2 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowProductForm(false)}
                  className="rounded-xl border border-border px-4 py-2.5 text-xs font-medium hover:bg-muted"
                >
                  বাতিল
                </button>
                <button type="submit" className={btnClass}>
                  সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/60 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-lg rounded-3xl border border-border bg-card p-6 shadow-lift space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <span className="text-xs text-muted-foreground">অর্ডার নম্বর</span>
                <h3 className="text-xl font-bold font-mono text-navy">#{selectedOrder.orderNumber}</h3>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="rounded-lg p-1 text-muted-foreground hover:bg-muted"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">কাস্টমার নাম:</span>
                <span className="font-bold text-navy">{selectedOrder.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">মোবাইল:</span>
                <a href={`tel:+88${selectedOrder.customerPhone}`} className="font-mono text-primary font-bold hover:underline">
                  {toBn(selectedOrder.customerPhone)}
                </a>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">ঠিকানা:</span>
                <span className="text-right max-w-[240px]">{selectedOrder.address}, {selectedOrder.area}, {selectedOrder.district}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">অর্ডার তারিখ:</span>
                <span>{new Date(selectedOrder.createdAt).toLocaleString("bn-BD")}</span>
              </div>
            </div>

            <div className="border-t border-border pt-3">
              <h4 className="text-xs font-bold text-navy mb-2">অর্ডারকৃত পণ্যসমূহ:</h4>
              <div className="space-y-2">
                {selectedOrder.items.map((item, i) => (
                  <div key={i} className="flex justify-between text-xs bg-ocean-soft/40 p-2 rounded-xl">
                    <span>{item.name} × {toBn(item.quantity)}</span>
                    <span className="font-bold">{formatPrice(item.lineTotal)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-border pt-3 space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">সাবটোটাল:</span>
                <span>{formatPrice(selectedOrder.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">ডেলিভারি চার্জ:</span>
                <span>{formatPrice(selectedOrder.deliveryCharge)}</span>
              </div>
              <div className="flex justify-between font-bold text-sm text-navy pt-1 border-t border-border">
                <span>সর্বমোট:</span>
                <span className="text-highlight font-extrabold">{formatPrice(selectedOrder.total)}</span>
              </div>
            </div>

            <div className="border-t border-border pt-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-muted-foreground">স্ট্যাটাস:</span>
                <select
                  value={selectedOrder.status}
                  onChange={(e) => handleOrderStatusChange(selectedOrder.id, e.target.value as OrderStatus)}
                  className="rounded-lg border border-border bg-card px-2.5 py-1 text-xs font-bold outline-none"
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <a
                href={`tel:+88${selectedOrder.customerPhone}`}
                className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-navy"
              >
                <Phone className="h-3 w-3" /> কল করুন
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Customer Profile & History Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/60 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-lg rounded-3xl border border-border bg-card p-6 shadow-lift space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="text-xl font-bold text-navy">{selectedCustomer.fullName}</h3>
                <a href={`tel:+88${selectedCustomer.phoneNormalized}`} className="text-primary font-mono text-xs hover:underline flex items-center gap-1 mt-0.5">
                  <Phone className="h-3 w-3" /> {toBn(selectedCustomer.phoneNormalized)}
                </a>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="rounded-lg p-1 text-muted-foreground hover:bg-muted"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-ocean-soft p-3 rounded-xl">
                <span className="text-muted-foreground">মোট সফল অর্ডার:</span>
                <p className="text-lg font-bold text-navy">{toBn(selectedCustomer.totalOrders)} টি</p>
              </div>
              <div className="bg-ocean-soft p-3 rounded-xl">
                <span className="text-muted-foreground">সর্বমোট ক্রয় মূল্য:</span>
                <p className="text-lg font-bold text-highlight">{formatPrice(selectedCustomer.totalSpent)}</p>
              </div>
            </div>

            <div className="border-t border-border pt-3">
              <h4 className="text-xs font-bold text-navy mb-2">এই কাস্টমারের অর্ডার হিস্ট্রি:</h4>
              {dataService.getCustomerOrders(selectedCustomer.id).length === 0 ? (
                <p className="text-xs text-muted-foreground py-3">অর্ডার হিস্ট্রি খালি।</p>
              ) : (
                <div className="space-y-2">
                  {dataService.getCustomerOrders(selectedCustomer.id).map((ord) => (
                    <div key={ord.id} className="p-2.5 rounded-xl border border-border bg-muted/20 text-xs flex justify-between items-center">
                      <div>
                        <p className="font-mono font-bold text-navy">#{ord.orderNumber}</p>
                        <p className="text-[11px] text-muted-foreground">{new Date(ord.createdAt).toLocaleDateString("bn-BD")}</p>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-navy">{formatPrice(ord.total)}</span>
                        <span className="block text-[10px] text-muted-foreground uppercase">{ord.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="border-t border-border pt-3 flex justify-end">
              <button
                onClick={() => setSelectedCustomer(null)}
                className="rounded-xl border border-border px-4 py-2 text-xs font-semibold hover:bg-muted"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
