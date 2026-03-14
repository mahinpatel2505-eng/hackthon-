import {
  Package,
  AlertTriangle,
  XCircle,
  ArrowDownToLine,
  ArrowUpFromLine,
  ArrowLeftRight,
  type LucideIcon,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface KPICardProps {
  title: string;
  value: number;
  description: string;
  icon: LucideIcon;
  variant: "default" | "warning" | "danger" | "info";
}

const variantStyles = {
  default: "from-blue-500/10 to-blue-600/5 border-blue-500/20 text-blue-600",
  warning: "from-amber-500/10 to-amber-600/5 border-amber-500/20 text-amber-600",
  danger: "from-red-500/10 to-red-600/5 border-red-500/20 text-red-600",
  info: "from-violet-500/10 to-violet-600/5 border-violet-500/20 text-violet-600",
};

const iconStyles = {
  default: "bg-blue-500/10 text-blue-600",
  warning: "bg-amber-500/10 text-amber-600",
  danger: "bg-red-500/10 text-red-600",
  info: "bg-violet-500/10 text-violet-600",
};

function KPICard({ title, value, description, icon: Icon, variant }: KPICardProps) {
  return (
    <Card
      className={`bg-gradient-to-br ${variantStyles[variant]} border shadow-sm hover:shadow-md transition-shadow duration-300`}
    >
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className={`rounded-lg p-2 ${iconStyles[variant]}`}>
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold tracking-tight">{value.toLocaleString()}</div>
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      </CardContent>
    </Card>
  );
}

interface KPIGridProps {
  kpis: {
    totalProducts: number;
    lowStockItems: number;
    outOfStockItems: number;
    pendingReceipts: number;
    pendingDeliveries: number;
    pendingTransfers: number;
  };
}

export function KPIGrid({ kpis }: KPIGridProps) {
  const cards: KPICardProps[] = [
    {
      title: "Total Products",
      value: kpis.totalProducts,
      description: "Active products in catalog",
      icon: Package,
      variant: "default",
    },
    {
      title: "Low Stock Items",
      value: kpis.lowStockItems,
      description: "Below reorder level",
      icon: AlertTriangle,
      variant: "warning",
    },
    {
      title: "Out of Stock",
      value: kpis.outOfStockItems,
      description: "Zero stock across all locations",
      icon: XCircle,
      variant: "danger",
    },
    {
      title: "Pending Receipts",
      value: kpis.pendingReceipts,
      description: "Awaiting validation",
      icon: ArrowDownToLine,
      variant: "info",
    },
    {
      title: "Pending Deliveries",
      value: kpis.pendingDeliveries,
      description: "Awaiting dispatch",
      icon: ArrowUpFromLine,
      variant: "warning",
    },
    {
      title: "Transfers Scheduled",
      value: kpis.pendingTransfers,
      description: "Internal movements pending",
      icon: ArrowLeftRight,
      variant: "default",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {cards.map((card) => (
        <KPICard key={card.title} {...card} />
      ))}
    </div>
  );
}
