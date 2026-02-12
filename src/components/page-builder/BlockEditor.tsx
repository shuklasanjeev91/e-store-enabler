import { useState, useCallback } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  GripVertical,
  Trash2,
  Plus,
  Type,
  Image as ImageIcon,
  MousePointerClick,
  Columns,
  Minus,
  ChevronDown,
  ChevronUp,
  Upload,
  Settings2,
  Video,
  ShoppingBag,
  Timer,
  HelpCircle,
  Palette,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import {
  type PageBlock,
  type BlockType,
  type TextBlock,
  type ImageBlock,
  type ButtonBlock,
  type ColumnsBlock,
  type SpacerBlock,
  type VideoBlock,
  type ProductGridBlock,
  type CountdownBlock,
  type AccordionBlock,
  type BlockStyling,
  createBlock,
  parseBlocks,
} from "./types";

interface BlockEditorProps {
  content: string;
  onChange: (content: string) => void;
  storeId: string;
}

const BLOCK_TYPES: { type: BlockType; label: string; icon: React.ReactNode; description: string }[] = [
  { type: "text", label: "Text", icon: <Type className="h-5 w-5" />, description: "Rich text content" },
  { type: "image", label: "Image", icon: <ImageIcon className="h-5 w-5" />, description: "Upload or link image" },
  { type: "button", label: "Button", icon: <MousePointerClick className="h-5 w-5" />, description: "Call-to-action button" },
  { type: "columns", label: "Columns", icon: <Columns className="h-5 w-5" />, description: "Multi-column layout" },
  { type: "spacer", label: "Spacer", icon: <Minus className="h-5 w-5" />, description: "Vertical spacing" },
  { type: "video", label: "Video", icon: <Video className="h-5 w-5" />, description: "YouTube/Vimeo embed" },
  { type: "product_grid", label: "Products", icon: <ShoppingBag className="h-5 w-5" />, description: "Product grid display" },
  { type: "countdown", label: "Countdown", icon: <Timer className="h-5 w-5" />, description: "Countdown timer" },
  { type: "accordion", label: "FAQ", icon: <HelpCircle className="h-5 w-5" />, description: "Accordion / FAQ section" },
];

export default function BlockEditor({ content, onChange, storeId }: BlockEditorProps) {
  const [blocks, setBlocks] = useState<PageBlock[]>(() => parseBlocks(content));
  const [expandedBlock, setExpandedBlock] = useState<string | null>(null);
  const [showAddMenu, setShowAddMenu] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const updateBlocks = useCallback((newBlocks: PageBlock[]) => {
    setBlocks(newBlocks);
    onChange(JSON.stringify(newBlocks));
  }, [onChange]);

  const addBlock = (type: BlockType) => {
    const newBlock = createBlock(type);
    const newBlocks = [...blocks, newBlock];
    updateBlocks(newBlocks);
    setExpandedBlock(newBlock.id);
    setShowAddMenu(false);
  };

  const removeBlock = (id: string) => {
    updateBlocks(blocks.filter(b => b.id !== id));
    if (expandedBlock === id) setExpandedBlock(null);
  };

  const updateBlock = (id: string, updates: Partial<PageBlock>) => {
    updateBlocks(blocks.map(b => b.id === id ? { ...b, ...updates } as PageBlock : b));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = blocks.findIndex(b => b.id === active.id);
      const newIndex = blocks.findIndex(b => b.id === over.id);
      updateBlocks(arrayMove(blocks, oldIndex, newIndex));
    }
  };

  return (
    <div className="space-y-4">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={blocks.map(b => b.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {blocks.map((block) => (
              <SortableBlockItem
                key={block.id}
                block={block}
                isExpanded={expandedBlock === block.id}
                onToggle={() => setExpandedBlock(expandedBlock === block.id ? null : block.id)}
                onRemove={() => removeBlock(block.id)}
                onUpdate={(updates) => updateBlock(block.id, updates)}
                storeId={storeId}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {blocks.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed py-12 text-center">
          <Columns className="h-10 w-10 text-muted-foreground/50" />
          <p className="mt-3 text-sm font-medium text-muted-foreground">No blocks yet</p>
          <p className="mt-1 text-xs text-muted-foreground/70">Click "Add Block" to start building your page</p>
        </div>
      )}

      <div className="relative">
        <Button variant="outline" className="w-full gap-2 border-dashed" onClick={() => setShowAddMenu(!showAddMenu)}>
          <Plus className="h-4 w-4" />
          Add Block
        </Button>

        {showAddMenu && (
          <div className="absolute left-0 right-0 top-full z-10 mt-2 grid grid-cols-3 gap-2 rounded-lg border bg-background p-3 shadow-lg">
            {BLOCK_TYPES.map((bt) => (
              <button
                key={bt.type}
                onClick={() => addBlock(bt.type)}
                className="flex flex-col items-center gap-1.5 rounded-lg border border-transparent p-2.5 text-center transition-all hover:border-primary/30 hover:bg-primary/5"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">{bt.icon}</div>
                <span className="text-[11px] font-medium">{bt.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ===== Sortable Block Item =====
function SortableBlockItem({
  block, isExpanded, onToggle, onRemove, onUpdate, storeId,
}: {
  block: PageBlock; isExpanded: boolean; onToggle: () => void; onRemove: () => void;
  onUpdate: (updates: Partial<PageBlock>) => void; storeId: string;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: block.id });
  const style = { transform: CSS.Transform.toString(transform), transition };
  const blockInfo = BLOCK_TYPES.find(bt => bt.type === block.type);

  return (
    <div ref={setNodeRef} style={style} className={cn("rounded-lg border bg-background transition-shadow", isDragging && "shadow-lg ring-2 ring-primary/20 z-50")}>
      <div className="flex items-center gap-2 px-3 py-2.5">
        <button {...attributes} {...listeners} className="cursor-grab touch-none text-muted-foreground hover:text-foreground active:cursor-grabbing">
          <GripVertical className="h-4 w-4" />
        </button>
        <div className="flex h-7 w-7 items-center justify-center rounded bg-muted text-muted-foreground">{blockInfo?.icon}</div>
        <span className="flex-1 text-sm font-medium">{blockInfo?.label || block.type}</span>
        <button onClick={onToggle} className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground">
          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <Settings2 className="h-4 w-4" />}
        </button>
        <button onClick={onRemove} className="rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {isExpanded && (
        <div className="border-t px-4 py-4 space-y-4">
          {block.type === "text" && <TextBlockSettings block={block} onUpdate={onUpdate} />}
          {block.type === "image" && <ImageBlockSettings block={block} onUpdate={onUpdate} storeId={storeId} />}
          {block.type === "button" && <ButtonBlockSettings block={block} onUpdate={onUpdate} />}
          {block.type === "columns" && <ColumnsBlockSettings block={block} onUpdate={onUpdate} />}
          {block.type === "spacer" && <SpacerBlockSettings block={block} onUpdate={onUpdate} />}
          {block.type === "video" && <VideoBlockSettings block={block} onUpdate={onUpdate} />}
          {block.type === "product_grid" && <ProductGridBlockSettings block={block} onUpdate={onUpdate} />}
          {block.type === "countdown" && <CountdownBlockSettings block={block} onUpdate={onUpdate} />}
          {block.type === "accordion" && <AccordionBlockSettings block={block} onUpdate={onUpdate} />}

          {/* Per-block styling */}
          <BlockStylingSettings styling={block.styling} onUpdate={(styling) => onUpdate({ styling } as any)} />
        </div>
      )}
    </div>
  );
}

// ===== Per-Block Styling =====
function BlockStylingSettings({ styling, onUpdate }: { styling?: BlockStyling; onUpdate: (s: BlockStyling) => void }) {
  const current = styling || {};
  return (
    <div className="space-y-3 border-t pt-3 mt-3">
      <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        <Palette className="h-3.5 w-3.5" /> Block Styling
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-xs">Background Color</Label>
          <div className="flex items-center gap-2 mt-1">
            <input
              type="color"
              value={current.backgroundColor || "#ffffff"}
              onChange={(e) => onUpdate({ ...current, backgroundColor: e.target.value })}
              className="h-8 w-10 cursor-pointer rounded border p-0.5"
            />
            <Input
              value={current.backgroundColor || ""}
              onChange={(e) => onUpdate({ ...current, backgroundColor: e.target.value })}
              placeholder="none"
              className="h-8 text-xs flex-1"
            />
            {current.backgroundColor && (
              <Button variant="ghost" size="sm" className="h-8 px-2 text-xs" onClick={() => onUpdate({ ...current, backgroundColor: undefined })}>
                Clear
              </Button>
            )}
          </div>
        </div>
        <div>
          <Label className="text-xs">Padding</Label>
          <Select value={current.padding || "none"} onValueChange={(v) => onUpdate({ ...current, padding: v as any })}>
            <SelectTrigger className="h-8 text-xs mt-1"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              <SelectItem value="sm">Small</SelectItem>
              <SelectItem value="md">Medium</SelectItem>
              <SelectItem value="lg">Large</SelectItem>
              <SelectItem value="xl">Extra Large</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}

// ===== Existing Block Settings =====

function TextBlockSettings({ block, onUpdate }: { block: TextBlock; onUpdate: (u: Partial<TextBlock>) => void }) {
  return (
    <div className="space-y-3">
      <div>
        <Label>Content (HTML)</Label>
        <Textarea value={block.content} onChange={(e) => onUpdate({ content: e.target.value })} className="min-h-[120px] font-mono text-xs" placeholder="<h2>Your heading</h2><p>Your paragraph text...</p>" />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <Label className="text-xs">Alignment</Label>
          <Select value={block.alignment || "left"} onValueChange={(v) => onUpdate({ alignment: v as any })}>
            <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="left">Left</SelectItem>
              <SelectItem value="center">Center</SelectItem>
              <SelectItem value="right">Right</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs">Size</Label>
          <Select value={block.fontSize || "base"} onValueChange={(v) => onUpdate({ fontSize: v as any })}>
            <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="sm">Small</SelectItem>
              <SelectItem value="base">Normal</SelectItem>
              <SelectItem value="lg">Large</SelectItem>
              <SelectItem value="xl">XL</SelectItem>
              <SelectItem value="2xl">2XL</SelectItem>
              <SelectItem value="3xl">3XL</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs">Weight</Label>
          <Select value={block.fontWeight || "normal"} onValueChange={(v) => onUpdate({ fontWeight: v as any })}>
            <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="normal">Normal</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="semibold">Semibold</SelectItem>
              <SelectItem value="bold">Bold</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}

function ImageBlockSettings({ block, onUpdate, storeId }: { block: ImageBlock; onUpdate: (u: Partial<ImageBlock>) => void; storeId: string }) {
  const [uploading, setUploading] = useState(false);
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${storeId}/pages/${Date.now()}.${fileExt}`;
      await supabase.storage.from("page-images").upload(fileName, file, { upsert: true });
      const { data } = supabase.storage.from("page-images").getPublicUrl(fileName);
      onUpdate({ src: data.publicUrl });
      toast({ title: "Image uploaded!" });
    } catch {
      toast({ title: "Upload failed", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-3">
      <div>
        <Label>Image</Label>
        {block.src ? (
          <div className="relative mt-2 overflow-hidden rounded-lg border">
            <img src={block.src} alt={block.alt} className="h-40 w-full object-cover" />
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity">
              <label className="cursor-pointer">
                <Button variant="secondary" size="sm" asChild><span><Upload className="mr-1 h-3 w-3" />Change</span></Button>
                <input type="file" accept="image/*" className="hidden" onChange={handleUpload} />
              </label>
            </div>
          </div>
        ) : (
          <label className="mt-2 flex h-32 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed hover:border-primary/50">
            <Upload className="h-6 w-6 text-muted-foreground" />
            <span className="mt-1 text-xs text-muted-foreground">{uploading ? "Uploading..." : "Click to upload"}</span>
            <input type="file" accept="image/*" className="hidden" onChange={handleUpload} disabled={uploading} />
          </label>
        )}
      </div>
      <div>
        <Label className="text-xs">Or paste image URL</Label>
        <Input value={block.src} onChange={(e) => onUpdate({ src: e.target.value })} placeholder="https://..." className="h-8 text-xs" />
      </div>
      <div>
        <Label className="text-xs">Alt text</Label>
        <Input value={block.alt} onChange={(e) => onUpdate({ alt: e.target.value })} placeholder="Describe the image" className="h-8 text-xs" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-xs">Width</Label>
          <Select value={block.width || "full"} onValueChange={(v) => onUpdate({ width: v as any })}>
            <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="full">Full width</SelectItem>
              <SelectItem value="large">Large</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="small">Small</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs">Corners</Label>
          <Select value={block.borderRadius || "lg"} onValueChange={(v) => onUpdate({ borderRadius: v as any })}>
            <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Sharp</SelectItem>
              <SelectItem value="md">Rounded</SelectItem>
              <SelectItem value="lg">More rounded</SelectItem>
              <SelectItem value="xl">Very rounded</SelectItem>
              <SelectItem value="2xl">Extra rounded</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}

function ButtonBlockSettings({ block, onUpdate }: { block: ButtonBlock; onUpdate: (u: Partial<ButtonBlock>) => void }) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-xs">Button text</Label>
          <Input value={block.text} onChange={(e) => onUpdate({ text: e.target.value })} className="h-8 text-xs" />
        </div>
        <div>
          <Label className="text-xs">Link URL</Label>
          <Input value={block.url} onChange={(e) => onUpdate({ url: e.target.value })} placeholder="https://..." className="h-8 text-xs" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <Label className="text-xs">Style</Label>
          <Select value={block.variant || "primary"} onValueChange={(v) => onUpdate({ variant: v as any })}>
            <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="primary">Filled</SelectItem>
              <SelectItem value="outline">Outline</SelectItem>
              <SelectItem value="ghost">Ghost</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs">Alignment</Label>
          <Select value={block.alignment || "center"} onValueChange={(v) => onUpdate({ alignment: v as any })}>
            <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="left">Left</SelectItem>
              <SelectItem value="center">Center</SelectItem>
              <SelectItem value="right">Right</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs">Size</Label>
          <Select value={block.size || "default"} onValueChange={(v) => onUpdate({ size: v as any })}>
            <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="sm">Small</SelectItem>
              <SelectItem value="default">Default</SelectItem>
              <SelectItem value="lg">Large</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}

function ColumnsBlockSettings({ block, onUpdate }: { block: ColumnsBlock; onUpdate: (u: Partial<ColumnsBlock>) => void }) {
  const updateItem = (index: number, updates: Partial<ColumnsBlock["items"][0]>) => {
    const newItems = [...block.items];
    newItems[index] = { ...newItems[index], ...updates };
    onUpdate({ items: newItems });
  };
  const setColumnCount = (count: number) => {
    const currentItems = [...block.items];
    while (currentItems.length < count) currentItems.push({ content: `Column ${currentItems.length + 1}`, heading: `Heading ${currentItems.length + 1}` });
    onUpdate({ columns: count, items: currentItems.slice(0, count) });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-xs">Columns</Label>
          <Select value={String(block.columns)} onValueChange={(v) => setColumnCount(Number(v))}>
            <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="2">2 Columns</SelectItem>
              <SelectItem value="3">3 Columns</SelectItem>
              <SelectItem value="4">4 Columns</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs">Gap</Label>
          <Select value={block.gap || "md"} onValueChange={(v) => onUpdate({ gap: v as any })}>
            <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="sm">Small</SelectItem>
              <SelectItem value="md">Medium</SelectItem>
              <SelectItem value="lg">Large</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      {block.items.slice(0, block.columns).map((item, i) => (
        <div key={i} className="space-y-2 rounded-md border p-3">
          <Label className="text-xs font-semibold text-muted-foreground">Column {i + 1}</Label>
          <Input value={item.heading || ""} onChange={(e) => updateItem(i, { heading: e.target.value })} placeholder="Heading" className="h-8 text-xs" />
          <Textarea value={item.content} onChange={(e) => updateItem(i, { content: e.target.value })} placeholder="Content text..." className="min-h-[60px] text-xs" />
          <Input value={item.imageUrl || ""} onChange={(e) => updateItem(i, { imageUrl: e.target.value })} placeholder="Image URL (optional)" className="h-8 text-xs" />
        </div>
      ))}
    </div>
  );
}

function SpacerBlockSettings({ block, onUpdate }: { block: SpacerBlock; onUpdate: (u: Partial<SpacerBlock>) => void }) {
  return (
    <div>
      <Label className="text-xs">Height</Label>
      <Select value={block.height} onValueChange={(v) => onUpdate({ height: v as any })}>
        <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="sm">Small (24px)</SelectItem>
          <SelectItem value="md">Medium (48px)</SelectItem>
          <SelectItem value="lg">Large (80px)</SelectItem>
          <SelectItem value="xl">Extra Large (128px)</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

// ===== New Block Settings =====

function VideoBlockSettings({ block, onUpdate }: { block: VideoBlock; onUpdate: (u: Partial<VideoBlock>) => void }) {
  return (
    <div className="space-y-3">
      <div>
        <Label className="text-xs">Video URL (YouTube or Vimeo)</Label>
        <Input value={block.url} onChange={(e) => onUpdate({ url: e.target.value })} placeholder="https://www.youtube.com/watch?v=..." className="h-8 text-xs" />
      </div>
      <div>
        <Label className="text-xs">Aspect Ratio</Label>
        <Select value={block.aspectRatio || "16:9"} onValueChange={(v) => onUpdate({ aspectRatio: v as any })}>
          <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="16:9">16:9 (Widescreen)</SelectItem>
            <SelectItem value="4:3">4:3 (Classic)</SelectItem>
            <SelectItem value="1:1">1:1 (Square)</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

function ProductGridBlockSettings({ block, onUpdate }: { block: ProductGridBlock; onUpdate: (u: Partial<ProductGridBlock>) => void }) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-xs">Columns</Label>
          <Select value={String(block.columns || 3)} onValueChange={(v) => onUpdate({ columns: Number(v) as any })}>
            <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="2">2 Columns</SelectItem>
              <SelectItem value="3">3 Columns</SelectItem>
              <SelectItem value="4">4 Columns</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs">Max products</Label>
          <Select value={String(block.limit || 6)} onValueChange={(v) => onUpdate({ limit: Number(v) })}>
            <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="3">3</SelectItem>
              <SelectItem value="6">6</SelectItem>
              <SelectItem value="9">9</SelectItem>
              <SelectItem value="12">12</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div>
        <Label className="text-xs">Category ID (optional, leave empty for all)</Label>
        <Input value={block.categoryId || ""} onChange={(e) => onUpdate({ categoryId: e.target.value || undefined })} placeholder="category-uuid" className="h-8 text-xs" />
      </div>
    </div>
  );
}

function CountdownBlockSettings({ block, onUpdate }: { block: CountdownBlock; onUpdate: (u: Partial<CountdownBlock>) => void }) {
  return (
    <div className="space-y-3">
      <div>
        <Label className="text-xs">Label</Label>
        <Input value={block.label || ""} onChange={(e) => onUpdate({ label: e.target.value })} placeholder="Sale ends in" className="h-8 text-xs" />
      </div>
      <div>
        <Label className="text-xs">Target Date & Time</Label>
        <Input type="datetime-local" value={block.targetDate} onChange={(e) => onUpdate({ targetDate: e.target.value })} className="h-8 text-xs" />
      </div>
      <div>
        <Label className="text-xs">Alignment</Label>
        <Select value={block.alignment || "center"} onValueChange={(v) => onUpdate({ alignment: v as any })}>
          <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="left">Left</SelectItem>
            <SelectItem value="center">Center</SelectItem>
            <SelectItem value="right">Right</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

function AccordionBlockSettings({ block, onUpdate }: { block: AccordionBlock; onUpdate: (u: Partial<AccordionBlock>) => void }) {
  const updateItem = (index: number, updates: Partial<AccordionBlock["items"][0]>) => {
    const newItems = [...block.items];
    newItems[index] = { ...newItems[index], ...updates };
    onUpdate({ items: newItems });
  };
  const addItem = () => {
    onUpdate({ items: [...block.items, { question: `Question ${block.items.length + 1}?`, answer: "Answer here..." }] });
  };
  const removeItem = (index: number) => {
    if (block.items.length <= 1) return;
    onUpdate({ items: block.items.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-3">
      {block.items.map((item, i) => (
        <div key={i} className="space-y-2 rounded-md border p-3">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-semibold text-muted-foreground">Item {i + 1}</Label>
            {block.items.length > 1 && (
              <button onClick={() => removeItem(i)} className="text-xs text-destructive hover:underline">Remove</button>
            )}
          </div>
          <Input value={item.question} onChange={(e) => updateItem(i, { question: e.target.value })} placeholder="Question" className="h-8 text-xs" />
          <Textarea value={item.answer} onChange={(e) => updateItem(i, { answer: e.target.value })} placeholder="Answer..." className="min-h-[60px] text-xs" />
        </div>
      ))}
      <Button variant="outline" size="sm" onClick={addItem} className="w-full gap-1 text-xs">
        <Plus className="h-3 w-3" /> Add FAQ Item
      </Button>
    </div>
  );
}
