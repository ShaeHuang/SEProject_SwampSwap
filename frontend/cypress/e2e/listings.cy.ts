type Listing = {
  ID: number;
  CreatedAt: string;
  UpdatedAt: string;
  DeletedAt: string | null;
  title: string;
  description: string;
  price: number;
  category:
    | "Digital Product"
    | "Furniture"
    | "Cooking"
    | "Clothing"
    | "Sports"
    | "Cars";
  condition: "New" | "Like new" | "Open box" | "Gently used" | "Used" | "Fair";
  user_id: number;
  status: "available" | "sold";
};

const baseListings: Listing[] = [
  {
    ID: 1,
    CreatedAt: "2026-03-20T12:00:00Z",
    UpdatedAt: "2026-03-20T12:00:00Z",
    DeletedAt: null,
    title: "Vintage Denim Jacket",
    description: "Great for cooler evenings and lightly worn.",
    price: 35,
    category: "Clothing",
    condition: "Gently used",
    user_id: 7,
    status: "available",
  },
  {
    ID: 2,
    CreatedAt: "2026-03-19T10:00:00Z",
    UpdatedAt: "2026-03-19T10:00:00Z",
    DeletedAt: null,
    title: "Digital Camera",
    description: "Compact camera with charger and carrying case.",
    price: 120,
    category: "Digital Product",
    condition: "Like new",
    user_id: 8,
    status: "available",
  },
  {
    ID: 3,
    CreatedAt: "2026-03-18T14:00:00Z",
    UpdatedAt: "2026-03-18T14:00:00Z",
    DeletedAt: null,
    title: "Cooking Pot Set",
    description: "Non-stick pots perfect for apartment cooking.",
    price: 48,
    category: "Cooking",
    condition: "Used",
    user_id: 9,
    status: "sold",
  },
];

const currentUserResponse = {
  message: "success",
  data: {
    ID: 11,
    username: "swamper",
  },
};

const visitListingsPage = ({ loggedIn = false } = {}) => {
  cy.intercept("GET", "**/api/listings", {
    statusCode: 200,
    body: baseListings,
  }).as("getListings");

  if (loggedIn) {
    cy.intercept("GET", "**/api/user", {
      statusCode: 200,
      body: currentUserResponse,
    }).as("getCurrentUser");
  }

  cy.visit("/listings", {
    onBeforeLoad(window) {
      window.localStorage.clear();

      if (loggedIn) {
        window.localStorage.setItem("token", "fake-jwt-token");
      }
    },
  });

  cy.wait("@getListings")
    .its("request.url")
    .should("match", /\/api\/listings$/);
};

describe("listings page", () => {
  it("shows listings, visible categories, and the login button for guests", () => {
    visitListingsPage();

    cy.contains("SwampSwap Market").should("be.visible");
    cy.contains("button", "All").should("be.visible");
    cy.contains("button", "Digital Product").should("be.visible");
    cy.contains("button", "Cooking").should("be.visible");
    cy.contains("button", "Clothing").should("be.visible");
    cy.contains("button", "Sports").should("be.visible");
    cy.contains("button", "Cars").should("be.visible");
    cy.contains("button", "Log In").should("be.visible");

    cy.contains("Great for cooler evenings and lightly worn.").should("be.visible");
    cy.contains("Compact camera with charger and carrying case.").should("be.visible");
    cy.contains("Non-stick pots perfect for apartment cooking.").should("be.visible");
  });

  it("filters listings by the selected category tag", () => {
    visitListingsPage();

    cy.contains("button", "Cooking").click();

    cy.wait("@getListings")
      .its("request.url")
      .should("match", /\/api\/listings$/);

    cy.location("search").should("include", "category=Cooking");
    cy.get("#listing-search").should("have.value", "");
    cy.contains("Non-stick pots perfect for apartment cooking.").should("be.visible");
    cy.contains("Great for cooler evenings and lightly worn.").should("not.exist");
    cy.contains("Compact camera with charger and carrying case.").should("not.exist");
  });

  it("clears the category filter when All is selected", () => {
    visitListingsPage();

    cy.contains("button", "Cooking").click();
    cy.location("search").should("include", "category=Cooking");
    cy.contains("Great for cooler evenings and lightly worn.").should("not.exist");

    cy.contains("button", "All").click();

    cy.location("search").should("not.include", "category=");
    cy.contains("Great for cooler evenings and lightly worn.").should("be.visible");
    cy.contains("Compact camera with charger and carrying case.").should("be.visible");
    cy.contains("Non-stick pots perfect for apartment cooking.").should("be.visible");
  });

  it("updates sort and status controls while continuing to use the public listings endpoint", () => {
    visitListingsPage();

    cy.get("#listing-sort").select("Price high to low");
    cy.wait("@getListings")
      .its("request.url")
      .should("match", /\/api\/listings$/);
    cy.location("search").should("include", "sort=price_desc");
    cy.get("#listing-sort").should("have.value", "price_desc");

    cy.get("#listing-status").select("Sold only");
    cy.wait("@getListings")
      .its("request.url")
      .should("match", /\/api\/listings$/);
    cy.location("search").should("include", "status=sold");
    cy.get("#listing-status").should("have.value", "sold");

    cy.contains("button", "Reset").click();
    cy.wait("@getListings")
      .its("request.url")
      .should("match", /\/api\/listings$/);
    cy.location("search").should("eq", "");
    cy.get("#listing-sort").should("have.value", "latest");
    cy.get("#listing-status").should("have.value", "all");
    cy.get("#listing-search").should("have.value", "");
  });

  it("redirects guests to login when they try to buy from the listing grid", () => {
    visitListingsPage();

    cy.contains("button", "Buy").first().click();

    cy.contains("Please log in before buying an item.").should("be.visible");
    cy.location("pathname").should("eq", "/login");
  });

  it("lets an authenticated user create a new listing through the listings API", () => {
    const createdListing: Listing = {
      ID: 44,
      CreatedAt: "2026-03-21T11:00:00Z",
      UpdatedAt: "2026-03-21T11:00:00Z",
      DeletedAt: null,
      title: "Car Phone Mount",
      description: "Easy dashboard mount for campus commutes.",
      price: 18,
      category: "Cars",
      condition: "Open box",
      user_id: 11,
      status: "available",
    };

    visitListingsPage({ loggedIn: true });

    cy.wait("@getCurrentUser");
    cy.contains("swamper").should("be.visible");

    cy.intercept("POST", "**/api/listings", (request) => {
      expect(request.headers.authorization).to.eq("Bearer fake-jwt-token");
      expect(request.body).to.deep.equal({
        title: createdListing.title,
        description: createdListing.description,
        price: createdListing.price,
        category: createdListing.category,
        condition: createdListing.condition,
      });

      request.reply({
        statusCode: 201,
        body: createdListing,
      });
    }).as("createListing");

    cy.contains("button", "Sell an Item").click();
    cy.get("#sell-title").type(createdListing.title);
    cy.get("#sell-category").select(createdListing.category);
    cy.get("#sell-description").type(createdListing.description);
    cy.get("#sell-condition").select(createdListing.condition);
    cy.get("#sell-price").type(String(createdListing.price));
    cy.contains("button", "Post Listing").click();

    cy.wait("@createListing");
    cy.contains("Your item is now live.").should("be.visible");
    cy.contains(createdListing.category).should("be.visible");
    cy.contains(createdListing.condition).should("be.visible");
    cy.contains(createdListing.description).should("be.visible");
  });
});

describe("listing detail page", () => {
  it("loads the listing detail and buys through the listings API", () => {
    const updatedListing: Listing = {
      ...baseListings[1],
      status: "sold",
    };

    cy.intercept("GET", "**/api/listings/2", {
      statusCode: 200,
      body: baseListings[1],
    }).as("getListingDetail");

    cy.intercept("PUT", "**/api/listings/2", (request) => {
      expect(request.headers.authorization).to.eq("Bearer fake-jwt-token");
      expect(request.body).to.deep.equal({ status: "sold" });

      request.reply({
        statusCode: 200,
        body: updatedListing,
      });
    }).as("buyListing");

    cy.visit("/listings/2", {
      onBeforeLoad(window) {
        window.localStorage.setItem("token", "fake-jwt-token");
      },
    });

    cy.wait("@getListingDetail");
    cy.contains("Digital Camera").should("be.visible");
    cy.contains("Buy Now").click();

    cy.wait("@buyListing");
    cy.contains("Item purchased successfully.").should("be.visible");
    cy.contains("Item Sold").should("be.visible");
    cy.contains("This item is no longer available.").should("be.visible");
  });

  it("surfaces the backend authorization error when a protected buy request is rejected", () => {
    cy.intercept("GET", "**/api/listings/1", {
      statusCode: 200,
      body: baseListings[0],
    }).as("getListingDetail");

    cy.intercept("PUT", "**/api/listings/1", {
      statusCode: 401,
      body: { error: "Not authorized to update this listing." },
    }).as("buyListing");

    cy.visit("/listings/1", {
      onBeforeLoad(window) {
        window.localStorage.setItem("token", "fake-jwt-token");
      },
    });

    cy.wait("@getListingDetail");
    cy.contains("Buy Now").click();

    cy.wait("@buyListing");
    cy.contains("Not authorized to update this listing.").should("be.visible");
    cy.contains("Buy Now").should("be.visible");
  });

  it("sends guests to login when they try to buy from the detail page", () => {
    cy.intercept("GET", "**/api/listings/1", {
      statusCode: 200,
      body: baseListings[0],
    }).as("getListingDetail");

    cy.visit("/listings/1");

    cy.wait("@getListingDetail");
    cy.contains("Buy Now").click();

    cy.contains("Please log in before buying an item.").should("be.visible");
    cy.location("pathname").should("eq", "/login");
  });
});
