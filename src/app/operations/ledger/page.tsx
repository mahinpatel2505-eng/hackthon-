import { Suspense } from "react";
import { History, ArrowUpRight, ArrowDownLeft, ArrowRightLeft, ShieldCheck, User } from "lucide-react";
import { getLedgerEntries } from "@/lib/queries";
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
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "Move History | CoreInventory",
};

async function LedgerList() {
  const entries = await getLedgerEntries();

  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed rounded-xl bg-muted/30">
        <History className="w-12 h-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold">No movement history</h3>
        <p className="text-muted-foreground max-w-sm">
          No stock movements have been recorded yet. Activity will appear here as stock is received, shipped, or moved.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-card overflow-hidden shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="w-[180px]">Timestamp</TableHead>
            <TableHead>Product</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Location</TableHead>
            <TableHead className="text-right">Quantity</TableHead>
            <TableHead>Reference</TableHead>
            <TableHead>User</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {entries.map((entry: any) => (
            <TableRow key={entry.id} className="group hover:bg-muted/5">
              <TableCell className="text-xs text-muted-foreground font-medium">
                {format(new Date(entry.createdAt), "MMM d, HH:mm:ss")}
              </TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <span className="font-semibold text-sm">{entry.product.sku}</span>
                  <span className="text-[10px] text-muted-foreground truncate max-w-[150px]">{entry.product.name}</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1.5">
                  {entry.movement === "IN" ? (
                    <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-50 px-1.5 py-0 h-5">
                      <ArrowDownLeft className="w-3 h-3 mr-1" /> IN
                    </Badge>
                  ) : (
                    <Badge className="bg-rose-50 text-rose-700 border-rose-100 hover:bg-rose-50 px-1.5 py-0 h-5">
                      <ArrowUpRight className="w-3 h-3 mr-1" /> OUT
                    </Badge>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-col text-xs">
                  <span className="font-medium">{entry.location.name}</span>
                  <span className="text-[10px] text-muted-foreground">{entry.location.warehouse.name}</span>
                </div>
              </TableCell>
              <TableCell className={cn(
                "text-right font-mono font-bold",
                entry.movement === "IN" ? "text-emerald-600" : "text-rose-600"
              )}>
                {entry.movement === "IN" ? "+" : "-"}{entry.quantity}
              </TableCell>
              <TableCell className="font-mono text-[10px] text-muted-foreground uppercase">
                {entry.reference}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <User className="w-3 h-3 text-slate-400" />
                  {entry.user?.name || "System"}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export default function LedgerPage() {
  return (
    <div className="p-4 md:p-8 space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Move History</h1>
            <ShieldCheck className="w-5 h-5 text-emerald-600 drop-shadow-sm" />
          </div>
          <p className="text-muted-foreground">The immutable ledger recording every inventory transaction for compliance and auditing.</p>
        </div>
        <div className="bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2 flex items-center gap-3">
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">Live Audit Trail Active</span>
        </div>
      </div>

      <Suspense fallback={<Skeleton className="h-96 w-full rounded-xl" />}>
        <LedgerList />
      </Suspense>
    </div>
  );
}
