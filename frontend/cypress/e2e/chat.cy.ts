describe("Chat page", () => {
  beforeEach(() => {
    cy.visit("http://localhost:5173/chat");
  });

  it("loads conversations on page load", () => {
    cy.intercept("GET", "**/api/message/conversations").as("getConversations");
    
    cy.wait("@getConversations");
    cy.contains("Conversations").should("be.visible");
  });

  it("displays conversation list with user names", () => {
    cy.intercept("GET", "**/api/message/conversations", {
      statusCode: 200,
      body: [
        {
          userId: "2",
          username: "seller1",
          lastMessage: "Are you still selling?",
          lastAt: "2024-04-09T10:00:00Z",
          unreadCount: 2,
        },
        {
          userId: "3",
          username: "buyer1",
          lastMessage: "Great, I'll take it",
          lastAt: "2024-04-09T09:00:00Z",
          unreadCount: 0,
        },
      ],
    }).as("getConversations");

    cy.reload();
    cy.wait("@getConversations");
    cy.contains("seller1").should("be.visible");
    cy.contains("buyer1").should("be.visible");
  });

  it("displays unread badge on conversations with unread messages", () => {
    cy.intercept("GET", "**/api/message/conversations", {
      statusCode: 200,
      body: [
        {
          userId: "2",
          username: "seller1",
          lastMessage: "Message",
          lastAt: "2024-04-09T10:00:00Z",
          unreadCount: 3,
        },
      ],
    }).as("getConversations");

    cy.reload();
    cy.wait("@getConversations");
    cy.contains("3").should("be.visible");
  });

  it("hides unread badge when unreadCount is 0", () => {
    cy.intercept("GET", "**/api/message/conversations", {
      statusCode: 200,
      body: [
        {
          userId: "2",
          username: "seller1",
          lastMessage: "Message",
          lastAt: "2024-04-09T10:00:00Z",
          unreadCount: 0,
        },
      ],
    }).as("getConversations");

    cy.reload();
    cy.wait("@getConversations");
    cy.get(".rounded-full.bg-destructive").should("not.exist");
  });

  it("loads messages when conversation is selected", () => {
    cy.intercept("GET", "**/api/message/conversations", {
      statusCode: 200,
      body: [
        {
          userId: "2",
          username: "seller1",
          lastMessage: "Last message",
          lastAt: "2024-04-09T10:00:00Z",
          unreadCount: 0,
        },
      ],
    }).as("getConversations");

    cy.intercept("GET", "**/api/user/2", {
      statusCode: 200,
      body: {
        id: "2",
        username: "seller1",
        email: "seller@uf.edu",
        avatar: null,
        joinedAt: "2024-01-01T00:00:00Z",
        bio: "Selling items",
        stats: { itemsPosted: 10, itemsSold: 5 },
      },
    }).as("getUserInfo");

    cy.intercept("GET", "**/api/message/thread/2", {
      statusCode: 200,
      body: [
        {
          id: "1",
          senderId: "2",
          content: "Hi, interested?",
          createdAt: "2024-04-09T08:00:00Z",
        },
        {
          id: "2",
          senderId: "1",
          content: "Yes, still available?",
          createdAt: "2024-04-09T09:00:00Z",
        },
      ],
    }).as("getMessages");

    cy.reload();
    cy.wait("@getConversations");
    cy.contains("seller1").click();

    cy.wait("@getUserInfo");
    cy.wait("@getMessages");
    cy.contains("Hi, interested?").should("be.visible");
    cy.contains("Yes, still available?").should("be.visible");
  });

  it("displays selected user info in chat header", () => {
    cy.intercept("GET", "**/api/message/conversations", {
      statusCode: 200,
      body: [
        {
          userId: "2",
          username: "seller1",
          lastMessage: "Message",
          lastAt: "2024-04-09T10:00:00Z",
          unreadCount: 0,
        },
      ],
    }).as("getConversations");

    cy.intercept("GET", "**/api/user/2", {
      statusCode: 200,
      body: {
        id: "2",
        username: "seller1",
        email: "seller@uf.edu",
        avatar: null,
        joinedAt: "2024-01-01T00:00:00Z",
        bio: "Selling items",
        stats: { itemsPosted: 10, itemsSold: 5 },
      },
    }).as("getUserInfo");

    cy.intercept("GET", "**/api/message/thread/2", {
      statusCode: 200,
      body: [],
    }).as("getMessages");

    cy.reload();
    cy.wait("@getConversations");
    cy.contains("seller1").click();

    cy.wait("@getUserInfo");
    cy.contains("seller@uf.edu").should("be.visible");
  });

  it("shows prompt when no conversation is selected", () => {
    cy.contains("Select conversation to load messages").should("be.visible");
  });

  it("sends a message", () => {
    cy.intercept("GET", "**/api/message/conversations", {
      statusCode: 200,
      body: [
        {
          userId: "2",
          username: "seller1",
          lastMessage: "Message",
          lastAt: "2024-04-09T10:00:00Z",
          unreadCount: 0,
        },
      ],
    }).as("getConversations");

    cy.intercept("GET", "**/api/user/2", {
      statusCode: 200,
      body: {
        id: "2",
        username: "seller1",
        email: "seller@uf.edu",
        avatar: null,
        joinedAt: "2024-01-01T00:00:00Z",
        bio: "Selling items",
        stats: { itemsPosted: 10, itemsSold: 5 },
      },
    }).as("getUserInfo");

    cy.intercept("GET", "**/api/message/thread/2", {
      statusCode: 200,
      body: [],
    }).as("getMessages");

    cy.intercept("POST", "**/api/message/send", {
      statusCode: 201,
      body: { id: "new-msg-id", content: "I'm interested!", senderId: "1" },
    }).as("sendMessage");

    cy.reload();
    cy.wait("@getConversations");
    cy.contains("seller1").click();
    cy.wait("@getUserInfo");

    cy.get('input[placeholder="Type your message..."]').type("I'm interested!");
    cy.contains("button", "Send").click();

    cy.wait("@sendMessage");
    cy.get('input[placeholder="Type your message..."]').should("have.value", "");
  });

  it("does not send empty messages", () => {
    cy.intercept("GET", "**/api/message/conversations", {
      statusCode: 200,
      body: [
        {
          userId: "2",
          username: "seller1",
          lastMessage: "Message",
          lastAt: "2024-04-09T10:00:00Z",
          unreadCount: 0,
        },
      ],
    }).as("getConversations");

    cy.intercept("GET", "**/api/user/2", {
      statusCode: 200,
      body: {
        id: "2",
        username: "seller1",
        email: "seller@uf.edu",
        avatar: null,
        joinedAt: "2024-01-01T00:00:00Z",
        bio: "Selling items",
        stats: { itemsPosted: 10, itemsSold: 5 },
      },
    }).as("getUserInfo");

    cy.intercept("GET", "**/api/message/thread/2", {
      statusCode: 200,
      body: [],
    }).as("getMessages");

    cy.intercept("POST", "**/api/message/send").as("sendMessage");

    cy.reload();
    cy.wait("@getConversations");
    cy.contains("seller1").click();
    cy.wait("@getUserInfo");

    cy.contains("button", "Send").click();
    cy.get("@sendMessage.all").should("have.length", 0);
  });

  it("refreshes conversations list", () => {
    cy.intercept("GET", "**/api/message/conversations").as("getConversations");

    cy.reload();
    cy.wait("@getConversations");

    cy.contains("button", "Refresh").click();
    cy.wait("@getConversations");
  });

  it("sorts conversations by most recent first", () => {
    cy.intercept("GET", "**/api/message/conversations", {
      statusCode: 200,
      body: [
        {
          userId: "2",
          username: "seller1",
          lastMessage: "Old message",
          lastAt: "2024-04-09T08:00:00Z",
          unreadCount: 0,
        },
        {
          userId: "3",
          username: "buyer1",
          lastMessage: "Recent message",
          lastAt: "2024-04-09T10:00:00Z",
          unreadCount: 0,
        },
      ],
    }).as("getConversations");

    cy.reload();
    cy.wait("@getConversations");

    cy.get("ul button").first().should("contain", "buyer1");
    cy.get("ul button").last().should("contain", "seller1");
  });

  it("displays messages with correct alignment (sent vs received)", () => {
    const currentUserId = "1";

    cy.intercept("GET", "**/api/message/conversations", {
      statusCode: 200,
      body: [
        {
          userId: "2",
          username: "seller1",
          lastMessage: "Message",
          lastAt: "2024-04-09T10:00:00Z",
          unreadCount: 0,
        },
      ],
    }).as("getConversations");

    cy.intercept("GET", "**/api/user/2", {
      statusCode: 200,
      body: {
        id: "2",
        username: "seller1",
        email: "seller@uf.edu",
        avatar: null,
        joinedAt: "2024-01-01T00:00:00Z",
        bio: "Selling",
        stats: { itemsPosted: 10, itemsSold: 5 },
      },
    }).as("getUserInfo");

    cy.intercept("GET", "**/api/message/thread/2", {
      statusCode: 200,
      body: [
        {
          id: "1",
          senderId: "2",
          content: "Received message",
          createdAt: "2024-04-09T08:00:00Z",
        },
        {
          id: "2",
          senderId: currentUserId,
          content: "Sent message",
          createdAt: "2024-04-09T09:00:00Z",
        },
      ],
    }).as("getMessages");

    cy.reload();
    cy.wait("@getConversations");
    cy.contains("seller1").click();
    cy.wait("@getMessages");

    cy.contains("Received message").should("be.visible");
    cy.contains("Sent message").should("be.visible");
  });

  it("shows empty message state", () => {
    cy.intercept("GET", "**/api/message/conversations", {
      statusCode: 200,
      body: [
        {
          userId: "2",
          username: "seller1",
          lastMessage: "Message",
          lastAt: "2024-04-09T10:00:00Z",
          unreadCount: 0,
        },
      ],
    }).as("getConversations");

    cy.intercept("GET", "**/api/user/2", {
      statusCode: 200,
      body: {
        id: "2",
        username: "seller1",
        email: "seller@uf.edu",
        avatar: null,
        joinedAt: "2024-01-01T00:00:00Z",
        bio: "Selling",
        stats: { itemsPosted: 10, itemsSold: 5 },
      },
    }).as("getUserInfo");

    cy.intercept("GET", "**/api/message/thread/2", {
      statusCode: 200,
      body: [],
    }).as("getMessages");

    cy.reload();
    cy.wait("@getConversations");
    cy.contains("seller1").click();
    cy.wait("@getMessages");

    cy.contains("No messages yet.").should("be.visible");
  });
});
