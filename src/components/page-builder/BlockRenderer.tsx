import { type PageBlock, isBlockContent, parseBlocks } from "./types";

interface BlockRendererProps {
  content: string | null;
  primaryColor?: string;
}

export default function BlockRenderer({ content, primaryColor = "#2563eb" }: BlockRendererProps) {
  if (!content) return null;
  
  // If it's not block content, render as HTML (backward compat)
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
        <RenderBlock key={block.id} block={block} primaryColor={primaryColor} />
      ))}
    </div>
  );
}

function RenderBlock({ block, primaryColor }: { block: PageBlock; primaryColor: string }) {
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
              {item.imageUrl && (
                <img src={item.imageUrl} alt="" className="w-full rounded-lg object-cover aspect-video" />
              )}
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

    default:
      return null;
  }
}
