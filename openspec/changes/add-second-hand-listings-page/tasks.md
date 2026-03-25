## 1. Backend listing commerce support

- [x] 1.1 Extend the `Listing` model with explicit availability state and any buyer-tracking field needed for a simple buy flow.
- [x] 1.2 Update `GET /api/listings` to accept supported filter and sort query parameters and return listing state in responses.
- [x] 1.3 Add an authenticated buy endpoint or equivalent protected handler that marks an available listing as sold and rejects invalid purchases.
- [x] 1.4 Update backend API documentation to describe the new listing query parameters, response fields, and buy behavior.

## 2. Frontend listings data layer and routing

- [x] 2.1 Add frontend listing types and API helpers for fetching listings, fetching listing details, creating listings, and buying listings.
- [x] 2.2 Add marketplace and listing-detail routes to the React router and connect the home page navigation to the marketplace flow.
- [x] 2.3 Add any missing shadcn-style UI primitives needed for select/filter/form interactions while staying consistent with the current component setup.

## 3. Marketplace UI flows

- [x] 3.1 Build the marketplace page with listing cards, keyword filter controls, and sort controls backed by the listings API.
- [x] 3.2 Build the listing detail page with full item information, seller context, availability state, and a buy action.
- [x] 3.3 Build the sell flow as a simple form page or dialog for authenticated users and refresh the marketplace after successful creation.
- [x] 3.4 Handle unauthenticated buy/sell attempts and sold-item states with clear UI feedback.

## 4. Validation and regression checks

- [x] 4.1 Verify the backend listing endpoints still support existing read and create flows after the schema/API changes.
- [ ] 4.2 Verify the new marketplace, detail, sell, and buy flows manually in the frontend against the local backend.
- [x] 4.3 Add or update automated tests where practical for listing API behavior and critical UI flows.
