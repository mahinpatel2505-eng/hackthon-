"use client";

import { AlertTriangle, Package, ArrowRight, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface LowStockItem {
  id: string;
  name: string;
  sku: string;
  reorderLevel: number;
  currentStock: number;
  criticality: number;
}

export function LowStockAlerts({ items }: { items: LowStockItem[] }) {
  if (items.length === 0) return null;

  return (
    <Card className="border-amber-100 shadow-lg overflow-hidden">
      <CardHeader className="bg-amber-50/50 flex flex-row items-center justify-between pb-3">
        <div className="flex items-center gap-2 text-amber-900">
          <AlertTriangle className="h-5 w-5 text-amber-600" />
          <CardTitle className="text-lg">Reorder Alerts</CardTitle>
        </div>
        <Badge variant="outline" className="bg-amber-100/50 text-amber-700 border-amber-200">
          {items.length} Items Low
        </Badge>
      </CardHeader>
      <CardContent className="px-0 py-0">
        <div className="divide-y divide-amber-100/50">
          {items.map((item) => (
            <Link
              key={item.id}
              href={`/products/${item.id}`}
              className="flex items-center gap-4 px-6 py-4 hover:bg-amber-50/30 transition-colors group"
            >
              <div className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                item.criticality === 0 ? "bg-red-100 text-red-600" : "bg-amber-100 text-amber-600"
              )}>
                {item.criticality === 0 ? <AlertCircle className="h-5 w-5" /> : <Package className="h-5 w-5" />}
              </div>
              
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-slate-900 truncate">{item.name}</h4>
                  {item.criticality === 0 && (
                    <Badge variant="destructive" className="h-5 px-1.5 text-[10px] uppercase font-black animate-pulse">
                      Out of Stock
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-slate-500 font-mono mt-0.5">{item.sku}</p>
              </div>

              <div className="text-right flex flex-col items-end gap-1">
                <div className="text-sm font-black text-slate-900">
                  {item.currentStock} <span className="text-[10px] text-slate-400 font-normal">/ {item.reorderLevel} units</span>
                </div>
                <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className={cn(
                      "h-full transition-all duration-1000",
                      item.criticality === 0 ? "bg-red-500" : "bg-amber-500"
                    )}
                    style={{ width: `${Math.min(100, item.criticality * 100)}%` }}
                  />
                </div>
              </div>

              <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-amber-600 transition-colors" />
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
