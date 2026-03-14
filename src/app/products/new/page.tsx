"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Loader2, Package, Plus, Trash2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Link from "next/link";

export default function NewProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name"),
      sku: formData.get("sku"),
      category: formData.get("category"),
      uom: formData.get("uom"),
      barcode: formData.get("barcode") || undefined,
      reorderLevel: Number(formData.get("reorderLevel")) || 0,
    };

    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || "Failed to create product");
      }

      router.push("/products");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/products">
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Add New Product</h1>
          <p className="text-sm text-muted-foreground">Register a new item in your inventory system.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-2 border-primary/10 shadow-lg">
            <CardHeader className="bg-muted/30">
              <CardTitle className="text-lg flex items-center gap-2">
                <Package className="w-5 h-5 text-primary" /> General Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold" htmlFor="name">Product Name *</label>
                  <Input id="name" name="name" required placeholder="e.g. Steel Rods 10mm" className="border-2 focus:border-primary/50" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold" htmlFor="sku">SKU / Internal Code *</label>
                    <Input id="sku" name="sku" required placeholder="SR-10-V1" className="border-2 focus:border-primary/50" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold" htmlFor="category">Category *</label>
                    <Input id="category" name="category" required placeholder="Raw Materials" className="border-2 focus:border-primary/50" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold" htmlFor="uom">Unit of Measure *</label>
                    <Input id="uom" name="uom" required placeholder="kg, units, meters" className="border-2 focus:border-primary/50" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold" htmlFor="barcode">Barcode (Optional)</label>
                    <Input id="barcode" name="barcode" placeholder="Optional EAN/UPC" className="border-2 focus:border-primary/50" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="border-amber-200 bg-amber-50/30">
              <CardHeader>
                <CardTitle className="text-base text-amber-700">Inventory Logic</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold" htmlFor="reorderLevel">Reorder Level</label>
                  <Input 
                    id="reorderLevel" 
                    name="reorderLevel" 
                    type="number" 
                    defaultValue={0} 
                    className="border-2 border-amber-200 focus:border-amber-500" 
                  />
                  <p className="text-[10px] text-muted-foreground mt-1">
                    Triggers a "Low Stock" alert when total inventory drops below this value.
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-3">
              {error && (
                <p className="text-xs text-red-600 font-medium bg-red-50 p-2 rounded border border-red-100 italic">
                  ⚠️ {error}
                </p>
              )}
              <Button type="submit" className="w-full h-12 text-lg shadow-xl shadow-primary/20" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5 mr-2" /> Save Product
                  </>
                )}
              </Button>
              <Button type="button" variant="outline" className="w-full" asChild>
                <Link href="/products">Cancel</Link>
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
