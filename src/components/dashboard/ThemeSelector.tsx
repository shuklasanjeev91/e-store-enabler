import { useState } from "react";
import { Check, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { THEMES, type ThemeId } from "@/components/storefront/themes";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface ThemeSelectorProps {
  storeId: string;
  currentTheme: string;
  onThemeChange: (theme: ThemeId) => void;
}

export default function ThemeSelector({ storeId, currentTheme, onThemeChange }: ThemeSelectorProps) {
  const [open, setOpen] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState<ThemeId>(currentTheme as ThemeId);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("stores")
        .update({ theme: selectedTheme })
        .eq("id", storeId);

      if (error) throw error;

      onThemeChange(selectedTheme);
      setOpen(false);
      toast({
        title: "Theme updated!",
        description: "Your store's look has been changed.",
      });
    } catch (error) {
      console.error("Error updating theme:", error);
      toast({
        title: "Failed to update theme",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Palette className="h-4 w-4" />
          Change Theme
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Choose a theme</DialogTitle>
          <DialogDescription>
            Select a theme for your storefront. You can change this anytime.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-3 py-4 sm:grid-cols-2">
          {THEMES.map((theme) => (
            <button
              key={theme.id}
              type="button"
              onClick={() => setSelectedTheme(theme.id)}
              className={cn(
                "relative flex items-start gap-3 rounded-xl border-2 p-4 text-left transition-all",
                selectedTheme === theme.id
                  ? "border-primary bg-primary/5"
                  : "border-muted hover:border-muted-foreground/30"
              )}
            >
              <div className={cn(
                "h-10 w-10 shrink-0 rounded-lg border",
                theme.preview
              )} />
              <div className="flex-1">
                <p className="font-medium">{theme.name}</p>
                <p className="text-sm text-muted-foreground">{theme.description}</p>
              </div>
              {selectedTheme === theme.id && (
                <div className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-primary">
                  <Check className="h-3 w-3 text-primary-foreground" />
                </div>
              )}
            </button>
          ))}
        </div>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving || selectedTheme === currentTheme}>
            {isSaving ? "Saving..." : "Save Theme"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
