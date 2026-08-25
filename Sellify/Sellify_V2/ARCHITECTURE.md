# Sellify — Architecture & Decision Log

> Marketplace platform for small/handmade-goods sellers (the artisans who currently
> sell via Instagram, Facebook, or physical stalls). Sellers register, list products,
> and manage orders; buyers browse, pay securely, and track orders end to end.
>
> This project is a ground-up redesign of the original Sellify, applying the clean
> layered architecture studied in the Calcount codebase. Goal: production-grade,
> scalable, deployable — and a strong internship portfolio piece.

---

## 0. How to work in this repo (mentor mode)

This project is a **learning exercise**. When assisting (revised 2026-08-07):

- **No Socratic quizzing.** Explain the concept/design directly and completely first.
- **The user writes the code** — do not write it unprompted. Review what they wrote,
  point out what's wrong and why, and help fix it (following Calcount's rules and
  best practices). If something isn't understood, re-explain in an easier way using
  the running "Asha the potter" example — but always paired with the real technical
  term (interview-ready vocabulary).
- **One layer at a time.** Follow the request flow; don't jump ahead.
- **Flag interview-critical concepts** explicitly; relate designs back to
  fundamentals (e.g., name the SOLID principle something follows).
- Keep responses in points/tables, not long paragraphs.

---

## 1. The problem being solved

Handmade-goods sellers today rely on Instagram/Facebook. Real pain points:

1. **No dedicated storefront** — social media isn't built for commerce.
2. **Trust gap** — buyers can't verify a seller is legitimate.
3. **No secure payment** — money goes directly to seller, no protection.
4. **No dispute / return system** — buyer has no recourse if scammed.
5. **No order tracking** — once money is sent, buyer has zero visibility.

**Value proposition**
- For sellers: a dedicated storefront that converts reach into actual sales.
- For buyers: end-to-end visibility and protection from payment to delivery.

---

## 2. Domain model

### Entities
User, SellerProfile, Product, Category, Order, OrderItem
(plus later: Payment, Address, Dispute/Ticket, Cart)

### Relationships
| From | To | Cardinality | Notes |
|------|-----|-------------|-------|
| User | SellerProfile | one → one | A user *becomes* a seller by having a profile |
| SellerProfile | Product | one → many | A seller lists many products |
| Category | Product | one → many | Each product in one category |
| User | Order | one → many | A buyer places many orders |
| Order | OrderItem | one → many | An order splits into per-seller line items |
| Product | OrderItem | one → many | A product appears in many order items |

### Key modeling decisions
- **User + SellerProfile split** (not separate Seller/Buyer tables).
  Reason: one person can be *both* buyer and seller. Identity (User) is separate
  from capability (SellerProfile). **This is the exact pattern Amazon uses** —
  one Amazon account + Seller Central layered on top.
- **OrderItem is a junction entity** — breaks the many-to-many between Order and
  Product into two one-to-many relationships. Also carries per-order data.
- **Price snapshot on OrderItem** — store the price *at time of purchase*, not a
  live lookup, so historical orders reflect what was actually paid.

---

## 3. Table schemas

### User
| Column | Type | Why |
|--------|------|-----|
| id | int/UUID | Primary key (internal only) |
| urn | string | Public-facing ID |
| email | string (unique) | Login + contact |
| password_hash | string | bcrypt hash — never plaintext |
| phone | string | Contact + verification |
| is_active | bool | Suspend without deleting |
| is_deleted | bool | Soft delete |
| created_at / updated_at | timestamp | Audit |

### SellerProfile
| Column | Type | Why |
|--------|------|-----|
| id | int/UUID | Primary key |
| urn | string | Public ID |
| user_id | FK → User | Owner |
| business_name | string | Storefront brand |
| is_verified | bool | Trust signal (solves the trust-gap problem) |
| is_active / is_deleted | bool | Toggle / soft delete |
| created_at / updated_at | timestamp | Audit |

### Category
| Column | Type | Why |
|--------|------|-----|
| id | int/UUID | Primary key |
| urn | string | Public ID |
| name | string | "Jewellery", "Pottery" |
| is_active | bool | Hide without deleting |

### Product
| Column | Type | Why |
|--------|------|-----|
| id | int/UUID | Primary key |
| urn | string | Public ID |
| seller_id | FK → SellerProfile | Owner |
| category_id | FK → Category | Classification (RESTRICT on delete) |
| name | string | Title |
| description | text | Details |
| price | **decimal** | Never float — float loses precision on money |
| quantity | int | Stock available |
| image_urls | JSON array | URLs only — files live in object storage |
| is_active | bool | Hide without deleting |
| is_deleted | bool | Soft delete |
| created_at / updated_at | timestamp | Audit |

### Order
| Column | Type | Why |
|--------|------|-----|
| id | int/UUID | Primary key |
| urn | string | Public ID |
| buyer_id | FK → User | Who placed it |
| total_price | decimal | Sum at checkout |
| shipping_address | (Address, TBD) | Where to ship |
| status | enum | pending → paid → … |
| created_at / updated_at | timestamp | Audit |

### OrderItem  (one per seller-portion of an order)
| Column | Type | Why |
|--------|------|-----|
| id | int/UUID | Primary key |
| urn | string | Public ID |
| order_id | FK → Order | Parent order |
| seller_id | FK → SellerProfile | Who fulfills this portion |
| product_id | FK → Product | What was bought |
| quantity | int | How many |
| price_at_purchase | **decimal** | Price snapshot |
| status | enum | pending → packed → shipped → delivered |
| tracking_number | string | Per-item shipment |

---

## 4. Cross-cutting production rules

| Rule | Why | Interview flag |
|------|-----|----------------|
| `decimal` for money, never `float` | Float loses precision (0.1+0.2≠0.3) | ✅ |
| Soft delete (`is_deleted`) everywhere | Records may be referenced by old orders | ✅ |
| `urn` public, `id` internal | Never leak sequential DB ids (security) | ✅ |
| bcrypt/argon2 password hashing + salt | One-way, stops rainbow tables | ✅ high-freq |
| Images in object storage (S3/Cloudinary), URL in DB | DB is for structured data, not blobs; enables CDN | ✅ |
| Category as FK, not string | Normalization — integrity over duplication | ✅ (normalize vs denormalize) |
| FK delete behavior: RESTRICT for category | Never silently delete a seller's products | ✅ (RESTRICT/CASCADE/SET NULL) |

---

## 5. Application architecture (ported from Calcount)

### Request flow (in order)
1. HTTP Request
2. Middleware  (auth, rate limit, request context)
3. DTO validation  (Pydantic, before controller)
4. Controller  (class-based, stateless)
5. Dependency injection / Factory  (builds service with per-request context)
6. Service  (business logic — `run()`)
7. Repository  (DB access)
8. Response DTO  (shape output, snake_case → camelCase)
9. HTTP Response

### Folder structure
| Folder | Job |
|--------|-----|
| `middlewares/` | auth, rate limit, request context |
| `dtos/requests/` | validate input |
| `controllers/` | thin orchestration, one class per endpoint |
| `factories/` | build services with per-request context |
| `services/` | business logic |
| `repositories/` | DB access |
| `dtos/responses/` | shape output |
| `abstractions/` | base classes (IService, IRepository, IController) |
| `models/` | DB table definitions |
| `errors/` | custom exceptions |

### Patterns to reuse from Calcount
- **Abstractions layer**: `IService` (abstract `run()`), `IRepository` (concrete
  CRUD via Template Method), `IController` (`validate_request` contract).
- **DRY constructor**: shared urn/user_urn/api_name/user_id + bound logger in base classes.
- **Request tracing**: urn bound to every log line via `logger.bind(...)`.
- **Factory pattern**: inject a factory, not a service — service needs per-request context.
- **DI via `Depends()`**: swappable, testable dependencies.
- **Two-level error handling**: known business errors vs unexpected crashes.
- **LRU cache on reads only**: never cache writes/updates (stale data).
- **Consistent response shape**: transactionUrn, status, responseMessage, responseKey, data.

---

## 6. Build strategy

- **Approach: top-down vertical slices** ("walking skeleton").
  Build one feature through *all* layers before moving on. Higher motivation,
  shows how layers connect, first working feature in week 1.
- **First slice: `POST /seller/register`** — entry point, touches every layer,
  mirrors Calcount's `POST /user/register` (reference implementation).

### MVP scope (6 weeks)
In: seller registration + dashboard, product catalog + basic search, cart +
checkout with real Stripe payment, order tracking (buyer + seller), seller ratings.
Out (for now): dispute resolution, Elasticsearch, recommendations, notifications,
multi-channel inventory sync.

### Tech stack
FastAPI · PostgreSQL · Redis (cart + hot-product cache) · Stripe (real payments)
· Docker · deploy on Render/EC2.

### Rough timeline
| Week | Focus |
|------|-------|
| 1–2 | Domain models + seller/auth flow |
| 2–3 | Product catalog + search |
| 3–4 | Cart + Stripe integration |
| 4–5 | Order management + seller dashboard |
| 5–6 | Testing, deploy, README |

---

## 7. Open items / next decisions
- [ ] Address: separate table or embedded on Order? (decide before checkout slice)
- [ ] Order status enum: exact states + transitions
- [ ] Cart: Redis (ephemeral) vs DB table — decide at cart slice
- [x] Walk through `POST /seller/register` layer by layer — done 2026-08-07, see decision below

### Decision (2026-08-07): registration flows, authorization, build order
- **Two registration endpoints.** `POST /seller/register` creates `User` + `SellerProfile`
  atomically (one transaction). `POST /user/register` creates `User` only — deferred.
- **Authorization model.** No `role` column. Having a `SellerProfile` *is* the seller
  capability: seller-only endpoints = authentication (valid user) + capability check
  (SellerProfile exists for that user). Buyer endpoints = authentication only.
  (Authn = who are you; authz = what may you do — capability derived from §2 split.)
- **Build order.** Complete the seller vertical slice first (register → auth →
  products → orders), then buyer flows. Schema split (User + SellerProfile) stays.
- `POST /seller/register` contract: body = `email`, `password`, `phone`,
  `business_name`; duplicate email → `409`; validation failure → `422`; success → `201`.

---

## Reference repos
- Calcount (architecture reference): https://github.com/sengarshivansh/calcount
- Sellify (original): https://github.com/sengarshivansh/Ecommerce
