import { Suspense } from "react";
import { getDashboardKPIs, getRecentOperations, getFilterOptions, getLowStockDetails } from "@/lib/queries";
import { KPIGrid } from "@/components/dashboard/kpi-grid";
import { FilterBar } from "@/components/dashboard/filter-bar";
import { OperationsTable } from "@/components/dashboard/operations-table";
import { LowStockAlerts } from "@/components/dashboard/low-stock-alerts";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  LayoutDashboard,
  Database,
} from "lucide-react";

// ────────────────────────────────────────────────────────────
// Helper: Map URL search params to typed filter object
// ────────────────────────────────────────────────────────────

type DocType = "RECEIPT" | "DELIVERY" | "INTERNAL_TRANSFER" | "ADJUSTMENT";
type DocStatus = "DRAFT" | "VALIDATED" | "CANCELLED";

function parseFilters(searchParams: Record<string, string | string[] | undefined>) {
  const filters: {
    documentType?: DocType;
    status?: DocStatus;
    locationId?: string;
    category?: string;
  } = {};

  const type = typeof searchParams.type === "string" ? searchParams.type : undefined;
  const status = typeof searchParams.status === "string" ? searchParams.status : undefined;
  const location = typeof searchParams.location === "string" ? searchParams.location : undefined;
  const category = typeof searchParams.category === "string" ? searchParams.category : undefined;

  if (type && ["RECEIPT", "DELIVERY", "INTERNAL_TRANSFER", "ADJUSTMENT"].includes(type)) {
    filters.documentType = type as DocType;
  }
  if (status && ["DRAFT", "VALIDATED", "CANCELLED"].includes(status)) {
    filters.status = status as DocStatus;
  }
  if (location) filters.locationId = location;
  if (category) filters.category = category;

  return filters;
}

// ────────────────────────────────────────────────────────────
// Defaults when DB is not yet connected
// ────────────────────────────────────────────────────────────

const defaultKPIs = {
  totalProducts: 0,
  lowStockItems: 0,
  outOfStockItems: 0,
  pendingReceipts: 0,
  pendingDeliveries: 0,
  pendingTransfers: 0,
};

// ────────────────────────────────────────────────────────────
// Loading Skeletons
// ────────────────────────────────────────────────────────────

function KPISkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-[120px] rounded-xl" />
      ))}
    </div>
  );
}

function TableSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-[52px] rounded-lg" />
      ))}
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// Database Connection Banner
// ────────────────────────────────────────────────────────────

function NoDatabaseBanner() {
  return (
    <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 flex items-start gap-3">
      <Database className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
      <div>
        <h3 className="text-sm font-semibold text-amber-700">Database Not Connected</h3>
        <p className="text-xs text-amber-600 mt-1">
          The dashboard is showing default values. To connect your database:
        </p>
        <ol className="text-xs text-amber-600 mt-2 space-y-1 list-decimal list-inside">
          <li>Add your PostgreSQL URL to <code className="bg-amber-500/10 px-1 rounded">.env</code> → <code className="bg-amber-500/10 px-1 rounded">DATABASE_URL</code></li>
          <li>Run <code className="bg-amber-500/10 px-1 rounded">npx prisma migrate dev --name init</code></li>
          <li>Restart the dev server</li>
        </ol>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// Main Page (Server Component)
// ────────────────────────────────────────────────────────────

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedParams = await searchParams;
  const filters = parseFilters(resolvedParams);

  // Attempt to fetch data — gracefully handle missing DB
  let kpis = defaultKPIs;
  let operations: Awaited<ReturnType<typeof getRecentOperations>> = [];
  let lowStockItems: Awaited<ReturnType<typeof getLowStockDetails>> = [];
  let filterOptions = { categories: [] as string[], locations: [] as { id: string; name: string; type: string }[] };
  let dbConnected = true;

  try {
    const [kpiResult, opsResult, filterResult, lowStockResult] = await Promise.all([
      getDashboardKPIs(),
      getRecentOperations({ ...filters, limit: 50, offset: 0 }),
      getFilterOptions(),
      getLowStockDetails(),
    ]);
    kpis = kpiResult;
    operations = opsResult;
    filterOptions = filterResult;
    lowStockItems = lowStockResult;
  } catch (error) {
    console.error("[DASHBOARD] Database not available:", error);
    dbConnected = false;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-lg">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <LayoutDashboard className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold leading-tight">CoreInventory</h1>
              <p className="text-xs text-muted-foreground leading-none">Dashboard</p>
            </div>
          </div>
          {dbConnected && (
            <div className="ml-auto flex items-center gap-1.5 text-xs text-emerald-600">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Connected
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl space-y-6 px-6 py-8">
        {/* Database Warning */}
        {!dbConnected && <NoDatabaseBanner />}

        {/* KPI Grid */}
        <section id="kpi-section">
          <h2 className="text-lg font-semibold mb-4">Inventory Overview</h2>
          <Suspense fallback={<KPISkeleton />}>
            <KPIGrid kpis={kpis} />
          </Suspense>
        </section>

        {/* Reorder Alerts */}
        {lowStockItems.length > 0 && (
          <section id="alerts-section">
            <h2 className="text-lg font-semibold mb-4">Operational Urgency</h2>
            <LowStockAlerts items={lowStockItems} />
          </section>
        )}

        <Separator />

        {/* Filters */}
        <section id="filters-section">
          <h2 className="text-lg font-semibold mb-4">Recent Operations</h2>
          <Suspense fallback={<Skeleton className="h-[56px] rounded-xl" />}>
            <FilterBar
              categories={filterOptions.categories}
              locations={filterOptions.locations}
            />
          </Suspense>
        </section>

        {/* Operations Table */}
        <section id="operations-section">
          <Suspense fallback={<TableSkeleton />}>
            <OperationsTable operations={operations} />
          </Suspense>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-6">
        <div className="mx-auto max-w-7xl px-6">
          <p className="text-center text-xs text-muted-foreground">
            CoreInventory — Built for the Hackathon with Next.js, Prisma &amp; Shadcn UI
          </p>
        </div>
      </footer>
    </div>
  );
}
