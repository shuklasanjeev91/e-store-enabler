import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  Upload,
  Search,
  Image,
  FileText,
  Check,
  Loader2,
  FolderOpen,
  X,
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

interface MediaPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (url: string) => void;
  multiple?: boolean;
  onSelectMultiple?: (urls: string[]) => void;
  accept?: "images" | "all";
}

export function MediaPicker({
  open,
  onOpenChange,
  onSelect,
  multiple = false,
  onSelectMultiple,
  accept = "images",
}: MediaPickerProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

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
    enabled: !!user?.id && open,
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
        .filter((file) => file.name !== ".emptyFolderPlaceholder")
        .map((file) => {
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
    enabled: !!store?.id && open,
  });

  // Filter files based on search and accept type
  const filteredFiles = files.filter((file) => {
    const matchesSearch = file.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesType =
      accept === "all" || file.type.startsWith("image/");
    return matchesSearch && matchesType;
  });

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: async (fileList: FileList) => {
      if (!store?.id) throw new Error("No store found");

      const uploadedFiles: MediaFile[] = [];

      for (let i = 0; i < fileList.length; i++) {
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
      }

      return uploadedFiles;
    },
    onSuccess: (uploadedFiles) => {
      queryClient.invalidateQueries({ queryKey: ["media-files", store?.id] });
      toast({ title: "Files uploaded successfully" });
      setIsUploading(false);

      // Auto-select the uploaded file if single select
      if (!multiple && uploadedFiles.length === 1) {
        onSelect(uploadedFiles[0].url);
        onOpenChange(false);
      }
    },
    onError: (error) => {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
      setIsUploading(false);
    },
  });

  const handleFileUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files || files.length === 0) return;

      setIsUploading(true);
      uploadMutation.mutate(files);
      e.target.value = "";
    },
    [uploadMutation]
  );

  const toggleFileSelection = (fileUrl: string) => {
    if (multiple) {
      setSelectedFiles((prev) =>
        prev.includes(fileUrl)
          ? prev.filter((url) => url !== fileUrl)
          : [...prev, fileUrl]
      );
    } else {
      setSelectedFiles([fileUrl]);
    }
  };

  const handleConfirm = () => {
    if (multiple && onSelectMultiple) {
      onSelectMultiple(selectedFiles);
    } else if (selectedFiles.length > 0) {
      onSelect(selectedFiles[0]);
    }
    setSelectedFiles([]);
    onOpenChange(false);
  };

  const handleClose = () => {
    setSelectedFiles([]);
    onOpenChange(false);
  };

  const isImage = (type: string) => type.startsWith("image/");

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Select from Media Library</DialogTitle>
        </DialogHeader>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 py-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="file"
              id="media-picker-upload"
              className="hidden"
              multiple
              accept={accept === "images" ? "image/*" : "image/*,.pdf"}
              onChange={handleFileUpload}
            />
            <label htmlFor="media-picker-upload">
              <Button asChild variant="outline" disabled={isUploading}>
                <span>
                  {isUploading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4" />
                      Upload New
                    </>
                  )}
                </span>
              </Button>
            </label>
          </div>
        </div>

        {/* File Grid */}
        <div className="flex-1 overflow-y-auto min-h-[300px]">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredFiles.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <FolderOpen className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium">No files yet</p>
              <p className="text-muted-foreground mb-4">
                Upload files to get started
              </p>
              <label htmlFor="media-picker-upload">
                <Button asChild variant="outline">
                  <span>
                    <Upload className="h-4 w-4" />
                    Upload Files
                  </span>
                </Button>
              </label>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
              {filteredFiles.map((file) => {
                const isSelected = selectedFiles.includes(file.url);

                return (
                  <button
                    key={file.id}
                    onClick={() => toggleFileSelection(file.url)}
                    className={cn(
                      "group relative aspect-square rounded-lg overflow-hidden border-2 transition-all hover:border-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                      isSelected
                        ? "border-primary ring-2 ring-primary ring-offset-2"
                        : "border-transparent"
                    )}
                  >
                    {isImage(file.type) ? (
                      <img
                        src={file.url}
                        alt={file.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-muted flex items-center justify-center">
                        <FileText className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}

                    {/* Selection indicator */}
                    {isSelected && (
                      <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                        <div className="bg-primary text-primary-foreground rounded-full p-1">
                          <Check className="h-4 w-4" />
                        </div>
                      </div>
                    )}

                    {/* Hover overlay with file info */}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <p className="text-xs text-white truncate">{file.name}</p>
                      <p className="text-xs text-white/70">
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <DialogFooter className="flex-row justify-between sm:justify-between gap-2 pt-4 border-t">
          <div className="text-sm text-muted-foreground">
            {selectedFiles.length > 0
              ? `${selectedFiles.length} file${selectedFiles.length > 1 ? "s" : ""} selected`
              : "No files selected"}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={selectedFiles.length === 0}
            >
              <Check className="h-4 w-4" />
              Select
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Convenience component for triggering the media picker
interface MediaPickerTriggerProps {
  value?: string;
  onChange: (url: string) => void;
  placeholder?: string;
  className?: string;
}

export function MediaPickerTrigger({
  value,
  onChange,
  placeholder = "Select image",
  className,
}: MediaPickerTriggerProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className={cn("space-y-2", className)}>
        {value ? (
          <div className="relative group">
            <img
              src={value}
              alt="Selected"
              className="w-full h-32 object-cover rounded-lg border"
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={() => setOpen(true)}
              >
                Change
              </Button>
              <Button
                type="button"
                size="sm"
                variant="destructive"
                onClick={() => onChange("")}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="w-full h-32 border-2 border-dashed rounded-lg flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-primary hover:text-primary transition-colors"
          >
            <Image className="h-8 w-8" />
            <span className="text-sm">{placeholder}</span>
          </button>
        )}
      </div>

      <MediaPicker
        open={open}
        onOpenChange={setOpen}
        onSelect={onChange}
        accept="images"
      />
    </>
  );
}
