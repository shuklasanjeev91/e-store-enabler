import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useStorefront } from "@/contexts/StorefrontContext";
import { formatCurrency } from "@/lib/currency";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Heart,
  ShoppingCart,
  Minus,
  Plus,
  ChevronLeft,
  Share2,
  Truck,
  Shield,
  RotateCcw,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  compare_at_price: number | null;
  images: string[] | null;
  status: string;
  inventory_quantity: number;
  sku: string | null;
  category_id: string | null;
  has_variants: boolean;
}

interface ProductVariant {
  id: string;
  name: string;
  sku: string | null;
  price: number;
  compare_at_price: number | null;
  inventory_quantity: number;
  image_url: string | null;
  images: string[] | null;
  is_active: boolean;
  option1_name: string | null;
  option1_value: string | null;
  option2_name: string | null;
  option2_value: string | null;
  option3_name: string | null;
  option3_value: string | null;
}

interface VariantOption {
  name: string;
  values: string[];
}

export default function ProductDetail() {
  const { slug, productId } = useParams<{ slug: string; productId: string }>();
  const navigate = useNavigate();
  const {
    addToCart,
    addToWishlist,
    isInWishlist,
    currency,
    setIsCartOpen,
  } = useStorefront();

  const [product, setProduct] = useState<Product | null>(null);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [variantOptions, setVariantOptions] = useState<VariantOption[]>([]);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  useEffect(() => {
    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  // Update selected variant when options change
  useEffect(() => {
    if (variants.length > 0 && Object.keys(selectedOptions).length > 0) {
      const matchingVariant = variants.find((v) => {
        let matches = true;
        if (v.option1_name && selectedOptions[v.option1_name] !== v.option1_value) matches = false;
        if (v.option2_name && selectedOptions[v.option2_name] !== v.option2_value) matches = false;
        if (v.option3_name && selectedOptions[v.option3_name] !== v.option3_value) matches = false;
        return matches;
      });
      setSelectedVariant(matchingVariant || null);
      if (matchingVariant) {
        setSelectedImage(0);
        setQuantity(1);
      }
    }
  }, [selectedOptions, variants]);

  const fetchProduct = async () => {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", productId)
      .eq("status", "published")
      .maybeSingle();

    if (data) {
      setProduct(data);

      // Fetch variants if product has variants
      if (data.has_variants) {
        const { data: variantsData } = await supabase
          .from("product_variants")
          .select("*")
          .eq("product_id", productId)
          .eq("is_active", true)
          .order("sort_order");

        if (variantsData && variantsData.length > 0) {
          setVariants(variantsData);

          // Extract unique options
          const optionsMap = new Map<string, Set<string>>();
          variantsData.forEach((v) => {
            if (v.option1_name && v.option1_value) {
              if (!optionsMap.has(v.option1_name)) optionsMap.set(v.option1_name, new Set());
              optionsMap.get(v.option1_name)!.add(v.option1_value);
            }
            if (v.option2_name && v.option2_value) {
              if (!optionsMap.has(v.option2_name)) optionsMap.set(v.option2_name, new Set());
              optionsMap.get(v.option2_name)!.add(v.option2_value);
            }
            if (v.option3_name && v.option3_value) {
              if (!optionsMap.has(v.option3_name)) optionsMap.set(v.option3_name, new Set());
              optionsMap.get(v.option3_name)!.add(v.option3_value);
            }
          });

          const options: VariantOption[] = [];
          optionsMap.forEach((values, name) => {
            options.push({ name, values: Array.from(values) });
          });
          setVariantOptions(options);

          // Pre-select first variant options
          const initialOptions: Record<string, string> = {};
          const firstVariant = variantsData[0];
          if (firstVariant.option1_name && firstVariant.option1_value) {
            initialOptions[firstVariant.option1_name] = firstVariant.option1_value;
          }
          if (firstVariant.option2_name && firstVariant.option2_value) {
            initialOptions[firstVariant.option2_name] = firstVariant.option2_value;
          }
          if (firstVariant.option3_name && firstVariant.option3_value) {
            initialOptions[firstVariant.option3_name] = firstVariant.option3_value;
          }
          setSelectedOptions(initialOptions);
          setSelectedVariant(firstVariant);
        }
      }
    }
    setIsLoading(false);
  };

  const handleAddToCart = async () => {
    if (!product) return;
    setIsAddingToCart(true);
    // TODO: Handle variant cart addition when cart supports variants
    await addToCart(product.id, quantity);
    setIsAddingToCart(false);
    setIsCartOpen(true);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product?.name,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const handleOptionChange = (optionName: string, value: string) => {
    setSelectedOptions((prev) => ({ ...prev, [optionName]: value }));
  };

  // Get current display values based on selected variant
  const displayPrice = selectedVariant?.price ?? product?.price ?? 0;
  const displayComparePrice = selectedVariant?.compare_at_price ?? product?.compare_at_price;
  const displayInventory = selectedVariant?.inventory_quantity ?? product?.inventory_quantity ?? 0;
  const displaySku = selectedVariant?.sku ?? product?.sku;

  // Get images to display (variant images take priority)
  const getDisplayImages = (): string[] => {
    if (selectedVariant) {
      const variantImages = (selectedVariant as any).images || [];
      if (variantImages.length > 0) return variantImages;
      if (selectedVariant.image_url) return [selectedVariant.image_url];
    }
    return product?.images || [];
  };

  const displayImages = getDisplayImages();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold">Product Not Found</h1>
        <Button onClick={() => navigate(`/store/${slug}`)}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Store
        </Button>
      </div>
    );
  }

  const isOnSale = displayComparePrice && displayComparePrice > displayPrice;
  const discount = isOnSale
    ? Math.round(((displayComparePrice! - displayPrice) / displayComparePrice!) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Breadcrumb */}
      <div className="border-b">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <button
            onClick={() => navigate(`/store/${slug}`)}
            className="flex items-center text-sm text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Back to Store
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Images */}
          <div className="space-y-4">
            <div className="aspect-square overflow-hidden rounded-xl bg-muted">
              {displayImages[selectedImage] ? (
                <img
                  src={displayImages[selectedImage]}
                  alt={product.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <ShoppingCart className="h-20 w-20 text-muted-foreground/30" />
                </div>
              )}
            </div>
            {displayImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {displayImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={cn(
                      "h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border-2",
                      selectedImage === index
                        ? "border-primary"
                        : "border-transparent"
                    )}
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="space-y-6">
            <div>
              {isOnSale && (
                <Badge className="mb-2 bg-destructive">-{discount}% OFF</Badge>
              )}
              <h1 className="text-3xl font-bold">{product.name}</h1>
              {displaySku && (
                <p className="mt-1 text-sm text-muted-foreground">
                  SKU: {displaySku}
                </p>
              )}
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-primary">
                {formatCurrency(displayPrice, currency)}
              </span>
              {isOnSale && (
                <span className="text-xl text-muted-foreground line-through">
                  {formatCurrency(displayComparePrice!, currency)}
                </span>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <div className="prose prose-sm max-w-none">
                <p className="text-muted-foreground">{product.description}</p>
              </div>
            )}

            {/* Variant Options */}
            {variantOptions.length > 0 && (
              <div className="space-y-4">
                {variantOptions.map((option) => (
                  <div key={option.name} className="space-y-2">
                    <label className="text-sm font-medium">{option.name}</label>
                    <Select
                      value={selectedOptions[option.name] || ""}
                      onValueChange={(value) => handleOptionChange(option.name, value)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder={`Select ${option.name}`} />
                      </SelectTrigger>
                      <SelectContent>
                        {option.values.map((value) => (
                          <SelectItem key={value} value={value}>
                            {value}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
            )}

            {/* Stock Status */}
            <div className="flex items-center gap-2">
              {displayInventory > 0 ? (
                <>
                  <span className="h-2 w-2 rounded-full bg-green-500" />
                  <span className="text-sm text-green-600">
                    In Stock ({displayInventory} available)
                  </span>
                </>
              ) : (
                <>
                  <span className="h-2 w-2 rounded-full bg-red-500" />
                  <span className="text-sm text-red-600">Out of Stock</span>
                </>
              )}
            </div>

            {/* Quantity */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Quantity</label>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-12 text-center text-lg font-medium">
                  {quantity}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(Math.min(displayInventory, quantity + 1))}
                  disabled={quantity >= displayInventory}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                className="flex-1"
                size="lg"
                onClick={handleAddToCart}
                disabled={isAddingToCart || displayInventory === 0 || (product.has_variants && !selectedVariant)}
              >
                {isAddingToCart ? (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                  <ShoppingCart className="mr-2 h-5 w-5" />
                )}
                Add to Cart
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => addToWishlist(product.id)}
                className={cn(
                  isInWishlist(product.id) &&
                    "border-destructive text-destructive hover:bg-destructive/10"
                )}
              >
                <Heart
                  className={cn(
                    "h-5 w-5",
                    isInWishlist(product.id) && "fill-current"
                  )}
                />
              </Button>
              <Button variant="outline" size="lg" onClick={handleShare}>
                <Share2 className="h-5 w-5" />
              </Button>
            </div>

            {/* Features */}
            <div className="grid gap-4 border-t pt-6 sm:grid-cols-3">
              <div className="flex items-center gap-3">
                <Truck className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Free Shipping</p>
                  <p className="text-xs text-muted-foreground">On orders over ₹500</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Secure Payment</p>
                  <p className="text-xs text-muted-foreground">100% protected</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <RotateCcw className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Easy Returns</p>
                  <p className="text-xs text-muted-foreground">7 day return policy</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
