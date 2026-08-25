import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getProduct } from "@/api/products";
import { addToCart } from "@/api/cart";
import { useAuth } from "@/context/AuthContext";
import type { Product } from "@/types";
import { Button } from "@/components/ui/button";
import { PageSpinner } from "@/components/ui/spinner";
import { ProductImage } from "@/components/ui/product-image";
import { formatPrice } from "@/lib/utils";
import { ArrowLeft, ShoppingCart } from "lucide-react";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    getProduct(Number(id))
      .then(setProduct)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleAdd() {
    if (!user) {
      navigate("/login", { state: { from: `/product/${id}` } });
      return;
    }
    if (!product) return;
    setAdding(true);
    setMessage(null);
    try {
      await addToCart(product.id, quantity);
      setMessage("Added to cart!");
    } catch (e) {
      setMessage((e as Error).message);
    } finally {
      setAdding(false);
    }
  }

  if (loading) return <PageSpinner />;
  if (error || !product)
    return <p className="rounded-md bg-red-50 p-4 text-sm text-red-700">{error ?? "Not found"}</p>;

  const hasDiscount = product.discounted_price != null && product.discounted_price < product.price;

  return (
    <div>
      <Button variant="ghost" size="sm" className="mb-4" onClick={() => navigate(-1)}>
        <ArrowLeft className="h-4 w-4" /> Back
      </Button>

      <div className="grid gap-8 md:grid-cols-2">
        <ProductImage
          src={product.image_url}
          name={product.name}
          className="h-72 rounded-lg"
          fallbackTextClass="text-7xl"
        />

        <div>
          <h1 className="text-2xl font-bold">{product.name}</h1>
          <p className="mt-2 text-slate-600">{product.description}</p>

          <div className="mt-4 flex items-center gap-3">
            {hasDiscount ? (
              <>
                <span className="text-2xl font-bold">{formatPrice(product.discounted_price!)}</span>
                <span className="text-lg text-slate-400 line-through">
                  {formatPrice(product.price)}
                </span>
              </>
            ) : (
              <span className="text-2xl font-bold">{formatPrice(product.price)}</span>
            )}
          </div>

          <p className="mt-2 text-sm text-slate-500">
            {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
          </p>

          {product.stock > 0 && (
            <div className="mt-6 flex items-center gap-3">
              <input
                type="number"
                min={1}
                max={product.stock}
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                className="h-10 w-20 rounded-md border border-slate-300 px-3 text-sm"
              />
              <Button onClick={handleAdd} disabled={adding}>
                <ShoppingCart className="h-4 w-4" />
                {adding ? "Adding..." : "Add to cart"}
              </Button>
            </div>
          )}

          {message && (
            <p
              className={`mt-3 text-sm ${
                message === "Added to cart!" ? "text-green-700" : "text-red-700"
              }`}
            >
              {message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
