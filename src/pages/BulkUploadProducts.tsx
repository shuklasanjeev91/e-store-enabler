import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  HelpCircle,
  Upload,
  FileText,
  X,
  Check,
  AlertCircle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface StoreData {
  id: string;
  name: string;
  slug: string;
}

interface CSVProduct {
  name: string;
  price: number;
  description?: string;
  sku?: string;
  inventory_quantity?: number;
  status?: string;
  category?: string;
}

export default function BulkUploadProducts() {
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [store, setStore] = useState<StoreData | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{
    total: number;
    processed: number;
    success: number;
    failed: number;
  } | null>(null);

  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/auth");
    }
  }, [user, isLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchStore();
    }
  }, [user]);

  const fetchStore = async () => {
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
    } catch (error) {
      console.error("Error fetching store:", error);
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    const csvFile = files.find(
      (f) => f.type === "text/csv" || f.name.endsWith(".csv")
    );

    if (csvFile) {
      setFile(csvFile);
    } else {
      toast({
        title: "Invalid file type",
        description: "Please upload a CSV file",
        variant: "destructive",
      });
    }
  }, [toast]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (
        selectedFile.type === "text/csv" ||
        selectedFile.name.endsWith(".csv")
      ) {
        setFile(selectedFile);
      } else {
        toast({
          title: "Invalid file type",
          description: "Please upload a CSV file",
          variant: "destructive",
        });
      }
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const downloadSampleCSV = () => {
    const csvContent = `name,price,description,sku,inventory_quantity,status
"Example Product 1",99.99,"This is a sample product description","SKU001",100,published
"Example Product 2",149.99,"Another product description","SKU002",50,draft
"Example Product 3",29.99,"Third product description","SKU003",200,published`;

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sample_products_template.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const parseCSV = (text: string): CSVProduct[] => {
    const lines = text.split("\n").filter((line) => line.trim());
    if (lines.length < 2) return [];

    const headers = lines[0].split(",").map((h) => h.trim().toLowerCase().replace(/"/g, ""));
    const products: CSVProduct[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || [];
      const cleanValues = values.map((v) => v.replace(/^"|"$/g, "").trim());

      const product: any = {};
      headers.forEach((header, index) => {
        const value = cleanValues[index] || "";
        switch (header) {
          case "name":
            product.name = value;
            break;
          case "price":
            product.price = parseFloat(value) || 0;
            break;
          case "description":
            product.description = value;
            break;
          case "sku":
            product.sku = value;
            break;
          case "inventory_quantity":
          case "quantity":
          case "stock":
            product.inventory_quantity = parseInt(value) || 0;
            break;
          case "status":
            product.status = value === "published" ? "published" : "draft";
            break;
        }
      });

      if (product.name) {
        products.push(product);
      }
    }

    return products;
  };

  const handleUpload = async () => {
    if (!file || !store) return;

    setIsUploading(true);
    setUploadProgress({ total: 0, processed: 0, success: 0, failed: 0 });

    try {
      const text = await file.text();
      const products = parseCSV(text);

      if (products.length === 0) {
        toast({
          title: "No products found",
          description: "The CSV file appears to be empty or invalid",
          variant: "destructive",
        });
        setIsUploading(false);
        return;
      }

      setUploadProgress({
        total: products.length,
        processed: 0,
        success: 0,
        failed: 0,
      });

      let success = 0;
      let failed = 0;

      for (let i = 0; i < products.length; i++) {
        const product = products[i];

        try {
          const { error } = await supabase.from("products").insert({
            store_id: store.id,
            name: product.name,
            price: product.price,
            description: product.description || null,
            sku: product.sku || null,
            inventory_quantity: product.inventory_quantity || 0,
            status: product.status || "draft",
          });

          if (error) throw error;
          success++;
        } catch (err) {
          console.error(`Failed to insert product: ${product.name}`, err);
          failed++;
        }

        setUploadProgress({
          total: products.length,
          processed: i + 1,
          success,
          failed,
        });
      }

      toast({
        title: "Upload complete",
        description: `Successfully imported ${success} products. ${failed > 0 ? `${failed} failed.` : ""}`,
      });

      // Reset after success
      setTimeout(() => {
        setFile(null);
        setUploadProgress(null);
        navigate("/dashboard/products");
      }, 2000);
    } catch (error) {
      console.error("Error uploading products:", error);
      toast({
        title: "Upload failed",
        description: "There was an error processing your file",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

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
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/dashboard/products")}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-xl font-semibold">Bulk upload products</h1>
              <Button variant="outline" size="sm" className="gap-2">
                <HelpCircle className="h-4 w-4" />
                How it works
              </Button>
            </div>
          </header>

          {/* Content */}
          <div className="p-6">
            <div className="mx-auto max-w-3xl">
              <div className="rounded-lg border bg-card p-6 space-y-6">
                <div>
                  <h2 className="text-lg font-semibold">
                    Upload products from CSV file
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Download a{" "}
                    <button
                      onClick={downloadSampleCSV}
                      className="text-primary hover:underline font-medium"
                    >
                      sample CSV template
                    </button>{" "}
                    to see an example of the format required.
                  </p>
                </div>

                {/* Upload Area */}
                <div
                  className={cn(
                    "relative flex min-h-[200px] flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors",
                    isDragging
                      ? "border-primary bg-primary/5"
                      : "border-muted-foreground/25 hover:border-muted-foreground/50",
                    file && "border-solid border-muted"
                  )}
                  onDragEnter={handleDragEnter}
                  onDragLeave={handleDragLeave}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                >
                  {file ? (
                    <div className="flex flex-col items-center gap-4 p-6">
                      <div className="flex items-center gap-3 rounded-lg border bg-muted/50 px-4 py-3">
                        <FileText className="h-8 w-8 text-muted-foreground" />
                        <div className="text-left">
                          <p className="font-medium">{file.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {(file.size / 1024).toFixed(1)} KB
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="ml-4"
                          onClick={() => setFile(null)}
                          disabled={isUploading}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>

                      {uploadProgress && (
                        <div className="w-full max-w-sm space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>
                              Processing {uploadProgress.processed} of{" "}
                              {uploadProgress.total}
                            </span>
                            <span>
                              {Math.round(
                                (uploadProgress.processed /
                                  uploadProgress.total) *
                                  100
                              )}
                              %
                            </span>
                          </div>
                          <div className="h-2 overflow-hidden rounded-full bg-muted">
                            <div
                              className="h-full bg-primary transition-all"
                              style={{
                                width: `${(uploadProgress.processed / uploadProgress.total) * 100}%`,
                              }}
                            />
                          </div>
                          <div className="flex justify-between text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Check className="h-3 w-3 text-green-500" />
                              {uploadProgress.success} success
                            </span>
                            {uploadProgress.failed > 0 && (
                              <span className="flex items-center gap-1 text-destructive">
                                <AlertCircle className="h-3 w-3" />
                                {uploadProgress.failed} failed
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-4 p-6">
                      <Button
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        Add file
                      </Button>
                      <p className="text-sm text-muted-foreground">
                        or drag files to upload
                      </p>
                    </div>
                  )}

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,text/csv"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>

                {/* Actions */}
                <div className="flex justify-end">
                  <Button
                    onClick={handleUpload}
                    disabled={!file || isUploading}
                  >
                    {isUploading ? "Uploading..." : "Add products"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
