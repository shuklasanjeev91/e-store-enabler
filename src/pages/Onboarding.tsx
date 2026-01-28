import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
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
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { Loader2, Check } from "lucide-react";
import { z } from "zod";
import { THEMES, type ThemeId } from "@/components/storefront/themes";
import { cn } from "@/lib/utils";

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

export default function Onboarding() {
  const [storeName, setStoreName] = useState("");
  const [country, setCountry] = useState("US");
  const [selectedTheme, setSelectedTheme] = useState<ThemeId>("minimal");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingStores, setIsCheckingStores] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  const selectedCountry = countries.find((c) => c.code === country);

  useEffect(() => {
    const checkStores = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from("stores")
          .select("id")
          .limit(1);

        if (error) throw error;

        if (data && data.length > 0) {
          navigate("/dashboard");
        }
      } catch (err) {
        console.error("Error checking stores:", err);
      } finally {
        setIsCheckingStores(false);
      }
    };

    if (user && !isLoading) {
      checkStores();
    }
  }, [user, isLoading, navigate]);

  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/auth");
    }
  }, [user, isLoading, navigate]);

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
      if (!user) throw new Error("Not authenticated");

      const slug = generateSlug(storeName);

      const { error: insertError } = await supabase.from("stores").insert({
        user_id: user.id,
        name: storeName.trim(),
        slug,
        currency: selectedCountry?.currency || "USD",
        status: "draft",
        theme: selectedTheme,
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

      navigate("/dashboard");
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

  if (isLoading || isCheckingStores) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-primary">
        <Loader2 className="h-8 w-8 animate-spin text-primary-foreground" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-primary p-4">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute bottom-20 -left-20 h-64 w-64 rounded-full bg-white/5 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative z-10 w-full max-w-2xl rounded-2xl bg-background p-8 shadow-2xl"
      >
        {/* Logo */}
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
            <span className="font-display text-xl font-bold text-primary-foreground">S</span>
          </div>
          <span className="font-display text-2xl font-bold">Shopdu</span>
        </div>

        {/* Header */}
        <h1 className="mb-8 font-display text-2xl font-bold text-foreground">
          Create your store
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-6 sm:grid-cols-2">
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
          </div>

          {/* Theme Selection */}
          <div className="space-y-3">
            <Label>Choose a theme</Label>
            <div className="grid gap-3 sm:grid-cols-2">
              {THEMES.map((theme) => (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => setSelectedTheme(theme.id)}
                  className={cn(
                    "relative flex items-start gap-3 rounded-xl border-2 p-4 text-left transition-all",
                    selectedTheme === theme.id
                      ? "border-primary bg-primary/5"
                      : "border-muted hover:border-muted-foreground/30"
                  )}
                >
                  {/* Theme preview swatch */}
                  <div className={cn(
                    "h-10 w-10 shrink-0 rounded-lg border",
                    theme.preview
                  )} />
                  <div className="flex-1">
                    <p className="font-medium">{theme.name}</p>
                    <p className="text-sm text-muted-foreground">{theme.description}</p>
                  </div>
                  {selectedTheme === theme.id && (
                    <div className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-primary">
                      <Check className="h-3 w-3 text-primary-foreground" />
                    </div>
                  )}
                </button>
              ))}
            </div>
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
              "Create Store"
            )}
          </Button>
        </form>
      </motion.div>
    </div>
  );
}
