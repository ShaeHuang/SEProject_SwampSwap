describe("login page", () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.visit("/login");
  });

  it("shows validation feedback when the identifier is missing before submitting", () => {
    cy.intercept("POST", "**/api/login").as("loginRequest");

    cy.get("#password").type("Password!1");
    cy.contains("button", "Sign In").click();

    cy.contains("Username or email is required").should("be.visible");
    cy.location("pathname").should("eq", "/login");
    cy.get("@loginRequest.all").should("have.length", 0);
  });

  it("treats a whitespace-only identifier as missing before submitting", () => {
    cy.intercept("POST", "**/api/login").as("loginRequest");

    cy.get("#identifier").type("   ");
    cy.get("#password").type("Password!1");
    cy.contains("button", "Sign In").click();

    cy.contains("Username or email is required").should("be.visible");
    cy.location("pathname").should("eq", "/login");
    cy.get("@loginRequest.all").should("have.length", 0);
  });

  it("keeps password validation feedback for invalid passwords before submitting", () => {
    cy.intercept("POST", "**/api/login").as("loginRequest");

    cy.get("#identifier").type("swamper");
    cy.get("#password").type("short");
    cy.contains("button", "Sign In").click();

    cy.contains("Password must be at least 8 characters").should("be.visible");
    cy.location("pathname").should("eq", "/login");
    cy.get("@loginRequest.all").should("have.length", 0);
  });

  it("shows an error and keeps the user logged out when authentication fails", () => {
    cy.intercept("POST", "**/api/login", {
      statusCode: 400,
      body: { error: "incorrect username/password" },
    }).as("loginRequest");

    cy.get("#identifier").type("swamper");
    cy.get("#password").type("Password!1");
    cy.contains("button", "Sign In").click();

    cy.wait("@loginRequest")
      .its("request.body")
      .should("deep.equal", {
        username: "swamper",
        password: "Password!1",
      });

    cy.contains("incorrect username/password").should("be.visible");
    cy.location("pathname").should("eq", "/login");
    cy.window().its("localStorage.token").should("be.undefined");
  });

  it("trims surrounding whitespace from the identifier before submitting", () => {
    cy.intercept("POST", "**/api/login", {
      statusCode: 200,
      body: {
        "login successful, user token:": "fake-jwt-token",
      },
    }).as("loginRequest");

    cy.get("#identifier").type(" swamper ");
    cy.get("#password").type("Password!1");
    cy.contains("button", "Sign In").click();

    cy.wait("@loginRequest")
      .its("request.body")
      .should("deep.equal", {
        username: "swamper",
        password: "Password!1",
      });
  });

  it("stores the token and redirects home when username authentication succeeds", () => {
    cy.intercept("POST", "**/api/login", {
      statusCode: 200,
      body: {
        "login successful, user token:": "fake-jwt-token",
      },
    }).as("loginRequest");

    cy.get("#identifier").type("swamper");
    cy.get("#password").type("Password!1");
    cy.contains("button", "Sign In").click();

    cy.wait("@loginRequest")
      .its("request.body")
      .should("deep.equal", {
        username: "swamper",
        password: "Password!1",
      });

    cy.contains("Login successful").should("be.visible");
    cy.location("pathname").should("eq", "/");
    cy.window().its("localStorage.token").should("eq", "fake-jwt-token");
  });

  it("stores the token and redirects home when email authentication succeeds", () => {
    cy.intercept("POST", "**/api/login", {
      statusCode: 200,
      body: {
        "login successful, user token:": "fake-jwt-token",
      },
    }).as("loginRequest");

    cy.get("#identifier").type("swamper@ufl.edu");
    cy.get("#password").type("Password!1");
    cy.contains("button", "Sign In").click();

    cy.wait("@loginRequest")
      .its("request.body")
      .should("deep.equal", {
        username: "swamper@ufl.edu",
        password: "Password!1",
      });

    cy.contains("Login successful").should("be.visible");
    cy.location("pathname").should("eq", "/");
    cy.window().its("localStorage.token").should("eq", "fake-jwt-token");
  });
});
