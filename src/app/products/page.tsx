import { Suspense } from "react";
import { Plus, Search, Package, MapPin } from "lucide-react";
import { getProducts } from "@/lib/queries";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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

export const metadata = {
  title: "Products | CoreInventory",
  description: "Manage your inventory catalog and track stock across all locations.",
};

async function ProductList({ search }: { search?: string }) {
  const products = await getProducts(search);

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed rounded-xl bg-muted/30">
        <Package className="w-12 h-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold">No products found</h3>
        <p className="text-muted-foreground max-w-sm">
          {search ? `No products match "${search}". Try a different SKU or name.` : "Your catalog is empty. Start by adding your first product."}
        </p>
        <Button asChild className="mt-4">
          <Link href="/products/new">
            <Plus className="w-4 h-4 mr-2" /> Add Product
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50 hover:bg-muted/50">
            <TableHead className="w-[120px]">SKU</TableHead>
            <TableHead>Product Name</TableHead>
            <TableHead>Category</TableHead>
            <TableHead className="text-center">Total Stock</TableHead>
            <TableHead>Location Breakdown</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product.id} className="group">
              <TableCell className="font-mono text-xs font-semibold">
                {product.sku}
              </TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <span className="font-medium">{product.name}</span>
                  <span className="text-xs text-muted-foreground">{product.uom || "Units"}</span>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className="bg-muted/30">
                  {product.category}
                </Badge>
              </TableCell>
              <TableCell className="text-center">
                <span className={product.totalStock <= (product.reorderLevel || 0) ? "text-amber-600 font-bold" : "font-medium"}>
                  {product.totalStock}
                </span>
                {product.totalStock <= (product.reorderLevel || 0) && (
                  <p className="text-[10px] text-amber-600 font-medium">Low Stock</p>
                )}
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1 max-w-[300px]">
                  {product.stockQuants.length > 0 ? (
                    product.stockQuants.map((sq: any) => (
                      <Badge key={sq.id} variant="secondary" className="text-[10px] px-1.5 py-0 h-5 flex gap-1 items-center bg-blue-50 text-blue-700 border-blue-100">
                        <MapPin className="w-2.5 h-2.5" />
                        {sq.location.name}: {sq.quantity}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-xs text-muted-foreground italic">No stock allocated</span>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`/products/${product.id}`}>Edit</Link>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function ProductsSkeleton() {
  return (
    <div className="rounded-xl border space-y-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="p-4 flex gap-4 items-center">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-16 ml-auto" />
        </div>
      ))}
    </div>
  );
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const searchQuery = searchParams.q;

  return (
    <div className="p-4 md:p-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Product Catalog</h1>
          <p className="text-muted-foreground">Manage your master data and track inventory levels.</p>
        </div>
        <Button asChild className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all active:scale-95">
          <Link href="/products/new">
            <Plus className="w-4 h-4 mr-2" /> New Product
          </Link>
        </Button>
      </div>

      <Card className="border-none shadow-md bg-white/50 backdrop-blur-sm">
        <CardContent className="p-4">
          <form className="relative flex items-center">
            <Search className="absolute left-3 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              name="q"
              defaultValue={searchQuery}
              placeholder="Search by SKU or Product Name..."
              className="w-full pl-10 pr-4 py-2 bg-muted/50 rounded-lg border-2 border-transparent focus:border-primary/20 focus:bg-white transition-all outline-none text-sm"
            />
          </form>
        </CardContent>
      </Card>

      <Suspense key={searchQuery} fallback={<ProductsSkeleton />}>
        <ProductList search={searchQuery} />
      </Suspense>
    </div>
  );
}
