import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { getProduct, type Product } from "./catalog";

type CartLine = { id: string; qty: number };
type Ctx = {
  cart: CartLine[];
  wishlist: string[];
  cartOpen: boolean;
  setCartOpen: (v: boolean) => void;
  add: (id: string, qty?: number) => void;
  setQty: (id: string, qty: number) => void;
  remove: (id: string) => void;
  clear: () => void;
  toggleWish: (id: string) => void;
  lines: { product: Product; qty: number }[];
  count: number;
  subtotal: number;
};

const StoreCtx = createContext<Ctx | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartLine[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      setCart(JSON.parse(localStorage.getItem("zh-cart") || "[]"));
      setWishlist(JSON.parse(localStorage.getItem("zh-wish") || "[]"));
    } catch {}
    setLoaded(true);
  }, []);
  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem("zh-cart", JSON.stringify(cart));
    localStorage.setItem("zh-wish", JSON.stringify(wishlist));
  }, [cart, wishlist, loaded]);

  const add = (id: string, qty = 1) => {
    setCart((c) => {
      const ex = c.find((l) => l.id === id);
      return ex ? c.map((l) => (l.id === id ? { ...l, qty: l.qty + qty } : l)) : [...c, { id, qty }];
    });
    toast.success("কার্টে যোগ হয়েছে", { description: getProduct(id)?.name });
  };
  const setQty = (id: string, qty: number) =>
    setCart((c) => (qty <= 0 ? c.filter((l) => l.id !== id) : c.map((l) => (l.id === id ? { ...l, qty } : l))));
  const remove = (id: string) => setCart((c) => c.filter((l) => l.id !== id));
  const toggleWish = (id: string) =>
    setWishlist((w) => (w.includes(id) ? w.filter((x) => x !== id) : [...w, id]));

  const lines = cart.flatMap((l) => {
    const product = getProduct(l.id);
    return product ? [{ product, qty: l.qty }] : [];
  });
  const count = lines.reduce((s, l) => s + l.qty, 0);
  const subtotal = lines.reduce((s, l) => s + l.qty * l.product.price, 0);

  return (
    <StoreCtx.Provider
      value={{ cart, wishlist, cartOpen, setCartOpen, add, setQty, remove, clear: () => setCart([]), toggleWish, lines, count, subtotal }}
    >
      {children}
    </StoreCtx.Provider>
  );
}

export function useStore() {
  const c = useContext(StoreCtx);
  if (!c) throw new Error("useStore outside StoreProvider");
  return c;
}
