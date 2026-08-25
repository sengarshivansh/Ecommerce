// ---------------------------------------------------------------------------
// The API client: the single place the frontend talks to the backend.
//
// Every screen calls these helpers instead of calling fetch() directly. That
// gives us ONE place to: set the base URL, attach the auth token, parse JSON,
// and turn HTTP errors into thrown JS errors the UI can catch.
// ---------------------------------------------------------------------------

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

const TOKEN_KEY = "sellify_token";

// --- token storage -------------------------------------------------------
// The JWT lives in localStorage so it survives page reloads. (Trade-offs vs.
// cookies are discussed in the accompanying guide.)
export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

// --- error type ----------------------------------------------------------
// FastAPI returns errors as { "detail": "..." } with an HTTP status code.
// We wrap that in a real Error so callers can `try/catch` and read .message.
export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = "ApiError";
  }
}

interface RequestOptions {
  method?: string;
  /** A plain object that will be JSON-encoded as the request body. */
  json?: unknown;
  /** Query-string parameters; undefined/null values are skipped. */
  params?: Record<string, string | number | boolean | undefined | null>;
  /** Send the Authorization header (default true). */
  auth?: boolean;
}

function buildUrl(path: string, params?: RequestOptions["params"]): string {
  const url = new URL(BASE_URL + path);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.set(key, String(value));
      }
    }
  }
  return url.toString();
}

/**
 * The generic request helper. `<T>` is the expected response shape.
 */
export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", json, params, auth = true } = options;

  const headers: Record<string, string> = {};
  if (json !== undefined) headers["Content-Type"] = "application/json";

  const token = getToken();
  if (auth && token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(buildUrl(path, params), {
    method,
    headers,
    body: json !== undefined ? JSON.stringify(json) : undefined,
  });

  // 204 No Content / empty body
  if (res.status === 204) return undefined as T;

  const text = await res.text();
  const data = text ? JSON.parse(text) : null;

  if (!res.ok) {
    // FastAPI validation errors put an array under `detail`; flatten it.
    const detail = data?.detail;
    const message =
      typeof detail === "string"
        ? detail
        : Array.isArray(detail)
          ? detail.map((d: { msg?: string }) => d.msg ?? JSON.stringify(d)).join(", ")
          : `Request failed (${res.status})`;
    throw new ApiError(res.status, message);
  }

  return data as T;
}

/**
 * Login is special: FastAPI's OAuth2PasswordRequestForm expects
 * application/x-www-form-urlencoded data, not JSON.
 */
export async function requestForm<T>(path: string, form: Record<string, string>): Promise<T> {
  const body = new URLSearchParams(form);
  const res = await fetch(buildUrl(path), {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) {
    throw new ApiError(res.status, data?.detail ?? `Request failed (${res.status})`);
  }
  return data as T;
}
