type Listing = {
  id: number;
  created_at: string;
  updated_at: string;
  title: string;
  description: string;
  price: number;
  user_id: number;
  status: "available" | "sold";
  buyer_id: number | null;
  seller_username: string;
};

const baseListings: Listing[] = [
  {
    id: 1,
    created_at: "2026-03-20T12:00:00Z",
    updated_at: "2026-03-20T12:00:00Z",
    title: "Vintage Denim Jacket",
    description: "Great for cooler evenings and lightly worn.",
    price: 35,
    user_id: 7,
    status: "available",
    buyer_id: null,
    seller_username: "mia",
  },
  {
    id: 2,
    created_at: "2026-03-19T10:00:00Z",
    updated_at: "2026-03-19T10:00:00Z",
    title: "Digital Camera",
    description: "Compact camera with charger and carrying case.",
    price: 120,
    user_id: 8,
    status: "available",
    buyer_id: null,
    seller_username: "lucas",
  },
  {
    id: 3,
    created_at: "2026-03-18T14:00:00Z",
    updated_at: "2026-03-18T14:00:00Z",
    title: "Cooking Pot Set",
    description: "Non-stick pots perfect for apartment cooking.",
    price: 48,
    user_id: 9,
    status: "sold",
    buyer_id: 5,
    seller_username: "ava",
  },
];

const currentUserResponse = {
  message: "success",
  data: {
    ID: 11,
    username: "swamper",
  },
};

const filterListings = (query: Record<string, string | undefined>) => {
  const search = query.search?.toLowerCase() ?? "";
  const status = query.status ?? "all";
  const sort = query.sort ?? "latest";

  let listings = [...baseListings];

  if (search) {
    listings = listings.filter(
      (listing) =>
        listing.title.toLowerCase().includes(search) ||
        listing.description.toLowerCase().includes(search),
    );
  }

  if (status !== "all") {
    listings = listings.filter((listing) => listing.status === status);
  }

  if (sort === "price_asc") {
    listings.sort((left, right) => left.price - right.price);
  } else if (sort === "price_desc") {
    listings.sort((left, right) => right.price - left.price);
  } else if (sort === "oldest") {
    listings.sort((left, right) => left.created_at.localeCompare(right.created_at));
  } else {
    listings.sort((left, right) => right.created_at.localeCompare(left.created_at));
  }

  return listings;
};

const visitListingsPage = (loggedIn = false) => {
  cy.intercept("GET", "**/api/listings*", (request) => {
    request.reply({
      statusCode: 200,
      body: filterListings(request.query as Record<string, string | undefined>),
    });
  }).as("getListings");

  if (loggedIn) {
    cy.intercept("GET", "**/api/admin/user", {
      statusCode: 200,
      body: currentUserResponse,
    }).as("getCurrentUser");
  } else {
    cy.intercept("GET", "**/api/admin/user", {
      statusCode: 401,
      body: { error: "unauthorized" },
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

  cy.wait("@getListings");
};

describe("listings page", () => {
  it("shows listings, visible categories, and the login button for guests", () => {
    visitListingsPage(false);

    cy.contains("SwampSwap Market").should("be.visible");
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

  it("filters listings when a category is selected from the navigation bar", () => {
    visitListingsPage(false);

    cy.contains("button", "Cooking").click();
    cy.wait("@getListings")
      .its("request.query")
      .should("deep.include", { search: "Cooking" });

    cy.location("search").should("include", "search=Cooking");
    cy.contains("Non-stick pots perfect for apartment cooking.").should("be.visible");
    cy.contains("Great for cooler evenings and lightly worn.").should("not.exist");
  });

  it("applies sort and status filters from the toolbar", () => {
    visitListingsPage(false);

    cy.get("#listing-sort").select("Price high to low");
    cy.wait("@getListings")
      .its("request.query")
      .should("deep.include", { sort: "price_desc" });

    cy.get("#listing-status").select("Sold only");
    cy.wait("@getListings")
      .its("request.query")
      .should("deep.include", { sort: "price_desc", status: "sold" });

    cy.contains("Non-stick pots perfect for apartment cooking.").should("be.visible");
    cy.contains("Great for cooler evenings and lightly worn.").should("not.exist");
    cy.contains("Compact camera with charger and carrying case.").should("not.exist");
  });

  it("redirects guests to login when they try to buy from the listing grid", () => {
    visitListingsPage(false);

    cy.contains("button", "Buy").first().click();

    cy.contains("Please log in before buying an item.").should("be.visible");
    cy.location("pathname").should("eq", "/login");
  });

  it("lets an authenticated user create a new listing from the sell dialog", () => {
    const createdListing: Listing = {
      id: 44,
      created_at: "2026-03-21T11:00:00Z",
      updated_at: "2026-03-21T11:00:00Z",
      title: "Car Phone Mount",
      description: "Easy dashboard mount for campus commutes.",
      price: 18,
      user_id: 11,
      status: "available",
      buyer_id: null,
      seller_username: "swamper",
    };

    visitListingsPage(true);

    cy.wait("@getCurrentUser");
    cy.contains("swamper").should("be.visible");

    cy.intercept("POST", "**/api/admin/listings", {
      statusCode: 201,
      body: createdListing,
    }).as("createListing");

    cy.contains("button", "Sell an Item").click();
    cy.get("#sell-title").type(createdListing.title);
    cy.get("#sell-description").type(createdListing.description);
    cy.get("#sell-price").type(String(createdListing.price));
    cy.contains("button", "Post Listing").click();

    cy.wait("@createListing")
      .its("request.body")
      .should("deep.equal", {
        title: createdListing.title,
        description: createdListing.description,
        price: createdListing.price,
      });

    cy.contains("Your item is now live.").should("be.visible");
    cy.contains(createdListing.description).should("be.visible");
  });
});

describe("listing detail page", () => {
  it("loads the listing detail and allows an authenticated user to buy", () => {
    const updatedListing: Listing = {
      ...baseListings[1],
      status: "sold",
      buyer_id: 11,
    };

    cy.intercept("GET", "**/api/listings/2", {
      statusCode: 200,
      body: baseListings[1],
    }).as("getListingDetail");

    cy.intercept("POST", "**/api/admin/listings/2/buy", {
      statusCode: 200,
      body: updatedListing,
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
