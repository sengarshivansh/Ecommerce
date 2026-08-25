import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { myOrders } from "@/api/orders";
import type { Order } from "@/types";
import { Card, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageSpinner } from "@/components/ui/spinner";
import { formatPrice } from "@/lib/utils";

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    myOrders(1, 20)
      .then((res) => setOrders(res.data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageSpinner />;
  if (error) return <p className="rounded-md bg-red-50 p-4 text-sm text-red-700">{error}</p>;

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">Your orders</h1>
      {orders.length === 0 ? (
        <p className="py-16 text-center text-slate-500">You haven't placed any orders yet.</p>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <Link key={order.id} to={`/orders/${order.id}`}>
              <Card className="transition-shadow hover:shadow-md">
                <CardBody className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Order #{order.id}</p>
                    <p className="text-sm text-slate-500">
                      {new Date(order.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge status={order.status} />
                    <span className="font-semibold">{formatPrice(order.total_price)}</span>
                  </div>
                </CardBody>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
