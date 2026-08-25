import { useEffect, useState } from "react";
import { allOrders, ORDER_STATUS_FLOW, updateOrderStatus } from "@/api/orders";
import type { Order } from "@/types";
import { AdminTabs } from "@/components/AdminTabs";
import { Card, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageSpinner } from "@/components/ui/spinner";
import { formatPrice } from "@/lib/utils";

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);

  function refresh() {
    return allOrders(1, 50)
      .then((r) => setOrders(r.data))
      .catch((e) => setError(e.message));
  }

  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, []);

  async function advance(order: Order, nextStatus: string) {
    setBusyId(order.id);
    setError(null);
    try {
      await updateOrderStatus(order.id, nextStatus);
      await refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusyId(null);
    }
  }

  if (loading) return <PageSpinner />;

  return (
    <div>
      <AdminTabs />
      {error && <p className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      <Card>
        <CardBody>
          <h2 className="mb-3 font-semibold">All orders ({orders.length})</h2>
          {orders.length === 0 ? (
            <p className="text-sm text-slate-500">No orders yet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-slate-500">
                  <th className="pb-2 font-medium">Order</th>
                  <th className="pb-2 font-medium">Status</th>
                  <th className="pb-2 text-right font-medium">Total</th>
                  <th className="pb-2 text-right font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => {
                  // The backend only allows forward transitions; offer the next one.
                  const nextStatuses = ORDER_STATUS_FLOW[order.status] ?? [];
                  return (
                    <tr key={order.id} className="border-b border-slate-100">
                      <td className="py-2">#{order.id}</td>
                      <td className="py-2">
                        <Badge status={order.status} />
                      </td>
                      <td className="py-2 text-right">{formatPrice(order.total_price)}</td>
                      <td className="py-2 text-right">
                        {nextStatuses.length === 0 ? (
                          <span className="text-xs text-slate-400">—</span>
                        ) : (
                          nextStatuses.map((next) => (
                            <Button
                              key={next}
                              size="sm"
                              variant="outline"
                              disabled={busyId === order.id}
                              onClick={() => advance(order, next)}
                            >
                              Mark {next}
                            </Button>
                          ))
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
