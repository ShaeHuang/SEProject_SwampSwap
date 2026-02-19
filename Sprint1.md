# User Stories

## Frontend (10)
1. As a user, I want to sign up, so that I can create an account.
2. As a user, I want to log in, so that I can access my account securely.
3. As a user, I want a consistent navigation and page layout, so that I can move between features easily.
4. As a user, I want clear loading / empty / error states, so that I understand what’s happening.
5. As a user, I want accessible and friendly forms (validation + helpful messages), so that I can complete actions without confusion.
6. As a user, I want to view my profile information (avatar, name, email, bio, join date), so that I can verify my account details.
7. As a user, I want to see my activity stats (items posted / items sold), so that I can track my marketplace activity.
8. As a user, I want to switch between demo users (mock profiles), so that I can preview the UI with different data.
9. As a user, I want an “Edit Profile” entry point, so that I can update my profile information.
10. As a user, I want a “View Items” entry point from my profile, so that I can quickly access my listings.

## Backend (10)
11. As a backend system, I want to handle user registration and login so that people can use our website.
12. As a backend system, I want the passwords of users to be stored securely so that their accounts are safe from potential adversaries.
13. As a backend system, I want to handle secure password changes and resets so that users can recover accounts and update credentials safely.
14. As a backend system, I want frequent human users of the website to be visibly verified to make scams harder to perform.
15. As a backend system, I want the API to be as performant as possible while still serving all needed functions to minimize lag for the end users.
16. As a backend system, I want to provide full CRUD operations for swap listings, so that users can create, view, edit and delete what they're offering. 
17. As a backend system, I want to support search and filtering on listings, so that the frontend can let users narrow down results.
18. As a backend system, I want to handle image uploads for listings, so that users can attach photos to what they're swapping.
19. As a backend system, I want to provide a messaging API between users, so that they can coordinate a swap after showing interest
20. As a backend system, I want to provide user profile retrieval and editing capabilities, so that users can view and update their account information.


# Planned Issues
Frontend: 
- Frontend project initialization: set up the React/Vite dev workflow, repo structure, and shared UI setup so teammates can build consistently.
- Implement landing/home page UI and basic navigation between pages.
- Build authentication UIs (register + login) and connect them via routing.
- Build User Information (profile) page UI (mocked data is acceptable for Sprint 1).
- (Planned next / stretch) Wire profile buttons (Edit Profile / View Items) to real pages and connect to backend APIs when endpoints are ready.

Backend: 
- Get the login API calls working with the frontend.
- Make a SQLite table for the listings with the username being the key.
- Create an API call for users to add/delete listings.
- Add functionality for users to change their password in case it is lost.
- Expand the User schema to support a profile with the appropriate REST API calls.

# Completed Tasks
Frontend: 
- Set up frontend initialization and local dev workflow (install deps, run dev server, consistent project scaffold).
- Implemented a landing/home page with navigation to key features/pages.
- Implemented the User Information (profile) page UI using mocked data for Sprint 1 demo:
  - Displays avatar, name, email, bio, joined date
  - Displays basic stats (items posted / items sold)
  - Includes a demo switch (User 1 / User 2) to show multiple mocked profiles
- Recorded the frontend demo video showing the current UI and page navigation.


Backend: 
- Set up a basic Go web server using Gin for routing and GORM plus SQLite for the database.
- Created 3 REST API routes for the user database: one for registering, one for logging in, and one for retrieving user information.
- Implemented hashing and JSON Web Tokens (JWTs) to make password storage and processing secure.

# Incomplete Tasks
Frontend: 
- “Edit Profile” and “View Items” buttons are currently UI placeholders and not wired to real pages yet (User Stories #9–#10).
- User profile data is mocked for Sprint 1; backend user info endpoint integration is planned once the API is available.
- Auth UI integration with real backend auth/JWT flow will be completed in the next sprint.

Why incomplete (Frontend):
- Sprint 1 focused on establishing a stable frontend foundation (scaffold + routing + core pages) to unblock parallel development and enable Sprint 2 API integration.

Backend:
- User schema is rather basic currently, not supporting anything with listings yet.
- There is no connection to the frontend website yet; the API is self-contained.

Why incomplete (Backend):
- We wanted to get a solid bedrock of code that is easy to expand upon rather than brute forcing it by hard coding everything, which will waste time in the long run.
