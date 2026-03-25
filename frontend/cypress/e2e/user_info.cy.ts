describe("User Info page", () => {
  it("loads user info from backend", () => {
    cy.visit("http://localhost:5173/");
    cy.contains("User Information").click();

    cy.contains("testuser");
    cy.contains("test@uf.edu");
  });
});