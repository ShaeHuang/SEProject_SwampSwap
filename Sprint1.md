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
(TBD by backend team)

# Planned Issues
Frontend: 
- Frontend project initialization: set up the React/Vite dev workflow, repo structure, and shared UI setup so teammates can build consistently.
- Implement landing/home page UI and basic navigation between pages.
- Build authentication UIs (register + login) and connect them via routing.
- Build User Information (profile) page UI (mocked data is acceptable for Sprint 1).
- (Planned next / stretch) Wire profile buttons (Edit Profile / View Items) to real pages and connect to backend APIs when endpoints are ready.

Backend: ...

# Completed Tasks
Frontend: 
- Set up frontend initialization and local dev workflow (install deps, run dev server, consistent project scaffold).
- Implemented a landing/home page with navigation to key features/pages.
- Implemented the User Information (profile) page UI using mocked data for Sprint 1 demo:
  - Displays avatar, name, email, bio, joined date
  - Displays basic stats (items posted / items sold)
  - Includes a demo switch (User 1 / User 2) to show multiple mocked profiles
- Recorded the frontend demo video showing the current UI and page navigation.


Backend: ...

# Incomplete Tasks
Frontend: 
- “Edit Profile” and “View Items” buttons are currently UI placeholders and not wired to real pages yet (User Stories #9–#10).
- User profile data is mocked for Sprint 1; backend user info endpoint integration is planned once the API is available.
- Auth UI integration with real backend auth/JWT flow will be completed in the next sprint.

Why incomplete (Frontend):
- Sprint 1 focused on establishing a stable frontend foundation (scaffold + routing + core pages) to unblock parallel development and enable Sprint 2 API integration.

Backend: ...
