## Why

The login flow has active uncommitted changes but no automated browser-level coverage, which makes it easy to regress validation, API error handling, token persistence, or post-login navigation while iterating. Adding Cypress coverage now gives the team a repeatable way to verify the login experience before more auth-dependent features are built on top of it.

## What Changes

- Add Cypress as the frontend end-to-end test runner and define npm scripts for running login-focused E2E tests locally.
- Add browser tests for the `/login` page covering client-side validation, failed authentication, and successful authentication.
- Verify the success path persists the auth token in `localStorage` and redirects the user away from the login page after a successful sign-in.
- Define the local test assumptions needed to exercise the current Vite frontend and Gin backend login flow in development.

## Capabilities

### New Capabilities
- `login-e2e-testing`: Browser-level verification for the login flow, including validation feedback, API-backed authentication outcomes, token persistence, and navigation after sign-in.

### Modified Capabilities
- None.

## Impact

- Affected frontend code: `frontend/package.json`, Cypress configuration, support files, fixtures or helpers, and login E2E spec files.
- Affected application behavior under test: `frontend/src/pages/Login/index.tsx`, `frontend/src/api/auth.ts`, routing from `frontend/src/router/routes.ts`, and the backend `/api/login` endpoint.
- New development dependency: Cypress in the frontend workspace.
- Test environment coordination between the Vite app on `http://localhost:5173` and the backend API on `http://localhost:8080`.
