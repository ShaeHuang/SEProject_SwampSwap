describe("User Info page", () => {
  beforeEach(() => {
    cy.visit("http://localhost:5173/user");
  });

  it("loads initial user info from backend", () => {
    cy.contains("testuser");
    cy.contains("test@uf.edu");
  });

  it("displays user profile information correctly", () => {
    cy.contains("Joined").should("be.visible");
    cy.contains("Items Posted").should("be.visible");
    cy.contains("Items Sold").should("be.visible");
    cy.get("img").should("have.attr", "alt", "testuser");
  });

  it("searches for a different user by ID", () => {
    cy.intercept("GET", "**/api/user/*").as("getUserInfo");

    cy.get('input[placeholder="Enter User ID"]').clear().type("2");
    cy.contains("button", "Search").click();

    cy.wait("@getUserInfo");
    cy.get('input[placeholder="Enter User ID"]').should("have.value", "2");
  });

  it("updates user info when searching with different ID", () => {
    cy.intercept("GET", "**/api/user/1", {
      statusCode: 200,
      body: {
        id: "1",
        username: "testuser",
        email: "test@uf.edu",
        avatar: null,
        joinedAt: "2024-01-01T00:00:00Z",
        bio: "Test bio",
        stats: { itemsPosted: 5, itemsSold: 2 },
      },
    });
    
    cy.intercept("GET", "**/api/user/2", {
      statusCode: 200,
      body: {
        id: "2",
        username: "otheruser",
        email: "other@uf.edu",
        avatar: null,
        joinedAt: "2024-02-01T00:00:00Z",
        bio: "Other bio",
        stats: { itemsPosted: 10, itemsSold: 5 },
      },
    }).as("getUser2");

    cy.get('input[placeholder="Enter User ID"]').clear().type("2");
    cy.contains("button", "Search").click();

    cy.wait("@getUser2");
    cy.contains("otheruser").should("be.visible");
    cy.contains("other@uf.edu").should("be.visible");
  });

  it("shows error message when user not found", () => {
    cy.intercept("GET", "**/api/user/999", {
      statusCode: 404,
      body: { error: "User not found" },
    }).as("getUserNotFound");

    cy.get('input[placeholder="Enter User ID"]').clear().type("999");
    cy.contains("button", "Search").click();

    cy.wait("@getUserNotFound");
    cy.contains("User not found").should("be.visible");
  });

  it("disables search button while loading", () => {
    cy.get('input[placeholder="Enter User ID"]').clear().type("2");
    cy.contains("button", "Search").click();

    cy.contains("button", "Search").should("be.disabled");
  });

  it("displays contact information", () => {
    cy.contains("Contact Information").should("be.visible");
    cy.contains("Email").should("be.visible");
    cy.contains("test@uf.edu").should("be.visible");
  });

  it("back button navigates to previous page", () => {
    cy.contains("button", "← Back").click();
    cy.location("pathname").should("not.equal", "/user");
  });

  it("handles empty user ID input", () => {
    cy.get('input[placeholder="Enter User ID"]').clear();
    cy.contains("button", "Search").click();
  });

  it("displays user stats correctly", () => {
    cy.contains("Items Posted").should("be.visible");
    cy.contains("Items Sold").should("be.visible");
    cy.get(".text-2xl.font-bold.text-primary").should("have.length.greaterThan", 0);
  });
});