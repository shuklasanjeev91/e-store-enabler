import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import {
  Upload,
  Search,
  Grid3X3,
  List,
  Trash2,
  Download,
  Copy,
  MoreVertical,
  Image,
  FileText,
  X,
  Check,
  Loader2,
  FolderOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MediaFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  created_at: string;
}

export default function MediaLibrary() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewFile, setPreviewFile] = useState<MediaFile | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<MediaFile | null>(null);

  // Fetch store
  const { data: store } = useQuery({
    queryKey: ["store", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from("stores")
        .select("*")
        .eq("user_id", user.id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Fetch media files
  const { data: files = [], isLoading } = useQuery({
    queryKey: ["media-files", store?.id],
    queryFn: async () => {
      if (!store?.id) return [];
      
      const { data, error } = await supabase.storage
        .from("store-media")
        .list(store.id, {
          sortBy: { column: "created_at", order: "desc" },
        });
      
      if (error) throw error;
      
      const filesWithUrls: MediaFile[] = (data || [])
        .filter(file => file.name !== ".emptyFolderPlaceholder")
        .map(file => {
          const { data: urlData } = supabase.storage
            .from("store-media")
            .getPublicUrl(`${store.id}/${file.name}`);
          
          return {
            id: file.id || file.name,
            name: file.name,
            size: file.metadata?.size || 0,
            type: file.metadata?.mimetype || "unknown",
            url: urlData.publicUrl,
            created_at: file.created_at || new Date().toISOString(),
          };
        });
      
      return filesWithUrls;
    },
    enabled: !!store?.id,
  });

  // Filter files based on search
  const filteredFiles = files.filter(file =>
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: async (fileList: FileList) => {
      if (!store?.id) throw new Error("No store found");
      
      const uploadedFiles: MediaFile[] = [];
      const totalFiles = fileList.length;
      
      for (let i = 0; i < totalFiles; i++) {
        const file = fileList[i];
        const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
        const filePath = `${store.id}/${fileName}`;
        
        const { error } = await supabase.storage
          .from("store-media")
          .upload(filePath, file);
        
        if (error) throw error;
        
        const { data: urlData } = supabase.storage
          .from("store-media")
          .getPublicUrl(filePath);
        
        uploadedFiles.push({
          id: fileName,
          name: fileName,
          size: file.size,
          type: file.type,
          url: urlData.publicUrl,
          created_at: new Date().toISOString(),
        });
        
        setUploadProgress(Math.round(((i + 1) / totalFiles) * 100));
      }
      
      return uploadedFiles;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["media-files", store?.id] });
      toast({ title: "Files uploaded successfully" });
      setIsUploading(false);
      setUploadProgress(0);
    },
    onError: (error) => {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
      setIsUploading(false);
      setUploadProgress(0);
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (fileNames: string[]) => {
      if (!store?.id) throw new Error("No store found");
      
      const filePaths = fileNames.map(name => `${store.id}/${name}`);
      const { error } = await supabase.storage
        .from("store-media")
        .remove(filePaths);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["media-files", store?.id] });
      toast({ title: "Files deleted successfully" });
      setSelectedFiles([]);
      setDeleteDialogOpen(false);
      setFileToDelete(null);
    },
    onError: (error) => {
      toast({
        title: "Delete failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    setIsUploading(true);
    uploadMutation.mutate(files);
    e.target.value = "";
  }, [uploadMutation]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;
    
    setIsUploading(true);
    uploadMutation.mutate(files);
  }, [uploadMutation]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const toggleFileSelection = (fileId: string) => {
    setSelectedFiles(prev =>
      prev.includes(fileId)
        ? prev.filter(id => id !== fileId)
        : [...prev, fileId]
    );
  };

  const selectAll = () => {
    if (selectedFiles.length === filteredFiles.length) {
      setSelectedFiles([]);
    } else {
      setSelectedFiles(filteredFiles.map(f => f.id));
    }
  };

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    toast({ title: "URL copied to clipboard" });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const isImage = (type: string) => type.startsWith("image/");

  const handleDeleteClick = (file: MediaFile) => {
    setFileToDelete(file);
    setDeleteDialogOpen(true);
  };

  const handleBulkDelete = () => {
    const filesToDelete = filteredFiles
      .filter(f => selectedFiles.includes(f.id))
      .map(f => f.name);
    deleteMutation.mutate(filesToDelete);
  };

  const handleSingleDelete = () => {
    if (fileToDelete) {
      deleteMutation.mutate([fileToDelete.name]);
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <DashboardSidebar storeName={store?.name || ""} storeSlug={store?.slug || ""} />
        <SidebarInset className="flex-1">
          <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold">Media Library</h1>
                <p className="text-muted-foreground">
                  Upload and manage images and files for your store
                </p>
              </div>
              
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  multiple
                  accept="image/*,.pdf"
                  onChange={handleFileUpload}
                />
                <label htmlFor="file-upload">
                  <Button asChild disabled={isUploading}>
                    <span>
                      {isUploading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Uploading {uploadProgress}%
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4" />
                          Upload Files
                        </>
                      )}
                    </span>
                  </Button>
                </label>
              </div>
            </div>

            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search files..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              
              <div className="flex items-center gap-2">
                {selectedFiles.length > 0 && (
                  <>
                    <Badge variant="secondary">
                      {selectedFiles.length} selected
                    </Badge>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setDeleteDialogOpen(true)}
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </Button>
                  </>
                )}
                
                <div className="flex items-center border rounded-md">
                  <Button
                    variant={viewMode === "grid" ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                    className="rounded-r-none"
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                    className="rounded-l-none"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Drop Zone / Content */}
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              className="min-h-[400px]"
            >
              {isLoading ? (
                <div className="flex items-center justify-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : filteredFiles.length === 0 ? (
                <Card className="flex flex-col items-center justify-center h-64 border-dashed">
                  <FolderOpen className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-lg font-medium">No files yet</p>
                  <p className="text-muted-foreground mb-4">
                    Drag and drop files here or click upload
                  </p>
                  <label htmlFor="file-upload">
                    <Button asChild variant="outline">
                      <span>
                        <Upload className="h-4 w-4" />
                        Upload Files
                      </span>
                    </Button>
                  </label>
                </Card>
              ) : viewMode === "grid" ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {filteredFiles.map((file) => (
                    <Card
                      key={file.id}
                      className={cn(
                        "group relative overflow-hidden cursor-pointer transition-all hover:ring-2 hover:ring-primary",
                        selectedFiles.includes(file.id) && "ring-2 ring-primary"
                      )}
                      onClick={() => setPreviewFile(file)}
                    >
                      <div
                        className="absolute top-2 left-2 z-10"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Checkbox
                          checked={selectedFiles.includes(file.id)}
                          onCheckedChange={() => toggleFileSelection(file.id)}
                          className="bg-background"
                        />
                      </div>
                      
                      <div className="aspect-square bg-muted flex items-center justify-center">
                        {isImage(file.type) ? (
                          <img
                            src={file.url}
                            alt={file.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <FileText className="h-12 w-12 text-muted-foreground" />
                        )}
                      </div>
                      
                      <div className="p-2">
                        <p className="text-xs font-medium truncate">{file.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(file.size)}
                        </p>
                      </div>
                      
                      <div
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="icon" variant="secondary" className="h-7 w-7">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => copyToClipboard(file.url)}>
                              <Copy className="h-4 w-4 mr-2" />
                              Copy URL
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <a href={file.url} download target="_blank" rel="noopener noreferrer">
                                <Download className="h-4 w-4 mr-2" />
                                Download
                              </a>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteClick(file)}
                              className="text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <div className="divide-y">
                    <div className="flex items-center gap-4 p-3 bg-muted/50">
                      <Checkbox
                        checked={selectedFiles.length === filteredFiles.length && filteredFiles.length > 0}
                        onCheckedChange={selectAll}
                      />
                      <span className="flex-1 text-sm font-medium">Name</span>
                      <span className="w-24 text-sm font-medium">Size</span>
                      <span className="w-32 text-sm font-medium">Date</span>
                      <span className="w-20"></span>
                    </div>
                    
                    {filteredFiles.map((file) => (
                      <div
                        key={file.id}
                        className={cn(
                          "flex items-center gap-4 p-3 hover:bg-muted/50 cursor-pointer",
                          selectedFiles.includes(file.id) && "bg-primary/5"
                        )}
                        onClick={() => setPreviewFile(file)}
                      >
                        <div onClick={(e) => e.stopPropagation()}>
                          <Checkbox
                            checked={selectedFiles.includes(file.id)}
                            onCheckedChange={() => toggleFileSelection(file.id)}
                          />
                        </div>
                        
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="w-10 h-10 rounded bg-muted flex items-center justify-center flex-shrink-0">
                            {isImage(file.type) ? (
                              <img
                                src={file.url}
                                alt={file.name}
                                className="w-full h-full object-cover rounded"
                              />
                            ) : (
                              <FileText className="h-5 w-5 text-muted-foreground" />
                            )}
                          </div>
                          <span className="text-sm truncate">{file.name}</span>
                        </div>
                        
                        <span className="w-24 text-sm text-muted-foreground">
                          {formatFileSize(file.size)}
                        </span>
                        
                        <span className="w-32 text-sm text-muted-foreground">
                          {new Date(file.created_at).toLocaleDateString()}
                        </span>
                        
                        <div className="w-20 flex justify-end" onClick={(e) => e.stopPropagation()}>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button size="icon" variant="ghost" className="h-8 w-8">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => copyToClipboard(file.url)}>
                                <Copy className="h-4 w-4 mr-2" />
                                Copy URL
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <a href={file.url} download target="_blank" rel="noopener noreferrer">
                                  <Download className="h-4 w-4 mr-2" />
                                  Download
                                </a>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDeleteClick(file)}
                                className="text-destructive"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </div>
          </div>
        </SidebarInset>
      </div>

      {/* Preview Dialog */}
      <Dialog open={!!previewFile} onOpenChange={() => setPreviewFile(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="truncate pr-8">{previewFile?.name}</DialogTitle>
            <DialogDescription>
              {previewFile && formatFileSize(previewFile.size)} • {previewFile?.type}
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex items-center justify-center bg-muted rounded-lg min-h-[300px] max-h-[500px] overflow-hidden">
            {previewFile && isImage(previewFile.type) ? (
              <img
                src={previewFile.url}
                alt={previewFile.name}
                className="max-w-full max-h-[500px] object-contain"
              />
            ) : (
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <FileText className="h-16 w-16" />
                <p>Preview not available</p>
              </div>
            )}
          </div>
          
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => previewFile && copyToClipboard(previewFile.url)}
              className="w-full sm:w-auto"
            >
              <Copy className="h-4 w-4" />
              Copy URL
            </Button>
            <Button asChild variant="outline" className="w-full sm:w-auto">
              <a href={previewFile?.url} download target="_blank" rel="noopener noreferrer">
                <Download className="h-4 w-4" />
                Download
              </a>
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (previewFile) {
                  handleDeleteClick(previewFile);
                  setPreviewFile(null);
                }
              }}
              className="w-full sm:w-auto"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete {fileToDelete ? "File" : "Files"}</DialogTitle>
            <DialogDescription>
              {fileToDelete
                ? `Are you sure you want to delete "${fileToDelete.name}"? This action cannot be undone.`
                : `Are you sure you want to delete ${selectedFiles.length} files? This action cannot be undone.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={fileToDelete ? handleSingleDelete : handleBulkDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
}
