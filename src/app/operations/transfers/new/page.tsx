"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Loader2, Plus, Trash2, MapPin, AlertCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Link from "next/link";

interface LineItem {
  productId: string;
  quantity: number;
  sourceLocationId: string;
  destLocationId: string;
}

export default function NewTransferPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [lines, setLines] = useState<LineItem[]>([{ productId: "", quantity: 1, sourceLocationId: "", destLocationId: "" }]);
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

  const addLine = () => setLines([...lines, { productId: "", quantity: 1, sourceLocationId: "", destLocationId: "" }]);
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

    const payload = {
      notes: new FormData(e.currentTarget).get("notes"),
      lines: lines.map(l => ({ ...l, quantity: Number(l.quantity) })),
    };

    try {
      const res = await fetch("/api/operations/transfers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Failed to save transfer");

      router.push("/operations/transfers");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/operations/transfers">
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-purple-900">New Internal Transfer</h1>
          <p className="text-sm text-muted-foreground">Move stock between different locations within the warehouse.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="border-purple-100 shadow-lg">
          <CardHeader className="bg-purple-50/30">
            <CardTitle className="text-lg text-purple-900">Transfer Header</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold">Notes / Purpose</label>
              <Input name="notes" placeholder="e.g. Replenishment from Bulk to Staging" className="border-purple-100" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-100 shadow-lg overflow-hidden">
          <CardHeader className="bg-purple-50/30 flex flex-row items-center justify-between">
            <CardTitle className="text-lg text-purple-900">Transfer Lines</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={addLine} className="border-purple-200 text-purple-700 hover:bg-purple-50">
              <Plus className="w-4 h-4 mr-2" /> Add Item
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-purple-50/20 border-b">
                  <tr>
                    <th className="px-4 py-2 text-left font-semibold">Product *</th>
                    <th className="px-4 py-2 text-left font-semibold">Source *</th>
                    <th className="px-4 py-2 text-center w-8"></th>
                    <th className="px-4 py-2 text-left font-semibold">Destination *</th>
                    <th className="px-4 py-2 text-left font-semibold w-24">Qty *</th>
                    <th className="px-4 py-2 text-right"></th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {lines.map((line, index) => (
                    <tr key={index} className="group hover:bg-purple-50/5 transition-colors">
                      <td className="px-4 py-3 min-w-[200px]">
                        <Select value={line.productId} onValueChange={(val) => updateLine(index, "productId", val)}>
                          <SelectTrigger className="w-full border-none shadow-none focus:ring-0">
                            <SelectValue placeholder="Product..." />
                          </SelectTrigger>
                          <SelectContent>
                            {products.map(p => (
                              <SelectItem key={p.id} value={p.id}>{p.name} ({p.sku})</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="px-4 py-3 min-w-[180px]">
                        <Select value={line.sourceLocationId} onValueChange={(val) => updateLine(index, "sourceLocationId", val)}>
                          <SelectTrigger className="w-full border-none shadow-none focus:ring-0 bg-amber-50/30">
                            <SelectValue placeholder="From..." />
                          </SelectTrigger>
                          <SelectContent>
                            {locations.map(l => (
                              <SelectItem key={l.id} value={l.id}>{l.name} ({l.warehouse.name})</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="px-2 py-3 text-center">
                        <ArrowRight className="w-4 h-4 text-purple-300" />
                      </td>
                      <td className="px-4 py-3 min-w-[180px]">
                        <Select value={line.destLocationId} onValueChange={(val) => updateLine(index, "destLocationId", val)}>
                          <SelectTrigger className="w-full border-none shadow-none focus:ring-0 bg-emerald-50/30">
                            <SelectValue placeholder="To..." />
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
                          min={1} 
                          value={line.quantity} 
                          onChange={(e) => updateLine(index, "quantity", e.target.value)} 
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
                          className="text-muted-foreground hover:text-red-600"
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
            <AlertTitle>Transfer Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex flex-col md:flex-row gap-4 justify-end">
          <Button type="button" variant="outline" className="w-full md:w-32" asChild>
            <Link href="/operations/transfers">Cancel</Link>
          </Button>
          <Button type="submit" className="w-full md:w-48 bg-purple-600 hover:bg-purple-700 shadow-xl shadow-purple-200" disabled={loading}>
            {loading ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Moving...</>
            ) : (
              <><Save className="w-4 h-4 mr-2" /> Execute Transfer</>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
