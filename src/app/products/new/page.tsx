import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ProductForm } from "@/components/products/ProductForm";

export default function NewProductPage() {
  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/products">
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Add New Product</h1>
          <p className="text-sm text-muted-foreground">Register a new item in your inventory system.</p>
        </div>
      </div>

      <ProductForm />
    </div>
  );
}
