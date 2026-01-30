import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { MediaPickerTrigger } from "@/components/MediaPicker";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Plus,
  Trash2,
  X,
  Edit2,
  GripVertical,
} from "lucide-react";

export interface VariantOption {
  name: string;
  values: string[];
}

export interface ProductVariant {
  id?: string;
  name: string;
  sku: string;
  price: number;
  compareAtPrice: number | null;
  inventoryQuantity: number;
  imageUrl: string;
  isActive: boolean;
  option1Name: string | null;
  option1Value: string | null;
  option2Name: string | null;
  option2Value: string | null;
  option3Name: string | null;
  option3Value: string | null;
  sortOrder: number;
}

interface VariantManagerProps {
  variants: ProductVariant[];
  options: VariantOption[];
  currency: string;
  onOptionsChange: (options: VariantOption[]) => void;
  onVariantsChange: (variants: ProductVariant[]) => void;
}

export function VariantManager({
  variants,
  options,
  currency,
  onOptionsChange,
  onVariantsChange,
}: VariantManagerProps) {
  const [optionDialogOpen, setOptionDialogOpen] = useState(false);
  const [editingOptionIndex, setEditingOptionIndex] = useState<number | null>(null);
  const [newOptionName, setNewOptionName] = useState("");
  const [newOptionValues, setNewOptionValues] = useState<string[]>([]);
  const [newValueInput, setNewValueInput] = useState("");

  const currencySymbol = currency === "INR" ? "₹" : "$";

  const generateVariantCombinations = (opts: VariantOption[]): ProductVariant[] => {
    if (opts.length === 0) return [];

    const combinations: string[][] = [[]];

    for (const option of opts) {
      const newCombinations: string[][] = [];
      for (const combo of combinations) {
        for (const value of option.values) {
          newCombinations.push([...combo, value]);
        }
      }
      combinations.length = 0;
      combinations.push(...newCombinations);
    }

    return combinations.map((combo, index) => {
      const name = combo.join(" / ");
      const existing = variants.find((v) => v.name === name);
      if (existing) return existing;

      return {
        name,
        sku: "",
        price: 0,
        compareAtPrice: null,
        inventoryQuantity: 0,
        imageUrl: "",
        isActive: true,
        option1Name: opts[0]?.name || null,
        option1Value: combo[0] || null,
        option2Name: opts[1]?.name || null,
        option2Value: combo[1] || null,
        option3Name: opts[2]?.name || null,
        option3Value: combo[2] || null,
        sortOrder: index,
      };
    });
  };

  const handleAddOption = () => {
    if (!newOptionName.trim() || newOptionValues.length === 0) return;

    const newOption: VariantOption = {
      name: newOptionName.trim(),
      values: newOptionValues,
    };

    let updatedOptions: VariantOption[];
    if (editingOptionIndex !== null) {
      updatedOptions = [...options];
      updatedOptions[editingOptionIndex] = newOption;
    } else {
      if (options.length >= 3) return;
      updatedOptions = [...options, newOption];
    }

    onOptionsChange(updatedOptions);
    const newVariants = generateVariantCombinations(updatedOptions);
    onVariantsChange(newVariants);
    resetOptionDialog();
  };

  const resetOptionDialog = () => {
    setNewOptionName("");
    setNewOptionValues([]);
    setNewValueInput("");
    setEditingOptionIndex(null);
    setOptionDialogOpen(false);
  };

  const handleEditOption = (index: number) => {
    const option = options[index];
    setNewOptionName(option.name);
    setNewOptionValues([...option.values]);
    setEditingOptionIndex(index);
    setOptionDialogOpen(true);
  };

  const handleRemoveOption = (index: number) => {
    const updatedOptions = options.filter((_, i) => i !== index);
    onOptionsChange(updatedOptions);

    if (updatedOptions.length === 0) {
      onVariantsChange([]);
    } else {
      const newVariants = generateVariantCombinations(updatedOptions);
      onVariantsChange(newVariants);
    }
  };

  const handleAddValue = () => {
    const value = newValueInput.trim();
    if (value && !newOptionValues.includes(value)) {
      setNewOptionValues([...newOptionValues, value]);
      setNewValueInput("");
    }
  };

  const handleRemoveValue = (value: string) => {
    setNewOptionValues(newOptionValues.filter((v) => v !== value));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      handleAddValue();
    }
  };

  const updateVariant = (index: number, updates: Partial<ProductVariant>) => {
    const updatedVariants = [...variants];
    updatedVariants[index] = { ...updatedVariants[index], ...updates };
    onVariantsChange(updatedVariants);
  };

  const updateAllVariants = (field: keyof ProductVariant, value: number | string) => {
    const updatedVariants = variants.map((v) => ({ ...v, [field]: value }));
    onVariantsChange(updatedVariants);
  };

  return (
    <div className="space-y-6">
      {/* Variant Options */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium">Options</h3>
            <p className="text-sm text-muted-foreground">
              Add options like size, color, material (max 3)
            </p>
          </div>
          {options.length < 3 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setOptionDialogOpen(true)}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Add option
            </Button>
          )}
        </div>

        {options.length > 0 && (
          <div className="space-y-2">
            {options.map((option, index) => (
              <div
                key={index}
                className="flex items-center justify-between rounded-lg border bg-card p-3"
              >
                <div className="flex items-center gap-3">
                  <GripVertical className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{option.name}</p>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {option.values.map((value) => (
                        <Badge key={value} variant="secondary" className="text-xs">
                          {value}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEditOption(index)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveOption(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Variant Combinations Table */}
      {variants.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Variants ({variants.length})</h3>
              <p className="text-sm text-muted-foreground">
                Set individual pricing and inventory for each variant
              </p>
            </div>
          </div>

          {/* Bulk Actions */}
          <Card>
            <CardContent className="flex flex-wrap items-center gap-4 p-4">
              <span className="text-sm text-muted-foreground">Apply to all:</span>
              <div className="flex items-center gap-2">
                <Label className="text-sm">Price</Label>
                <div className="relative w-28">
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                    {currencySymbol}
                  </span>
                  <Input
                    type="number"
                    className="h-8 pl-6 text-sm"
                    placeholder="0"
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      if (!isNaN(val)) updateAllVariants("price", val);
                    }}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Label className="text-sm">Quantity</Label>
                <Input
                  type="number"
                  className="h-8 w-20 text-sm"
                  placeholder="0"
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    if (!isNaN(val)) updateAllVariants("inventoryQuantity", val);
                  }}
                />
              </div>
            </CardContent>
          </Card>

          {/* Variants Table */}
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12"></TableHead>
                  <TableHead>Variant</TableHead>
                  <TableHead className="w-32">Price</TableHead>
                  <TableHead className="w-32">Compare at</TableHead>
                  <TableHead className="w-24">Quantity</TableHead>
                  <TableHead className="w-32">SKU</TableHead>
                  <TableHead className="w-16">Active</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {variants.map((variant, index) => (
                  <TableRow key={variant.name}>
                    <TableCell>
                      <div className="h-10 w-10">
                        {variant.imageUrl ? (
                          <div className="relative group h-10 w-10 overflow-hidden rounded-lg border">
                            <img
                              src={variant.imageUrl}
                              alt={variant.name}
                              className="h-full w-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => updateVariant(index, { imageUrl: "" })}
                              className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                            >
                              <X className="h-4 w-4 text-white" />
                            </button>
                          </div>
                        ) : (
                          <MediaPickerTrigger
                            value=""
                            onChange={(url) => updateVariant(index, { imageUrl: url })}
                            placeholder=""
                            className="!h-10 !w-10"
                          />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">{variant.name}</span>
                    </TableCell>
                    <TableCell>
                      <div className="relative">
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                          {currencySymbol}
                        </span>
                        <Input
                          type="number"
                          className="h-8 pl-6 text-sm"
                          value={variant.price || ""}
                          onChange={(e) =>
                            updateVariant(index, {
                              price: parseFloat(e.target.value) || 0,
                            })
                          }
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="relative">
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                          {currencySymbol}
                        </span>
                        <Input
                          type="number"
                          className="h-8 pl-6 text-sm"
                          value={variant.compareAtPrice || ""}
                          onChange={(e) =>
                            updateVariant(index, {
                              compareAtPrice: parseFloat(e.target.value) || null,
                            })
                          }
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        className="h-8 text-sm"
                        value={variant.inventoryQuantity || ""}
                        onChange={(e) =>
                          updateVariant(index, {
                            inventoryQuantity: parseInt(e.target.value) || 0,
                          })
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        className="h-8 text-sm"
                        value={variant.sku}
                        placeholder="SKU"
                        onChange={(e) =>
                          updateVariant(index, { sku: e.target.value })
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={variant.isActive}
                        onCheckedChange={(checked) =>
                          updateVariant(index, { isActive: checked })
                        }
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Inventory Summary */}
          <div className="grid gap-4 sm:grid-cols-3">
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Total Inventory</p>
                <p className="text-2xl font-bold">
                  {variants.reduce((sum, v) => sum + (v.inventoryQuantity || 0), 0)}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Active Variants</p>
                <p className="text-2xl font-bold">
                  {variants.filter((v) => v.isActive).length}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Out of Stock</p>
                <p className="text-2xl font-bold text-destructive">
                  {variants.filter((v) => v.inventoryQuantity <= 0).length}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Add/Edit Option Dialog */}
      <Dialog open={optionDialogOpen} onOpenChange={(open) => !open && resetOptionDialog()}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingOptionIndex !== null ? "Edit option" : "Add option"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>
                Option name <span className="text-destructive">*</span>
              </Label>
              <Input
                placeholder="e.g., Size, Color, Material"
                value={newOptionName}
                onChange={(e) => setNewOptionName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>
                Option values <span className="text-destructive">*</span>
              </Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter value and press Enter"
                  value={newValueInput}
                  onChange={(e) => setNewValueInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
                <Button type="button" variant="outline" onClick={handleAddValue}>
                  Add
                </Button>
              </div>
              {newOptionValues.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {newOptionValues.map((value) => (
                    <Badge key={value} variant="secondary" className="gap-1 pr-1">
                      {value}
                      <button
                        type="button"
                        onClick={() => handleRemoveValue(value)}
                        className="ml-1 rounded-full hover:bg-background/50"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={resetOptionDialog}>
              Cancel
            </Button>
            <Button onClick={handleAddOption} disabled={!newOptionName.trim() || newOptionValues.length === 0}>
              {editingOptionIndex !== null ? "Save changes" : "Add option"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
