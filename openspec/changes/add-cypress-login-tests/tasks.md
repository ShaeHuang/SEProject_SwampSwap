## 1. Cypress Setup

- [x] 1.1 Add Cypress as a frontend development dependency and define npm scripts for opening and running the E2E suite.
- [x] 1.2 Create the baseline Cypress configuration, support files, and folder structure needed to run browser tests against the local Vite app.

## 2. Login Flow Coverage

- [x] 2.1 Implement a Cypress spec for `/login` that verifies client-side validation feedback for invalid email or password input.
- [x] 2.2 Implement a Cypress spec for `/login` that verifies failed authentication handling using a controlled error response and confirms no token is stored.
- [x] 2.3 Implement a Cypress spec for `/login` that verifies successful authentication handling using a controlled success response, including token persistence and redirect to `/`.
- [x] 2.4 Add any minimal selector or testability adjustments required to keep the login tests stable without changing user-facing behavior.

## 3. Developer Workflow Verification

- [x] 3.1 Document the local assumptions for running the Cypress login suite alongside the frontend app.
- [x] 3.2 Run the login-focused Cypress suite and fix any setup issues discovered during execution.
