# Zhinuk implementation status (ZIP handover)

এই পরিবর্তনগুলো existing project-এর ওপর additive patch; homepage, Blue Ocean design ও original static demo catalog মুছে ফেলা হয়নি।

## এই patch-এ করা হয়েছে
- আটটি original product image `public/products/`-এ কপি করা হয়েছে, যাতে SQL seed-এর `/products/...` URL কাজ করতে পারে।
- Supabase migration-এ products, customers, orders, order items, RLS, admin role check, storage bucket এবং server-side COD order RPC রয়েছে।
- Order RPC-তে Bangladesh phone normalization, server-side price/stock validation, duplicate product-line rejection এবং delivery-zone/charge matching শক্ত করা হয়েছে।
- Admin page-এ product CRUD/status controls, main-image upload/preview (JPG/PNG/WebP, 5 MB), order status update এবং admin-only CSV export আছে।
- সম্ভাব্য secret-যুক্ত `.env` ZIP deliverable থেকে বাদ দেওয়া হয়েছে; `.env.example`-এ placeholder values আছে।

## এখনো বাকি / production-ready বলে দাবি করা হচ্ছে না
- Public homepage/shop/product detail এখনও static `src/lib/catalog.ts` থেকে product নেয়; admin-created products public storefront-এ auto-sync হয় না।
- Multi-image gallery/reordering, complete customer profile/order drill-down, audit log এবং MFA enforcement অসম্পূর্ণ।
- Real Supabase project-এ migration চালানো, administrator account grant করা, storage upload, checkout, RLS/privacy এবং order lifecycle end-to-end পরীক্ষা করা হয়নি।
- Meta Pixel integration/verification করা হয়নি।

## Deployment-এর আগে
1. `.env.example`-এর placeholder-গুলো Lovable Cloud/deployment secret settings-এ প্রকৃত Supabase URL ও publishable key দিয়ে configure করুন; secrets source control-এ দেবেন না।
2. Supabase-এ backup নিয়ে staging-এ migration review ও apply করুন।
3. Authentication user তৈরি করে `docs/ADMIN-SETUP-BN.md`-এর নির্দেশে নির্দিষ্ট verified account-কে `app_metadata.role=admin` দিন। Business contact email-কে স্বয়ংক্রিয় admin account ধরা হয়নি।
4. `/admin` login, image upload, product changes, COD order, stock safety, customer privacy ও CSV export বাস্তবে পরীক্ষা না করে live traffic-এ ব্যবহার করবেন না।
