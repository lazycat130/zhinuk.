// Static catalog shaped like WooCommerce REST products, so it can be swapped for an API later.
import phone from "@/assets/p-phone.jpg";
import watch from "@/assets/p-watch.jpg";
import headphones from "@/assets/p-headphones.jpg";
import perfume from "@/assets/p-perfume.jpg";
import shoes from "@/assets/p-shoes.jpg";
import handbag from "@/assets/p-handbag.jpg";
import backpack from "@/assets/p-backpack.jpg";
import skincare from "@/assets/p-skincare.jpg";

export type Category = { slug: string; name: string; image: string };
export type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  regularPrice?: number;
  rating: number;
  reviews: string;
  image: string;
  description: string;
};

export const categories: Category[] = [
  { slug: "fashion", name: "ফ্যাশন", image: handbag },
  { slug: "electronics", name: "ইলেকট্রনিক্স", image: phone },
  { slug: "beauty", name: "বিউটি", image: skincare },
  { slug: "watch", name: "ঘড়ি", image: watch },
  { slug: "bag", name: "ব্যাগ", image: backpack },
  { slug: "shoes", name: "জুতা", image: shoes },
  { slug: "gadget", name: "গ্যাজেট", image: headphones },
  { slug: "lifestyle", name: "লাইফস্টাইল", image: perfume },
];

export const products: Product[] = [
  { id: "smartphone-128", name: "স্মার্টফোন (128GB)", category: "electronics", price: 89999, regularPrice: 99999, rating: 4.8, reviews: "12k", image: phone, description: "উজ্জ্বল ডিসপ্লে, ডুয়াল ক্যামেরা ও সারাদিনের ব্যাটারি — প্রতিদিনের সঙ্গী।" },
  { id: "wireless-headphones", name: "ওয়্যারলেস হেডফোন", category: "gadget", price: 4999, regularPrice: 5699, rating: 4.7, reviews: "8.5k", image: headphones, description: "নয়েজ ক্যান্সেলেশন ও আরামদায়ক কুশন, ৩০ ঘণ্টা ব্যাটারি।" },
  { id: "running-shoes", name: "রানিং শু", category: "shoes", price: 5990, regularPrice: 7990, rating: 4.6, reviews: "7.4k", image: shoes, description: "হালকা ও আরামদায়ক, দৌড় ও দৈনন্দিন ব্যবহারের জন্য উপযুক্ত।" },
  { id: "mens-backpack", name: "মেন'স ব্যাকপ্যাক", category: "bag", price: 1299, regularPrice: 1699, rating: 4.5, reviews: "6.0k", image: backpack, description: "ল্যাপটপ কম্পার্টমেন্টসহ টেকসই ও পানিরোধী ব্যাকপ্যাক।" },
  { id: "skincare-set", name: "স্কিনকেয়ার সেট", category: "beauty", price: 1850, regularPrice: 2199, rating: 4.7, reviews: "5.2k", image: skincare, description: "সিরাম ও ক্রিমের সম্পূর্ণ সেট — উজ্জ্বল ও সতেজ ত্বকের জন্য।" },
  { id: "smart-watch", name: "স্মার্ট ওয়াচ", category: "watch", price: 3499, regularPrice: 4499, rating: 4.6, reviews: "9.9k", image: watch, description: "হার্ট রেট, স্টেপ ট্র্যাকিং ও নোটিফিকেশন — এক কব্জিতে।" },
  { id: "leather-handbag", name: "প্রিমিয়াম লেদার হ্যান্ডব্যাগ", category: "fashion", price: 3250, regularPrice: 3990, rating: 4.8, reviews: "3.1k", image: handbag, description: "খাঁটি লেদারে তৈরি মার্জিত হ্যান্ডব্যাগ, গোল্ডেন হার্ডওয়্যার।" },
  { id: "premium-perfume", name: "প্রিমিয়াম পারফিউম", category: "lifestyle", price: 2450, rating: 4.9, reviews: "2.4k", image: perfume, description: "দীর্ঘস্থায়ী ফুলেল সুবাস, ১০০ মিলি।" },
];

let dynamicProductGetter: ((id: string) => Product | undefined) | null = null;
let dynamicAllProductsGetter: (() => Product[]) | null = null;

export const setDynamicProductGetters = (
  single: (id: string) => Product | undefined,
  all: () => Product[]
) => {
  dynamicProductGetter = single;
  dynamicAllProductsGetter = all;
};

export const getProduct = (id: string): Product | undefined => {
  if (dynamicProductGetter) {
    const found = dynamicProductGetter(id);
    if (found) return found;
  }
  return products.find((p) => p.id === id);
};

export const getProducts = (): Product[] => {
  if (dynamicAllProductsGetter) {
    return dynamicAllProductsGetter();
  }
  return products;
};

export const getCategory = (slug: string) => categories.find((c) => c.slug === slug);

const bn = "০১২৩৪৫৬৭৮৯";
export const toBn = (s: string | number) => String(s).replace(/\d/g, (d) => bn[+d] ?? d);
export const formatPrice = (n: number) => "৳ " + toBn(n.toLocaleString("en-IN"));
export const discountPct = (p: Product) =>
  p.regularPrice ? Math.round((1 - p.price / p.regularPrice) * 100) : 0;

export const DELIVERY_DHAKA = 80;
export const DELIVERY_OUTSIDE = 120;
