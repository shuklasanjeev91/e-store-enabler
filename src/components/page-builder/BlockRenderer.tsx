import { useState, useEffect } from "react";
import { type PageBlock, type VideoBlock, type ProductGridBlock, type CountdownBlock, type AccordionBlock, isBlockContent, parseBlocks } from "./types";
import { supabase } from "@/integrations/supabase/client";

interface BlockRendererProps {
  content: string | null;
  primaryColor?: string;
  storeId?: string;
  currency?: string;
}

const PADDING_MAP: Record<string, string> = {
  none: "p-0",
  sm: "px-4 py-3",
  md: "px-6 py-6",
  lg: "px-8 py-10",
  xl: "px-10 py-16",
};

function BlockWrapper({ block, children }: { block: PageBlock; children: React.ReactNode }) {
  const padding = PADDING_MAP[block.styling?.padding || "none"];
  const bg = block.styling?.backgroundColor;
  return (
    <div className={padding} style={bg ? { backgroundColor: bg } : undefined}>
      {children}
    </div>
  );
}

export default function BlockRenderer({ content, primaryColor = "#2563eb", storeId, currency = "USD" }: BlockRendererProps) {
  if (!content) return null;

  if (!isBlockContent(content)) {
    return (
      <div
        className="prose prose-gray prose-lg max-w-none prose-headings:font-light prose-headings:tracking-tight prose-p:leading-relaxed prose-a:underline prose-a:underline-offset-4 prose-img:rounded-xl prose-img:w-full"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    );
  }

  const blocks = parseBlocks(content);

  return (
    <div className="space-y-0">
      {blocks.map((block) => (
        <BlockWrapper key={block.id} block={block}>
          <RenderBlock block={block} primaryColor={primaryColor} storeId={storeId} currency={currency} />
        </BlockWrapper>
      ))}
    </div>
  );
}

function RenderBlock({ block, primaryColor, storeId, currency }: { block: PageBlock; primaryColor: string; storeId?: string; currency?: string }) {
  switch (block.type) {
    case "text":
      return (
        <div
          className={`
            ${block.fontSize === "sm" ? "text-sm" : ""}
            ${block.fontSize === "base" ? "text-base" : ""}
            ${block.fontSize === "lg" ? "text-lg" : ""}
            ${block.fontSize === "xl" ? "text-xl" : ""}
            ${block.fontSize === "2xl" ? "text-2xl" : ""}
            ${block.fontSize === "3xl" ? "text-3xl md:text-4xl" : ""}
            ${block.fontWeight === "medium" ? "font-medium" : ""}
            ${block.fontWeight === "semibold" ? "font-semibold" : ""}
            ${block.fontWeight === "bold" ? "font-bold" : ""}
            ${block.alignment === "center" ? "text-center" : ""}
            ${block.alignment === "right" ? "text-right" : ""}
            prose prose-gray max-w-none py-2
          `}
          dangerouslySetInnerHTML={{ __html: block.content }}
        />
      );

    case "image":
      if (!block.src) return null;
      return (
        <div className={`py-4 ${block.width === "small" ? "max-w-sm mx-auto" : block.width === "medium" ? "max-w-2xl mx-auto" : block.width === "large" ? "max-w-4xl mx-auto" : ""}`}>
          <img
            src={block.src}
            alt={block.alt}
            className={`w-full object-cover ${
              block.borderRadius === "none" ? "rounded-none" :
              block.borderRadius === "md" ? "rounded-md" :
              block.borderRadius === "lg" ? "rounded-lg" :
              block.borderRadius === "xl" ? "rounded-xl" :
              block.borderRadius === "2xl" ? "rounded-2xl" : "rounded-lg"
            }`}
          />
        </div>
      );

    case "button":
      return (
        <div className={`py-4 ${block.alignment === "center" ? "text-center" : block.alignment === "right" ? "text-right" : ""}`}>
          <a
            href={block.url}
            className={`inline-flex items-center justify-center font-semibold transition-all
              ${block.size === "sm" ? "px-4 py-2 text-sm" : block.size === "lg" ? "px-8 py-4 text-base" : "px-6 py-3 text-sm"}
              rounded-lg
              ${block.variant === "outline" ? "border-2" : ""}
              ${block.variant === "ghost" ? "hover:opacity-70" : ""}
            `}
            style={{
              backgroundColor: block.variant === "primary" ? primaryColor : "transparent",
              color: block.variant === "primary" ? "#fff" : primaryColor,
              borderColor: block.variant === "outline" ? primaryColor : undefined,
            }}
          >
            {block.text}
          </a>
        </div>
      );

    case "columns":
      return (
        <div
          className={`py-6 grid
            ${block.columns === 2 ? "grid-cols-1 md:grid-cols-2" : block.columns === 3 ? "grid-cols-1 md:grid-cols-3" : "grid-cols-1 md:grid-cols-4"}
            ${block.gap === "sm" ? "gap-4" : block.gap === "lg" ? "gap-8" : "gap-6"}
          `}
        >
          {block.items.map((item, i) => (
            <div key={i} className="space-y-3">
              {item.imageUrl && <img src={item.imageUrl} alt="" className="w-full rounded-lg object-cover aspect-video" />}
              {item.heading && <h3 className="text-lg font-semibold">{item.heading}</h3>}
              <p className="text-sm leading-relaxed opacity-80">{item.content}</p>
            </div>
          ))}
        </div>
      );

    case "spacer":
      return (
        <div className={`
          ${block.height === "sm" ? "h-6" : ""}
          ${block.height === "md" ? "h-12" : ""}
          ${block.height === "lg" ? "h-20" : ""}
          ${block.height === "xl" ? "h-32" : ""}
        `} />
      );

    case "video":
      return <VideoBlockRenderer block={block} />;

    case "product_grid":
      return <ProductGridRenderer block={block} storeId={storeId} currency={currency} primaryColor={primaryColor} />;

    case "countdown":
      return <CountdownRenderer block={block} primaryColor={primaryColor} />;

    case "accordion":
      return <AccordionRenderer block={block} />;

    default:
      return null;
  }
}

// ===== Video Block =====
function VideoBlockRenderer({ block }: { block: VideoBlock }) {
  const embedUrl = getEmbedUrl(block.url);
  if (!embedUrl) return <p className="text-sm text-muted-foreground py-4 text-center">Enter a YouTube or Vimeo URL</p>;

  const aspectClass = block.aspectRatio === "4:3" ? "aspect-[4/3]" : block.aspectRatio === "1:1" ? "aspect-square" : "aspect-video";

  return (
    <div className={`py-4 ${aspectClass} w-full overflow-hidden rounded-lg`}>
      <iframe src={embedUrl} className="h-full w-full" allow="autoplay; fullscreen; picture-in-picture" allowFullScreen title="Video embed" />
    </div>
  );
}

function getEmbedUrl(url: string): string | null {
  if (!url) return null;
  // YouTube
  const ytMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;
  // Vimeo
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  return null;
}

// ===== Product Grid Block =====
function ProductGridRenderer({ block, storeId, currency, primaryColor }: { block: ProductGridBlock; storeId?: string; currency?: string; primaryColor: string }) {
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    if (!storeId) return;
    const fetchProducts = async () => {
      let query = supabase
        .from("products")
        .select("id, name, price, compare_at_price, images")
        .eq("store_id", storeId)
        .eq("status", "published")
        .order("created_at", { ascending: false })
        .limit(block.limit || 6);
      if (block.categoryId) query = query.eq("category_id", block.categoryId);
      const { data } = await query;
      setProducts(data || []);
    };
    fetchProducts();
  }, [storeId, block.limit, block.categoryId]);

  if (!products.length) return <p className="py-8 text-center text-sm text-muted-foreground">No products to display</p>;

  const cols = block.columns === 2 ? "grid-cols-2" : block.columns === 4 ? "grid-cols-2 md:grid-cols-4" : "grid-cols-2 md:grid-cols-3";

  return (
    <div className={`py-6 grid ${cols} gap-4`}>
      {products.map((p) => (
        <div key={p.id} className="group rounded-lg border overflow-hidden">
          <div className="aspect-square bg-muted overflow-hidden">
            {p.images?.[0] && <img src={p.images[0]} alt={p.name} className="h-full w-full object-cover transition-transform group-hover:scale-105" />}
          </div>
          <div className="p-3 space-y-1">
            <h4 className="text-sm font-medium truncate">{p.name}</h4>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold" style={{ color: primaryColor }}>
                {new Intl.NumberFormat("en", { style: "currency", currency: currency || "USD" }).format(p.price)}
              </span>
              {p.compare_at_price && p.compare_at_price > p.price && (
                <span className="text-xs text-muted-foreground line-through">
                  {new Intl.NumberFormat("en", { style: "currency", currency: currency || "USD" }).format(p.compare_at_price)}
                </span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ===== Countdown Block =====
function CountdownRenderer({ block, primaryColor }: { block: CountdownBlock; primaryColor: string }) {
  const [timeLeft, setTimeLeft] = useState(getTimeLeft(block.targetDate));

  useEffect(() => {
    const interval = setInterval(() => setTimeLeft(getTimeLeft(block.targetDate)), 1000);
    return () => clearInterval(interval);
  }, [block.targetDate]);

  const alignClass = block.alignment === "right" ? "justify-end" : block.alignment === "left" ? "justify-start" : "justify-center";

  return (
    <div className={`py-6 ${block.alignment === "center" ? "text-center" : block.alignment === "right" ? "text-right" : ""}`}>
      {block.label && <p className="text-sm font-medium mb-3 opacity-70">{block.label}</p>}
      <div className={`flex ${alignClass} gap-3`}>
        {(["days", "hours", "minutes", "seconds"] as const).map((unit) => (
          <div key={unit} className="flex flex-col items-center rounded-lg p-3 min-w-[60px]" style={{ backgroundColor: `${primaryColor}10` }}>
            <span className="text-2xl md:text-3xl font-bold" style={{ color: primaryColor }}>{timeLeft[unit]}</span>
            <span className="text-[10px] uppercase tracking-wider opacity-60 mt-1">{unit}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function getTimeLeft(target: string) {
  const diff = Math.max(0, new Date(target).getTime() - Date.now());
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

// ===== Accordion Block =====
function AccordionRenderer({ block }: { block: AccordionBlock }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="py-4 space-y-2">
      {block.items.map((item, i) => (
        <div key={i} className="rounded-lg border overflow-hidden">
          <button
            onClick={() => setOpenIndex(openIndex === i ? null : i)}
            className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium hover:bg-muted/50 transition-colors"
          >
            {item.question}
            <svg
              className={`h-4 w-4 shrink-0 transition-transform duration-200 ${openIndex === i ? "rotate-180" : ""}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {openIndex === i && (
            <div className="px-4 pb-4 text-sm leading-relaxed opacity-80">
              {item.answer}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
