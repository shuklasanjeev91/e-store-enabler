import { useState, useEffect, useRef } from "react";
import { Search, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { formatCurrency } from "@/lib/currency";
import { useStorefront } from "@/contexts/StorefrontContext";

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  compare_at_price: number | null;
  images: string[] | null;
  status: string;
}

interface StorefrontSearchProps {
  products: Product[];
  storeSlug: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function StorefrontSearch({ products, storeSlug, isOpen, onClose }: StorefrontSearchProps) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { currency } = useStorefront();

  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const results = query.trim().length >= 1
    ? products.filter((p) =>
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        (p.description && p.description.toLowerCase().includes(query.toLowerCase()))
      ).slice(0, 8)
    : [];

  const handleSelect = (productId: string) => {
    onClose();
    navigate(`/store/${storeSlug}/product/${productId}`);
  };

  return (
    <div className="fixed inset-0 z-[60]">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Search Panel */}
      <div className="relative mx-auto mt-16 w-full max-w-2xl px-4">
        <div className="overflow-hidden rounded-xl bg-white shadow-2xl dark:bg-zinc-900">
          {/* Input */}
          <div className="flex items-center gap-3 border-b px-4 py-3 dark:border-zinc-700">
            <Search className="h-5 w-5 shrink-0 text-zinc-400" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search products..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 bg-transparent text-lg outline-none placeholder:text-zinc-400 dark:text-white"
            />
            <button onClick={onClose} className="shrink-0 rounded-md p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800">
              <X className="h-5 w-5 text-zinc-400" />
            </button>
          </div>

          {/* Results */}
          {query.trim().length >= 1 && (
            <div className="max-h-[60vh] overflow-y-auto">
              {results.length === 0 ? (
                <div className="px-4 py-8 text-center text-zinc-500">
                  No products found for "{query}"
                </div>
              ) : (
                <ul>
                  {results.map((product) => (
                    <li key={product.id}>
                      <button
                        className="flex w-full items-center gap-4 px-4 py-3 text-left transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800"
                        onClick={() => handleSelect(product.id)}
                      >
                        <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-700">
                          {product.images?.[0] ? (
                            <img
                              src={product.images[0]}
                              alt={product.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-zinc-300">
                              <Search className="h-5 w-5" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium text-zinc-900 dark:text-white">
                            {product.name}
                          </p>
                          {product.description && (
                            <p className="truncate text-sm text-zinc-500">
                              {product.description}
                            </p>
                          )}
                        </div>
                        <div className="shrink-0 text-right">
                          <p className="font-semibold text-zinc-900 dark:text-white">
                            {formatCurrency(product.price, currency)}
                          </p>
                          {product.compare_at_price && product.compare_at_price > product.price && (
                            <p className="text-sm text-zinc-400 line-through">
                              {formatCurrency(product.compare_at_price, currency)}
                            </p>
                          )}
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* Hint */}
          {query.trim().length === 0 && (
            <div className="px-4 py-6 text-center text-sm text-zinc-400">
              Start typing to search products
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
