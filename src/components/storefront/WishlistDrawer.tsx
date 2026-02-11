import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Heart, ShoppingBag, ShoppingCart, Trash2 } from "lucide-react";
import { useStorefront } from "@/contexts/StorefrontContext";
import { formatCurrency } from "@/lib/currency";
import { motion, AnimatePresence } from "framer-motion";

export default function WishlistDrawer() {
  const {
    isWishlistOpen,
    setIsWishlistOpen,
    wishlistItems,
    removeFromWishlist,
    addToCart,
    currency,
    customer,
    setIsAuthOpen,
  } = useStorefront();

  const handleMoveToCart = async (productId: string, wishlistId: string) => {
    await addToCart(productId);
    await removeFromWishlist(wishlistId);
  };

  if (!customer) {
    return (
      <Sheet open={isWishlistOpen} onOpenChange={setIsWishlistOpen}>
        <SheetContent className="flex w-full flex-col p-0 sm:max-w-md">
          <div className="flex items-center gap-3 border-b px-6 py-5">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-red-50">
              <Heart className="h-4 w-4 text-red-500" />
            </div>
            <h2 className="text-base font-semibold">Wishlist</h2>
          </div>
          <div className="flex flex-1 flex-col items-center justify-center gap-5 px-6">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-red-50">
              <Heart className="h-8 w-8 text-red-300" />
            </div>
            <div className="text-center">
              <p className="font-medium">Save your favorites</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Sign in to save items you love
              </p>
            </div>
            <Button
              className="rounded-full"
              onClick={() => {
                setIsWishlistOpen(false);
                setIsAuthOpen(true);
              }}
            >
              Sign In
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Sheet open={isWishlistOpen} onOpenChange={setIsWishlistOpen}>
      <SheetContent className="flex w-full flex-col p-0 sm:max-w-md">
        <div className="flex items-center gap-3 border-b px-6 py-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-red-50">
            <Heart className="h-4 w-4 text-red-500" />
          </div>
          <div>
            <h2 className="text-base font-semibold">Wishlist</h2>
            <p className="text-xs text-muted-foreground">{wishlistItems.length} saved item{wishlistItems.length !== 1 ? 's' : ''}</p>
          </div>
        </div>

        {wishlistItems.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-5 px-6">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-neutral-50">
              <Heart className="h-8 w-8 text-neutral-300" />
            </div>
            <div className="text-center">
              <p className="font-medium">Nothing saved yet</p>
              <p className="mt-1 text-sm text-muted-foreground">Tap the heart on products you love</p>
            </div>
            <Button variant="outline" className="rounded-full" onClick={() => setIsWishlistOpen(false)}>
              Start Exploring
            </Button>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto px-6 py-4">
            <AnimatePresence mode="popLayout">
              {wishlistItems.map((item) => (
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
                    <div>
                      <h4 className="text-sm font-medium leading-tight line-clamp-2">
                        {item.product?.name}
                      </h4>
                      <div className="mt-1 flex items-center gap-2">
                        <span className="text-sm font-semibold tabular-nums">
                          {formatCurrency(item.product?.price || 0, currency)}
                        </span>
                        {item.product?.compare_at_price &&
                          item.product.compare_at_price > item.product.price && (
                            <span className="text-xs text-muted-foreground line-through tabular-nums">
                              {formatCurrency(item.product.compare_at_price, currency)}
                            </span>
                          )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 flex-1 rounded-full text-xs gap-1.5"
                        onClick={() => handleMoveToCart(item.product_id, item.id)}
                      >
                        <ShoppingCart className="h-3.5 w-3.5" />
                        Add to Bag
                      </Button>
                      <button
                        onClick={() => removeFromWishlist(item.id)}
                        className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-neutral-400 transition-colors hover:bg-neutral-200 hover:text-red-500"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
