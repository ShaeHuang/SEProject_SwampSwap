## ADDED Requirements

### Requirement: Login accepts username or email identifier
The login flow SHALL allow a user to submit a single identifier field that may contain either a username or an email address, together with a password, when authenticating.

#### Scenario: Username-based login submission
- **WHEN** a user enters a username in the login identifier field and submits a valid password
- **THEN** the frontend MUST allow submission without client-side email-format validation errors

#### Scenario: Email-based login submission
- **WHEN** a user enters an email address in the login identifier field and submits a valid password
- **THEN** the frontend MUST allow submission using the same login flow as username-based sign-in

### Requirement: Login identifier field is not email-constrained
The login page MUST present the sign-in identifier as a generic field rather than an email-only field, and client-side validation MUST require presence but MUST NOT reject values solely because they are not in email format.

#### Scenario: Non-email identifier is entered
- **WHEN** a user types a value that does not match email format into the login identifier field
- **THEN** the login page MUST NOT show an email-format validation error for that value

#### Scenario: Identifier is missing
- **WHEN** a user submits the login form with the identifier field left empty
- **THEN** the login page MUST block submission and show a required-field validation error

### Requirement: Frontend login request preserves backend compatibility
The frontend login request MUST serialize the entered identifier in the backend-supported login payload format so that username and email sign-in attempts use the same API endpoint without requiring a backend contract change.

#### Scenario: Identifier is sent to backend login endpoint
- **WHEN** a user submits the login form with any non-empty identifier and password
- **THEN** the frontend MUST send the identifier in the backend login request field expected by `POST /api/login`
