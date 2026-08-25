import { request, requestForm } from "./client";
import type { TokenResponse, User } from "@/types";

export interface RegisterPayload {
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  phone_number: string;
}

export function register(payload: RegisterPayload) {
  // POST /auth/register — public, so auth: false (no token needed).
  return request<{ id: number; username: string; email: string; role: string }>(
    "/auth/register",
    { method: "POST", json: payload, auth: false },
  );
}

export function login(username: string, password: string) {
  // POST /auth/login — form-encoded (OAuth2PasswordRequestForm).
  return requestForm<TokenResponse>("/auth/login", { username, password });
}

export function getMe() {
  // GET /auth/me — needs the bearer token.
  return request<User>("/auth/me");
}
