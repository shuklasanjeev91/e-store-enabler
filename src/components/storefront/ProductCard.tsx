import { Heart, ShoppingCart, ShoppingBag, Eye } from "lucide-react";
import { useStorefront } from "@/contexts/StorefrontContext";
import { formatCurrency } from "@/lib/currency";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

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
    <motion.div
      className="group cursor-pointer"
      onClick={handleViewProduct}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      {/* Image Container */}
      <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-neutral-100">
        {product.images?.[0] ? (
          <>
            <img
              src={product.images[0]}
              alt={product.name}
              onLoad={() => setImageLoaded(true)}
              className={cn(
                "absolute inset-0 h-full w-full object-cover transition-all duration-700 ease-out",
                hasSecondImage && isHovered ? "opacity-0 scale-[1.03]" : "opacity-100 scale-100",
                !imageLoaded && "blur-sm"
              )}
            />
            {hasSecondImage && (
              <img
                src={product.images![1]}
                alt={product.name}
                className={cn(
                  "absolute inset-0 h-full w-full object-cover transition-all duration-700 ease-out",
                  isHovered ? "opacity-100 scale-100" : "opacity-0 scale-[0.97]"
                )}
              />
            )}
          </>
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-neutral-100 to-neutral-200">
            <ShoppingBag className="h-10 w-10 text-neutral-300" />
          </div>
        )}

        {/* Sale Badge */}
        {isOnSale && (
          <div
            className="absolute left-3 top-3 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white shadow-sm backdrop-blur-sm"
            style={{ backgroundColor: accentColor ? `${accentColor}dd` : "#e53e3edd" }}
          >
            -{discount}%
          </div>
        )}

        {/* Hover Action Buttons - slide up from bottom */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.2 }}
              className="absolute bottom-3 left-3 right-3 flex items-center justify-center gap-2"
            >
              <button
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow-lg backdrop-blur-sm transition-all hover:bg-white hover:scale-110"
                onClick={handleAddToWishlist}
              >
                <Heart
                  className={cn(
                    "h-4 w-4 transition-colors",
                    isInWishlist(product.id) ? "fill-red-500 text-red-500" : "text-neutral-700"
                  )}
                />
              </button>
              <button
                className="flex h-11 flex-1 items-center justify-center gap-2 rounded-full bg-black/85 text-sm font-medium text-white shadow-lg backdrop-blur-sm transition-all hover:bg-black"
                onClick={handleAddToCart}
              >
                <ShoppingBag className="h-4 w-4" />
                Add to Bag
              </button>
              <button
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow-lg backdrop-blur-sm transition-all hover:bg-white hover:scale-110"
                onClick={(e) => { e.stopPropagation(); handleViewProduct(); }}
              >
                <Eye className="h-4 w-4 text-neutral-700" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Persistent wishlist indicator */}
        {isInWishlist(product.id) && !isHovered && (
          <div className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur-sm">
            <Heart className="h-3.5 w-3.5 fill-red-500 text-red-500" />
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="mt-3.5 space-y-1">
        <h3 className="text-sm font-medium leading-snug line-clamp-1 transition-colors group-hover:text-neutral-600">
          {product.name}
        </h3>
        <div className="flex items-center gap-2">
          <span className={cn("text-sm font-semibold tabular-nums", isOnSale && "text-red-600")}>
            {formatCurrency(product.price, currency)}
          </span>
          {isOnSale && (
            <span className="text-xs text-neutral-400 line-through tabular-nums">
              {formatCurrency(product.compare_at_price!, currency)}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
