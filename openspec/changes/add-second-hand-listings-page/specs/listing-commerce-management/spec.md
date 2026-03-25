## ADDED Requirements

### Requirement: Listings API supports filter and sort parameters
The listings read API SHALL support query parameters for filtering and sorting marketplace results.

#### Scenario: API filters listings by search term
- **WHEN** a client sends a public listings request with a supported search query
- **THEN** the API returns only listings whose searchable fields match that query

#### Scenario: API sorts listings by supported order
- **WHEN** a client sends a public listings request with a supported sort value
- **THEN** the API returns listings in the requested order

### Requirement: Listings have explicit availability state
The system SHALL persist listing availability so the frontend can distinguish items that can still be bought from items that are sold.

#### Scenario: Existing listings migrate to available
- **WHEN** the updated listing schema is applied to existing data
- **THEN** previously created listings default to an available state

#### Scenario: Listing read includes availability
- **WHEN** a client reads listings or a listing detail
- **THEN** the API response includes the listing availability state needed by the frontend

### Requirement: Authenticated users can buy available listings exactly once
The system SHALL provide an authenticated buy operation for listings that are still available.

#### Scenario: Buy succeeds for available listing
- **WHEN** an authenticated user buys a listing that is currently available
- **THEN** the API marks the listing as sold, associates the buyer if tracked, and returns the updated listing state

#### Scenario: Buy fails for unavailable listing
- **WHEN** an authenticated user buys a listing that is already sold or unavailable
- **THEN** the API rejects the request with a client error indicating that the item cannot be purchased

#### Scenario: Owner cannot buy own listing
- **WHEN** the listing owner attempts to buy their own listing
- **THEN** the API rejects the request with a client error
