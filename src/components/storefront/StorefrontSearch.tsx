import { useState, useEffect, useRef } from "react";
import { Search, X, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { formatCurrency } from "@/lib/currency";
import { useStorefront } from "@/contexts/StorefrontContext";
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
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[60]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Backdrop */}
        <motion.div
          className="absolute inset-0 bg-black/60 backdrop-blur-md"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        />

        {/* Search Panel */}
        <motion.div
          className="relative mx-auto mt-[10vh] w-full max-w-2xl px-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
        >
          <div className="overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 dark:bg-zinc-900">
            {/* Input */}
            <div className="flex items-center gap-3 border-b px-5 py-4 dark:border-zinc-700">
              <Search className="h-5 w-5 shrink-0 text-zinc-400" />
              <input
                ref={inputRef}
                type="text"
                placeholder="What are you looking for?"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1 bg-transparent text-base outline-none placeholder:text-zinc-400 dark:text-white"
              />
              <button
                onClick={onClose}
                className="shrink-0 rounded-full p-1.5 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <X className="h-4 w-4 text-zinc-400" />
              </button>
            </div>

            {/* Results */}
            {query.trim().length >= 1 && (
              <div className="max-h-[55vh] overflow-y-auto">
                {results.length === 0 ? (
                  <div className="px-5 py-10 text-center">
                    <p className="text-sm text-zinc-400">No results for "{query}"</p>
                    <p className="mt-1 text-xs text-zinc-300">Try a different search term</p>
                  </div>
                ) : (
                  <ul className="py-2">
                    {results.map((product, i) => (
                      <motion.li
                        key={product.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.03 }}
                      >
                        <button
                          className="flex w-full items-center gap-4 px-5 py-3 text-left transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800"
                          onClick={() => handleSelect(product.id)}
                        >
                          <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-zinc-100 dark:bg-zinc-700">
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
                            <p className="truncate text-sm font-medium text-zinc-900 dark:text-white">
                              {product.name}
                            </p>
                            {product.description && (
                              <p className="truncate text-xs text-zinc-400 mt-0.5">
                                {product.description}
                              </p>
                            )}
                          </div>
                          <div className="shrink-0 text-right">
                            <p className="text-sm font-semibold tabular-nums text-zinc-900 dark:text-white">
                              {formatCurrency(product.price, currency)}
                            </p>
                            {product.compare_at_price && product.compare_at_price > product.price && (
                              <p className="text-xs text-zinc-400 line-through tabular-nums">
                                {formatCurrency(product.compare_at_price, currency)}
                              </p>
                            )}
                          </div>
                          <ArrowRight className="h-4 w-4 text-zinc-300 shrink-0" />
                        </button>
                      </motion.li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {/* Hint */}
            {query.trim().length === 0 && (
              <div className="px-5 py-8 text-center">
                <p className="text-sm text-zinc-400">Start typing to search products</p>
                <p className="mt-1 text-xs text-zinc-300">Press ESC to close</p>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
