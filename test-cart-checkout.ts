import { dataService } from "./src/lib/data-service";
import { products, getProduct, formatPrice, toBn } from "./src/lib/catalog";

// Mock localStorage for headless Node environment
const storage = new Map<string, string>();
const mockLocalStorage = {
  getItem: (key: string) => storage.get(key) ?? null,
  setItem: (key: string, val: string) => { storage.set(key, val); },
  removeItem: (key: string) => { storage.delete(key); },
  clear: () => { storage.clear(); },
};
(global as any).localStorage = mockLocalStorage;

let testCount = 0;
let passCount = 0;
let failCount = 0;

function assert(condition: boolean, testName: string, details?: string) {
  testCount++;
  if (condition) {
    passCount++;
    console.log(`  ✓ [PASS] ${testName}`);
  } else {
    failCount++;
    console.error(`  ✗ [FAIL] ${testName}${details ? ` -> ${details}` : ""}`);
  }
}

console.log("=================================================");
console.log("  ZHINUK COMMERCE: CART & CHECKOUT TEST SUITE");
console.log("=================================================\n");

// -----------------------------------------------------------------
// SUITE 1: CART CORE LOGIC & STATE MUTATIONS
// -----------------------------------------------------------------
console.log("SECTION 1: CART OPERATIONS & MATHEMATICAL ACCURACY");

type CartLine = { id: string; qty: number };

class CartStoreSimulator {
  public cart: CartLine[] = [];
  public loaded = false;

  constructor() {
    this.hydrate();
  }

  hydrate() {
    try {
      this.cart = JSON.parse(mockLocalStorage.getItem("zh-cart") || "[]");
    } catch {
      this.cart = [];
    }
    this.loaded = true;
  }

  persist() {
    if (!this.loaded) return;
    mockLocalStorage.setItem("zh-cart", JSON.stringify(this.cart));
  }

  add(id: string, qty = 1) {
    const existing = this.cart.find((l) => l.id === id);
    if (existing) {
      this.cart = this.cart.map((l) => (l.id === id ? { ...l, qty: l.qty + qty } : l));
    } else {
      this.cart = [...this.cart, { id, qty }];
    }
    this.persist();
  }

  setQty(id: string, qty: number) {
    this.cart = qty <= 0 ? this.cart.filter((l) => l.id !== id) : this.cart.map((l) => (l.id === id ? { ...l, qty } : l));
    this.persist();
  }

  remove(id: string) {
    this.cart = this.cart.filter((l) => l.id !== id);
    this.persist();
  }

  clear() {
    this.cart = [];
    this.persist();
  }

  get lines() {
    return this.cart.flatMap((l) => {
      const product = getProduct(l.id);
      return product ? [{ product, qty: l.qty }] : [];
    });
  }

  get count() {
    return this.lines.reduce((s, l) => s + l.qty, 0);
  }

  get subtotal() {
    return this.lines.reduce((s, l) => s + l.qty * l.product.price, 0);
  }
}

const store = new CartStoreSimulator();
store.clear();

// 1.1 Add single product
store.add("smartphone-128", 1);
assert(store.cart.length === 1 && store.cart[0].id === "smartphone-128" && store.cart[0].qty === 1, "Add single product to empty cart");
assert(store.count === 1, "Cart item count is 1");
assert(store.subtotal === 89999, `Subtotal matches product price (৳${store.subtotal} === ৳89999)`);

// 1.2 Add same product again (accumulate qty)
store.add("smartphone-128", 2);
assert(store.cart.length === 1, "Cart distinct item length remains 1 when adding same product");
assert(store.cart[0].qty === 3, "Cart item quantity accumulated to 3");
assert(store.count === 3, "Cart total item count is 3");
assert(store.subtotal === 89999 * 3, `Subtotal equals 3 × ৳89999 = ৳${store.subtotal}`);

// 1.3 Add a second product
store.add("wireless-headphones", 2); // 4999 * 2 = 9998
assert(store.cart.length === 2, "Cart now has 2 distinct items");
assert(store.count === 5, "Cart total item count is 5 (3 + 2)");
assert(store.subtotal === 89999 * 3 + 4999 * 2, `Subtotal equals ৳${89999 * 3 + 4999 * 2}`);

// 1.4 Add a third product
store.add("mens-backpack", 1); // 1299
assert(store.cart.length === 3, "Cart now has 3 distinct items");
assert(store.count === 6, "Cart total item count is 6");
const expectedSubtotal = 89999 * 3 + 4999 * 2 + 1299;
assert(store.subtotal === expectedSubtotal, `Subtotal equals ৳${expectedSubtotal}`);

// 1.5 Change quantity with setQty
store.setQty("mens-backpack", 4);
assert(store.cart.find((l) => l.id === "mens-backpack")?.qty === 4, "setQty updated quantity to 4");
assert(store.count === 3 + 2 + 4, "Total count updated after setQty");

// 1.6 setQty <= 0 removes item
store.setQty("mens-backpack", 0);
assert(!store.cart.some((l) => l.id === "mens-backpack"), "setQty(id, 0) removed product from cart");
assert(store.cart.length === 2, "Cart length reduced back to 2");

// 1.7 Negative quantity also removes item safely
store.add("mens-backpack", 1);
store.setQty("mens-backpack", -5);
assert(!store.cart.some((l) => l.id === "mens-backpack"), "setQty(id, -5) removed product safely");

// 1.8 Remove item directly
store.remove("wireless-headphones");
assert(!store.cart.some((l) => l.id === "wireless-headphones"), "remove(id) removed wireless-headphones");
assert(store.cart.length === 1 && store.cart[0].id === "smartphone-128", "Only smartphone remains in cart");

// 1.9 Unknown product ID in cart is gracefully omitted in lines getter without crashing
store.add("non-existent-item-999", 1);
assert(store.lines.length === 1, "Unknown/deleted product safely omitted from lines getter");
assert(store.count === 3, "Count ignores deleted/unknown product lines");
store.remove("non-existent-item-999");

// 1.10 Clear cart
store.clear();
assert(store.cart.length === 0, "clear() emptied the cart array");
assert(store.lines.length === 0, "clear() resulted in empty lines");
assert(store.count === 0, "clear() resulted in count 0");
assert(store.subtotal === 0, "clear() resulted in subtotal 0");

// -----------------------------------------------------------------
// SUITE 2: CART PERSISTENCE (LOCALSTORAGE & PAGE REFRESH)
// -----------------------------------------------------------------
console.log("\nSECTION 2: CART PERSISTENCE & HYDRATION");

// 2.1 Test serialization
store.add("smart-watch", 2); // 3499 * 2 = 6998
store.add("running-shoes", 1); // 5990
const serialized = mockLocalStorage.getItem("zh-cart");
assert(serialized !== null, "Cart was serialized to localStorage under key 'zh-cart'");
const parsed = JSON.parse(serialized!);
assert(parsed.length === 2 && parsed[0].id === "smart-watch" && parsed[0].qty === 2, "Serialized JSON has expected items and quantities");

// 2.2 Test deserialization on simulated page refresh / new instance
const freshStore = new CartStoreSimulator();
assert(freshStore.cart.length === 2, "New store instance hydrated with 2 items from localStorage");
assert(freshStore.count === 3, "Hydrated instance count is 3");
assert(freshStore.subtotal === 3499 * 2 + 5990, "Hydrated instance subtotal matches exactly");

// 2.3 Malformed localStorage recovery
mockLocalStorage.setItem("zh-cart", "{invalid json");
const corruptedStore = new CartStoreSimulator();
assert(Array.isArray(corruptedStore.cart) && corruptedStore.cart.length === 0, "Corrupted localStorage gracefully recovered to empty array without crashing");

// Restore valid cart for next sections
store.clear();
store.add("running-shoes", 1); // 5990
store.add("skincare-set", 2); // 1850 * 2 = 3700 -> subtotal = 9690

// -----------------------------------------------------------------
// SUITE 3: DELIVERY CHARGE & ORDER TOTAL MATH
// -----------------------------------------------------------------
console.log("\nSECTION 3: DELIVERY CHARGES & ORDER TOTAL FORMULA");

const sub = store.subtotal; // 9690
const dhakaTotal = dataService.calculateOrderTotal(sub, "dhaka", 0);
assert(dhakaTotal.deliveryCharge === 80, "Inside Dhaka delivery fee is exactly ৳80");
assert(dhakaTotal.total === 9690 + 80, `Inside Dhaka total = 9690 + 80 = ৳${dhakaTotal.total}`);

const outsideTotal = dataService.calculateOrderTotal(sub, "outside", 0);
assert(outsideTotal.deliveryCharge === 120, "Outside Dhaka delivery fee is exactly ৳120");
assert(outsideTotal.total === 9690 + 120, `Outside Dhaka total = 9690 + 120 = ৳${outsideTotal.total}`);

const discountedTotal = dataService.calculateOrderTotal(sub, "dhaka", 500);
assert(discountedTotal.discount === 500, "Discount is applied correctly (৳500)");
assert(discountedTotal.total === 9690 - 500 + 80, `Discounted total = 9690 - 500 + 80 = ৳${discountedTotal.total}`);

const invalidZoneTotal = dataService.calculateOrderTotal(sub, "invalid" as any, 0);
assert(invalidZoneTotal.deliveryCharge === 80, "Invalid zone gracefully defaults to Dhaka (৳80)");

// -----------------------------------------------------------------
// SUITE 4: CHECKOUT FORM VALIDATION RULES
// -----------------------------------------------------------------
console.log("\nSECTION 4: CHECKOUT FORM VALIDATION");

// 4.1 Phone validation test cases
const phoneTests = [
  { p: "01823824071", expected: true, desc: "Standard Robi 018" },
  { p: "+8801712345678", expected: true, desc: "Standard GP +88017" },
  { p: "8801912345678", expected: true, desc: "Standard BL 88019" },
  { p: "01512345678", expected: true, desc: "Standard Teletalk 015" },
  { p: "01612345678", expected: true, desc: "Standard Airtel 016" },
  { p: "01312345678", expected: true, desc: "Standard GP 013" },
  { p: "01412345678", expected: true, desc: "Standard BL 014" },
  { p: "01823-824071", expected: true, desc: "Dashed format 01823-824071" },
  { p: "01823 824071", expected: true, desc: "Spaced format 01823 824071" },
  { p: "০১৮২৩৮২৪০৭১", expected: true, desc: "Bengali numerals (Bangla keyboard)" },
  { p: "+৮৮০১৭১২৩৪৫৬৭৮", expected: true, desc: "Bengali numerals with +৮৮ prefix" },
  { p: "01212345678", expected: false, desc: "Invalid operator prefix 012" },
  { p: "0182382407", expected: false, desc: "Invalid length: 10 digits" },
  { p: "018238240719", expected: false, desc: "Invalid length: 12 digits" },
  { p: "abcdefghijk", expected: false, desc: "Non-numeric characters" },
  { p: "", expected: false, desc: "Empty phone number" },
];

for (const pt of phoneTests) {
  const valid = dataService.isValidBDPhone(pt.p);
  assert(valid === pt.expected, `Phone validation: ${pt.desc} (${pt.p})`);
}

// -----------------------------------------------------------------
// SUITE 5: ORDER SUBMISSION & PERSISTENCE AUDIT
// -----------------------------------------------------------------
console.log("\nSECTION 5: ORDER SUBMISSION & BACKEND PERSISTENCE AUDIT");

async function runOrderAudit() {
  // 5.1 Validation: Name missing
  const resNoName = await dataService.placeOrder({
    customerName: "",
    customerPhone: "01823824071",
    address: "ধানমন্ডি ৩২, ঢাকা",
    district: "ঢাকা",
    area: "ধানমন্ডি",
    deliveryZone: "dhaka",
    items: [{ productId: "running-shoes", quantity: 1 }],
  });
  assert(!resNoName.success && Boolean(resNoName.error?.includes("নাম")), "Order rejected when name is empty");

  // 5.2 Validation: Invalid Phone
  const resBadPhone = await dataService.placeOrder({
    customerName: "আব্দুল করিম",
    customerPhone: "01234567890",
    address: "ধানমন্ডি ৩২, ঢাকা",
    district: "ঢাকা",
    area: "ধানমন্ডি",
    deliveryZone: "dhaka",
    items: [{ productId: "running-shoes", quantity: 1 }],
  });
  assert(!resBadPhone.success && Boolean(resBadPhone.error?.includes("মোবাইল")), "Order rejected when phone number is invalid");

  // 5.3 Validation: Address too short (< 5 chars)
  const resShortAddr = await dataService.placeOrder({
    customerName: "আব্দুল করিম",
    customerPhone: "01823824071",
    address: "ঢাকা",
    district: "ঢাকা",
    area: "ধানমন্ডি",
    deliveryZone: "dhaka",
    items: [{ productId: "running-shoes", quantity: 1 }],
  });
  assert(!resShortAddr.success && Boolean(resShortAddr.error?.includes("ঠিকানা")), "Order rejected when address is shorter than 5 chars");

  // 5.4 Validation: Missing district/area
  const resNoDistrict = await dataService.placeOrder({
    customerName: "আব্দুল করিম",
    customerPhone: "01823824071",
    address: "ধানমন্ডি ৩২, ঢাকা",
    district: "",
    area: "",
    deliveryZone: "dhaka",
    items: [{ productId: "running-shoes", quantity: 1 }],
  });
  assert(!resNoDistrict.success && Boolean(resNoDistrict.error?.includes("জেলা")), "Order rejected when district or area is missing");

  // 5.5 Validation: Empty cart / items array
  const resEmptyItems = await dataService.placeOrder({
    customerName: "আব্দুল করিম",
    customerPhone: "01823824071",
    address: "ধানমন্ডি ৩২, ঢাকা",
    district: "ঢাকা",
    area: "ধানমন্ডি",
    deliveryZone: "dhaka",
    items: [],
  });
  assert(!resEmptyItems.success && Boolean(resEmptyItems.error?.includes("পণ্য")), "Order rejected when items array is empty");

  // 5.6 Out of stock validation
  const resExcessiveQty = await dataService.placeOrder({
    customerName: "আব্দুল করিম",
    customerPhone: "01823824071",
    address: "ধানমন্ডি ৩২, ঢাকা",
    district: "ঢাকা",
    area: "ধানমন্ডি",
    deliveryZone: "dhaka",
    items: [{ productId: "running-shoes", quantity: 50 }], // Stock is 25
  });
  assert(!resExcessiveQty.success && Boolean(resExcessiveQty.error?.includes("পর্যাপ্ত স্টক নেই")), "Order rejected when item quantity exceeds available stock");

  // 5.7 Submission with unconfigured Supabase (REAL PERSISTENCE AUDIT)
  const initialOrderCount = dataService.getOrders().length;
  const resUnconfigured = await dataService.placeOrder({
    customerName: "আব্দুল করিম",
    customerPhone: "01823824071",
    address: "বাড়ি ১২, রোড ৪, সেক্টর ৭",
    district: "ঢাকা",
    area: "উত্তরা",
    deliveryZone: "dhaka",
    items: [{ productId: "running-shoes", quantity: 1 }],
  });

  assert(
    resUnconfigured.success === false,
    "Order placement returns success=false when Supabase is not configured (no fake success orders)"
  );
  assert(
    Boolean(resUnconfigured.error && resUnconfigured.error.includes("Supabase")),
    "Order placement returns clear explanatory message stating Supabase connection is required"
  );
  assert(
    dataService.getOrders().length === initialOrderCount,
    "Unpersisted orders are NOT secretly committed to application state or local storage"
  );

  console.log("\n=================================================");
  console.log(`TOTAL TESTS: ${testCount} | PASSED: ${passCount} | FAILED: ${failCount}`);
  console.log("=================================================");

  if (failCount > 0) {
    process.exit(1);
  }
}

runOrderAudit();
