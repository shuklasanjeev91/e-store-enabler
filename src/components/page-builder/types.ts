export type BlockType = "text" | "image" | "button" | "columns" | "spacer" | "video" | "product_grid" | "countdown" | "accordion";

// Per-block styling shared by all blocks
export interface BlockStyling {
  backgroundColor?: string;
  padding?: "none" | "sm" | "md" | "lg" | "xl";
}

export interface BaseBlock {
  id: string;
  type: BlockType;
  styling?: BlockStyling;
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

export interface VideoBlock extends BaseBlock {
  type: "video";
  url: string;
  aspectRatio?: "16:9" | "4:3" | "1:1";
}

export interface ProductGridBlock extends BaseBlock {
  type: "product_grid";
  columns?: 2 | 3 | 4;
  limit?: number;
  categoryId?: string;
}

export interface CountdownBlock extends BaseBlock {
  type: "countdown";
  targetDate: string;
  label?: string;
  alignment?: "left" | "center" | "right";
}

export interface AccordionBlock extends BaseBlock {
  type: "accordion";
  items: Array<{
    question: string;
    answer: string;
  }>;
}

export type PageBlock = TextBlock | ImageBlock | ButtonBlock | ColumnsBlock | SpacerBlock | VideoBlock | ProductGridBlock | CountdownBlock | AccordionBlock;

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
    case "video":
      return { id, type: "video", url: "", aspectRatio: "16:9" };
    case "product_grid":
      return { id, type: "product_grid", columns: 3, limit: 6 };
    case "countdown":
      return { id, type: "countdown", targetDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16), label: "Sale ends in", alignment: "center" };
    case "accordion":
      return { id, type: "accordion", items: [{ question: "Question 1?", answer: "Answer to question 1." }, { question: "Question 2?", answer: "Answer to question 2." }] };
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
