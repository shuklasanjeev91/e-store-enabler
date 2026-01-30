import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  created_at: string;
}

export default function Categories() {
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const [store, setStore] = useState<StoreData | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

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
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoadingData(false);
    }
  };

  const deleteCategory = async (categoryId: string) => {
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

  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading || isLoadingData) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!store) return null;

  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar storeName={store.name} storeSlug={store.slug} />

      <main className="lg:pl-56">
        <div className="min-h-screen pt-14 lg:pt-0">
          {/* Header */}
          <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background px-6">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-semibold">Categories</h1>
              <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground">
                <HelpCircle className="h-4 w-4" />
                How it works
              </Button>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" className="gap-2">
                <HelpCircle className="h-4 w-4" />
                Help
              </Button>
              <Button variant="ghost" size="icon">
                <Bell className="h-5 w-5" />
              </Button>
            </div>
          </header>

          {/* Content */}
          <div className="p-6">
            {categories.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20">
                {/* Empty State Illustration */}
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
                <p className="mb-6 max-w-md text-center text-muted-foreground">
                  Organize your products with categories to help customers easily find what they need.
                </p>

                <Button onClick={() => navigate("/dashboard/categories/new")}>
                  Create new category
                </Button>

                <a
                  href="#"
                  className="mt-4 text-sm text-primary hover:underline"
                >
                  Learn more about categories
                </a>
              </div>
            ) : (
              <>
                {/* Search and Actions Bar */}
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="relative w-full max-w-sm">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search categories..."
                      className="pl-9"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Button onClick={() => navigate("/dashboard/categories/new")}>
                    Create new category
                  </Button>
                </div>

                <div className="rounded-lg border bg-card">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Category</TableHead>
                        <TableHead>Slug</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="w-12"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCategories.map((category) => (
                        <TableRow
                          key={category.id}
                          className="cursor-pointer"
                          onClick={() => navigate(`/dashboard/categories/${category.id}`)}
                        >
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="h-12 w-12 overflow-hidden rounded-lg border bg-muted">
                                {category.image_url ? (
                                  <img
                                    src={category.image_url}
                                    alt={category.name}
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <div className="flex h-full w-full items-center justify-center">
                                    <Layers className="h-5 w-5 text-muted-foreground" />
                                  </div>
                                )}
                              </div>
                              <p className="font-medium">{category.name}</p>
                            </div>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {category.slug}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={category.status === "active" ? "default" : "secondary"}
                            >
                              {category.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/dashboard/categories/${category.id}`);
                                  }}
                                >
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteCategory(category.id);
                                  }}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
