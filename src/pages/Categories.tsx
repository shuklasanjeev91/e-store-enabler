import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  HelpCircle,
  Bell,
  MoreHorizontal,
  Edit,
  Trash2,
  Layers,
  Package,
  Tags,
  ChevronRight,
  ChevronDown,
  Plus,
  FolderTree,
  GripVertical,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface StoreData {
  id: string;
  name: string;
  slug: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  status: string;
  image_url: string | null;
  description: string | null;
  sort_order: number | null;
  parent_id: string | null;
  created_at: string;
}

interface CategoryNode extends Category {
  children: CategoryNode[];
  level: number;
}

function buildTree(categories: Category[]): CategoryNode[] {
  const map = new Map<string, CategoryNode>();
  const roots: CategoryNode[] = [];

  // Create nodes
  categories.forEach((cat) => {
    map.set(cat.id, { ...cat, children: [], level: 0 });
  });

  // Build tree
  categories.forEach((cat) => {
    const node = map.get(cat.id)!;
    if (cat.parent_id && map.has(cat.parent_id)) {
      const parent = map.get(cat.parent_id)!;
      node.level = parent.level + 1;
      parent.children.push(node);
    } else {
      roots.push(node);
    }
  });

  // Fix deeper levels recursively
  const fixLevels = (nodes: CategoryNode[], level: number) => {
    nodes.forEach((n) => {
      n.level = level;
      fixLevels(n.children, level + 1);
    });
  };
  fixLevels(roots, 0);

  return roots;
}

export default function Categories() {
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const [store, setStore] = useState<StoreData | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/auth");
    }
  }, [user, isLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchStoreAndCategories();
    }
  }, [user]);

  const fetchStoreAndCategories = async () => {
    try {
      const { data: storeData, error: storeError } = await supabase
        .from("stores")
        .select("id, name, slug")
        .eq("user_id", user!.id)
        .single();

      if (storeError || !storeData) {
        navigate("/onboarding");
        return;
      }

      setStore(storeData);

      const { data: categoriesData, error: categoriesError } = await supabase
        .from("categories")
        .select("*")
        .eq("store_id", storeData.id)
        .order("sort_order", { ascending: true });

      if (!categoriesError && categoriesData) {
        setCategories(categoriesData);
        // Auto-expand all L1 categories
        const l1Ids = new Set(
          categoriesData.filter((c) => !c.parent_id).map((c) => c.id)
        );
        setExpandedIds(l1Ids);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoadingData(false);
    }
  };

  const deleteCategory = async (categoryId: string) => {
    // Check if it has children
    const hasChildren = categories.some((c) => c.parent_id === categoryId);
    if (hasChildren) {
      toast({
        title: "Cannot delete",
        description: "Remove all subcategories first before deleting this category.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from("categories")
        .delete()
        .eq("id", categoryId);

      if (error) throw error;

      setCategories(categories.filter((c) => c.id !== categoryId));
      toast({ title: "Category deleted successfully" });
    } catch (error) {
      console.error("Error deleting category:", error);
      toast({ title: "Failed to delete category", variant: "destructive" });
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const expandAll = () => {
    setExpandedIds(new Set(categories.map((c) => c.id)));
  };

  const collapseAll = () => {
    setExpandedIds(new Set());
  };

  // Filter tree — if searching, flatten and show matches
  const tree = buildTree(categories);

  const filteredFlat = searchQuery
    ? categories.filter((c) =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : null;

  // Get the depth label
  const getLevelLabel = (level: number) => {
    switch (level) {
      case 0: return "L1";
      case 1: return "L2";
      case 2: return "L3";
      default: return `L${level + 1}`;
    }
  };

  const getLevelColor = (level: number) => {
    switch (level) {
      case 0: return "bg-primary/10 text-primary";
      case 1: return "bg-blue-500/10 text-blue-600";
      case 2: return "bg-amber-500/10 text-amber-600";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getChildCount = (catId: string): number => {
    return categories.filter((c) => c.parent_id === catId).length;
  };

  // Render a single category row
  const renderCategoryRow = (cat: CategoryNode | Category, level: number = 0) => {
    const childCount = getChildCount(cat.id);
    const isExpanded = expandedIds.has(cat.id);
    const children = categories.filter((c) => c.parent_id === cat.id);
    const canAddChild = level < 2; // Max 3 levels (0, 1, 2)

    return (
      <div key={cat.id}>
        <div
          className="group flex items-center gap-2 border-b px-4 py-3 transition-colors hover:bg-muted/50"
          style={{ paddingLeft: `${16 + level * 32}px` }}
        >
          {/* Expand toggle */}
          <button
            className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded transition-colors hover:bg-muted"
            onClick={() => childCount > 0 && toggleExpand(cat.id)}
          >
            {childCount > 0 ? (
              isExpanded ? (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              )
            ) : (
              <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/30" />
            )}
          </button>

          {/* Image */}
          <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg border bg-muted">
            {cat.image_url ? (
              <img
                src={cat.image_url}
                alt={cat.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <Layers className="h-4 w-4 text-muted-foreground" />
              </div>
            )}
          </div>

          {/* Name & info */}
          <div className="flex flex-1 items-center gap-3 min-w-0">
            <div className="min-w-0 flex-1">
              <button
                className="font-medium text-sm hover:text-primary transition-colors text-left truncate block"
                onClick={() => navigate(`/dashboard/categories/${cat.id}`)}
              >
                {cat.name}
              </button>
              <p className="text-xs text-muted-foreground truncate">{cat.slug}</p>
            </div>

            {/* Level badge */}
            <span className={`flex-shrink-0 rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${getLevelColor(level)}`}>
              {getLevelLabel(level)}
            </span>

            {/* Child count */}
            {childCount > 0 && (
              <span className="flex-shrink-0 text-xs text-muted-foreground">
                {childCount} sub
              </span>
            )}

            {/* Status */}
            <Badge
              variant={cat.status === "active" ? "default" : "secondary"}
              className="flex-shrink-0"
            >
              {cat.status}
            </Badge>
          </div>

          {/* Actions */}
          <div className="flex flex-shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
            {canAddChild && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 gap-1 text-xs"
                onClick={() => navigate(`/dashboard/categories/new?parent=${cat.id}`)}
              >
                <Plus className="h-3.5 w-3.5" />
                Sub
              </Button>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => navigate(`/dashboard/categories/${cat.id}`)}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                {canAddChild && (
                  <DropdownMenuItem
                    onClick={() => navigate(`/dashboard/categories/new?parent=${cat.id}`)}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Subcategory
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={() => deleteCategory(cat.id)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Render children if expanded */}
        {isExpanded &&
          children
            .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
            .map((child) => renderCategoryRow(child, level + 1))}
      </div>
    );
  };

  if (isLoading || isLoadingData) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!store) return null;

  const l1Count = categories.filter((c) => !c.parent_id).length;
  const l2Count = categories.filter(
    (c) => c.parent_id && !categories.some((p) => p.parent_id && p.id === c.parent_id && categories.some((gp) => gp.id === p.parent_id))
  ).length;

  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar storeName={store.name} storeSlug={store.slug} />

      <main className="lg:pl-56">
        <div className="min-h-screen pt-14 lg:pt-0">
          {/* Header */}
          <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background px-6">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-semibold">Categories</h1>
              <Badge variant="secondary" className="gap-1">
                <FolderTree className="h-3 w-3" />
                {categories.length} total
              </Badge>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon">
                <Bell className="h-5 w-5" />
              </Button>
              <Button onClick={() => navigate("/dashboard/categories/new")}>
                <Plus className="mr-2 h-4 w-4" />
                Add Category
              </Button>
            </div>
          </header>

          {/* Content */}
          <div className="p-6">
            {categories.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="relative mb-6">
                  <div className="flex h-32 w-32 items-center justify-center rounded-2xl bg-primary/10">
                    <Package className="h-12 w-12 text-primary" />
                  </div>
                  <div className="absolute -bottom-2 -right-4 flex h-16 w-16 items-center justify-center rounded-xl bg-primary/20">
                    <Tags className="h-8 w-8 text-primary" />
                  </div>
                  <div className="absolute -left-2 top-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15">
                    <Layers className="h-5 w-5 text-primary" />
                  </div>
                </div>

                <h2 className="mb-2 text-xl font-semibold">
                  Create categories to organize your products
                </h2>
                <p className="mb-2 max-w-md text-center text-muted-foreground">
                  Build a 3-level category hierarchy (e.g., Clothing → Men → T-Shirts) to power your storefront mega menu.
                </p>
                <div className="mb-6 flex items-center gap-6 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5"><span className="inline-block h-2.5 w-2.5 rounded bg-primary/60" /> Level 1: Main</span>
                  <span className="flex items-center gap-1.5"><span className="inline-block h-2.5 w-2.5 rounded bg-blue-500/60" /> Level 2: Sub</span>
                  <span className="flex items-center gap-1.5"><span className="inline-block h-2.5 w-2.5 rounded bg-amber-500/60" /> Level 3: Item</span>
                </div>

                <Button onClick={() => navigate("/dashboard/categories/new")}>
                  Create first category
                </Button>
              </div>
            ) : (
              <>
                {/* Search and Actions Bar */}
                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="relative w-full max-w-sm">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search categories..."
                      className="pl-9"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={expandAll}>
                      Expand All
                    </Button>
                    <Button variant="outline" size="sm" onClick={collapseAll}>
                      Collapse All
                    </Button>
                  </div>
                </div>

                {/* Hierarchy Legend */}
                <div className="mb-4 flex items-center gap-4 rounded-lg border bg-muted/30 px-4 py-2.5 text-xs text-muted-foreground">
                  <FolderTree className="h-4 w-4" />
                  <span>Category hierarchy supports up to 3 levels for the storefront mega menu</span>
                  <span className="mx-2">•</span>
                  <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ${getLevelColor(0)}`}>L1</span>
                  <span>Main</span>
                  <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ${getLevelColor(1)}`}>L2</span>
                  <span>Sub</span>
                  <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ${getLevelColor(2)}`}>L3</span>
                  <span>Item</span>
                </div>

                {/* Tree View */}
                <div className="rounded-lg border bg-card">
                  {/* Table Header */}
                  <div className="flex items-center gap-2 border-b bg-muted/30 px-4 py-2.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    <div className="w-6" />
                    <div className="w-10" />
                    <div className="flex-1">Category</div>
                    <div className="w-24 text-center">Level</div>
                    <div className="w-16 text-center">Status</div>
                    <div className="w-24" />
                  </div>

                  {/* Search results (flat) */}
                  {filteredFlat
                    ? filteredFlat.map((cat) => {
                        // Find its depth
                        let level = 0;
                        let current = cat;
                        while (current.parent_id) {
                          level++;
                          const parent = categories.find((c) => c.id === current.parent_id);
                          if (!parent) break;
                          current = parent;
                        }
                        return renderCategoryRow(cat, level);
                      })
                    : tree
                        .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
                        .map((node) => renderCategoryRow(node, 0))}

                  {(filteredFlat ? filteredFlat.length : tree.length) === 0 && (
                    <div className="py-12 text-center text-sm text-muted-foreground">
                      No categories found
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
