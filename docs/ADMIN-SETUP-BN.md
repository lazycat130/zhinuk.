# Zhinuk Admin & Commerce Setup (বাংলা)

## গুরুত্বপূর্ণ
এই পরিবর্তনগুলো বিদ্যমান project-কে extend করে। Production Supabase-এ migration চালানোর আগে backup নিন এবং staging-এ পরীক্ষা করুন। এই ZIP-এ থাকা `.env` সরিয়ে `.env.example` রাখা হয়েছে; deployment secrets Lovable Cloud-এর environment settings-এ configure করুন।

## 1. Supabase migration
1. Supabase Dashboard → SQL Editor খুলুন।
2. `supabase/migrations/202610240001_zhinuk_commerce.sql`-এর SQL backup/staging review করার পর চালান।
3. Migration বিদ্যমান product ID-তে `ON CONFLICT DO NOTHING` ব্যবহার করে; বিদ্যমান product overwrite করে না। আটটি current demo item শুধু missing ID থাকলে seed হবে।
4. Public order RPC product price ও stock server-side database থেকে নেয়। Customer/order table-এ public direct read policy নেই।

## 2. Administrator তৈরি
1. Supabase Authentication → Users থেকে নির্দিষ্ট administrator-এর user account তৈরি করুন।
2. SQL Editor-এ নিচের query-তে নিজের admin login email বসিয়ে শুধুমাত্র সেই user-কে admin role দিন:

```sql
update auth.users
set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || '{"role":"admin"}'::jsonb
where lower(email) = lower('YOUR-ADMIN-LOGIN-EMAIL');
```

3. Query-র ফলাফল/affected row যাচাই করুন। Admin access `app_metadata.role` থেকে যাচাই হয়; user-editable `user_metadata` ব্যবহার করা হয় না। Admin account-এর জন্য শক্তিশালী unique password ও MFA ব্যবহার করুন। Service-role key কখনো browser code-এ দেবেন না।
4. Deploy/preview-এর পর `/admin` খুলে লগইন করুন।

## 3. পণ্য
Admin → পণ্য → নতুন পণ্য। Status `published` করলে public database query-তে দৃশ্যমান হবে। Product images-এর জন্য `zhinuk-products` public bucket migration-এ তৈরি হয়; upload UI এখনো সংযুক্ত করা হয়নি, তাই আপাতত publicly accessible image URL দিন। Existing আটটি demo image `/products/`-এ কপি করা হয়েছে।

## 4. Orders & Customers
Checkout `place_zhinuk_order` RPC কল করে। RPC server-side price, published status, stock ও total যাচাই করে; customer phone-ভিত্তিক record update করে এবং order/order items আলাদা করে সংরক্ষণ করে। Admin order status update করতে পারে।

## 5. পরিচিত সীমাবদ্ধতা—পরবর্তী ধাপ আবশ্যক
- Admin-এ file picker দিয়ে image upload/reorder এখনো করা হয়নি; image URL field আছে।
- CSV export, customer profile/order drill-down, audit log ও MFA enforcement এখনো UI-তে নেই।
- Public homepage/shop এখনো original static `src/lib/catalog.ts` ব্যবহার করে। তাই Admin-এ নতুন product তৈরি করলেই homepage-এ স্বয়ংক্রিয়ভাবে আসবে না—public catalog-কে database query-তে migrate করা পরবর্তী কাজ। Existing demo catalog নষ্ট করা হয়নি।
- `bkash`/`nagad` payment option শুধু payment method/status রেকর্ড করে; gateway integration নয়। COD ব্যবহার না করলে payment gateway সংযুক্ত না হওয়া পর্যন্ত online payment সংগ্রহ করা যাবে না।
- Supabase migration ও browser/build tests এই environment থেকে production project-এ চালানো হয়নি।
