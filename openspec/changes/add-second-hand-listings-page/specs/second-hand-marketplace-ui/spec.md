## ADDED Requirements

### Requirement: Users can browse and refine second-hand listings
The system SHALL provide a second-hand marketplace page that displays public listings and allows users to filter and sort the visible results.

#### Scenario: Marketplace page loads listings
- **WHEN** a user opens the marketplace route
- **THEN** the system displays a list of listings returned by the public listings API

#### Scenario: User filters listings by keyword
- **WHEN** a user enters a search term in the marketplace filter controls
- **THEN** the system refreshes the displayed results to show only listings matching the filter criteria

#### Scenario: User changes listing sort order
- **WHEN** a user selects a supported sort option
- **THEN** the system refreshes the displayed results in the selected order

### Requirement: Users can view listing details
The system SHALL provide a detail view for each listing that shows complete listing information and available actions.

#### Scenario: User opens a listing detail page
- **WHEN** a user selects a listing from the marketplace page
- **THEN** the system navigates to a listing detail view showing title, description, price, and seller-related context returned by the API

#### Scenario: Listing is unavailable
- **WHEN** a user opens a listing that is marked unavailable or sold
- **THEN** the detail view indicates that the item is no longer available for purchase

### Requirement: Authenticated users can sell items from the frontend
The system SHALL provide a sell flow that lets authenticated users submit a new second-hand listing.

#### Scenario: Authenticated user submits a listing
- **WHEN** an authenticated user completes the sell form with valid title, description, and price values
- **THEN** the system creates the listing through the protected API and returns the user to a refreshed marketplace experience

#### Scenario: Unauthenticated user attempts to sell
- **WHEN** a user without a valid session tries to open or submit the sell flow
- **THEN** the system blocks the action and prompts the user to authenticate

### Requirement: Authenticated users can initiate a buy action from listing details
The system SHALL provide a buy action on available listing detail views for authenticated users.

#### Scenario: Authenticated user buys an available listing
- **WHEN** an authenticated user confirms the buy action for an available listing
- **THEN** the system sends the buy request, shows a success state, and updates the listing UI to reflect that the item is no longer available

#### Scenario: Unauthenticated user attempts to buy
- **WHEN** a user without a valid session selects the buy action
- **THEN** the system blocks the action and prompts the user to authenticate
