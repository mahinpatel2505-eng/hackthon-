import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  ArrowLeftRight,
  ClipboardCheck,
} from "lucide-react";

interface OperationLine {
  productName: string;
  productSku: string;
  category: string;
  quantity: number;
  sourceLocation: string | null;
  destLocation: string | null;
}

interface Operation {
  id: string;
  reference: string;
  type: string;
  status: string;
  supplier: string | null;
  customer: string | null;
  userName: string;
  createdAt: string;
  lineCount: number;
  totalQuantity: number;
  lines: OperationLine[];
}

const typeConfig: Record<string, { label: string; icon: typeof ArrowDownToLine; className: string }> = {
  RECEIPT: {
    label: "Receipt",
    icon: ArrowDownToLine,
    className: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20",
  },
  DELIVERY: {
    label: "Delivery",
    icon: ArrowUpFromLine,
    className: "bg-sky-500/10 text-sky-700 border-sky-500/20",
  },
  INTERNAL_TRANSFER: {
    label: "Transfer",
    icon: ArrowLeftRight,
    className: "bg-violet-500/10 text-violet-700 border-violet-500/20",
  },
  ADJUSTMENT: {
    label: "Adjustment",
    icon: ClipboardCheck,
    className: "bg-amber-500/10 text-amber-700 border-amber-500/20",
  },
};

const statusConfig: Record<string, string> = {
  DRAFT: "bg-zinc-500/10 text-zinc-600 border-zinc-500/20",
  VALIDATED: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20",
  CANCELLED: "bg-red-500/10 text-red-700 border-red-500/20",
};

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

interface OperationsTableProps {
  operations: Operation[];
}

export function OperationsTable({ operations }: OperationsTableProps) {
  if (operations.length === 0) {
    return (
      <div className="rounded-xl border bg-card p-12 text-center shadow-sm">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
          <ClipboardCheck className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold">No Operations Found</h3>
        <p className="text-sm text-muted-foreground mt-1">
          No inventory movements match your current filters. Try adjusting your filters or create a new operation.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50 hover:bg-muted/50">
            <TableHead className="font-semibold">Reference</TableHead>
            <TableHead className="font-semibold">Type</TableHead>
            <TableHead className="font-semibold">Status</TableHead>
            <TableHead className="font-semibold">Products</TableHead>
            <TableHead className="font-semibold">Total Qty</TableHead>
            <TableHead className="font-semibold">Party</TableHead>
            <TableHead className="font-semibold">Operated By</TableHead>
            <TableHead className="font-semibold text-right">Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {operations.map((op) => {
            const config = typeConfig[op.type] ?? typeConfig.RECEIPT;
            const TypeIcon = config.icon;

            return (
              <TableRow
                key={op.id}
                className="group transition-colors hover:bg-muted/30"
                id={`operation-row-${op.id}`}
              >
                <TableCell className="font-mono text-xs font-medium">
                  {op.reference.substring(0, 12)}...
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={`${config.className} gap-1`}>
                    <TypeIcon className="h-3 w-3" />
                    {config.label}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={statusConfig[op.status] ?? statusConfig.DRAFT}
                  >
                    {op.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span className="text-sm">
                    {op.lines.length > 0
                      ? op.lines[0].productName
                      : "—"}
                    {op.lineCount > 1 && (
                      <span className="text-muted-foreground ml-1">
                        +{op.lineCount - 1} more
                      </span>
                    )}
                  </span>
                </TableCell>
                <TableCell className="font-semibold tabular-nums">
                  {op.totalQuantity.toLocaleString()}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {op.supplier ?? op.customer ?? "Internal"}
                </TableCell>
                <TableCell className="text-sm">{op.userName}</TableCell>
                <TableCell className="text-right text-sm text-muted-foreground">
                  {formatDate(op.createdAt)}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
