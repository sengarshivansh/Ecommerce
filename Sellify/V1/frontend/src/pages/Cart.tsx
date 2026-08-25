import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { clearCart, getCart, removeCartItem, updateCartItem } from "@/api/cart";
import { createOrder } from "@/api/orders";
import type { CartView } from "@/types";
import { Card, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageSpinner } from "@/components/ui/spinner";
import { formatPrice } from "@/lib/utils";
import { Trash2 } from "lucide-react";

export default function Cart() {
  const navigate = useNavigate();
  const [cart, setCart] = useState<CartView | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function refresh() {
    return getCart()
      .then(setCart)
      .catch((e) => setError(e.message));
  }

  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, []);

  // A small wrapper so every mutating action shows a busy state, surfaces
  // errors, and re-reads the cart afterwards (the backend is the source of truth).
  async function mutate(action: () => Promise<unknown>) {
    setBusy(true);
    setError(null);
    try {
      await action();
      await refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function checkout() {
    setBusy(true);
    setError(null);
    try {
      const order = await createOrder();
      navigate(`/orders/${order.order_id}`);
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
    }
  }

  if (loading) return <PageSpinner />;

  const isEmpty = !cart || cart.items.length === 0;

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">Your cart</h1>
      {error && <p className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      {isEmpty ? (
        <p className="py-16 text-center text-slate-500">Your cart is empty.</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-3">
          <div className="space-y-3 md:col-span-2">
            {cart!.items.map((item) => (
              <Card key={item.product_id}>
                <CardBody className="flex items-center gap-4">
                  <div className="flex-1">
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-slate-500">{formatPrice(item.price)} each</p>
                  </div>
                  <input
                    type="number"
                    min={1}
                    value={item.quantity}
                    disabled={busy}
                    onChange={(e) =>
                      mutate(() => updateCartItem(item.product_id, Math.max(1, Number(e.target.value))))
                    }
                    className="h-9 w-16 rounded-md border border-slate-300 px-2 text-sm"
                  />
                  <div className="w-20 text-right font-medium">{formatPrice(item.item_cost)}</div>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={busy}
                    onClick={() => mutate(() => removeCartItem(item.product_id))}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </CardBody>
              </Card>
            ))}
            <Button
              variant="outline"
              size="sm"
              disabled={busy}
              onClick={() => mutate(() => clearCart())}
            >
              Clear cart
            </Button>
          </div>

          <Card className="h-fit">
            <CardBody>
              <h2 className="mb-3 font-semibold">Summary</h2>
              <div className="flex justify-between border-b border-slate-100 pb-3 text-sm">
                <span className="text-slate-500">Total</span>
                <span className="font-bold">{formatPrice(cart!.total_cost)}</span>
              </div>
              <Button className="mt-4 w-full" disabled={busy} onClick={checkout}>
                {busy ? "Placing order..." : "Checkout"}
              </Button>
            </CardBody>
          </Card>
        </div>
      )}
    </div>
  );
}
