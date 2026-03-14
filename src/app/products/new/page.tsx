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
      brand: formData.get("brand") || undefined,
      manufacturer: formData.get("manufacturer") || undefined,
      costPrice: Number(formData.get("costPrice")) || 0,
      salePrice: Number(formData.get("salePrice")) || 0,
      weight: formData.get("weight") ? Number(formData.get("weight")) : undefined,
      dimensions: formData.get("dimensions") || undefined,
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

  // Local state for margin preview
  const [prices, setPrices] = useState({ cost: 0, sale: 0 });
  const margin = prices.sale > 0 ? ((prices.sale - prices.cost) / prices.sale) * 100 : 0;

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
          <div className="md:col-span-2 space-y-6">
            <Card className="border-primary/10 shadow-lg">
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
                      <label className="text-sm font-semibold" htmlFor="brand">Brand</label>
                      <Input id="brand" name="brand" placeholder="e.g. Acme Corp" className="border-2 focus:border-primary/50" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold" htmlFor="manufacturer">Manufacturer</label>
                      <Input id="manufacturer" name="manufacturer" placeholder="Manufacturing Site A" className="border-2 focus:border-primary/50" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-emerald-100 shadow-md">
              <CardHeader className="bg-emerald-50/50">
                <CardTitle className="text-lg text-emerald-800 flex items-center gap-2">
                  <Plus className="w-5 h-5" /> Financials & Logistics
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold">Cost Price ($)</label>
                      <Input 
                        name="costPrice" 
                        type="number" 
                        step="0.01" 
                        placeholder="0.00"
                        onChange={(e) => setPrices(p => ({ ...p, cost: Number(e.target.value) }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold">Sale Price ($)</label>
                      <Input 
                        name="salePrice" 
                        type="number" 
                        step="0.01" 
                        placeholder="0.00"
                        onChange={(e) => setPrices(p => ({ ...p, sale: Number(e.target.value) }))}
                      />
                    </div>
                    {prices.sale > 0 && (
                      <div className={`p-2 rounded text-xs font-bold text-center ${margin >= 20 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                        Estimated Margin: {margin.toFixed(1)}%
                      </div>
                    )}
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-600">Weight (kg)</label>
                      <Input name="weight" type="number" step="0.1" placeholder="0.0" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-600">Dimensions (L×W×H)</label>
                      <Input name="dimensions" placeholder="e.g. 10x20x30 cm" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="border-amber-200 bg-amber-50/30">
              <CardHeader>
                <CardTitle className="text-base text-amber-700">Inventory Logic</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Unit of Measure</label>
                  <Input name="uom" required defaultValue="pcs" placeholder="pcs, kg, units" />
                </div>
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
                    Triggers a "Low Stock" alert when inventory drops below this value.
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
