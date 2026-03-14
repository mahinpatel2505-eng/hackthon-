import { Suspense } from "react";
import { Plus, Package, Truck, ArrowRight } from "lucide-react";
import { getReceipts } from "@/lib/queries";
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
  title: "Receipts | CoreInventory",
};

async function ReceiptList() {
  const receipts = await getReceipts();

  if (receipts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed rounded-xl bg-muted/30">
        <Truck className="w-12 h-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold">No receipts found</h3>
        <p className="text-muted-foreground max-w-sm">
          You haven&apos;t recorded any incoming stock yet. Start by creating a new receipt.
        </p>
        <Button asChild className="mt-4">
          <Link href="/operations/receipts/new">
            <Plus className="w-4 h-4 mr-2" /> New Receipt
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
            <TableHead>Supplier</TableHead>
            <TableHead>Items</TableHead>
            <TableHead>Total Qty</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {receipts.map((receipt: any) => (
            <TableRow key={receipt.id}>
              <TableCell className="font-mono text-xs font-semibold">{receipt.reference}</TableCell>
              <TableCell className="font-medium">{receipt.supplier}</TableCell>
              <TableCell>
                <div className="text-xs space-y-0.5">
                  {receipt.lines.slice(0, 2).map((line: any) => (
                    <div key={line.id} className="flex gap-1 items-center">
                      <span className="text-muted-foreground">{line.product.sku}</span>
                      <ArrowRight className="w-2.5 h-2.5 text-muted-foreground" />
                      <span>{line.destLocation.name}</span>
                    </div>
                  ))}
                  {receipt.lines.length > 2 && (
                    <p className="text-[10px] text-muted-foreground">+{receipt.lines.length - 2} more items</p>
                  )}
                </div>
              </TableCell>
              <TableCell>{receipt.lines.reduce((sum: number, l: any) => sum + l.quantity, 0)}</TableCell>
              <TableCell className="text-xs text-muted-foreground">
                {format(new Date(receipt.createdAt), "MMM d, HH:mm")}
              </TableCell>
              <TableCell>
                <Badge variant={receipt.status === "VALIDATED" ? "default" : "secondary"}>
                  {receipt.status}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`/operations/receipts/${receipt.id}`}>View</Link>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export default function ReceiptsPage() {
  return (
    <div className="p-4 md:p-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inventory Receipts</h1>
          <p className="text-muted-foreground">Manage incoming stock and supplier deliveries.</p>
        </div>
        <Button asChild className="bg-primary shadow-lg shadow-primary/20">
          <Link href="/operations/receipts/new">
            <Plus className="w-4 h-4 mr-2" /> New Receipt
          </Link>
        </Button>
      </div>

      <Suspense fallback={<Skeleton className="h-48 w-full rounded-xl" />}>
        <ReceiptList />
      </Suspense>
    </div>
  );
}
