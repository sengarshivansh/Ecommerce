import { Link } from "react-router-dom";
import type { Product } from "@/types";
import { Card } from "@/components/ui/card";
import { ProductImage } from "@/components/ui/product-image";
import { formatPrice } from "@/lib/utils";

export function ProductCard({ product }: { product: Product }) {
  const hasDiscount =
    product.discounted_price != null && product.discounted_price < product.price;

  return (
    <Link to={`/product/${product.id}`}>
      <Card className="h-full transition-shadow hover:shadow-md">
        <ProductImage
          src={product.image_url}
          name={product.name}
          className="h-36 rounded-t-lg"
        />
        <div className="p-4">
          <h3 className="truncate font-medium text-slate-900">{product.name}</h3>
          <p className="mt-1 line-clamp-2 h-10 text-sm text-slate-500">{product.description}</p>
          <div className="mt-2 flex items-center gap-2">
            {hasDiscount ? (
              <>
                <span className="font-semibold text-slate-900">
                  {formatPrice(product.discounted_price!)}
                </span>
                <span className="text-sm text-slate-400 line-through">
                  {formatPrice(product.price)}
                </span>
              </>
            ) : (
              <span className="font-semibold text-slate-900">{formatPrice(product.price)}</span>
            )}
          </div>
          <p className="mt-1 text-xs text-slate-400">
            {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
          </p>
        </div>
      </Card>
    </Link>
  );
}
