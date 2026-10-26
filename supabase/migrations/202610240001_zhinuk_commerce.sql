-- Zhinuk commerce foundation. Review in staging before applying to production.
create extension if not exists pgcrypto;

create or replace function public.is_zhinuk_admin()
returns boolean language sql stable security definer set search_path = public
as $$ select coalesce((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin', false); $$;
revoke all on function public.is_zhinuk_admin() from public;
grant execute on function public.is_zhinuk_admin() to authenticated;

create table if not exists public.products (
  id text primary key,
  name text not null,
  name_en text,
  sku text unique,
  category text not null default 'lifestyle',
  subcategory text,
  price numeric(12,2) not null check (price >= 0),
  regular_price numeric(12,2) check (regular_price is null or regular_price >= price),
  rating numeric(2,1) not null default 0 check (rating between 0 and 5),
  review_count integer not null default 0 check (review_count >= 0),
  image_url text not null default '',
  gallery_urls text[] not null default '{}',
  description text not null default '',
  details text,
  specifications jsonb not null default '{}'::jsonb,
  stock_quantity integer not null default 0 check (stock_quantity >= 0),
  low_stock_threshold integer not null default 5 check (low_stock_threshold >= 0),
  variants jsonb not null default '[]'::jsonb,
  status text not null default 'draft' check (status in ('draft','published','archived')),
  is_demo boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  phone_normalized text not null unique,
  email text,
  address text not null default '',
  district text not null default '',
  area text not null default '',
  delivery_zone text not null default '',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique default ('ZH-' || upper(substr(replace(gen_random_uuid()::text,'-',''),1,10))),
  customer_id uuid not null references public.customers(id) on delete restrict,
  status text not null default 'pending' check (status in ('pending','confirmed','processing','shipped','delivered','cancelled')),
  payment_method text not null default 'cod' check (payment_method in ('cod','bkash','nagad')),
  payment_status text not null default 'unpaid' check (payment_status in ('unpaid','pending','paid','refunded')),
  subtotal numeric(12,2) not null check (subtotal >= 0),
  discount numeric(12,2) not null default 0 check (discount >= 0),
  delivery_charge numeric(12,2) not null check (delivery_charge >= 0),
  total numeric(12,2) not null check (total >= 0),
  address_snapshot jsonb not null default '{}'::jsonb,
  customer_note text,
  idempotency_key text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete restrict,
  product_id text references public.products(id) on delete set null,
  product_name text not null,
  variant jsonb not null default '{}'::jsonb,
  quantity integer not null check (quantity > 0),
  unit_price numeric(12,2) not null check (unit_price >= 0),
  line_total numeric(12,2) not null check (line_total >= 0)
);

create index if not exists products_public_listing_idx on public.products(status, category);
create index if not exists orders_customer_idx on public.orders(customer_id, created_at desc);
create index if not exists orders_status_idx on public.orders(status, created_at desc);
create index if not exists order_items_order_idx on public.order_items(order_id);

alter table public.products enable row level security;
alter table public.customers enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

drop policy if exists "Public can view published products" on public.products;
create policy "Public can view published products" on public.products for select using (status = 'published');
drop policy if exists "Admins manage products" on public.products;
create policy "Admins manage products" on public.products for all to authenticated using (public.is_zhinuk_admin()) with check (public.is_zhinuk_admin());
drop policy if exists "Admins manage customers" on public.customers;
create policy "Admins manage customers" on public.customers for all to authenticated using (public.is_zhinuk_admin()) with check (public.is_zhinuk_admin());
drop policy if exists "Admins manage orders" on public.orders;
create policy "Admins manage orders" on public.orders for all to authenticated using (public.is_zhinuk_admin()) with check (public.is_zhinuk_admin());
drop policy if exists "Admins manage order items" on public.order_items;
create policy "Admins manage order items" on public.order_items for all to authenticated using (public.is_zhinuk_admin()) with check (public.is_zhinuk_admin());

-- Seed the existing demo catalog only when an ID is absent. These are clearly marked as demo data.
insert into public.products (id,name,category,price,regular_price,rating,review_count,image_url,description,stock_quantity,status,is_demo) values
('smartphone-128','স্মার্টফোন (128GB)','electronics',89999,99999,4.8,12000,'/products/p-phone.jpg','উজ্জ্বল ডিসপ্লে, ডুয়াল ক্যামেরা ও সারাদিনের ব্যাটারি — প্রতিদিনের সঙ্গী।',10,'published',true),
('wireless-headphones','ওয়্যারলেস হেডফোন','gadget',4999,5699,4.7,8500,'/products/p-headphones.jpg','নয়েজ ক্যান্সেলেশন ও আরামদায়ক কুশন, ৩০ ঘণ্টা ব্যাটারি।',15,'published',true),
('running-shoes','রানিং শু','shoes',5990,7990,4.6,7400,'/products/p-shoes.jpg','হালকা ও আরামদায়ক, দৌড় ও দৈনন্দিন ব্যবহারের জন্য উপযুক্ত।',12,'published',true),
('mens-backpack',E'মেন\'স ব্যাকপ্যাক','bag',1299,1699,4.5,6000,'/products/p-backpack.jpg','ল্যাপটপ কম্পার্টমেন্টসহ টেকসই ও পানিরোধী ব্যাকপ্যাক।',20,'published',true),
('skincare-set','স্কিনকেয়ার সেট','beauty',1850,2199,4.7,5200,'/products/p-skincare.jpg','সিরাম ও ক্রিমের সম্পূর্ণ সেট — উজ্জ্বল ও সতেজ ত্বকের জন্য।',18,'published',true),
('smart-watch','স্মার্ট ওয়াচ','watch',3499,4499,4.6,9900,'/products/p-watch.jpg','হার্ট রেট, স্টেপ ট্র্যাকিং ও নোটিফিকেশন — এক কব্জিতে।',14,'published',true),
('leather-handbag','প্রিমিয়াম লেদার হ্যান্ডব্যাগ','fashion',3250,3990,4.8,3100,'/products/p-handbag.jpg','খাঁটি লেদারে তৈরি মার্জিত হ্যান্ডব্যাগ, গোল্ডেন হার্ডওয়্যার।',9,'published',true),
('premium-perfume','প্রিমিয়াম পারফিউম','lifestyle',2450,null,4.9,2400,'/products/p-perfume.jpg','দীর্ঘস্থায়ী ফুলেল সুবাস, ১০০ মিলি।',11,'published',true)
on conflict (id) do nothing;

-- Checkout RPC: prices and stock are looked up on the server; browser totals are ignored.
create or replace function public.place_zhinuk_order(
  p_name text, p_phone text, p_email text, p_address text, p_district text, p_area text,
  p_delivery_zone text, p_payment_method text, p_delivery_charge integer,
  p_items jsonb, p_idempotency_key text, p_customer_note text default null
) returns jsonb language plpgsql security definer set search_path = public
as $$
declare
  v_customer_id uuid; v_order_id uuid; v_order_number text; v_subtotal numeric(12,2) := 0;
  v_total numeric(12,2); v_delivery_charge numeric(12,2); v_item jsonb; v_product public.products%rowtype; v_qty integer; v_phone text;
begin
  if length(trim(coalesce(p_name,''))) < 2 then raise exception 'নাম সঠিকভাবে দিন'; end if;
  v_phone := regexp_replace(translate(coalesce(p_phone,''), '০১২৩৪৫৬৭৮৯', '0123456789'), '\D', '', 'g');
  if v_phone ~ '^8801[3-9][0-9]{8}$' then v_phone := substr(v_phone,3); end if;
  if v_phone !~ '^01[3-9][0-9]{8}$' then raise exception 'বাংলাদেশের সঠিক মোবাইল নম্বর দিন'; end if;
  if length(trim(coalesce(p_address,''))) < 5 then raise exception 'সম্পূর্ণ ডেলিভারি ঠিকানা দিন (কমপক্ষে ৫ অক্ষর)'; end if;
  if p_delivery_zone = 'dhaka' and coalesce(p_delivery_charge, -1) <> 80 then raise exception 'ঢাকার ডেলিভারি চার্জ সঠিক নয় (৳৮০ হতে হবে)'; end if;
  if p_delivery_zone = 'outside' and coalesce(p_delivery_charge, -1) <> 120 then raise exception 'ঢাকার বাইরের ডেলিভারি চার্জ সঠিক নয় (৳১২০ হতে হবে)'; end if;
  if coalesce(p_delivery_zone,'') not in ('dhaka','outside') then raise exception 'ডেলিভারি এলাকা নির্বাচন করুন (ঢাকা অথবা ঢাকার বাইরে)'; end if;
  if length(trim(coalesce(p_district,''))) = 0 or length(trim(coalesce(p_area,''))) = 0 then raise exception 'জেলা ও এলাকা সঠিকভাবে দিন'; end if;
  if p_payment_method <> 'cod' then raise exception 'অনলাইন পেমেন্ট গেটওয়ে এখনো চালু হয়নি; ক্যাশ অন ডেলিভারি (COD) নির্বাচন করুন'; end if;
  if p_idempotency_key is not null then
    select id, order_number, total, subtotal, delivery_charge into v_order_id, v_order_number, v_total, v_subtotal, v_delivery_charge from public.orders where idempotency_key=p_idempotency_key;
    if v_order_id is not null then return jsonb_build_object('order_id',v_order_id,'order_number',v_order_number,'total',v_total,'subtotal',v_subtotal,'delivery_charge',v_delivery_charge,'reused',true); end if;
  end if;
  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items)=0 then raise exception 'কার্ট খালি, কোনো পণ্য নির্বাচিত নেই'; end if;
  -- Reject duplicate product IDs instead of validating stock per line and accidentally overselling.
  if (select count(*) from jsonb_array_elements(p_items)) <>
     (select count(distinct value->>'product_id') from jsonb_array_elements(p_items)) then
    raise exception 'একই পণ্য কার্টে একাধিক লাইনে আছে; কার্ট রিফ্রেশ করে আবার চেষ্টা করুন';
  end if;
  -- Lock product rows in deterministic order to avoid overselling and deadlock between concurrent orders.
  for v_item in select value from jsonb_array_elements(p_items) order by (value->>'product_id') asc loop
    v_qty := (v_item->>'quantity')::integer;
    if v_qty < 1 or v_qty > 99 then raise exception 'পণ্যের পরিমাণ সঠিক নয় (১ থেকে ৯৯ এর মধ্যে হতে হবে)'; end if;
    select * into v_product from public.products where id = v_item->>'product_id' and status='published' for update;
    if not found then raise exception 'একটি পণ্য আর উপলব্ধ নেই'; end if;
    if v_product.stock_quantity < v_qty then raise exception 'পর্যাপ্ত স্টক নেই: % (মজুদ: %)', v_product.name, v_product.stock_quantity; end if;
    v_subtotal := v_subtotal + v_product.price * v_qty;
  end loop;
  insert into public.customers(full_name,phone_normalized,email,address,district,area,delivery_zone)
  values(trim(p_name),v_phone,nullif(trim(coalesce(p_email,'')),''),trim(p_address),trim(coalesce(p_district,'')),trim(coalesce(p_area,'')),trim(coalesce(p_delivery_zone,'')))
  on conflict(phone_normalized) do update set full_name=excluded.full_name,email=coalesce(excluded.email,customers.email),address=excluded.address,district=excluded.district,area=excluded.area,delivery_zone=excluded.delivery_zone,updated_at=now()
  returning id into v_customer_id;
  v_total := v_subtotal + p_delivery_charge;
  insert into public.orders(customer_id,payment_method,payment_status,subtotal,discount,delivery_charge,total,address_snapshot,customer_note,idempotency_key)
  values(v_customer_id,p_payment_method,case when p_payment_method='cod' then 'unpaid' else 'pending' end,v_subtotal,0,p_delivery_charge,v_total,jsonb_build_object('name',trim(p_name),'phone',v_phone,'email',p_email,'address',trim(p_address),'district',trim(p_district),'area',trim(p_area),'delivery_zone',p_delivery_zone),nullif(trim(coalesce(p_customer_note,'')),''),p_idempotency_key)
  returning id,order_number into v_order_id,v_order_number;
  for v_item in select value from jsonb_array_elements(p_items) order by (value->>'product_id') asc loop
    v_qty := (v_item->>'quantity')::integer;
    select * into v_product from public.products where id = v_item->>'product_id' and status='published' for update;
    insert into public.order_items(order_id,product_id,product_name,variant,quantity,unit_price,line_total)
    values(v_order_id,v_product.id,v_product.name,coalesce(v_item->'variant','{}'::jsonb),v_qty,v_product.price,v_product.price*v_qty);
    update public.products set stock_quantity=stock_quantity-v_qty,updated_at=now() where id=v_product.id;
  end loop;
  return jsonb_build_object('order_id',v_order_id,'order_number',v_order_number,'total',v_total,'subtotal',v_subtotal,'delivery_charge',p_delivery_charge,'reused',false);
end; $$;
revoke all on function public.place_zhinuk_order(text,text,text,text,text,text,text,text,integer,jsonb,text,text) from public, anon, authenticated;
grant execute on function public.place_zhinuk_order(text,text,text,text,text,text,text,text,integer,jsonb,text,text) to anon, authenticated;

-- Persistent product image storage. Uploading is restricted to authenticated admins.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('zhinuk-products','zhinuk-products',true,5242880,array['image/jpeg','image/png','image/webp'])
on conflict (id) do nothing;
drop policy if exists "Public can view Zhinuk product images" on storage.objects;
create policy "Public can view Zhinuk product images" on storage.objects for select using (bucket_id='zhinuk-products');
drop policy if exists "Admins upload Zhinuk product images" on storage.objects;
create policy "Admins upload Zhinuk product images" on storage.objects for insert to authenticated with check (bucket_id='zhinuk-products' and public.is_zhinuk_admin());
drop policy if exists "Admins update Zhinuk product images" on storage.objects;
create policy "Admins update Zhinuk product images" on storage.objects for update to authenticated using (bucket_id='zhinuk-products' and public.is_zhinuk_admin()) with check (bucket_id='zhinuk-products' and public.is_zhinuk_admin());
drop policy if exists "Admins delete Zhinuk product images" on storage.objects;
create policy "Admins delete Zhinuk product images" on storage.objects for delete to authenticated using (bucket_id='zhinuk-products' and public.is_zhinuk_admin());

-- Customer Product Reviews table with public read, verified submit, and admin moderation
-- Security fix: default status is strictly 'pending'; public users cannot submit pre-approved reviews.
create table if not exists public.product_reviews (
  id uuid primary key default gen_random_uuid(),
  product_id text references public.products(id) on delete cascade,
  customer_name text not null,
  customer_phone_masked text,
  rating integer not null check (rating between 1 and 5),
  comment text not null check (length(trim(comment)) >= 5),
  status text not null default 'pending' check (status in ('approved','pending','rejected')),
  created_at timestamptz not null default now()
);
alter table public.product_reviews enable row level security;
drop policy if exists "Public can view approved reviews" on public.product_reviews;
create policy "Public can view approved reviews" on public.product_reviews for select using (status = 'approved');
drop policy if exists "Public can insert reviews" on public.product_reviews;
create policy "Public can insert reviews" on public.product_reviews for insert to anon, authenticated
  with check (status = 'pending' and length(trim(customer_name)) >= 2 and length(trim(comment)) >= 5 and rating between 1 and 5);
drop policy if exists "Admins manage reviews" on public.product_reviews;
create policy "Admins manage reviews" on public.product_reviews for all to authenticated using (public.is_zhinuk_admin()) with check (public.is_zhinuk_admin());

-- Public safe order tracking RPC: returns timeline status publicly; full PII/items requires customer phone verification
create or replace function public.track_zhinuk_order(
  p_order_query text,
  p_phone_verification text default null
) returns jsonb language plpgsql security definer set search_path = public
as $$
declare
  v_order record;
  v_items jsonb;
  v_clean_query text;
  v_clean_phone text;
  v_stored_phone text;
  v_is_verified boolean := false;
begin
  v_clean_query := upper(trim(regexp_replace(coalesce(p_order_query,''),'^#','')));
  if v_clean_query = '' then return null; end if;

  select o.id, o.order_number, o.status, o.created_at, o.subtotal, o.delivery_charge, o.total,
         o.payment_method, o.payment_status, o.address_snapshot,
         c.full_name as cust_name, c.phone_normalized as cust_phone, c.district as cust_district, c.area as cust_area
  into v_order
  from public.orders o
  join public.customers c on c.id = o.customer_id
  where upper(o.order_number) = v_clean_query or o.id::text = lower(v_clean_query)
  limit 1;

  if v_order.id is null then
    return null;
  end if;

  -- Historical snapshot fidelity: use address_snapshot phone and address if present
  v_stored_phone := coalesce(nullif(v_order.address_snapshot->>'phone',''), v_order.cust_phone);

  -- Phone verification check (Bangladesh number normalization)
  if p_phone_verification is not null and trim(p_phone_verification) <> '' then
    v_clean_phone := regexp_replace(translate(coalesce(p_phone_verification,''), '০১২৩৪৫৬৭৮৯', '0123456789'), '\D', '', 'g');
    if v_clean_phone ~ '^8801[3-9][0-9]{8}$' then v_clean_phone := substr(v_clean_phone,3); end if;
    
    if v_clean_phone = v_stored_phone or
       (length(v_clean_phone) >= 4 and right(v_stored_phone, 4) = right(v_clean_phone, 4)) then
      v_is_verified := true;
    end if;
  end if;

  -- If not phone-verified: return minimal timeline progress without leaking customer PII or line items
  if not v_is_verified then
    return jsonb_build_object(
      'id', v_order.id,
      'order_number', v_order.order_number,
      'status', v_order.status,
      'created_at', v_order.created_at,
      'is_verified', false,
      'requires_phone_verification', true
    );
  end if;

  -- Full verified order details (retrieved from point-in-time snapshot)
  select jsonb_agg(jsonb_build_object(
    'product_id', oi.product_id,
    'name', oi.product_name,
    'quantity', oi.quantity,
    'unit_price', oi.unit_price,
    'line_total', oi.line_total
  )) into v_items
  from public.order_items oi
  where oi.order_id = v_order.id;

  return jsonb_build_object(
    'id', v_order.id,
    'order_number', v_order.order_number,
    'status', v_order.status,
    'created_at', v_order.created_at,
    'subtotal', v_order.subtotal,
    'delivery_charge', v_order.delivery_charge,
    'total', v_order.total,
    'payment_method', v_order.payment_method,
    'payment_status', v_order.payment_status,
    'customer_name_masked', substr(coalesce(v_order.address_snapshot->>'name', v_order.cust_name), 1, 2) || '***',
    'district', coalesce(v_order.address_snapshot->>'district', v_order.cust_district),
    'area', coalesce(v_order.address_snapshot->>'area', v_order.cust_area),
    'items', coalesce(v_items, '[]'::jsonb),
    'is_verified', true
  );
end; $$;
revoke all on function public.track_zhinuk_order(text,text) from public, anon, authenticated;
grant execute on function public.track_zhinuk_order(text,text) to anon, authenticated;

