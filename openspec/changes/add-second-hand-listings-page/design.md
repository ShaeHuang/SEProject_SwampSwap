## Context

The backend already exposes public listing reads and authenticated listing creation, update, and deletion through Gin and GORM. The frontend is a Vite + React app with basic routing and a small set of shadcn-style UI primitives, but it does not yet include a marketplace page, listing detail view, or listing-specific API client.

This change crosses both frontend and backend because the requested experience includes filter, sort, detail, sell, and buy flows. The current `Listing` model only stores title, description, price, and owner, so a buy flow cannot yet reflect purchase state or prevent repeated purchases. The design should stay simple and align with the existing single-service architecture and SQLite-backed development setup.

## Goals / Non-Goals

**Goals:**
- Add a dedicated second-hand listings page reachable from the frontend router and home page.
- Provide a simple, shadcn-based browsing experience with client-visible filter and sort controls.
- Add a listing detail screen that surfaces full item information and actions for buying or selling.
- Support authenticated listing creation from the frontend.
- Extend backend listing behavior so purchased items can be represented and excluded or labeled consistently.

**Non-Goals:**
- Build a full checkout, payment, escrow, or order history system.
- Add image upload, category taxonomy, or advanced search facets in this change.
- Introduce a new backend service, state management library, or database beyond the current SQLite setup.

## Decisions

### Decision: Add a marketplace route plus a separate detail route

The frontend will add a top-level listings route for browsing and a parameterized detail route for item inspection. This keeps the list page lightweight while letting the detail view own buy interactions and richer content.

Alternative considered: a modal-only detail view from the list page. This would be faster to build initially, but it makes route sharing, refresh behavior, and future expansion harder.

### Decision: Use query-driven listing fetches for filter and sort

The public listings endpoint will be extended to accept simple query parameters such as keyword and sort order. Server-side filtering/sorting keeps the frontend straightforward and avoids divergence between displayed results and backend data as the dataset grows.

Alternative considered: fetch all listings and filter in the browser. This is acceptable for tiny datasets but does not scale and makes API behavior less reusable.

### Decision: Introduce lightweight listing availability state instead of full orders

The listing model will gain minimal state needed for buy/sell behavior, such as a status field and optional buyer reference. The buy action will mark an available listing as sold to the current user rather than creating a separate order subsystem.

Alternative considered: a separate purchases table and order workflow. This would support richer commerce later, but it is too heavy for the simple user request and current codebase maturity.

### Decision: Keep sell flow in a simple form dialog or dedicated page backed by existing protected endpoints

The frontend sell experience will collect title, description, and price using the current protected create endpoint, extended only if extra fields become necessary for status handling. This keeps the UI simple and compatible with the existing auth pattern.

Alternative considered: inline creation inside the list page. That is possible, but a contained form component or route is easier to validate and maintain.

## Risks / Trade-offs

- [Buy state is minimal] -> A simple sold flag or status is enough for now, but it will not cover negotiation or cancelation flows. Keep the API naming generic enough to evolve later.
- [Existing data has no status field] -> Use database migration defaults so pre-existing listings become `available` automatically.
- [Auth state handling on the frontend may be incomplete] -> Reuse the current login/token approach and disable sell/buy actions gracefully when the user is not authenticated.
- [Server-side filtering increases backend scope] -> Limit the first version to a small set of query parameters such as search term and price/date sort to keep the change manageable.

## Migration Plan

1. Add the new listing fields to the GORM model and let `AutoMigrate` apply the schema update locally.
2. Extend public and protected listing handlers without removing existing endpoint paths.
3. Add frontend listing API helpers, routes, and pages behind the current app shell.
4. Verify existing listing read/create behavior still works for callers that do not use the new fields or query parameters.
5. If rollback is needed, revert frontend routes/components and ignore the added columns in SQLite until a follow-up cleanup migration is planned.

## Open Questions

- Should purchased items remain visible in the marketplace with a `Sold` badge, or be hidden by default with an explicit filter to show sold items?
- Should the buy action be modeled as a new endpoint such as `POST /api/admin/listings/:id/buy`, or as an update of listing state through the existing update endpoint?
