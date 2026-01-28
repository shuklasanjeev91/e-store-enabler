import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Heart, ShoppingBag, X, ShoppingCart } from "lucide-react";
import { useStorefront } from "@/contexts/StorefrontContext";
import { formatCurrency } from "@/lib/currency";

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
        <SheetContent className="flex w-full flex-col sm:max-w-lg">
          <SheetHeader className="border-b pb-4">
            <SheetTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5" />
              Wishlist
            </SheetTitle>
          </SheetHeader>
          <div className="flex flex-1 flex-col items-center justify-center gap-4">
            <Heart className="h-16 w-16 text-muted-foreground" />
            <p className="text-muted-foreground text-center">
              Sign in to save your favorite items
            </p>
            <Button
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
      <SheetContent className="flex w-full flex-col sm:max-w-lg">
        <SheetHeader className="border-b pb-4">
          <SheetTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Wishlist ({wishlistItems.length})
          </SheetTitle>
        </SheetHeader>

        {wishlistItems.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4">
            <Heart className="h-16 w-16 text-muted-foreground" />
            <p className="text-muted-foreground">Your wishlist is empty</p>
            <Button variant="outline" onClick={() => setIsWishlistOpen(false)}>
              Continue Shopping
            </Button>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto py-4">
            <div className="space-y-4">
              {wishlistItems.map((item) => (
                <div key={item.id} className="flex gap-4 border-b pb-4">
                  <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
                    {item.product?.images?.[0] ? (
                      <img
                        src={item.product.images[0]}
                        alt={item.product.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <ShoppingBag className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col">
                    <div className="flex justify-between">
                      <h4 className="font-medium line-clamp-2">
                        {item.product?.name}
                      </h4>
                      <button
                        onClick={() => removeFromWishlist(item.id)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="font-medium">
                        {formatCurrency(item.product?.price || 0, currency)}
                      </span>
                      {item.product?.compare_at_price &&
                        item.product.compare_at_price > item.product.price && (
                          <span className="text-sm text-muted-foreground line-through">
                            {formatCurrency(item.product.compare_at_price, currency)}
                          </span>
                        )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-auto w-fit"
                      onClick={() => handleMoveToCart(item.product_id, item.id)}
                    >
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      Move to Cart
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
