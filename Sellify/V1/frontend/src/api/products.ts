import { request } from "./client";
import type { Product, ProductListResponse } from "@/types";

export interface ProductQuery {
  category_id?: number;
  search?: string;
  sort?: "price_asc" | "price_desc";
  min_price?: number;
  max_price?: number;
  page?: number;
  limit?: number;
}

export function listProducts(query: ProductQuery = {}) {
  // GET /product/list?... — public, supports filtering/sort/pagination.
  // (ProductQuery has no index signature, so we widen it for the params type.)
  return request<ProductListResponse>("/product/list", {
    params: { ...query } as Record<string, string | number | undefined>,
    auth: false,
  });
}

export function getProduct(id: number) {
  // GET /product/{id} — public.
  return request<Product>(`/product/${id}`, { auth: false });
}

export interface CreateProductPayload {
  name: string;
  description: string;
  price: number;
  discounted_price?: number | null;
  stock: number;
  category_id: number;
  /** Either "/products/foo.jpg" (served by this site) or an absolute URL. */
  image_url?: string | null;
}

export function createProduct(payload: CreateProductPayload) {
  // POST /product/create — admin only (token must belong to an admin).
  return request<Product>("/product/create", { method: "POST", json: payload });
}
