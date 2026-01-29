import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, FileText, Plus, HelpCircle } from "lucide-react";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "@/hooks/use-toast";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { SortablePageRow } from "@/components/dashboard/SortablePageRow";

interface Page {
  id: string;
  title: string;
  slug: string;
  status: string;
  created_at: string;
  updated_at: string;
  sort_order: number | null;
}

interface StoreData {
  id: string;
  name: string;
  slug: string;
}

export default function Pages() {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const [store, setStore] = useState<StoreData | null>(null);
  const [pages, setPages] = useState<Page[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [pageToDelete, setPageToDelete] = useState<Page | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSavingOrder, setIsSavingOrder] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/auth");
    }
  }, [user, isLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      const { data: storeData, error: storeError } = await supabase
        .from("stores")
        .select("id, name, slug")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (storeError) throw storeError;

      if (!storeData) {
        navigate("/onboarding");
        return;
      }

      setStore(storeData);

      const { data: pagesData, error: pagesError } = await supabase
        .from("pages")
        .select("id, title, slug, status, created_at, updated_at, sort_order")
        .eq("store_id", storeData.id)
        .order("sort_order", { ascending: true });

      if (pagesError) throw pagesError;
      setPages(pagesData || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "Failed to load pages",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;

      if (!over || active.id === over.id) return;

      const oldIndex = pages.findIndex((p) => p.id === active.id);
      const newIndex = pages.findIndex((p) => p.id === over.id);

      const newPages = arrayMove(pages, oldIndex, newIndex);
      setPages(newPages);

      // Save new order to database
      setIsSavingOrder(true);
      try {
        const updates = newPages.map((page, index) => ({
          id: page.id,
          sort_order: index + 1,
        }));

        for (const update of updates) {
          const { error } = await supabase
            .from("pages")
            .update({ sort_order: update.sort_order })
            .eq("id", update.id);

          if (error) throw error;
        }

        toast({
          title: "Order saved",
          description: "Page order has been updated.",
        });
      } catch (error) {
        console.error("Error saving order:", error);
        toast({
          title: "Failed to save order",
          description: "Please try again.",
          variant: "destructive",
        });
        // Revert on error
        fetchData();
      } finally {
        setIsSavingOrder(false);
      }
    },
    [pages]
  );

  const handleDelete = async () => {
    if (!pageToDelete) return;

    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from("pages")
        .delete()
        .eq("id", pageToDelete.id);

      if (error) throw error;

      setPages(pages.filter((p) => p.id !== pageToDelete.id));
      toast({
        title: "Page deleted",
        description: `"${pageToDelete.title}" has been deleted.`,
      });
    } catch (error) {
      console.error("Error deleting page:", error);
      toast({
        title: "Failed to delete page",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setPageToDelete(null);
    }
  };

  const handleEdit = (pageId: string) => {
    navigate(`/dashboard/appearance/pages/${pageId}`);
  };

  const handleView = (storeSlug: string, pageSlug: string) => {
    window.open(`/store/${storeSlug}/page/${pageSlug}`, "_blank");
  };

  const handleDeleteClick = (page: Page) => {
    setPageToDelete(page);
    setDeleteDialogOpen(true);
  };

  if (isLoading || isLoadingData) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!store) {
    return null;
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <DashboardSidebar storeName={store.name} storeSlug={store.slug} />

      <main className="lg:pl-56 pt-14 lg:pt-0">
        <div className="border-b bg-background">
          <div className="flex items-center justify-between px-6 py-4 lg:px-8">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-semibold">Pages</h1>
              <Button variant="outline" size="sm" className="gap-1.5">
                <HelpCircle className="h-4 w-4" />
                How it works
              </Button>
              {isSavingOrder && (
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Saving...
                </span>
              )}
            </div>
            {pages.length > 0 && (
              <Button
                onClick={() => navigate("/dashboard/appearance/pages/new")}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Add page
              </Button>
            )}
          </div>
        </div>

        <div className="p-6 lg:p-8">
          {pages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24">
              <div className="mb-6 flex h-32 w-32 items-center justify-center rounded-full bg-primary/10">
                <FileText className="h-16 w-16 text-primary" />
              </div>
              <h2 className="mb-2 text-xl font-semibold">
                Add pages to provide more details
              </h2>
              <p className="mb-6 max-w-md text-center text-muted-foreground">
                Start creating pages for your store to share more information
                about your products, brand, etc
              </p>
              <Button
                onClick={() => navigate("/dashboard/appearance/pages/new")}
                className="gap-2"
              >
                Add page
              </Button>
              <button className="mt-4 text-sm text-primary hover:underline">
                Learn more about pages
              </button>
            </div>
          ) : (
            <div className="rounded-xl border bg-background">
              <div className="px-6 py-3 border-b">
                <p className="text-sm text-muted-foreground">
                  Drag and drop to reorder pages. The order will be reflected in your store navigation.
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="px-3 py-3 text-sm font-medium text-muted-foreground w-10"></th>
                      <th className="px-6 py-3 text-sm font-medium text-muted-foreground">
                        Title
                      </th>
                      <th className="px-6 py-3 text-sm font-medium text-muted-foreground">
                        Status
                      </th>
                      <th className="px-6 py-3 text-sm font-medium text-muted-foreground">
                        Last Updated
                      </th>
                      <th className="px-6 py-3 text-sm font-medium text-muted-foreground"></th>
                    </tr>
                  </thead>
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext
                      items={pages.map((p) => p.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      <tbody>
                        {pages.map((page) => (
                          <SortablePageRow
                            key={page.id}
                            page={page}
                            storeSlug={store.slug}
                            onEdit={handleEdit}
                            onView={handleView}
                            onDelete={handleDeleteClick}
                          />
                        ))}
                      </tbody>
                    </SortableContext>
                  </DndContext>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete page?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{pageToDelete?.title}"? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
