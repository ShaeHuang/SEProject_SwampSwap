## Why

The project already has a basic listings API, but the frontend does not yet provide a real second-hand marketplace experience. Adding a simple shadcn-based listings page now will connect the existing backend with a usable buyer/seller flow and make the platform feel like a functioning campus trading product.

## What Changes

- Add a new second-hand listings page in the React frontend using existing shadcn-style UI components and routing.
- Show a browsable listings feed with filter and sort controls so buyers can quickly narrow items by keyword and ordering.
- Add a listing detail view where users can read the full description, see price and seller context, and initiate a buy action.
- Add a sell flow that lets authenticated users create a new listing from the frontend using the protected listing API.
- Add a lightweight buy flow that lets users mark intent to buy from the detail view and updates listing availability/state in a way the UI can reflect.
- Extend the listings backend as needed to support frontend-driven filtering, sorting, detail data, and item purchase state.

## Capabilities

### New Capabilities
- `second-hand-marketplace-ui`: Browse, filter, sort, inspect, and act on second-hand listings from the frontend.
- `listing-commerce-management`: Support listing state and API behaviors required for selling and buying items safely.

### Modified Capabilities

## Impact

- Affected frontend areas: `frontend/src/pages`, `frontend/src/router/routes.ts`, shared UI components, and new API helpers/types for listings.
- Affected backend areas: `backend/listings.go`, `backend/main.go`, database migration for any new listing fields, and API documentation.
- Affected user flows: home navigation, listing discovery, listing creation, and listing purchase intent.
