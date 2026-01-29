// Theme Configuration System
// Each category has unique colors, typography, and styling optimized for its products

export interface ThemeColors {
  // Primary palette
  primary: string;
  primaryForeground: string;
  primaryHover: string;
  
  // Secondary/accent
  accent: string;
  accentForeground: string;
  
  // Backgrounds
  background: string;
  backgroundSecondary: string;
  backgroundTertiary: string;
  
  // Text
  foreground: string;
  foregroundMuted: string;
  foregroundSubtle: string;
  
  // Borders
  border: string;
  borderSubtle: string;
  
  // Status colors
  success: string;
  warning: string;
  error: string;
  sale: string;
  
  // Special
  gradient?: string;
  overlay?: string;
}

export interface ThemeTypography {
  fontFamily: string;
  headingFamily: string;
  headingWeight: string;
  headingStyle: "uppercase" | "capitalize" | "normal";
  letterSpacing: string;
}

export interface ThemeStyle {
  borderRadius: "none" | "sm" | "md" | "lg" | "xl" | "2xl" | "full";
  cardStyle: "flat" | "elevated" | "bordered" | "glass";
  buttonStyle: "solid" | "outline" | "ghost" | "gradient";
  imageStyle: "square" | "rounded" | "portrait" | "landscape";
  headerStyle: "minimal" | "centered" | "full-width" | "split";
  heroStyle: "minimal" | "image-bg" | "split" | "carousel" | "video";
  productCardStyle: "minimal" | "detailed" | "overlay" | "magazine";
}

export interface CategoryThemeConfig {
  id: string;
  name: string;
  description: string;
  category: string;
  colors: ThemeColors;
  typography: ThemeTypography;
  style: ThemeStyle;
  features: string[];
}

// ==========================================
// FASHION & APPAREL THEMES
// ==========================================

export const fashionMinimalChic: CategoryThemeConfig = {
  id: "fashion-minimal",
  name: "Minimal Chic",
  description: "Clean lines with elegant typography",
  category: "fashion",
  colors: {
    primary: "#1a1a1a",
    primaryForeground: "#ffffff",
    primaryHover: "#333333",
    accent: "#c9a96e",
    accentForeground: "#1a1a1a",
    background: "#ffffff",
    backgroundSecondary: "#fafafa",
    backgroundTertiary: "#f5f5f5",
    foreground: "#1a1a1a",
    foregroundMuted: "#666666",
    foregroundSubtle: "#999999",
    border: "#e5e5e5",
    borderSubtle: "#f0f0f0",
    success: "#22c55e",
    warning: "#f59e0b",
    error: "#ef4444",
    sale: "#ef4444",
  },
  typography: {
    fontFamily: "'Inter', sans-serif",
    headingFamily: "'Playfair Display', serif",
    headingWeight: "300",
    headingStyle: "normal",
    letterSpacing: "0.02em",
  },
  style: {
    borderRadius: "none",
    cardStyle: "flat",
    buttonStyle: "solid",
    imageStyle: "portrait",
    headerStyle: "minimal",
    heroStyle: "minimal",
    productCardStyle: "minimal",
  },
  features: ["wishlist", "quick-view", "size-guide", "lookbook"],
};

export const fashionUrbanEdge: CategoryThemeConfig = {
  id: "fashion-bold",
  name: "Urban Edge",
  description: "Bold contrasts and street style vibes",
  category: "fashion",
  colors: {
    primary: "#000000",
    primaryForeground: "#ffffff",
    primaryHover: "#1a1a1a",
    accent: "#ff3d00",
    accentForeground: "#ffffff",
    background: "#0a0a0a",
    backgroundSecondary: "#141414",
    backgroundTertiary: "#1f1f1f",
    foreground: "#ffffff",
    foregroundMuted: "#a3a3a3",
    foregroundSubtle: "#737373",
    border: "#2a2a2a",
    borderSubtle: "#1f1f1f",
    success: "#22c55e",
    warning: "#f59e0b",
    error: "#ef4444",
    sale: "#ff3d00",
    gradient: "linear-gradient(135deg, #ff3d00 0%, #ff6b35 100%)",
  },
  typography: {
    fontFamily: "'Space Grotesk', sans-serif",
    headingFamily: "'Space Grotesk', sans-serif",
    headingWeight: "700",
    headingStyle: "uppercase",
    letterSpacing: "0.05em",
  },
  style: {
    borderRadius: "none",
    cardStyle: "bordered",
    buttonStyle: "solid",
    imageStyle: "square",
    headerStyle: "full-width",
    heroStyle: "image-bg",
    productCardStyle: "overlay",
  },
  features: ["wishlist", "quick-view", "size-guide", "streetwear-drops"],
};

export const fashionLuxeBoutique: CategoryThemeConfig = {
  id: "fashion-elegant",
  name: "Luxe Boutique",
  description: "Sophisticated luxury aesthetic",
  category: "fashion",
  colors: {
    primary: "#1e1e2e",
    primaryForeground: "#ffffff",
    primaryHover: "#2e2e3e",
    accent: "#d4af37",
    accentForeground: "#1e1e2e",
    background: "#f8f6f3",
    backgroundSecondary: "#f0ede8",
    backgroundTertiary: "#e8e4dd",
    foreground: "#1e1e2e",
    foregroundMuted: "#5c5c6d",
    foregroundSubtle: "#8c8c9a",
    border: "#d4d0c8",
    borderSubtle: "#e8e4dd",
    success: "#22c55e",
    warning: "#f59e0b",
    error: "#dc2626",
    sale: "#9f1239",
    gradient: "linear-gradient(135deg, #d4af37 0%, #f5d87a 100%)",
  },
  typography: {
    fontFamily: "'Cormorant Garamond', serif",
    headingFamily: "'Cormorant Garamond', serif",
    headingWeight: "300",
    headingStyle: "normal",
    letterSpacing: "0.15em",
  },
  style: {
    borderRadius: "none",
    cardStyle: "flat",
    buttonStyle: "outline",
    imageStyle: "portrait",
    headerStyle: "centered",
    heroStyle: "split",
    productCardStyle: "magazine",
  },
  features: ["wishlist", "quick-view", "size-guide", "personal-shopper", "gift-wrap"],
};

export const fashionRunwayReady: CategoryThemeConfig = {
  id: "fashion-modern",
  name: "Runway Ready",
  description: "Contemporary grid-based layout",
  category: "fashion",
  colors: {
    primary: "#0f172a",
    primaryForeground: "#ffffff",
    primaryHover: "#1e293b",
    accent: "#3b82f6",
    accentForeground: "#ffffff",
    background: "#ffffff",
    backgroundSecondary: "#f8fafc",
    backgroundTertiary: "#f1f5f9",
    foreground: "#0f172a",
    foregroundMuted: "#475569",
    foregroundSubtle: "#94a3b8",
    border: "#e2e8f0",
    borderSubtle: "#f1f5f9",
    success: "#22c55e",
    warning: "#f59e0b",
    error: "#ef4444",
    sale: "#ef4444",
  },
  typography: {
    fontFamily: "'Inter', sans-serif",
    headingFamily: "'Space Grotesk', sans-serif",
    headingWeight: "600",
    headingStyle: "normal",
    letterSpacing: "0",
  },
  style: {
    borderRadius: "lg",
    cardStyle: "elevated",
    buttonStyle: "solid",
    imageStyle: "portrait",
    headerStyle: "split",
    heroStyle: "carousel",
    productCardStyle: "detailed",
  },
  features: ["wishlist", "quick-view", "size-guide", "trending-now"],
};

export const fashionRetroGlam: CategoryThemeConfig = {
  id: "fashion-vintage",
  name: "Retro Glam",
  description: "Vintage-inspired with warm tones",
  category: "fashion",
  colors: {
    primary: "#78350f",
    primaryForeground: "#ffffff",
    primaryHover: "#92400e",
    accent: "#c084fc",
    accentForeground: "#ffffff",
    background: "#fef3c7",
    backgroundSecondary: "#fde68a",
    backgroundTertiary: "#fcd34d",
    foreground: "#78350f",
    foregroundMuted: "#92400e",
    foregroundSubtle: "#b45309",
    border: "#d97706",
    borderSubtle: "#f59e0b",
    success: "#22c55e",
    warning: "#f59e0b",
    error: "#ef4444",
    sale: "#c084fc",
  },
  typography: {
    fontFamily: "'DM Sans', sans-serif",
    headingFamily: "'Abril Fatface', serif",
    headingWeight: "400",
    headingStyle: "normal",
    letterSpacing: "0.02em",
  },
  style: {
    borderRadius: "xl",
    cardStyle: "bordered",
    buttonStyle: "solid",
    imageStyle: "rounded",
    headerStyle: "centered",
    heroStyle: "image-bg",
    productCardStyle: "detailed",
  },
  features: ["wishlist", "quick-view", "size-guide", "vintage-collection"],
};

// ==========================================
// GROCERY & FOOD THEMES
// ==========================================

export const groceryFreshMarket: CategoryThemeConfig = {
  id: "grocery-fresh",
  name: "Fresh Market",
  description: "Bright and inviting for fresh produce",
  category: "grocery",
  colors: {
    primary: "#16a34a",
    primaryForeground: "#ffffff",
    primaryHover: "#15803d",
    accent: "#f97316",
    accentForeground: "#ffffff",
    background: "#ffffff",
    backgroundSecondary: "#f0fdf4",
    backgroundTertiary: "#dcfce7",
    foreground: "#14532d",
    foregroundMuted: "#166534",
    foregroundSubtle: "#22c55e",
    border: "#bbf7d0",
    borderSubtle: "#dcfce7",
    success: "#22c55e",
    warning: "#f97316",
    error: "#ef4444",
    sale: "#ef4444",
  },
  typography: {
    fontFamily: "'Nunito', sans-serif",
    headingFamily: "'Nunito', sans-serif",
    headingWeight: "700",
    headingStyle: "normal",
    letterSpacing: "0",
  },
  style: {
    borderRadius: "xl",
    cardStyle: "elevated",
    buttonStyle: "solid",
    imageStyle: "square",
    headerStyle: "full-width",
    heroStyle: "carousel",
    productCardStyle: "detailed",
  },
  features: ["quick-add", "weight-selection", "recipe-suggestions", "weekly-deals"],
};

export const groceryOrganicHarvest: CategoryThemeConfig = {
  id: "grocery-organic",
  name: "Organic Harvest",
  description: "Earthy tones for organic products",
  category: "grocery",
  colors: {
    primary: "#854d0e",
    primaryForeground: "#ffffff",
    primaryHover: "#713f12",
    accent: "#65a30d",
    accentForeground: "#ffffff",
    background: "#fefce8",
    backgroundSecondary: "#fef9c3",
    backgroundTertiary: "#fef08a",
    foreground: "#422006",
    foregroundMuted: "#713f12",
    foregroundSubtle: "#a16207",
    border: "#ca8a04",
    borderSubtle: "#eab308",
    success: "#65a30d",
    warning: "#d97706",
    error: "#dc2626",
    sale: "#dc2626",
  },
  typography: {
    fontFamily: "'Merriweather', serif",
    headingFamily: "'Merriweather', serif",
    headingWeight: "400",
    headingStyle: "normal",
    letterSpacing: "0.01em",
  },
  style: {
    borderRadius: "lg",
    cardStyle: "flat",
    buttonStyle: "solid",
    imageStyle: "rounded",
    headerStyle: "centered",
    heroStyle: "split",
    productCardStyle: "minimal",
  },
  features: ["organic-certified", "farm-info", "nutritional-info", "subscription"],
};

export const groceryUrbanPantry: CategoryThemeConfig = {
  id: "grocery-modern",
  name: "Urban Pantry",
  description: "Modern design for city grocers",
  category: "grocery",
  colors: {
    primary: "#18181b",
    primaryForeground: "#ffffff",
    primaryHover: "#27272a",
    accent: "#a855f7",
    accentForeground: "#ffffff",
    background: "#ffffff",
    backgroundSecondary: "#fafafa",
    backgroundTertiary: "#f4f4f5",
    foreground: "#18181b",
    foregroundMuted: "#52525b",
    foregroundSubtle: "#a1a1aa",
    border: "#e4e4e7",
    borderSubtle: "#f4f4f5",
    success: "#22c55e",
    warning: "#f59e0b",
    error: "#ef4444",
    sale: "#a855f7",
  },
  typography: {
    fontFamily: "'Inter', sans-serif",
    headingFamily: "'Space Grotesk', sans-serif",
    headingWeight: "600",
    headingStyle: "normal",
    letterSpacing: "0",
  },
  style: {
    borderRadius: "lg",
    cardStyle: "elevated",
    buttonStyle: "solid",
    imageStyle: "square",
    headerStyle: "split",
    heroStyle: "minimal",
    productCardStyle: "detailed",
  },
  features: ["quick-add", "express-delivery", "meal-kits", "smart-lists"],
};

export const groceryGourmetKitchen: CategoryThemeConfig = {
  id: "grocery-gourmet",
  name: "Gourmet Kitchen",
  description: "Premium look for specialty foods",
  category: "grocery",
  colors: {
    primary: "#1c1917",
    primaryForeground: "#fafaf9",
    primaryHover: "#292524",
    accent: "#b91c1c",
    accentForeground: "#ffffff",
    background: "#1c1917",
    backgroundSecondary: "#292524",
    backgroundTertiary: "#44403c",
    foreground: "#fafaf9",
    foregroundMuted: "#d6d3d1",
    foregroundSubtle: "#a8a29e",
    border: "#44403c",
    borderSubtle: "#57534e",
    success: "#22c55e",
    warning: "#f59e0b",
    error: "#ef4444",
    sale: "#fbbf24",
    gradient: "linear-gradient(135deg, #b91c1c 0%, #dc2626 100%)",
  },
  typography: {
    fontFamily: "'Lora', serif",
    headingFamily: "'Playfair Display', serif",
    headingWeight: "400",
    headingStyle: "normal",
    letterSpacing: "0.05em",
  },
  style: {
    borderRadius: "sm",
    cardStyle: "bordered",
    buttonStyle: "outline",
    imageStyle: "square",
    headerStyle: "centered",
    heroStyle: "image-bg",
    productCardStyle: "overlay",
  },
  features: ["chef-picks", "wine-pairing", "gift-baskets", "tasting-notes"],
};

export const groceryLocalFarm: CategoryThemeConfig = {
  id: "grocery-local",
  name: "Local Farm",
  description: "Rustic charm for farm-fresh goods",
  category: "grocery",
  colors: {
    primary: "#365314",
    primaryForeground: "#ffffff",
    primaryHover: "#3f6212",
    accent: "#ea580c",
    accentForeground: "#ffffff",
    background: "#ecfccb",
    backgroundSecondary: "#d9f99d",
    backgroundTertiary: "#bef264",
    foreground: "#1a2e05",
    foregroundMuted: "#365314",
    foregroundSubtle: "#4d7c0f",
    border: "#84cc16",
    borderSubtle: "#a3e635",
    success: "#22c55e",
    warning: "#f97316",
    error: "#dc2626",
    sale: "#dc2626",
  },
  typography: {
    fontFamily: "'Quicksand', sans-serif",
    headingFamily: "'Amatic SC', cursive",
    headingWeight: "700",
    headingStyle: "normal",
    letterSpacing: "0.02em",
  },
  style: {
    borderRadius: "2xl",
    cardStyle: "flat",
    buttonStyle: "solid",
    imageStyle: "rounded",
    headerStyle: "minimal",
    heroStyle: "split",
    productCardStyle: "minimal",
  },
  features: ["farmer-profiles", "seasonal-picks", "farm-tours", "csa-boxes"],
};

// ==========================================
// ELECTRONICS THEMES
// ==========================================

export const electronicsTechHub: CategoryThemeConfig = {
  id: "electronics-tech",
  name: "Tech Hub",
  description: "Sleek dark theme for gadgets",
  category: "electronics",
  colors: {
    primary: "#6366f1",
    primaryForeground: "#ffffff",
    primaryHover: "#4f46e5",
    accent: "#22d3ee",
    accentForeground: "#0a0a0a",
    background: "#0a0a0a",
    backgroundSecondary: "#171717",
    backgroundTertiary: "#262626",
    foreground: "#fafafa",
    foregroundMuted: "#a3a3a3",
    foregroundSubtle: "#737373",
    border: "#262626",
    borderSubtle: "#404040",
    success: "#22c55e",
    warning: "#f59e0b",
    error: "#ef4444",
    sale: "#22d3ee",
    gradient: "linear-gradient(135deg, #6366f1 0%, #22d3ee 100%)",
  },
  typography: {
    fontFamily: "'Inter', sans-serif",
    headingFamily: "'Space Grotesk', sans-serif",
    headingWeight: "700",
    headingStyle: "normal",
    letterSpacing: "-0.02em",
  },
  style: {
    borderRadius: "xl",
    cardStyle: "glass",
    buttonStyle: "gradient",
    imageStyle: "square",
    headerStyle: "full-width",
    heroStyle: "video",
    productCardStyle: "overlay",
  },
  features: ["specs-comparison", "3d-view", "tech-specs", "compatibility-check"],
};

export const electronicsDigitalStore: CategoryThemeConfig = {
  id: "electronics-minimal",
  name: "Digital Store",
  description: "Clean Apple-inspired design",
  category: "electronics",
  colors: {
    primary: "#0a0a0a",
    primaryForeground: "#ffffff",
    primaryHover: "#262626",
    accent: "#0ea5e9",
    accentForeground: "#ffffff",
    background: "#ffffff",
    backgroundSecondary: "#f5f5f5",
    backgroundTertiary: "#e5e5e5",
    foreground: "#0a0a0a",
    foregroundMuted: "#525252",
    foregroundSubtle: "#a3a3a3",
    border: "#e5e5e5",
    borderSubtle: "#f5f5f5",
    success: "#22c55e",
    warning: "#f59e0b",
    error: "#ef4444",
    sale: "#ef4444",
  },
  typography: {
    fontFamily: "'SF Pro Display', -apple-system, sans-serif",
    headingFamily: "'SF Pro Display', -apple-system, sans-serif",
    headingWeight: "600",
    headingStyle: "normal",
    letterSpacing: "-0.02em",
  },
  style: {
    borderRadius: "2xl",
    cardStyle: "flat",
    buttonStyle: "solid",
    imageStyle: "square",
    headerStyle: "minimal",
    heroStyle: "minimal",
    productCardStyle: "minimal",
  },
  features: ["specs-comparison", "3d-view", "apple-pay", "trade-in"],
};

export const electronicsGamerZone: CategoryThemeConfig = {
  id: "electronics-gaming",
  name: "Gamer Zone",
  description: "Vibrant colors for gaming gear",
  category: "electronics",
  colors: {
    primary: "#7c3aed",
    primaryForeground: "#ffffff",
    primaryHover: "#6d28d9",
    accent: "#10b981",
    accentForeground: "#ffffff",
    background: "#0c0a09",
    backgroundSecondary: "#1c1917",
    backgroundTertiary: "#292524",
    foreground: "#fafaf9",
    foregroundMuted: "#a8a29e",
    foregroundSubtle: "#78716c",
    border: "#292524",
    borderSubtle: "#44403c",
    success: "#10b981",
    warning: "#f59e0b",
    error: "#ef4444",
    sale: "#f43f5e",
    gradient: "linear-gradient(135deg, #7c3aed 0%, #10b981 50%, #06b6d4 100%)",
  },
  typography: {
    fontFamily: "'Rajdhani', sans-serif",
    headingFamily: "'Orbitron', sans-serif",
    headingWeight: "700",
    headingStyle: "uppercase",
    letterSpacing: "0.05em",
  },
  style: {
    borderRadius: "md",
    cardStyle: "bordered",
    buttonStyle: "gradient",
    imageStyle: "square",
    headerStyle: "full-width",
    heroStyle: "video",
    productCardStyle: "overlay",
  },
  features: ["pc-builder", "rgb-preview", "fps-benchmarks", "esports-gear"],
};

export const electronicsSmartHome: CategoryThemeConfig = {
  id: "electronics-smart",
  name: "Smart Home",
  description: "Modern look for IoT devices",
  category: "electronics",
  colors: {
    primary: "#0369a1",
    primaryForeground: "#ffffff",
    primaryHover: "#0284c7",
    accent: "#f472b6",
    accentForeground: "#ffffff",
    background: "#f0f9ff",
    backgroundSecondary: "#e0f2fe",
    backgroundTertiary: "#bae6fd",
    foreground: "#0c4a6e",
    foregroundMuted: "#0369a1",
    foregroundSubtle: "#0ea5e9",
    border: "#7dd3fc",
    borderSubtle: "#bae6fd",
    success: "#22c55e",
    warning: "#f59e0b",
    error: "#ef4444",
    sale: "#f472b6",
  },
  typography: {
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    headingFamily: "'Plus Jakarta Sans', sans-serif",
    headingWeight: "600",
    headingStyle: "normal",
    letterSpacing: "0",
  },
  style: {
    borderRadius: "2xl",
    cardStyle: "elevated",
    buttonStyle: "solid",
    imageStyle: "rounded",
    headerStyle: "split",
    heroStyle: "split",
    productCardStyle: "detailed",
  },
  features: ["compatibility-check", "voice-assistant", "energy-savings", "room-setup"],
};

export const electronicsProGear: CategoryThemeConfig = {
  id: "electronics-pro",
  name: "Pro Gear",
  description: "Professional equipment showcase",
  category: "electronics",
  colors: {
    primary: "#171717",
    primaryForeground: "#fafafa",
    primaryHover: "#262626",
    accent: "#facc15",
    accentForeground: "#171717",
    background: "#fafafa",
    backgroundSecondary: "#f5f5f5",
    backgroundTertiary: "#e5e5e5",
    foreground: "#171717",
    foregroundMuted: "#525252",
    foregroundSubtle: "#737373",
    border: "#d4d4d4",
    borderSubtle: "#e5e5e5",
    success: "#22c55e",
    warning: "#f59e0b",
    error: "#ef4444",
    sale: "#ef4444",
  },
  typography: {
    fontFamily: "'IBM Plex Sans', sans-serif",
    headingFamily: "'IBM Plex Sans', sans-serif",
    headingWeight: "600",
    headingStyle: "normal",
    letterSpacing: "0",
  },
  style: {
    borderRadius: "md",
    cardStyle: "bordered",
    buttonStyle: "outline",
    imageStyle: "landscape",
    headerStyle: "full-width",
    heroStyle: "minimal",
    productCardStyle: "detailed",
  },
  features: ["specs-comparison", "pro-support", "bulk-pricing", "warranty-info"],
};

// Export all theme configs grouped by category
export const THEME_CONFIGS: Record<string, CategoryThemeConfig> = {
  // Fashion
  "fashion-minimal": fashionMinimalChic,
  "fashion-bold": fashionUrbanEdge,
  "fashion-elegant": fashionLuxeBoutique,
  "fashion-modern": fashionRunwayReady,
  "fashion-vintage": fashionRetroGlam,
  // Grocery
  "grocery-fresh": groceryFreshMarket,
  "grocery-organic": groceryOrganicHarvest,
  "grocery-modern": groceryUrbanPantry,
  "grocery-gourmet": groceryGourmetKitchen,
  "grocery-local": groceryLocalFarm,
  // Electronics
  "electronics-tech": electronicsTechHub,
  "electronics-minimal": electronicsDigitalStore,
  "electronics-gaming": electronicsGamerZone,
  "electronics-smart": electronicsSmartHome,
  "electronics-pro": electronicsProGear,
};

export function getThemeConfig(themeId: string): CategoryThemeConfig | undefined {
  return THEME_CONFIGS[themeId];
}

export function getThemesByCategory(categoryId: string): CategoryThemeConfig[] {
  return Object.values(THEME_CONFIGS).filter(t => t.category === categoryId);
}
