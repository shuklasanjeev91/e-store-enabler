import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { format } from "date-fns";
import { GripVertical, MoreVertical, Pencil, Eye, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Page {
  id: string;
  title: string;
  slug: string;
  status: string;
  created_at: string;
  updated_at: string;
  sort_order: number | null;
}

interface SortablePageRowProps {
  page: Page;
  storeSlug: string;
  onEdit: (pageId: string) => void;
  onView: (storeSlug: string, pageSlug: string) => void;
  onDelete: (page: Page) => void;
}

export function SortablePageRow({
  page,
  storeSlug,
  onEdit,
  onView,
  onDelete,
}: SortablePageRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: page.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className="border-b last:border-b-0 hover:bg-muted/50"
    >
      <td className="px-3 py-4">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-1 text-muted-foreground hover:text-foreground"
        >
          <GripVertical className="h-4 w-4" />
        </button>
      </td>
      <td className="px-6 py-4">
        <button
          onClick={() => onEdit(page.id)}
          className="font-medium text-foreground hover:text-primary"
        >
          {page.title}
        </button>
        <p className="text-sm text-muted-foreground">/{page.slug}</p>
      </td>
      <td className="px-6 py-4">
        <Badge variant={page.status === "published" ? "default" : "secondary"}>
          {page.status === "published" ? "Published" : "Draft"}
        </Badge>
      </td>
      <td className="px-6 py-4 text-sm text-muted-foreground">
        {format(new Date(page.updated_at), "MMM d, yyyy")}
      </td>
      <td className="px-6 py-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(page.id)}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onView(storeSlug, page.slug)}
            >
              <Eye className="mr-2 h-4 w-4" />
              View
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDelete(page)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </td>
    </tr>
  );
}
