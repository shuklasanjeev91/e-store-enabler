export const THEMES = [
  {
    id: "minimal",
    name: "Minimal",
    description: "Clean and simple with lots of whitespace",
    preview: "bg-white border-gray-200",
  },
  {
    id: "bold",
    name: "Bold",
    description: "Strong typography and vibrant colors",
    preview: "bg-slate-900 border-slate-700",
  },
  {
    id: "elegant",
    name: "Elegant",
    description: "Sophisticated luxury aesthetic",
    preview: "bg-stone-100 border-stone-300",
  },
  {
    id: "modern",
    name: "Modern",
    description: "Contemporary grid-based layout",
    preview: "bg-zinc-50 border-zinc-200",
  },
] as const;

export type ThemeId = (typeof THEMES)[number]["id"];
