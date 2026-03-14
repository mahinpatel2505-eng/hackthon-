"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Loader2, Plus, Trash2, MapPin, AlertCircle } from "lucide-react";
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
}

export default function NewDeliveryPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [lines, setLines] = useState<LineItem[]>([{ productId: "", quantity: 1, sourceLocationId: "" }]);
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

  const addLine = () => setLines([...lines, { productId: "", quantity: 1, sourceLocationId: "" }]);
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
      customer: formData.get("customer"),
      notes: formData.get("notes"),
      lines: lines.map(l => ({ ...l, quantity: Number(l.quantity) })),
    };

    try {
      const res = await fetch("/api/operations/deliveries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Failed to save delivery order");

      router.push("/operations/deliveries");
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
          <Link href="/operations/deliveries">
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-blue-900">New Delivery Order</h1>
          <p className="text-sm text-muted-foreground">Ship inventory to customers and update stock levels.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="border-blue-100 shadow-lg">
          <CardHeader className="bg-blue-50/50">
            <CardTitle className="text-lg text-blue-900">Shipment Details</CardTitle>
          </CardHeader>
          <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold">Customer / Destination *</label>
              <Input name="customer" required placeholder="e.g. Acme Logistics" className="border-blue-100" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold">Notes</label>
              <Input name="notes" placeholder="Order # or delivery instructions" className="border-blue-100" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-100 shadow-lg overflow-hidden">
          <CardHeader className="bg-blue-50/50 flex flex-row items-center justify-between">
            <CardTitle className="text-lg text-blue-900">Outgoing Items</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={addLine} className="border-blue-200 text-blue-700 hover:bg-blue-50">
              <Plus className="w-4 h-4 mr-2" /> Add Item
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-blue-50/30 border-b">
                  <tr>
                    <th className="px-4 py-2 text-left font-semibold">Product *</th>
                    <th className="px-4 py-2 text-left font-semibold">Source Location *</th>
                    <th className="px-4 py-2 text-left font-semibold w-24">Qty *</th>
                    <th className="px-4 py-2 text-right"></th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {lines.map((line, index) => (
                    <tr key={index} className="group hover:bg-blue-50/10 transition-colors">
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
                        <Select value={line.sourceLocationId} onValueChange={(val) => updateLine(index, "sourceLocationId", val)}>
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

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Operation Failed</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex flex-col md:flex-row gap-4 justify-end">
          <Button type="button" variant="outline" className="w-full md:w-32" asChild>
            <Link href="/operations/deliveries">Cancel</Link>
          </Button>
          <Button type="submit" className="w-full md:w-48 bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-200" disabled={loading}>
            {loading ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing...</>
            ) : (
              <><Save className="w-4 h-4 mr-2" /> Dispatch Order</>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
