import { Suspense } from "react";
import { Plus, Package, Truck, ArrowLeft, ArrowRight } from "lucide-react";
import { getDeliveries } from "@/lib/queries";
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
import { VerificationBadge } from "@/components/operations/VerificationBadge";

export const metadata = {
  title: "Deliveries | CoreInventory",
};

async function DeliveryList() {
  const deliveries = await getDeliveries();

  if (deliveries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed rounded-xl bg-muted/30">
        <Truck className="w-12 h-12 text-muted-foreground mb-4 rotate-180" />
        <h3 className="text-lg font-semibold">No deliveries found</h3>
        <p className="text-muted-foreground max-w-sm">
          No outgoing stock has been processed yet.
        </p>
        <Button asChild className="mt-4">
          <Link href="/operations/deliveries/new">
            <Plus className="w-4 h-4 mr-2" /> New Delivery
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
            <TableHead>Customer</TableHead>
            <TableHead>Items</TableHead>
            <TableHead>Total Qty</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {deliveries.map((delivery: any) => (
            <TableRow key={delivery.id}>
              <TableCell className="font-mono text-xs font-semibold">{delivery.reference}</TableCell>
              <TableCell className="font-medium">{delivery.customer}</TableCell>
              <TableCell>
                <div className="text-xs space-y-0.5">
                  {delivery.lines.slice(0, 2).map((line: any) => (
                    <div key={line.id} className="flex gap-1 items-center">
                      <span className="text-muted-foreground">{line.product.sku}</span>
                      <ArrowRight className="w-2.5 h-2.5 text-muted-foreground" />
                      <span>{line.sourceLocation?.name || "N/A"}</span>
                    </div>
                  ))}
                  {delivery.lines.length > 2 && (
                    <p className="text-[10px] text-muted-foreground">+{delivery.lines.length - 2} more items</p>
                  )}
                </div>
              </TableCell>
              <TableCell>{delivery.lines.reduce((sum: number, l: any) => sum + l.quantity, 0)}</TableCell>
              <TableCell className="text-xs text-muted-foreground">
                {format(new Date(delivery.createdAt), "MMM d, HH:mm")}
              </TableCell>
              <TableCell>
                <VerificationBadge 
                  status={delivery.status} 
                  isVerified={delivery.verified} 
                />
              </TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`/operations/deliveries/${delivery.id}`}>View</Link>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export default function DeliveriesPage() {
  return (
    <div className="p-4 md:p-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-blue-900">Delivery Orders</h1>
          <p className="text-muted-foreground">Manage outgoing shipments and customer dispatch.</p>
        </div>
        <Button asChild className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200">
          <Link href="/operations/deliveries/new">
            <Plus className="w-4 h-4 mr-2" /> New Delivery
          </Link>
        </Button>
      </div>

      <Suspense fallback={<Skeleton className="h-48 w-full rounded-xl" />}>
        <DeliveryList />
      </Suspense>
    </div>
  );
}
