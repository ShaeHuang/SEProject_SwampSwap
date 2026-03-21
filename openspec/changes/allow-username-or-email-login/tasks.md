## 1. Login Form Update

- [x] 1.1 Replace email-specific login page state, labels, placeholders, and input metadata with a generic username-or-email identifier field.
- [x] 1.2 Remove client-side email-format validation from the login form while preserving required identifier and password validation behavior.

## 2. Frontend Auth Contract Alignment

- [x] 2.1 Rename or normalize frontend login request types and payload construction to represent a generic identifier while preserving the backend `username` request field.
- [x] 2.2 Verify the login success and failure flows still behave correctly after the identifier-field refactor.

## 3. Verification Coverage

- [x] 3.1 Update or add automated login tests to cover successful submission with both username and email identifiers.
- [x] 3.2 Update or add automated login tests to confirm non-email identifiers are not blocked by client-side validation and that empty identifiers still fail validation.
