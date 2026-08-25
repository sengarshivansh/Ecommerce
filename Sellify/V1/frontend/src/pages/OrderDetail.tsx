import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getOrder } from "@/api/orders";
import type { OrderDetail as OrderDetailType } from "@/types";
import { Card, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageSpinner } from "@/components/ui/spinner";
import { formatPrice } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";

export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<OrderDetailType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getOrder(Number(id))
      .then(setOrder)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <PageSpinner />;
  if (error || !order)
    return <p className="rounded-md bg-red-50 p-4 text-sm text-red-700">{error ?? "Not found"}</p>;

  return (
    <div>
      <Button variant="ghost" size="sm" className="mb-4" onClick={() => navigate("/orders")}>
        <ArrowLeft className="h-4 w-4" /> Back to orders
      </Button>

      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Order #{order.order_id}</h1>
        <Badge status={order.status} />
      </div>

      <Card>
        <CardBody>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-slate-500">
                <th className="pb-2 font-medium">Product</th>
                <th className="pb-2 text-right font-medium">Price</th>
                <th className="pb-2 text-right font-medium">Qty</th>
                <th className="pb-2 text-right font-medium">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item) => (
                <tr key={item.product_id} className="border-b border-slate-100">
                  <td className="py-2">{item.name}</td>
                  <td className="py-2 text-right">{formatPrice(item.price)}</td>
                  <td className="py-2 text-right">{item.quantity}</td>
                  <td className="py-2 text-right">{formatPrice(item.price * item.quantity)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-4 flex justify-between text-base font-bold">
            <span>Total</span>
            <span>{formatPrice(order.total_price)}</span>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
