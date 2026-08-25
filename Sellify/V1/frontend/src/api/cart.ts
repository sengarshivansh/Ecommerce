import { request } from "./client";
import type { CartView } from "@/types";

export function getCart() {
  // GET /cart/me — the current user's cart.
  return request<CartView>("/cart/me");
}

export function addToCart(product_id: number, quantity: number) {
  // POST /cart/add
  return request<{ message: string }>("/cart/add", {
    method: "POST",
    json: { product_id, quantity },
  });
}

export function updateCartItem(product_id: number, quantity: number) {
  // PUT /cart/update — sets an absolute quantity for one item.
  return request<{ message: string }>("/cart/update", {
    method: "PUT",
    json: { product_id, quantity },
  });
}

export function removeCartItem(product_id: number) {
  // DELETE /cart/delete — body carries the product id.
  return request<{ message: string }>("/cart/delete", {
    method: "DELETE",
    json: { product_id },
  });
}

export function clearCart() {
  // DELETE /cart/clearcart
  return request<{ message: string }>("/cart/clearcart", { method: "DELETE" });
}
