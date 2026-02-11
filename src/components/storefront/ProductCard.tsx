import { Heart, ShoppingCart, ShoppingBag, Plus } from "lucide-react";
import { useStorefront } from "@/contexts/StorefrontContext";
import { formatCurrency } from "@/lib/currency";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  compare_at_price: number | null;
  images: string[] | null;
  status: string;
}

interface ProductCardProps {
  product: Product;
  storeSlug: string;
  variant?: "minimal" | "bold" | "elegant" | "modern";
  accentColor?: string;
  primaryColor?: string;
}

export default function ProductCard({
  product,
  storeSlug,
  variant = "minimal",
  accentColor,
  primaryColor,
}: ProductCardProps) {
  const { addToCart, addToWishlist, isInWishlist, currency, setIsCartOpen } =
    useStorefront();
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);

  const isOnSale =
    product.compare_at_price && product.compare_at_price > product.price;
  const discount = isOnSale
    ? Math.round(
        ((product.compare_at_price! - product.price) / product.compare_at_price!) *
          100
      )
    : 0;

  const hasSecondImage = product.images && product.images.length > 1;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await addToCart(product.id);
    setIsCartOpen(true);
  };

  const handleAddToWishlist = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await addToWishlist(product.id);
  };

  const handleViewProduct = () => {
    navigate(`/store/${storeSlug}/product/${product.id}`);
  };

  return (
    <div
      className="group cursor-pointer"
      onClick={handleViewProduct}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container - Xclusive-style clean with minimal overlays */}
      <div className="relative aspect-[3/4] overflow-hidden bg-neutral-100">
        {product.images?.[0] ? (
          <>
            <img
              src={product.images[0]}
              alt={product.name}
              className={cn(
                "absolute inset-0 h-full w-full object-cover transition-all duration-700",
                hasSecondImage && isHovered ? "opacity-0 scale-105" : "opacity-100 scale-100"
              )}
            />
            {/* Second image on hover */}
            {hasSecondImage && (
              <img
                src={product.images![1]}
                alt={product.name}
                className={cn(
                  "absolute inset-0 h-full w-full object-cover transition-all duration-700",
                  isHovered ? "opacity-100 scale-100" : "opacity-0 scale-95"
                )}
              />
            )}
          </>
        ) : (
          <div className="flex h-full items-center justify-center">
            <ShoppingCart className="h-12 w-12 text-neutral-300" />
          </div>
        )}

        {/* Sale Badge - Xclusive-style top-left pill */}
        {isOnSale && (
          <div
            className="absolute left-3 top-3 rounded-sm px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white"
            style={{ backgroundColor: accentColor || "#e53e3e" }}
          >
            Sale -{discount}%
          </div>
        )}

        {/* Wishlist Button - top right */}
        <button
          className={cn(
            "absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-sm transition-all hover:scale-110",
            isHovered ? "opacity-100" : "opacity-0",
            isInWishlist(product.id) && "opacity-100"
          )}
          onClick={handleAddToWishlist}
        >
          <Heart
            className={cn(
              "h-4 w-4 transition-colors",
              isInWishlist(product.id) ? "fill-red-500 text-red-500" : "text-neutral-700"
            )}
          />
        </button>

        {/* Quick Add - Xclusive-style bag icon bottom-right */}
        <button
          className={cn(
            "absolute bottom-3 right-3 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-lg transition-all hover:scale-110",
            isHovered ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
          )}
          onClick={handleAddToCart}
        >
          <ShoppingBag className="h-4 w-4" />
        </button>
      </div>

      {/* Product Info - Xclusive-style minimal */}
      <div className="mt-3 space-y-1.5">
        <h3 className="text-sm font-medium leading-tight line-clamp-1 transition-colors">
          {product.name}
        </h3>
        <div className="flex items-center gap-2">
          {isOnSale && (
            <span className="text-xs text-neutral-400 line-through">
              {formatCurrency(product.compare_at_price!, currency)}
            </span>
          )}
          <span className={cn("text-sm font-semibold", isOnSale && "text-red-600")}>
            {formatCurrency(product.price, currency)}
          </span>
        </div>
      </div>
    </div>
  );
}
