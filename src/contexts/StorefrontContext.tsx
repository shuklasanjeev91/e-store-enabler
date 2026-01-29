import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Customer {
  id: string;
  store_id: string;
  email: string | null;
  phone: string | null;
  name: string | null;
  email_verified: boolean;
  phone_verified: boolean;
}

interface CartItem {
  id: string;
  product_id: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    price: number;
    compare_at_price: number | null;
    images: string[] | null;
  };
}

interface WishlistItem {
  id: string;
  product_id: string;
  product: {
    id: string;
    name: string;
    price: number;
    compare_at_price: number | null;
    images: string[] | null;
  };
}

interface Category {
  id: string;
  name: string;
  slug: string;
  image_url: string | null;
  parent_id: string | null;
}

interface StorePage {
  id: string;
  title: string;
  slug: string;
}

interface StorefrontContextType {
  customer: Customer | null;
  setCustomer: (customer: Customer | null) => void;
  cartItems: CartItem[];
  wishlistItems: WishlistItem[];
  categories: Category[];
  pages: StorePage[];
  cartId: string | null;
  sessionId: string;
  isAuthOpen: boolean;
  setIsAuthOpen: (open: boolean) => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  isWishlistOpen: boolean;
  setIsWishlistOpen: (open: boolean) => void;
  addToCart: (productId: string, quantity?: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  updateCartQuantity: (itemId: string, quantity: number) => Promise<void>;
  addToWishlist: (productId: string) => Promise<void>;
  removeFromWishlist: (itemId: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
  cartTotal: number;
  cartCount: number;
  refreshCart: () => Promise<void>;
  refreshWishlist: () => Promise<void>;
  storeId: string | null;
  setStoreId: (id: string | null) => void;
  currency: string;
  setCurrency: (currency: string) => void;
}

const StorefrontContext = createContext<StorefrontContextType | undefined>(undefined);

function generateSessionId(): string {
  return 'sess_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export function StorefrontProvider({ children }: { children: ReactNode }) {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [pages, setPages] = useState<StorePage[]>([]);
  const [cartId, setCartId] = useState<string | null>(null);
  const [storeId, setStoreId] = useState<string | null>(null);
  const [currency, setCurrency] = useState<string>("USD");
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);

  // Get or create session ID
  const [sessionId] = useState(() => {
    const stored = localStorage.getItem('storefront_session');
    if (stored) return stored;
    const newSession = generateSessionId();
    localStorage.setItem('storefront_session', newSession);
    return newSession;
  });

  // Load customer from localStorage
  useEffect(() => {
    const storedCustomer = localStorage.getItem('storefront_customer');
    if (storedCustomer) {
      try {
        setCustomer(JSON.parse(storedCustomer));
      } catch (e) {
        localStorage.removeItem('storefront_customer');
      }
    }
  }, []);

  // Save customer to localStorage
  useEffect(() => {
    if (customer) {
      localStorage.setItem('storefront_customer', JSON.stringify(customer));
    } else {
      localStorage.removeItem('storefront_customer');
    }
  }, [customer]);

  // Fetch categories and pages when store changes
  useEffect(() => {
    if (storeId) {
      fetchCategories();
      fetchPages();
    }
  }, [storeId]);

  // Fetch cart when store/session/customer changes
  useEffect(() => {
    if (storeId) {
      initializeCart();
    }
  }, [storeId, sessionId, customer]);

  // Fetch wishlist when customer changes
  useEffect(() => {
    if (customer) {
      fetchWishlist();
    } else {
      setWishlistItems([]);
    }
  }, [customer]);

  const fetchCategories = async () => {
    if (!storeId) return;
    const { data } = await supabase
      .from("categories")
      .select("*")
      .eq("store_id", storeId)
      .eq("status", "active")
      .order("sort_order");
    if (data) setCategories(data);
  };

  const fetchPages = async () => {
    if (!storeId) return;
    const { data } = await supabase
      .from("pages")
      .select("id, title, slug, sort_order")
      .eq("store_id", storeId)
      .eq("status", "published")
      .order("sort_order", { ascending: true });
    if (data) setPages(data);
  };

  const initializeCart = async () => {
    if (!storeId) return;

    // Try to find existing cart
    let query = supabase
      .from("carts")
      .select("id")
      .eq("store_id", storeId);

    if (customer) {
      query = query.eq("customer_id", customer.id);
    } else {
      query = query.eq("session_id", sessionId);
    }

    const { data: existingCart } = await query.maybeSingle();

    if (existingCart) {
      setCartId(existingCart.id);
      await refreshCart(existingCart.id);
    } else {
      // Create new cart
      const { data: newCart, error } = await supabase
        .from("carts")
        .insert({
          store_id: storeId,
          session_id: customer ? null : sessionId,
          customer_id: customer?.id || null,
        })
        .select("id")
        .single();

      if (newCart) {
        setCartId(newCart.id);
        setCartItems([]);
      }
    }
  };

  const refreshCart = async (cartIdOverride?: string) => {
    const id = cartIdOverride || cartId;
    if (!id) return;

    const { data } = await supabase
      .from("cart_items")
      .select(`
        id,
        product_id,
        quantity,
        product:products(id, name, price, compare_at_price, images)
      `)
      .eq("cart_id", id);

    if (data) {
      setCartItems(data as unknown as CartItem[]);
    }
  };

  const fetchWishlist = async () => {
    if (!customer) return;

    const { data } = await supabase
      .from("wishlists")
      .select(`
        id,
        product_id,
        product:products(id, name, price, compare_at_price, images)
      `)
      .eq("customer_id", customer.id);

    if (data) {
      setWishlistItems(data as unknown as WishlistItem[]);
    }
  };

  const refreshWishlist = async () => {
    await fetchWishlist();
  };

  const addToCart = async (productId: string, quantity: number = 1) => {
    if (!cartId) return;

    // Check if item already exists
    const existingItem = cartItems.find(item => item.product_id === productId);

    if (existingItem) {
      await updateCartQuantity(existingItem.id, existingItem.quantity + quantity);
    } else {
      await supabase
        .from("cart_items")
        .insert({
          cart_id: cartId,
          product_id: productId,
          quantity,
        });
      await refreshCart();
    }
  };

  const removeFromCart = async (itemId: string) => {
    await supabase.from("cart_items").delete().eq("id", itemId);
    await refreshCart();
  };

  const updateCartQuantity = async (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      await removeFromCart(itemId);
    } else {
      await supabase
        .from("cart_items")
        .update({ quantity })
        .eq("id", itemId);
      await refreshCart();
    }
  };

  const addToWishlist = async (productId: string) => {
    if (!customer) {
      setIsAuthOpen(true);
      return;
    }

    await supabase
      .from("wishlists")
      .insert({
        customer_id: customer.id,
        product_id: productId,
      });
    await fetchWishlist();
  };

  const removeFromWishlist = async (itemId: string) => {
    await supabase.from("wishlists").delete().eq("id", itemId);
    await fetchWishlist();
  };

  const isInWishlist = (productId: string) => {
    return wishlistItems.some(item => item.product_id === productId);
  };

  const cartTotal = cartItems.reduce((sum, item) => {
    return sum + (item.product?.price || 0) * item.quantity;
  }, 0);

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <StorefrontContext.Provider
      value={{
        customer,
        setCustomer,
        cartItems,
        wishlistItems,
        categories,
        pages,
        cartId,
        sessionId,
        isAuthOpen,
        setIsAuthOpen,
        isCartOpen,
        setIsCartOpen,
        isWishlistOpen,
        setIsWishlistOpen,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        cartTotal,
        cartCount,
        refreshCart,
        refreshWishlist,
        storeId,
        setStoreId,
        currency,
        setCurrency,
      }}
    >
      {children}
    </StorefrontContext.Provider>
  );
}

export function useStorefront() {
  const context = useContext(StorefrontContext);
  if (!context) {
    throw new Error("useStorefront must be used within StorefrontProvider");
  }
  return context;
}
