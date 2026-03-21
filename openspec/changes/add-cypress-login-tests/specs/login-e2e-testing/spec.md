## ADDED Requirements

### Requirement: Cypress login suite is runnable from the frontend workspace
The project SHALL provide a Cypress-based end-to-end test suite in the frontend workspace that exercises the login flow from a browser context.

#### Scenario: Developer runs the login E2E suite
- **WHEN** a developer runs the documented frontend Cypress command against the local app
- **THEN** Cypress executes the login-focused browser tests without requiring manual browser interaction

### Requirement: Login validation is verified before submission
The Cypress login suite SHALL verify that invalid login input is rejected with visible validation feedback before a successful authentication request is completed.

#### Scenario: Invalid email or password is entered
- **WHEN** the test submits the login form with invalid credentials that fail client-side validation
- **THEN** the page shows validation feedback for the invalid fields and the user remains on `/login`

### Requirement: Authentication failure handling is verified
The Cypress login suite SHALL verify that a failed login attempt surfaces an error to the user and does not authenticate the session.

#### Scenario: Backend rejects the login request
- **WHEN** the test submits valid-looking credentials and the login request returns an authentication error
- **THEN** the page shows a login failure message, does not store an auth token, and remains on `/login`

### Requirement: Successful authentication behavior is verified
The Cypress login suite SHALL verify that a successful login stores the returned token and navigates the user away from the login page.

#### Scenario: Login succeeds
- **WHEN** the test submits valid credentials and the login request succeeds
- **THEN** the auth token is stored in browser `localStorage` and the user is redirected to `/`
