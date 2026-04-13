const profileFixture = {
  ID: 1,
  username: "testuser",
  email: "test@uf.edu",
  avatar: "",
  bio: "test bio",
  CreatedAt: "2026-04-01T12:00:00Z",
};

const mockProfileAndListings = (listings: unknown[] = [], profile = profileFixture) => {
  cy.intercept("GET", "**/api/user", {
    statusCode: 200,
    body: {
      message: "success",
      data: profile,
    },
  }).as("getCurrentUser");

  cy.intercept("GET", "**/api/user/listings", {
    statusCode: 200,
    body: {
      message: "success",
      data: listings,
    },
  }).as("getCurrentUserListings");
};

const visitHomeWithToken = () => {
  cy.visit("/", {
    onBeforeLoad(win) {
      win.localStorage.setItem("token", "fake-jwt-token");
    },
  });
};

describe("User Info page", () => {
  it("loads user info from backend", () => {
    mockProfileAndListings();

    visitHomeWithToken();
    cy.contains("User Information").click();

    cy.wait("@getCurrentUser");
    cy.wait("@getCurrentUserListings");

    cy.contains("testuser");
    cy.contains("test@uf.edu");
  });

  it("redirects to login when no token exists", () => {
    cy.clearLocalStorage();
    cy.visit("/");
    cy.contains("User Information").click();
    cy.location("pathname").should("eq", "/login");
  });

  it("shows empty state when user has no listings", () => {
    mockProfileAndListings([]);

    visitHomeWithToken();
    cy.contains("User Information").click();

    cy.wait("@getCurrentUser");
    cy.wait("@getCurrentUserListings");
    cy.contains("You have not posted any items yet.").should("be.visible");
  });

  it("renders listings returned by backend", () => {
    mockProfileAndListings([
      {
        ID: 101,
        CreatedAt: "2026-04-10T10:00:00Z",
        UpdatedAt: "2026-04-10T10:00:00Z",
        DeletedAt: null,
        title: "Used Textbook",
        description: "Calculus book in good condition",
        price: 25,
        category: "Digital Product",
        condition: "Used",
        user_id: 1,
        status: "available",
      },
      {
        ID: 102,
        CreatedAt: "2026-04-11T10:00:00Z",
        UpdatedAt: "2026-04-11T10:00:00Z",
        DeletedAt: null,
        title: "Desk Lamp",
        description: "Works perfectly",
        price: 15,
        category: "Furniture",
        condition: "Like new",
        user_id: 1,
        status: "sold",
      },
    ]);

    visitHomeWithToken();
    cy.contains("User Information").click();

    cy.wait("@getCurrentUser");
    cy.wait("@getCurrentUserListings");

    cy.contains("Used Textbook").should("be.visible");
    cy.contains("Desk Lamp").should("be.visible");
    cy.contains("Items Posted").prev().should("contain", "2");
    cy.contains("Items Sold").prev().should("contain", "1");
  });

  it("shows error UI when profile loading fails", () => {
    cy.intercept("GET", "**/api/user", {
      statusCode: 500,
      body: { error: "Failed to fetch current user" },
    }).as("getCurrentUserFail");

    cy.intercept("GET", "**/api/user/listings", {
      statusCode: 200,
      body: { message: "success", data: [] },
    }).as("getCurrentUserListings");

    visitHomeWithToken();
    cy.contains("User Information").click();

    cy.wait("@getCurrentUserFail");
    cy.contains("We couldn't load your profile").should("be.visible");
    cy.contains("Failed to fetch current user").should("be.visible");
  });

  it("updates profile photo via PUT /api/user", () => {
    mockProfileAndListings();

    cy.intercept("PUT", "**/api/user", (req) => {
      const avatar = req.body.avatar as string;
      req.reply({
        statusCode: 200,
        body: {
          message: "User updated successfully",
          user: {
            ID: 1,
            username: "testuser",
            email: "test@uf.edu",
            avatar,
            bio: "test bio",
            CreatedAt: "2026-04-01T12:00:00Z",
          },
        },
      });
    }).as("updateProfile");

    visitHomeWithToken();
    cy.contains("User Information").click();

    cy.wait("@getCurrentUser");
    cy.wait("@getCurrentUserListings");

    cy.contains("Edit Profile").click();
    cy.get('button[aria-label^="Select "]').eq(1).click();
    cy.contains("button", "Confirm").click();

    cy.wait("@updateProfile")
      .its("request.body.avatar")
      .should("be.a", "string")
      .and("not.be.empty");
  });
});