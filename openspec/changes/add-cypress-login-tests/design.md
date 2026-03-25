## Context

The frontend is a Vite + React application with a dedicated `/login` page that validates email and password input, calls `POST /api/login`, stores the returned token in `localStorage`, shows toast feedback, and navigates to `/` on success. The backend is a Gin service on `http://localhost:8080` with the login endpoint already exposed, but there is no existing browser automation framework or seeded test-user workflow in the repository. Because the target is currently uncommitted auth work, the design needs to add coverage quickly without coupling the tests to a mutable local database state.

## Goals / Non-Goals

**Goals:**
- Add Cypress to the frontend workspace with a minimal configuration that can run against the local Vite app.
- Verify the current login behavior end to end from the browser perspective: client-side validation, failed authentication handling, successful authentication handling, token persistence, and redirect behavior.
- Keep the initial test suite deterministic and easy for contributors to run while auth work is still evolving.

**Non-Goals:**
- End-to-end coverage for registration, protected routes, or other authenticated flows.
- Full CI pipeline integration in this change.
- Database seeding or a comprehensive backend test harness for Cypress.

## Decisions

Use Cypress in the `frontend` workspace with dedicated npm scripts for interactive and headless execution.
Rationale: the repo currently has no browser test runner, and Cypress gives fast feedback for form-heavy auth flows with low setup overhead in a Vite app.
Alternative considered: Playwright. It is also viable, but the requested change is specifically Cypress-focused and does not need broader cross-browser coverage yet.

Drive the login scenarios through `cy.intercept()` for the authentication request instead of depending on a real seeded backend user.
Rationale: the current backend uses a local SQLite database and there is no committed seeding or reset flow, so backend-dependent E2E tests would be brittle across machines. Intercepted responses still validate that the login page sends the request, handles backend errors, persists the returned token, and redirects correctly.
Alternative considered: running against the live backend. This would increase confidence in API integration, but it would require stable seeded credentials and test-environment reset mechanics that do not exist yet.

Prefer stable semantic selectors already present on the page, and add test-specific selectors only if the existing structure proves too brittle.
Rationale: the login page already exposes stable ids and visible button text for the email field, password field, and submit action. This keeps the production code changes minimal.
Alternative considered: adding `data-testid` attributes up front. This may become useful later, but it is not required for the initial login coverage.

## Risks / Trade-offs

- Mocked network responses may miss backend contract regressions -> Mitigation: keep the spec focused on frontend login behavior and document live-backend smoke coverage as future work.
- Toast rendering can be timing-sensitive in browser tests -> Mitigation: assert on the visible error or success message after the triggering action and avoid unnecessary timing assumptions.
- Redirect assertions may race with async login handling -> Mitigation: wait on the intercepted login request and assert the final URL after the response completes.
- Cypress setup adds maintenance overhead to a repo that currently has no E2E tooling -> Mitigation: keep the configuration minimal and scope the initial suite to the single highest-value auth flow.
