import { notFound } from "next/navigation";
import { ArrowLeft, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getProduct } from "@/lib/queries";
import { ProductForm } from "@/components/products/ProductForm";

interface EditProductPageProps {
  params: {
    id: string;
  };
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const product = await getProduct(params.id);

  if (!product) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/products">
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Edit Product</h1>
          <p className="text-sm text-muted-foreground">Modify details for <span className="font-semibold text-primary">{product.name}</span> ({product.sku}).</p>
        </div>
      </div>

      <ProductForm initialData={product} isEdit={true} />
    </div>
  );
}
