import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { z } from "zod";

const countries = [
  { code: "US", name: "United States", currency: "USD", symbol: "$" },
  { code: "GB", name: "United Kingdom", currency: "GBP", symbol: "£" },
  { code: "EU", name: "European Union", currency: "EUR", symbol: "€" },
  { code: "IN", name: "India", currency: "INR", symbol: "₹" },
  { code: "CA", name: "Canada", currency: "CAD", symbol: "CA$" },
  { code: "AU", name: "Australia", currency: "AUD", symbol: "A$" },
  { code: "JP", name: "Japan", currency: "JPY", symbol: "¥" },
  { code: "SG", name: "Singapore", currency: "SGD", symbol: "S$" },
  { code: "AE", name: "United Arab Emirates", currency: "AED", symbol: "د.إ" },
  { code: "BR", name: "Brazil", currency: "BRL", symbol: "R$" },
];

const storeNameSchema = z
  .string()
  .trim()
  .min(2, "Store name must be at least 2 characters")
  .max(50, "Store name must be less than 50 characters");

interface CreateStoreModalProps {
  isOpen: boolean;
  onStoreCreated: () => void;
}

export const CreateStoreModal = ({ isOpen, onStoreCreated }: CreateStoreModalProps) => {
  const [storeName, setStoreName] = useState("");
  const [country, setCountry] = useState("US");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedCountry = countries.find((c) => c.code === country);

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .substring(0, 30);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const result = storeNameSchema.safeParse(storeName);
    if (!result.success) {
      setError(result.error.errors[0].message);
      return;
    }

    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const slug = generateSlug(storeName) + "-" + Date.now().toString(36);

      const { error: insertError } = await supabase.from("stores").insert({
        user_id: user.id,
        name: storeName.trim(),
        slug,
        currency: selectedCountry?.currency || "USD",
        status: "draft",
      });

      if (insertError) {
        if (insertError.message.includes("duplicate")) {
          setError("A store with this name already exists. Please try another name.");
        } else {
          throw insertError;
        }
        return;
      }

      toast({
        title: "Store created!",
        description: `${storeName} is ready. Let's start adding products!`,
      });

      onStoreCreated();
    } catch (err) {
      console.error("Error creating store:", err);
      toast({
        title: "Failed to create store",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-primary/90 px-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-md rounded-2xl bg-background p-8 shadow-2xl"
          >
            {/* Logo */}
            <div className="mb-8 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
                <span className="font-display text-xl font-bold text-primary-foreground">S</span>
              </div>
              <span className="font-display text-2xl font-bold">Shopdu</span>
            </div>

            {/* Header */}
            <h2 className="mb-8 font-display text-2xl font-bold text-foreground">
              Enter business details
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Country/Currency Select */}
              <div className="space-y-2">
                <Label htmlFor="country">
                  Country <span className="text-destructive">*</span>
                </Label>
                <Select value={country} onValueChange={setCountry}>
                  <SelectTrigger className="h-12 bg-background">
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent className="bg-background border shadow-lg z-50">
                    {countries.map((c) => (
                      <SelectItem 
                        key={c.code} 
                        value={c.code}
                        className="cursor-pointer"
                      >
                        {c.name} ({c.symbol})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Business Name Input */}
              <div className="space-y-2">
                <Label htmlFor="storeName">
                  Business Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="storeName"
                  type="text"
                  value={storeName}
                  onChange={(e) => {
                    setStoreName(e.target.value);
                    setError(null);
                  }}
                  placeholder="Enter business name"
                  className={`h-12 ${error ? "border-destructive" : ""}`}
                  maxLength={50}
                />
                {error && <p className="text-sm text-destructive">{error}</p>}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="h-12 w-full"
                disabled={isSubmitting || !storeName.trim()}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Finish"
                )}
              </Button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
