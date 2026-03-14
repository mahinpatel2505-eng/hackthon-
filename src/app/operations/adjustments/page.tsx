import { Suspense } from "react";
import { Plus, ClipboardCheck, ArrowRight, MapPin, Gauge } from "lucide-react";
import { getAdjustments } from "@/lib/queries";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";
import { format } from "date-fns";

export const metadata = {
  title: "Adjustments | CoreInventory",
};

async function AdjustmentList() {
  const adjustments = await getAdjustments();

  if (adjustments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed rounded-xl bg-muted/30">
        <ClipboardCheck className="w-12 h-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold">No adjustments found</h3>
        <p className="text-muted-foreground max-w-sm">
          No inventory physical counts or adjustments have been recorded yet.
        </p>
        <Button asChild className="mt-4">
          <Link href="/operations/adjustments/new">
            <Plus className="w-4 h-4 mr-2" /> New Adjustment
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead>Reference</TableHead>
            <TableHead>Adjusted Items</TableHead>
            <TableHead>Qty Changes</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {adjustments.map((adj: any) => (
            <TableRow key={adj.id}>
              <TableCell className="font-mono text-xs font-semibold">{adj.reference}</TableCell>
              <TableCell>
                <div className="text-xs space-y-0.5">
                  {adj.lines.slice(0, 2).map((line: any) => (
                    <div key={line.id} className="flex gap-2 items-center">
                      <span className="font-medium">{line.product.sku}</span>
                      <span className="text-muted-foreground">@ {line.sourceLocation?.name || "N/A"}</span>
                    </div>
                  ))}
                  {adj.lines.length > 2 && (
                    <p className="text-[10px] text-muted-foreground">+{adj.lines.length - 2} more items</p>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1 font-medium">
                  <Gauge className="w-3.5 h-3.5 text-muted-foreground" />
                  {adj.lines.length} lines adjusted
                </div>
              </TableCell>
              <TableCell className="text-xs text-muted-foreground">
                {format(new Date(adj.createdAt), "MMM d, HH:mm")}
              </TableCell>
              <TableCell>
                <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-100">
                  {adj.status}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`/operations/adjustments/${adj.id}`}>View</Link>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export default function AdjustmentsPage() {
  return (
    <div className="p-4 md:p-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-800">Inventory Adjustments</h1>
          <p className="text-muted-foreground">Perform physical counts and correct system stock levels.</p>
        </div>
        <Button asChild className="bg-slate-800 hover:bg-slate-900 shadow-lg shadow-slate-200">
          <Link href="/operations/adjustments/new">
            <Plus className="w-4 h-4 mr-2" /> New Adjustment
          </Link>
        </Button>
      </div>

      <Suspense fallback={<Skeleton className="h-48 w-full rounded-xl" />}>
        <AdjustmentList />
      </Suspense>
    </div>
  );
}
