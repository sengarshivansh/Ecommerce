import { request } from "./client";
import type { Category } from "@/types";

export function listCategories() {
  // GET /category/list — public.
  return request<Category[]>("/category/list", { auth: false });
}

export function createCategory(name: string) {
  // POST /category/create — admin only.
  return request<Category>("/category/create", { method: "POST", json: { name } });
}
