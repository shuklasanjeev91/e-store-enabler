export const THEME_CATEGORIES = [
  { id: "fashion", name: "Fashion & Apparel", icon: "shirt" },
  { id: "grocery", name: "Grocery & Food", icon: "shopping-basket" },
  { id: "electronics", name: "Electronics", icon: "smartphone" },
  { id: "books", name: "Books & Stationery", icon: "book-open" },
  { id: "kids", name: "Kids & Toys", icon: "baby" },
  { id: "ayurvedic", name: "Ayurvedic & Wellness", icon: "leaf" },
] as const;

export type CategoryId = (typeof THEME_CATEGORIES)[number]["id"];

export const THEMES = [
  // Fashion & Apparel
  {
    id: "fashion-minimal",
    name: "Minimal Chic",
    description: "Clean lines with elegant typography",
    category: "fashion",
    preview: "https://images.unsplash.com/photo-1558171813-4c088753af8f?w=400&h=300&fit=crop",
    layout: "minimal",
  },
  {
    id: "fashion-bold",
    name: "Urban Edge",
    description: "Bold contrasts and street style vibes",
    category: "fashion",
    preview: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop",
    layout: "bold",
  },
  {
    id: "fashion-elegant",
    name: "Luxe Boutique",
    description: "Sophisticated luxury aesthetic",
    category: "fashion",
    preview: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400&h=300&fit=crop",
    layout: "elegant",
  },
  {
    id: "fashion-modern",
    name: "Runway Ready",
    description: "Contemporary grid-based layout",
    category: "fashion",
    preview: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&h=300&fit=crop",
    layout: "modern",
  },
  {
    id: "fashion-vintage",
    name: "Retro Glam",
    description: "Vintage-inspired with warm tones",
    category: "fashion",
    preview: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&h=300&fit=crop",
    layout: "minimal",
  },

  // Grocery & Food
  {
    id: "grocery-fresh",
    name: "Fresh Market",
    description: "Bright and inviting for fresh produce",
    category: "grocery",
    preview: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=300&fit=crop",
    layout: "minimal",
  },
  {
    id: "grocery-organic",
    name: "Organic Harvest",
    description: "Earthy tones for organic products",
    category: "grocery",
    preview: "https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=400&h=300&fit=crop",
    layout: "elegant",
  },
  {
    id: "grocery-modern",
    name: "Urban Pantry",
    description: "Modern design for city grocers",
    category: "grocery",
    preview: "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=400&h=300&fit=crop",
    layout: "modern",
  },
  {
    id: "grocery-gourmet",
    name: "Gourmet Kitchen",
    description: "Premium look for specialty foods",
    category: "grocery",
    preview: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop",
    layout: "bold",
  },
  {
    id: "grocery-local",
    name: "Local Farm",
    description: "Rustic charm for farm-fresh goods",
    category: "grocery",
    preview: "https://images.unsplash.com/photo-1550989460-0adf9ea622e2?w=400&h=300&fit=crop",
    layout: "minimal",
  },

  // Electronics
  {
    id: "electronics-tech",
    name: "Tech Hub",
    description: "Sleek dark theme for gadgets",
    category: "electronics",
    preview: "https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=400&h=300&fit=crop",
    layout: "bold",
  },
  {
    id: "electronics-minimal",
    name: "Digital Store",
    description: "Clean Apple-inspired design",
    category: "electronics",
    preview: "https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=400&h=300&fit=crop",
    layout: "minimal",
  },
  {
    id: "electronics-gaming",
    name: "Gamer Zone",
    description: "Vibrant colors for gaming gear",
    category: "electronics",
    preview: "https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?w=400&h=300&fit=crop",
    layout: "bold",
  },
  {
    id: "electronics-smart",
    name: "Smart Home",
    description: "Modern look for IoT devices",
    category: "electronics",
    preview: "https://images.unsplash.com/photo-1558089687-f282ffcbc126?w=400&h=300&fit=crop",
    layout: "modern",
  },
  {
    id: "electronics-pro",
    name: "Pro Gear",
    description: "Professional equipment showcase",
    category: "electronics",
    preview: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=300&fit=crop",
    layout: "elegant",
  },

  // Books & Stationery
  {
    id: "books-classic",
    name: "Classic Library",
    description: "Traditional bookstore feel",
    category: "books",
    preview: "https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=400&h=300&fit=crop",
    layout: "elegant",
  },
  {
    id: "books-modern",
    name: "Modern Reader",
    description: "Contemporary book lover's paradise",
    category: "books",
    preview: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=400&h=300&fit=crop",
    layout: "modern",
  },
  {
    id: "books-cozy",
    name: "Cozy Corner",
    description: "Warm and inviting reading nook",
    category: "books",
    preview: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&h=300&fit=crop",
    layout: "minimal",
  },
  {
    id: "books-academic",
    name: "Academic Press",
    description: "Professional for educational content",
    category: "books",
    preview: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=300&fit=crop",
    layout: "bold",
  },
  {
    id: "books-creative",
    name: "Creative Studio",
    description: "Artistic design for art books",
    category: "books",
    preview: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=300&fit=crop",
    layout: "modern",
  },

  // Kids & Toys
  {
    id: "kids-playful",
    name: "Playful Paradise",
    description: "Colorful and fun for children",
    category: "kids",
    preview: "https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=400&h=300&fit=crop",
    layout: "bold",
  },
  {
    id: "kids-pastel",
    name: "Pastel Dreams",
    description: "Soft pastels for baby products",
    category: "kids",
    preview: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=400&h=300&fit=crop",
    layout: "minimal",
  },
  {
    id: "kids-adventure",
    name: "Adventure Land",
    description: "Exciting theme for toys",
    category: "kids",
    preview: "https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=400&h=300&fit=crop",
    layout: "modern",
  },
  {
    id: "kids-educational",
    name: "Learning Fun",
    description: "Educational toys showcase",
    category: "kids",
    preview: "https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=400&h=300&fit=crop",
    layout: "elegant",
  },
  {
    id: "kids-cartoon",
    name: "Cartoon World",
    description: "Animated style for character toys",
    category: "kids",
    preview: "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=400&h=300&fit=crop",
    layout: "bold",
  },

  // Ayurvedic & Wellness
  {
    id: "ayurvedic-natural",
    name: "Natural Wellness",
    description: "Earthy tones for herbal products",
    category: "ayurvedic",
    preview: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400&h=300&fit=crop",
    layout: "minimal",
  },
  {
    id: "ayurvedic-spa",
    name: "Spa Retreat",
    description: "Calming design for wellness",
    category: "ayurvedic",
    preview: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=400&h=300&fit=crop",
    layout: "elegant",
  },
  {
    id: "ayurvedic-herbal",
    name: "Herbal Garden",
    description: "Green-focused for herbal remedies",
    category: "ayurvedic",
    preview: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop",
    layout: "modern",
  },
  {
    id: "ayurvedic-yoga",
    name: "Yoga Studio",
    description: "Peaceful design for yoga products",
    category: "ayurvedic",
    preview: "https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=400&h=300&fit=crop",
    layout: "minimal",
  },
  {
    id: "ayurvedic-premium",
    name: "Premium Ayurveda",
    description: "Luxury look for premium products",
    category: "ayurvedic",
    preview: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop",
    layout: "bold",
  },
] as const;

export type ThemeId = (typeof THEMES)[number]["id"];
export type LayoutType = "minimal" | "bold" | "elegant" | "modern";

export const getThemesByCategory = (categoryId: CategoryId) =>
  THEMES.filter((theme) => theme.category === categoryId);

export const getThemeLayout = (themeId: ThemeId): LayoutType => {
  const theme = THEMES.find((t) => t.id === themeId);
  return (theme?.layout as LayoutType) || "minimal";
};
