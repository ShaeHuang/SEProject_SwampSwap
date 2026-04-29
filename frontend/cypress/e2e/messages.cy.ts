describe("Chat page", () => {
  let threadCalls = 0;

  beforeEach(() => {
    // Conversations list
    cy.intercept("GET", "**/api/messages", {
      statusCode: 200,
      body: [
        {
          userId: "2",
          username: "bob",
          avatar: "",
          lastMessage: "Hello",
          lastAt: "2026-04-01T12:00:00Z",
          unreadCount: 1,
        },
      ],
    }).as("getConversations");

    // User info for the selected conversation partner
    cy.intercept("GET", "**/api/user/2", {
      statusCode: 200,
      body: {
        ID: 2,
        username: "bob",
        email: "bob@test.com",
        avatar: "",
        bio: "",
        CreatedAt: "2026-04-01T12:00:00Z",
      },
    }).as("getUserInfo");

    // Messages for the thread: first call empty, second call returns an incoming message
    cy.intercept("GET", "**/api/messages/2", (req) => {
      threadCalls += 1;
      if (threadCalls < 2) {
        req.reply({ statusCode: 200, body: [] });
      } else {
        req.reply({
          statusCode: 200,
          body: [
            {
              id: "10",
              senderId: "2",
              receiverId: "11",
              content: "New incoming message",
              createdAt: "2026-04-29T12:00:00Z",
              isRead: false,
            },
          ],
        });
      }
    }).as("getThread");

    // Sending a message
    cy.intercept("POST", "**/api/messages", (req) => {
      // Expect the frontend to send receiver_id and content
      expect(req.body).to.have.property('receiver_id');
      expect(req.body).to.have.property('content');

      req.reply({
        statusCode: 201,
        body: {
          id: "11",
          senderId: "11",
          receiverId: String(req.body.receiver_id),
          content: req.body.content,
          createdAt: new Date().toISOString(),
          isRead: false,
        },
      });
    }).as("postMessage");
  });

  it("Refresh button reloads the thread and shows incoming messages", () => {
    cy.visit("/chat?userId=2", {
      onBeforeLoad(win) {
        win.localStorage.setItem("token", "fake-jwt-token");
      },
    });

    cy.wait("@getConversations");
    cy.wait("@getThread");

    cy.contains("No messages yet.").should("be.visible");

    // Click the in-page Refresh which should reload both conversations and the current thread
    cy.contains("button", "Refresh").click();
    cy.wait("@getConversations");
    cy.wait("@getThread");

    cy.contains("New incoming message").should("be.visible");
  });

  it("sends a message and displays it in the thread", () => {
    cy.visit("/chat?userId=2", {
      onBeforeLoad(win) {
        win.localStorage.setItem("token", "fake-jwt-token");
      },
    });

    cy.wait("@getConversations");
    cy.wait("@getThread");

    cy.get('input[placeholder="Type your message..."]').type("Hi, I'm interested");
    cy.contains("button", "Send").click();

    cy.wait("@postMessage");
    cy.contains("Hi, I'm interested").should("be.visible");
  });
});
