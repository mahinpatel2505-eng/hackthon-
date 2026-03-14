"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Loader2, Plus, Trash2, Package, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Link from "next/link";

interface LineItem {
  productId: string;
  quantity: number;
  destLocationId: string;
}

export default function NewReceiptPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [lines, setLines] = useState<LineItem[]>([{ productId: "", quantity: 1, destLocationId: "" }]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      const [resProd, resLoc] = await Promise.all([
        fetch("/api/products"),
        fetch("/api/locations"), // Need to create this API or use a common one
      ]);
      const dataProd = await resProd.json();
      const dataLoc = await resLoc.json();
      setProducts(dataProd.data || []);
      setLocations(dataLoc.data || []);
    }
    fetchData();
  }, []);

  const addLine = () => setLines([...lines, { productId: "", quantity: 1, destLocationId: "" }]);
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
      supplier: formData.get("supplier"),
      notes: formData.get("notes"),
      lines: lines.map(l => ({ ...l, quantity: Number(l.quantity) })),
    };

    try {
      const res = await fetch("/api/operations/receipts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Failed to save receipt");

      router.push("/operations/receipts");
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
          <Link href="/operations/receipts">
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Create Stock Receipt</h1>
          <p className="text-sm text-muted-foreground">Receive incoming inventory from suppliers.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="border-primary/10 shadow-lg">
          <CardHeader className="bg-muted/30">
            <CardTitle className="text-lg">General Info</CardTitle>
          </CardHeader>
          <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold">Supplier Name *</label>
              <Input name="supplier" required placeholder="e.g. Acme Corp" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold">Notes</label>
              <Input name="notes" placeholder="Optional reference or comment" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/10 shadow-lg overflow-hidden">
          <CardHeader className="bg-muted/30 flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Product Lines</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={addLine}>
              <Plus className="w-4 h-4 mr-2" /> Add Item
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/20 border-b">
                  <tr>
                    <th className="px-4 py-2 text-left font-semibold">Product *</th>
                    <th className="px-4 py-2 text-left font-semibold">Location *</th>
                    <th className="px-4 py-2 text-left font-semibold w-24">Qty *</th>
                    <th className="px-4 py-2 text-right"></th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {lines.map((line, index) => (
                    <tr key={index} className="group hover:bg-muted/5 transition-colors">
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
                        <Select value={line.destLocationId} onValueChange={(val) => updateLine(index, "destLocationId", val)}>
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
                          min={1} 
                          value={line.quantity} 
                          onChange={(e) => updateLine(index, "quantity", e.target.value)} 
                          className="border-none shadow-none focus:ring-0 text-center"
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

        <div className="flex flex-col md:flex-row gap-4 justify-end">
          {error && <p className="text-sm text-red-600 font-medium py-2">⚠️ {error}</p>}
          <Button type="button" variant="outline" className="w-full md:w-32" asChild>
            <Link href="/operations/receipts">Cancel</Link>
          </Button>
          <Button type="submit" className="w-full md:w-48 shadow-xl shadow-primary/20" disabled={loading}>
            {loading ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing...</>
            ) : (
              <><Save className="w-4 h-4 mr-2" /> Validate Receipt</>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
