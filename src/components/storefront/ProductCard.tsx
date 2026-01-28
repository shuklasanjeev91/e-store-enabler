import { Heart, ShoppingCart, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useStorefront } from "@/contexts/StorefrontContext";
import { formatCurrency } from "@/lib/currency";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

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
}

export default function ProductCard({
  product,
  storeSlug,
  variant = "minimal",
}: ProductCardProps) {
  const { addToCart, addToWishlist, isInWishlist, currency, setIsCartOpen } =
    useStorefront();
  const navigate = useNavigate();

  const isOnSale =
    product.compare_at_price && product.compare_at_price > product.price;
  const discount = isOnSale
    ? Math.round(
        ((product.compare_at_price! - product.price) / product.compare_at_price!) *
          100
      )
    : 0;

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

  const cardStyles = {
    minimal: "group cursor-pointer",
    bold: "group cursor-pointer bg-card rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow",
    elegant: "group cursor-pointer border rounded-lg overflow-hidden",
    modern: "group cursor-pointer relative",
  };

  const imageStyles = {
    minimal: "aspect-[3/4] overflow-hidden bg-muted",
    bold: "aspect-square overflow-hidden",
    elegant: "aspect-[4/5] overflow-hidden bg-muted/50",
    modern: "aspect-square overflow-hidden rounded-2xl bg-muted",
  };

  return (
    <div className={cardStyles[variant]} onClick={handleViewProduct}>
      <div className={cn(imageStyles[variant], "relative")}>
        {product.images?.[0] ? (
          <img
            src={product.images[0]}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-muted">
            <ShoppingCart className="h-12 w-12 text-muted-foreground/30" />
          </div>
        )}

        {/* Sale Badge */}
        {isOnSale && (
          <Badge
            className={cn(
              "absolute top-2 left-2",
              variant === "bold" && "bg-destructive",
              variant === "elegant" && "bg-primary"
            )}
          >
            -{discount}%
          </Badge>
        )}

        {/* Action Buttons */}
        <div
          className={cn(
            "absolute inset-0 flex items-center justify-center gap-2 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100",
            variant === "modern" && "rounded-2xl"
          )}
        >
          <Button
            size="icon"
            variant="secondary"
            className="h-10 w-10"
            onClick={handleAddToCart}
          >
            <ShoppingCart className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="secondary"
            className={cn(
              "h-10 w-10",
              isInWishlist(product.id) && "bg-destructive text-destructive-foreground"
            )}
            onClick={handleAddToWishlist}
          >
            <Heart
              className={cn("h-4 w-4", isInWishlist(product.id) && "fill-current")}
            />
          </Button>
          <Button size="icon" variant="secondary" className="h-10 w-10">
            <Eye className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div
        className={cn(
          "mt-4",
          variant === "bold" && "p-4 pt-0",
          variant === "elegant" && "p-4"
        )}
      >
        <h3
          className={cn(
            "font-medium line-clamp-2",
            variant === "bold" && "text-lg",
            variant === "elegant" && "text-sm tracking-wide"
          )}
        >
          {product.name}
        </h3>
        <div className="mt-1 flex items-center gap-2">
          <span
            className={cn(
              "font-semibold",
              variant === "bold" && "text-lg text-primary"
            )}
          >
            {formatCurrency(product.price, currency)}
          </span>
          {isOnSale && (
            <span className="text-sm text-muted-foreground line-through">
              {formatCurrency(product.compare_at_price!, currency)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
