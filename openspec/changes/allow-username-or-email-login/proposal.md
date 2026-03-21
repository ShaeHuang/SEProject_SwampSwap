## Why

The login page currently treats the identifier as an email address and blocks submission unless it matches email format, even though the backend login API accepts a generic `username` field. This mismatch prevents users from signing in with usernames and makes the frontend contract more restrictive than the backend behavior.

## What Changes

- Update the login experience to accept a generic login identifier instead of enforcing email-only input on the client.
- Rename or normalize frontend login request data so the UI, validation logic, and API call all consistently represent a username-or-email identifier.
- Adjust login page copy, field metadata, and validation behavior so users can submit either a username or an email address with the same password flow.
- Add or update verification coverage for the login page so username-based and email-based sign-in attempts do not regress.

## Capabilities

### New Capabilities
- `flexible-login-identifier`: The login flow accepts either a username or an email address as the user identifier without client-side email-format enforcement.

### Modified Capabilities
- None.

## Impact

- Affected frontend code: `frontend/src/pages/Login/index.tsx`, `frontend/src/api/auth.ts`, and any shared validation helpers or tests used by the login flow.
- Affected backend contract usage: `POST /api/login` request payload handling from the frontend, while preserving the existing backend `username` request field unless implementation decides to extend the API.
- Affected automated coverage: existing Cypress login coverage and any future frontend tests that assume the login field is email-only.
