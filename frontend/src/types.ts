// These types mirror the shapes the FastAPI backend returns. Keeping them in
// one place means the whole app shares a single source of truth for the API.

export interface User {
  id: number;
  email: string;
  role: string; // "user" | "admin"
  username?: string;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  discounted_price: number | null;
  stock: number;
}

export interface ProductListResponse {
  page: number;
  limit: number;
  data: Product[];
}

export interface Category {
  id: number;
  name: string;
}

export interface CartItem {
  product_id: number;
  name: string;
  price: number;
  quantity: number;
  item_cost: number;
}

export interface CartView {
  items: CartItem[];
  total_cost: number;
}

export interface Order {
  id: number;
  total_price: number;
  status: string;
  created_at: string;
}

export interface OrderListResponse {
  page: number;
  limit: number;
  data: Order[];
}

export interface OrderDetailItem {
  product_id: number;
  name: string;
  price: number;
  quantity: number;
}

export interface OrderDetail {
  order_id: number;
  total_price: number;
  status: string;
  items: OrderDetailItem[];
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}
