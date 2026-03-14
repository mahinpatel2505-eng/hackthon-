import { Suspense } from "react";
import { Plus, Replace, ArrowRight, MapPin } from "lucide-react";
import { getTransfers } from "@/lib/queries";
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
  title: "Transfers | CoreInventory",
};

async function TransferList() {
  const transfers = await getTransfers();

  if (transfers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed rounded-xl bg-muted/30">
        <Replace className="w-12 h-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold">No transfers found</h3>
        <p className="text-muted-foreground max-w-sm">
          No internal stock movements have been recorded yet.
        </p>
        <Button asChild className="mt-4">
          <Link href="/operations/transfers/new">
            <Plus className="w-4 h-4 mr-2" /> New Transfer
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
            <TableHead>Movement Overview</TableHead>
            <TableHead>Items</TableHead>
            <TableHead className="text-center">Total Qty</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transfers.map((transfer: any) => (
            <TableRow key={transfer.id}>
              <TableCell className="font-mono text-xs font-semibold">{transfer.reference}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2 text-xs">
                  <Badge variant="outline" className="flex gap-1 items-center px-1.5 py-0 h-5 bg-amber-50 text-amber-700 border-amber-100">
                    <MapPin className="w-2.5 h-2.5" />
                    {transfer.lines[0]?.sourceLocation?.name || "Multiple"}
                  </Badge>
                  <ArrowRight className="w-3 h-3 text-muted-foreground" />
                  <Badge variant="outline" className="flex gap-1 items-center px-1.5 py-0 h-5 bg-emerald-50 text-emerald-700 border-emerald-100">
                    <MapPin className="w-2.5 h-2.5" />
                    {transfer.lines[0]?.destLocation?.name || "Multiple"}
                  </Badge>
                </div>
              </TableCell>
              <TableCell>
                <div className="text-xs space-y-0.5">
                  {transfer.lines.slice(0, 2).map((line: any) => (
                    <div key={line.id} className="flex gap-1 items-center">
                      <span className="text-muted-foreground">{line.product.sku}</span>
                      <span className="font-medium">x{line.quantity}</span>
                    </div>
                  ))}
                  {transfer.lines.length > 2 && (
                    <p className="text-[10px] text-muted-foreground">+{transfer.lines.length - 2} more items</p>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-center font-medium">
                {transfer.lines.reduce((sum: number, l: any) => sum + l.quantity, 0)}
              </TableCell>
              <TableCell className="text-xs text-muted-foreground">
                {format(new Date(transfer.createdAt), "MMM d, HH:mm")}
              </TableCell>
              <TableCell>
                <Badge variant="secondary" className="bg-purple-50 text-purple-700 border-purple-100 italic">
                  {transfer.status}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`/operations/transfers/${transfer.id}`}>View</Link>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export default function TransfersPage() {
  return (
    <div className="p-4 md:p-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-purple-900">Internal Transfers</h1>
          <p className="text-muted-foreground">Move inventory between shelves, racks, and staging areas.</p>
        </div>
        <Button asChild className="bg-purple-600 hover:bg-purple-700 shadow-lg shadow-purple-200">
          <Link href="/operations/transfers/new">
            <Plus className="w-4 h-4 mr-2" /> New Transfer
          </Link>
        </Button>
      </div>

      <Suspense fallback={<Skeleton className="h-48 w-full rounded-xl" />}>
        <TransferList />
      </Suspense>
    </div>
  );
}
