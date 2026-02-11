import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Minus, Plus, ShoppingBag, X, ArrowRight, Trash2 } from "lucide-react";
import { useStorefront } from "@/contexts/StorefrontContext";
import { formatCurrency } from "@/lib/currency";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

interface CartDrawerProps {
  storeSlug: string;
}

export default function CartDrawer({ storeSlug }: CartDrawerProps) {
  const {
    isCartOpen,
    setIsCartOpen,
    cartItems,
    cartTotal,
    updateCartQuantity,
    removeFromCart,
    currency,
  } = useStorefront();

  const navigate = useNavigate();

  const handleCheckout = () => {
    setIsCartOpen(false);
    navigate(`/store/${storeSlug}/checkout`);
  };

  return (
    <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
      <SheetContent className="flex w-full flex-col p-0 sm:max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-100">
              <ShoppingBag className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold">Your Bag</h2>
              <p className="text-xs text-muted-foreground">{cartItems.length} item{cartItems.length !== 1 ? 's' : ''}</p>
            </div>
          </div>
        </div>

        {cartItems.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-5 px-6">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-neutral-50">
              <ShoppingBag className="h-8 w-8 text-neutral-300" />
            </div>
            <div className="text-center">
              <p className="font-medium">Your bag is empty</p>
              <p className="mt-1 text-sm text-muted-foreground">Explore our collection and find something you love</p>
            </div>
            <Button variant="outline" className="rounded-full" onClick={() => setIsCartOpen(false)}>
              Continue Shopping
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <AnimatePresence mode="popLayout">
                {cartItems.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="mb-4 flex gap-4 rounded-xl bg-neutral-50/80 p-3"
                  >
                    <div className="h-[88px] w-[72px] flex-shrink-0 overflow-hidden rounded-lg bg-neutral-100">
                      {item.product?.images?.[0] ? (
                        <img
                          src={item.product.images[0]}
                          alt={item.product.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <ShoppingBag className="h-6 w-6 text-neutral-300" />
                        </div>
                      )}
                    </div>
                    <div className="flex flex-1 flex-col justify-between py-0.5">
                      <div className="flex justify-between gap-2">
                        <h4 className="text-sm font-medium leading-tight line-clamp-2">
                          {item.product?.name}
                        </h4>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="flex-shrink-0 rounded-md p-1 text-neutral-400 transition-colors hover:bg-neutral-200 hover:text-red-500"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center overflow-hidden rounded-full border border-neutral-200">
                          <button
                            className="flex h-7 w-7 items-center justify-center transition-colors hover:bg-neutral-100"
                            onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-7 text-center text-xs font-medium">{item.quantity}</span>
                          <button
                            className="flex h-7 w-7 items-center justify-center transition-colors hover:bg-neutral-100"
                            onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        <p className="text-sm font-semibold tabular-nums">
                          {formatCurrency(
                            (item.product?.price || 0) * item.quantity,
                            currency
                          )}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="border-t bg-white px-6 py-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Subtotal</span>
                <span className="text-lg font-bold tabular-nums">{formatCurrency(cartTotal, currency)}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Shipping & taxes calculated at checkout
              </p>
              <Button className="w-full rounded-full gap-2" size="lg" onClick={handleCheckout}>
                Checkout
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
