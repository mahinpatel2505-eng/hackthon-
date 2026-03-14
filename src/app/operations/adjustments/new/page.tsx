"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Plus, Trash2, AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Link from "next/link";

interface LineItem {
  productId: string;
  locationId: string;
  countedQuantity: number;
}

export default function NewAdjustmentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [lines, setLines] = useState<LineItem[]>([{ productId: "", locationId: "", countedQuantity: 0 }]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      const [resProd, resLoc] = await Promise.all([
        fetch("/api/products"),
        fetch("/api/locations"),
      ]);
      const dataProd = await resProd.json();
      const dataLoc = await resLoc.json();
      setProducts(dataProd.data || []);
      setLocations(dataLoc.data || []);
    }
    fetchData();
  }, []);

  const addLine = () => setLines([...lines, { productId: "", locationId: "", countedQuantity: 0 }]);
  const removeLine = (index: number) => setLines(lines.filter((_, i) => i !== index));
  const updateLine = (index: number, field: keyof LineItem, value: any) => {
    const newLines = [...lines];
    newLines[index] = { ...newLines[index], [field]: value };
    setLines(newLines);
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const payload = {
      notes: formData.get("notes"),
      lines: lines.map(l => ({ ...l, countedQuantity: Number(l.countedQuantity) })),
    };

    try {
      const res = await fetch("/api/operations/adjustments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Failed to process adjustment");

      router.push("/operations/adjustments");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/operations/adjustments">
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800">Inventory Adjustment</h1>
          <p className="text-sm text-muted-foreground">Record physical counts to correct system inventory.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="border-slate-200 shadow-lg">
          <CardHeader className="bg-slate-50/50">
            <CardTitle className="text-lg text-slate-800">Audit Metadata</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold">Reason / Notes *</label>
              <Input name="notes" required placeholder="e.g. Annual physical count, found damaged items" className="border-slate-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-lg overflow-hidden">
          <CardHeader className="bg-slate-50/50 flex flex-row items-center justify-between">
            <CardTitle className="text-lg text-slate-800">Physical Count Lines</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={addLine} className="border-slate-300 text-slate-700 hover:bg-slate-50">
              <Plus className="w-4 h-4 mr-2" /> Add Selection
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b">
                  <tr>
                    <th className="px-4 py-2 text-left font-semibold">Product *</th>
                    <th className="px-4 py-2 text-left font-semibold">Location *</th>
                    <th className="px-4 py-2 text-left font-semibold w-32">Counted Qty *</th>
                    <th className="px-4 py-2 text-right"></th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {lines.map((line, index) => (
                    <tr key={index} className="group hover:bg-slate-50/30 transition-colors">
                      <td className="px-4 py-3">
                        <Select value={line.productId} onValueChange={(val) => updateLine(index, "productId", val)}>
                          <SelectTrigger className="w-full border-none shadow-none focus:ring-0">
                            <SelectValue placeholder="Select product..." />
                          </SelectTrigger>
                          <SelectContent>
                            {products.map(p => (
                              <SelectItem key={p.id} value={p.id}>{p.name} ({p.sku})</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="px-4 py-3">
                        <Select value={line.locationId} onValueChange={(val) => updateLine(index, "locationId", val)}>
                          <SelectTrigger className="w-full border-none shadow-none focus:ring-0">
                            <SelectValue placeholder="Select location..." />
                          </SelectTrigger>
                          <SelectContent>
                            {locations.map(l => (
                              <SelectItem key={l.id} value={l.id}>{l.name} ({l.warehouse.name})</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="px-4 py-3">
                        <Input 
                          type="number" 
                          min={0} 
                          value={line.countedQuantity} 
                          onChange={(e) => updateLine(index, "countedQuantity", e.target.value)} 
                          className="border-none shadow-none focus:ring-0 text-center font-bold"
                        />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => removeLine(index)}
                          disabled={lines.length === 1}
                          className="text-muted-foreground hover:text-red-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Adjustment Failed</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex flex-col md:flex-row gap-4 justify-end">
          <Button type="button" variant="outline" className="w-full md:w-32" asChild>
            <Link href="/operations/adjustments">Cancel</Link>
          </Button>
          <Button type="submit" className="w-full md:w-48 bg-slate-800 hover:bg-slate-900 shadow-xl shadow-slate-200" disabled={loading}>
            {loading ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Reconciling...</>
            ) : (
              <><RefreshCw className="w-4 h-4 mr-2" /> Validate Audit</>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
