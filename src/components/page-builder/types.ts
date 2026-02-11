export type BlockType = "text" | "image" | "button" | "columns" | "spacer";

export interface BaseBlock {
  id: string;
  type: BlockType;
}

export interface TextBlock extends BaseBlock {
  type: "text";
  content: string;
  alignment?: "left" | "center" | "right";
  fontSize?: "sm" | "base" | "lg" | "xl" | "2xl" | "3xl";
  fontWeight?: "normal" | "medium" | "semibold" | "bold";
}

export interface ImageBlock extends BaseBlock {
  type: "image";
  src: string;
  alt: string;
  width?: "full" | "large" | "medium" | "small";
  borderRadius?: "none" | "md" | "lg" | "xl" | "2xl";
}

export interface ButtonBlock extends BaseBlock {
  type: "button";
  text: string;
  url: string;
  variant?: "primary" | "outline" | "ghost";
  alignment?: "left" | "center" | "right";
  size?: "sm" | "default" | "lg";
}

export interface ColumnsBlock extends BaseBlock {
  type: "columns";
  columns: number;
  gap?: "sm" | "md" | "lg";
  items: Array<{
    content: string;
    imageUrl?: string;
    heading?: string;
  }>;
}

export interface SpacerBlock extends BaseBlock {
  type: "spacer";
  height: "sm" | "md" | "lg" | "xl";
}

export type PageBlock = TextBlock | ImageBlock | ButtonBlock | ColumnsBlock | SpacerBlock;

export function createBlock(type: BlockType): PageBlock {
  const id = crypto.randomUUID();
  switch (type) {
    case "text":
      return { id, type: "text", content: "<p>Enter your text here...</p>", alignment: "left", fontSize: "base", fontWeight: "normal" };
    case "image":
      return { id, type: "image", src: "", alt: "", width: "full", borderRadius: "lg" };
    case "button":
      return { id, type: "button", text: "Click Here", url: "#", variant: "primary", alignment: "center", size: "default" };
    case "columns":
      return { id, type: "columns", columns: 2, gap: "md", items: [{ content: "Column 1", heading: "Heading 1" }, { content: "Column 2", heading: "Heading 2" }] };
    case "spacer":
      return { id, type: "spacer", height: "md" };
  }
}

export function isBlockContent(content: string | null): boolean {
  if (!content) return false;
  try {
    const parsed = JSON.parse(content);
    return Array.isArray(parsed) && parsed.length > 0 && parsed[0]?.type && parsed[0]?.id;
  } catch {
    return false;
  }
}

export function parseBlocks(content: string | null): PageBlock[] {
  if (!content) return [];
  try {
    const parsed = JSON.parse(content);
    if (Array.isArray(parsed)) return parsed;
  } catch {}
  return [];
}
