## Context

The current login page is implemented in the frontend as an email-specific form: it stores the identifier in `email` state, renders the field with `type="email"`, and uses `validateEmail()` before submitting. However, the frontend API wrapper already serializes that value into a `username` JSON field when calling `POST /api/login`, and the backend login handler binds only `username` plus `password`. The main constraint is preserving compatibility with the existing backend contract while removing unnecessary frontend restrictions that block username-based sign-in.

## Goals / Non-Goals

**Goals:**
- Let users submit either a username or an email address from the login page.
- Remove email-format enforcement from the login UI while keeping required-field and password validation intact.
- Make the frontend naming clearer so the UI state, validation logic, and request payload all describe the field as a generic login identifier.
- Keep existing backend login behavior working without requiring a backend migration.
- Update automated verification so both username and email inputs remain supported.

**Non-Goals:**
- Changing how the backend authenticates credentials internally.
- Adding separate username and email fields to the login form.
- Expanding registration or profile flows to collect or validate additional identity fields.
- Redesigning the login page beyond copy and field metadata needed to support the new identifier semantics.

## Decisions

Use a single identifier field in the frontend and treat it as freeform text rather than an email-only input.
Rationale: users only need one credential entry point, and the backend already expects a generic `username` field. Replacing email-specific validation and input metadata is the smallest change that unlocks both login modes.
Alternative considered: branching validation based on whether the identifier contains `@`. This would still preserve email-specific restrictions for some inputs and adds complexity without improving the backend contract.

Rename frontend login request types and local state away from `email` toward `identifier` (or equivalent), while continuing to send the identifier through the existing backend `username` property.
Rationale: this aligns the frontend contract with actual behavior and reduces future confusion in page logic, tests, and API wrappers.
Alternative considered: keeping the variable name `email` and only removing validation. That would work functionally but would leave the code misleading and increase the chance of future regressions.

Update tests to cover both identifier styles and absence of email-only validation.
Rationale: current and recently added login coverage assumes email-centric behavior. Explicit tests for username and email submissions make the intended behavior durable.
Alternative considered: relying on manual QA. That would be faster short-term but too fragile for an auth entry point that is actively changing.

## Risks / Trade-offs

- Accepting freeform identifier input may allow obviously malformed text through the client → Mitigation: keep only presence validation on the identifier field and rely on backend authentication failure for invalid credentials.
- Renaming frontend login fields could create inconsistencies with existing tests or mocks → Mitigation: update API wrapper types and login tests together so the serialized backend payload remains stable.
- Existing Cypress validation coverage may fail once email-format checks are removed → Mitigation: replace email-specific validation assertions with required-field and successful username/email submission scenarios.

## Migration Plan

No backend migration is required if the frontend continues posting the identifier as `username`. Rollout consists of updating the frontend form, request typing, and automated coverage together. Rollback is straightforward: revert the frontend login field and test changes if unexpected auth regressions appear.

## Open Questions

- Should the login label explicitly say `Username or Email`, or should product copy use a more generic term such as `Email or username` to match existing UX conventions elsewhere in the app?
