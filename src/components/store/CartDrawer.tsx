import { Link } from "@tanstack/react-router";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { formatPrice, toBn } from "@/lib/catalog";
import { useStore } from "@/lib/store";

export function QtyControl({ id, qty }: { id: string; qty: number }) {
  const { setQty } = useStore();
  return (
    <div className="flex h-8 items-center rounded-full border border-border">
      <button aria-label="কমান" onClick={() => setQty(id, qty - 1)} className="grid h-8 w-8 place-items-center hover:text-primary"><Minus className="h-3.5 w-3.5" /></button>
      <span className="w-6 text-center text-sm">{toBn(qty)}</span>
      <button aria-label="বাড়ান" onClick={() => setQty(id, qty + 1)} className="grid h-8 w-8 place-items-center hover:text-primary"><Plus className="h-3.5 w-3.5" /></button>
    </div>
  );
}

export function CartDrawer() {
  const { cartOpen, setCartOpen, lines, subtotal, remove } = useStore();
  return (
    <Sheet open={cartOpen} onOpenChange={setCartOpen}>
      <SheetContent className="flex w-full flex-col p-0 sm:max-w-md">
        <SheetHeader className="border-b border-border p-5">
          <SheetTitle className="text-left">
            <span className="block text-base font-bold text-navy">আপনার কার্ট ({toBn(lines.length)})</span>
            <span className="block text-xs font-normal text-muted-foreground mt-0.5">পছন্দগুলো জমুক, আনন্দের ঝুলি ভরুক।</span>
          </SheetTitle>
        </SheetHeader>
        {lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center text-muted-foreground">
            <ShoppingBag className="h-12 w-12 text-primary/60" />
            <p className="font-semibold text-navy text-sm">আপনার ঝুলি এখনো খালি—পছন্দের কিছু যোগ করে নিন।</p>
            <Link to="/shop" onClick={() => setCartOpen(false)} className="rounded-full bg-primary px-6 py-2.5 text-xs font-semibold text-primary-foreground hover:bg-navy transition">
              পছন্দের পণ্য খুঁজুন
            </Link>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y divide-border overflow-y-auto px-5">
              {lines.map(({ product, qty }) => (
                <li key={product.id} className="flex gap-3 py-4">
                  <img src={product.image} alt="" className="h-20 w-20 shrink-0 rounded-xl border border-border object-contain p-1" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{product.name}</p>
                    <p className="text-sm font-bold text-destructive">{formatPrice(product.price)}</p>
                    <div className="mt-2 flex items-center justify-between">
                      <QtyControl id={product.id} qty={qty} />
                      <button aria-label="সরান" onClick={() => remove(product.id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <div className="space-y-3 border-t border-border p-5">
              <div className="flex justify-between font-semibold"><span>পণ্যের সাবটোটাল</span><span>{formatPrice(subtotal)}</span></div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>ডেলিভারি চার্জ</span>
                <span className="font-medium text-navy">ঢাকায় ৳ ৮০ • বাইরে ৳ ১২০</span>
              </div>
              <Link to="/checkout" onClick={() => setCartOpen(false)} className="flex h-11 items-center justify-center rounded-full bg-primary font-semibold text-primary-foreground hover:bg-navy">চেকআউট করুন</Link>
              <Link to="/cart" onClick={() => setCartOpen(false)} className="flex h-11 items-center justify-center rounded-full border border-border font-medium hover:bg-muted">কার্ট ও ডেলিভারি হিসাব দেখুন</Link>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
