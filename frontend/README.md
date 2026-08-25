# Sellify Frontend

A React (Vite + TypeScript) storefront **and** admin dashboard for the Sellify FastAPI backend.
Styling is Tailwind CSS with shadcn-style components.

## Prerequisites

- Node.js 18+ (you have 24)
- The Sellify backend running (see below)

## 1. Start the backend

The backend code lives in `Sellify/V1/` (version 1 of the API). The app uses
package-relative imports (`from .database import ...`), so uvicorn
**must be run from the repo root** (the folder that *contains* `Sellify/`), using
the full module path `Sellify.V1.main:app`. Running it from inside `Sellify/` fails
with `ImportError: attempted relative import` or `ModuleNotFoundError: No module named 'Sellify'`.

```bash
# from the repo root: /Users/.../E-Commerce
source Sellify/venv/bin/activate
uvicorn Sellify.V1.main:app --reload --port 8000
```

> The backend reads `SECRET_KEY`, `ALGORITHM`, `ACCESS_TOKEN_EXPIRE_MINUTES`, and
> `DATABASE_URL` from `.env`. CORS is configured to allow `http://localhost:5173`
> (the Vite dev server). To allow other origins, set `FRONTEND_ORIGINS` (comma-separated).

## 2. Start the frontend

```bash
cd frontend
npm install        # first time only
npm run dev        # http://localhost:5173
```

The API base URL lives in `frontend/.env` as `VITE_API_URL` (defaults to `http://localhost:8000`).

## Scripts

| Command          | What it does                                  |
| ---------------- | --------------------------------------------- |
| `npm run dev`    | Start the dev server with hot reload          |
| `npm run build`  | Typecheck (`tsc`) then build to `dist/`        |
| `npm run preview`| Serve the production build locally            |
| `npm run lint`   | Typecheck only                                |

## How to see the admin pages

The backend creates every new user with `role="user"`. To get an admin, register
a user, then promote them in the database (e.g. `UPDATE users SET role='admin' WHERE username='you';`),
log out and back in. The **Admin** tab then appears in the navbar.

## Project structure

```
src/
  api/            # one file per backend router; all HTTP lives here
    client.ts     # the fetch wrapper (base URL, auth header, error handling)
    auth.ts  products.ts  categories.ts  cart.ts  orders.ts
  components/
    ui/           # reusable primitives (Button, Input, Card, Badge, ...)
    Navbar.tsx  ProtectedRoute.tsx  ProductCard.tsx  AdminTabs.tsx
  context/
    AuthContext.tsx   # global logged-in-user state
  pages/          # one component per screen (routed in App.tsx)
    ProductList, ProductDetail, Cart, Orders, OrderDetail, Login, Register
    admin/        # AdminProducts, AdminCategories, AdminOrders
  types.ts        # TypeScript shapes mirroring the backend's JSON
  App.tsx         # routes
  main.tsx        # app bootstrap (Router + AuthProvider)
```

See **`Frontend-Backend-Guide.docx`** in the repo root for a full walkthrough of how
the frontend and backend fit together.
