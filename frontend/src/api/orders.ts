import { request } from "./client";
import type { OrderDetail, OrderListResponse } from "@/types";

export function createOrder() {
  // POST /order/create — turns the user's cart into an order.
  return request<{ order_id: number; total_price: number; status: string }>("/order/create", {
    method: "POST",
  });
}

export function myOrders(page = 1, limit = 10) {
  // GET /order/me — the current user's order history.
  return request<OrderListResponse>("/order/me", { params: { page, limit } });
}

export function getOrder(id: number) {
  // GET /order/{id} — one order with its line items (must be the owner).
  return request<OrderDetail>(`/order/${id}`);
}

export function allOrders(page = 1, limit = 10) {
  // GET /order/all — admin only.
  return request<OrderListResponse>("/order/all", { params: { page, limit } });
}

export function updateOrderStatus(orderId: number, status: string) {
  // PUT /order/{order_id}/status — admin only; follows the status state machine.
  return request<{ order_id: number; new_status: string }>(`/order/${orderId}/status`, {
    method: "PUT",
    json: { status },
  });
}

// Mirrors the backend's allowed transitions so the admin UI only offers valid moves.
export const ORDER_STATUS_FLOW: Record<string, string[]> = {
  pending: ["confirmed"],
  confirmed: ["shipped"],
  shipped: ["delivered"],
  delivered: [],
};

export const ORDER_STATUSES = ["pending", "confirmed", "shipped", "delivered"] as const;
