import { Heart, ShoppingCart, Eye, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  const [imageLoaded, setImageLoaded] = useState(false);

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
      {/* Image Container */}
      <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-neutral-100">
        {product.images?.[0] ? (
          <>
            <img
              src={product.images[0]}
              alt={product.name}
              className={cn(
                "absolute inset-0 h-full w-full object-cover transition-all duration-700",
                hasSecondImage && isHovered ? "opacity-0 scale-105" : "opacity-100 scale-100"
              )}
              onLoad={() => setImageLoaded(true)}
            />
            {/* Second image on hover (Shopify-style image swap) */}
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

        {/* Sale Badge */}
        {isOnSale && (
          <div
            className="absolute left-3 top-3 rounded-full px-2.5 py-1 text-xs font-semibold text-white"
            style={{ backgroundColor: accentColor || "#ef4444" }}
          >
            -{discount}%
          </div>
        )}

        {/* Wishlist Button (always visible top-right) */}
        <button
          className={cn(
            "absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur-sm transition-all hover:bg-white hover:scale-110",
            isInWishlist(product.id) && "bg-red-50"
          )}
          onClick={handleAddToWishlist}
        >
          <Heart
            className={cn(
              "h-4 w-4 transition-colors",
              isInWishlist(product.id) ? "fill-red-500 text-red-500" : "text-neutral-600"
            )}
          />
        </button>

        {/* Quick Add Button - slides up from bottom on hover */}
        <div
          className={cn(
            "absolute inset-x-3 bottom-3 transition-all duration-300",
            isHovered ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
          )}
        >
          <button
            className="flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold text-white shadow-lg backdrop-blur-sm transition-all hover:opacity-90"
            style={{ backgroundColor: primaryColor || "#1a1a1a" }}
            onClick={handleAddToCart}
          >
            <Plus className="h-4 w-4" />
            Quick Add
          </button>
        </div>
      </div>

      {/* Product Info */}
      <div className="mt-3 space-y-1">
        <h3 className="text-sm font-medium leading-tight line-clamp-2 transition-colors group-hover:underline underline-offset-2">
          {product.name}
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold">
            {formatCurrency(product.price, currency)}
          </span>
          {isOnSale && (
            <span className="text-sm text-neutral-400 line-through">
              {formatCurrency(product.compare_at_price!, currency)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
