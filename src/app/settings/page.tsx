"use client";

import { useState, useEffect } from "react";
import { Building2, MapPin, Plus, Loader2, Warehouse as WarehouseIcon, Trash2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";

export default function SettingsPage() {
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form States
  const [whName, setWhName] = useState("");
  const [whAddress, setWhAddress] = useState("");
  const [locName, setLocName] = useState("");
  const [locType, setLocType] = useState("RACK");
  const [locWarehouseId, setLocWarehouseId] = useState("");
  
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [whRes, locRes] = await Promise.all([
        fetch("/api/warehouses"),
        fetch("/api/locations")
      ]);
      const whData = await whRes.json();
      const locData = await locRes.json();
      setWarehouses(whData.data || []);
      setLocations(locData.data || []);
    } catch (err) {
      console.error("Failed to fetch settings data", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateWarehouse = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/warehouses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: whName, address: whAddress })
      });
      if (!res.ok) throw new Error("Failed to create warehouse");
      setWhName("");
      setWhAddress("");
      fetchData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/locations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          name: locName, 
          type: locType, 
          warehouseId: locWarehouseId 
        })
      });
      if (!res.ok) throw new Error("Failed to create location");
      setLocName("");
      fetchData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteWarehouse = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete warehouse "${name}"?`)) return;
    
    try {
      setError("");
      const res = await fetch(`/api/warehouses/${id}`, { method: "DELETE" });
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Failed to delete warehouse");
      }
      
      fetchData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDeleteLocation = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete location "${name}"?`)) return;
    
    try {
      setError("");
      const res = await fetch(`/api/locations/${id}`, { method: "DELETE" });
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Failed to delete location");
      }
      
      fetchData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-6xl mx-auto animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">System Settings</h1>
        <p className="text-muted-foreground">Configure your warehouses, locations, and organizational structure.</p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Warehouses Section */}
        <section className="space-y-6">
          <Card className="shadow-lg border-primary/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                Manage Warehouses
              </CardTitle>
              <CardDescription>Facilities where your stock is stored.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateWarehouse} className="space-y-4 mb-6">
                <div className="grid gap-2">
                  <Input 
                    placeholder="Warehouse Name (e.g. Central Hub)" 
                    value={whName}
                    onChange={(e) => setWhName(e.target.value)}
                    required
                  />
                  <Input 
                    placeholder="Physical Address" 
                    value={whAddress}
                    onChange={(e) => setWhAddress(e.target.value)}
                  />
                </div>
                <Button type="submit" disabled={submitting} className="w-full">
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                  Add Warehouse
                </Button>
              </form>

              <Separator className="my-4" />

              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground">Active Warehouses</h3>
                {warehouses.length === 0 ? (
                  <p className="text-xs text-center py-4 bg-muted/30 rounded-lg text-muted-foreground italic">No warehouses defined.</p>
                ) : (
                  warehouses.map((wh) => (
                    <div key={wh.id} className="flex items-center justify-between p-3 rounded-xl border bg-card hover:bg-muted/30 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/5 rounded-lg">
                          <WarehouseIcon className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-bold">{wh.name}</p>
                          <p className="text-[10px] text-muted-foreground">{wh._count?.locations || 0} locations defined</p>
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => handleDeleteWarehouse(wh.id, wh.name)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Locations Section */}
        <section className="space-y-6">
          <Card className="shadow-lg border-emerald-500/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-emerald-600" />
                Manage Locations
              </CardTitle>
              <CardDescription>Racks, Bins, and Staging Areas within Warehouses.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateLocation} className="space-y-4 mb-6">
                <div className="grid gap-2">
                  <Select value={locWarehouseId} onValueChange={(val) => setLocWarehouseId(val || "")} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Warehouse" />
                    </SelectTrigger>
                    <SelectContent>
                      {warehouses.map((wh) => (
                        <SelectItem key={wh.id} value={wh.id}>{wh.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="flex gap-2">
                    <Input 
                      placeholder="Location Name (e.g. Rack A1)" 
                      className="flex-1"
                      value={locName}
                      onChange={(e) => setLocName(e.target.value)}
                      required
                    />
                    <Select value={locType} onValueChange={(val) => setLocType(val || "RACK")}>
                      <SelectTrigger className="w-[120px]">
                        <SelectValue placeholder="Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="RACK">Rack</SelectItem>
                        <SelectItem value="BIN">Bin</SelectItem>
                        <SelectItem value="STAGING">Staging</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button type="submit" disabled={submitting || !locWarehouseId} className="w-full bg-emerald-600 hover:bg-emerald-700">
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                  Add Location
                </Button>
              </form>

              <Separator className="my-4" />

              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground">Recent Locations</h3>
                {locations.length === 0 ? (
                  <p className="text-xs text-center py-4 bg-muted/30 rounded-lg text-muted-foreground italic">No locations defined.</p>
                ) : (
                  locations.slice(0, 10).map((loc) => (
                    <div key={loc.id} className="flex items-center justify-between p-3 rounded-xl border bg-card hover:bg-muted/30 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                          <MapPin className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-sm font-bold">{loc.name}</p>
                          <p className="text-[10px] text-muted-foreground">{loc.warehouse?.name} • {loc.type}</p>
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => handleDeleteLocation(loc.id, loc.name)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
