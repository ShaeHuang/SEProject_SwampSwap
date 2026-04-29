import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import ListingsPage from "./index";
import { FAVORITE_LISTINGS_STORAGE_KEY } from "@/lib/favorite-listings";
import type { Listing } from "@/types/listing";

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>(
    "react-router-dom",
  );
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock("@/api/listings", () => ({
  listListings: vi.fn(),
  createListing: vi.fn(),
  isAuthenticated: vi.fn(),
  defaultListingSort: "latest",
  defaultListingStatus: "all",
}));

vi.mock("@/api/auth", () => ({
  getCurrentUser: vi.fn(),
  logout: vi.fn(),
}));

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

import {
  listListings,
  createListing,
  isAuthenticated,
} from "@/api/listings";
import { getCurrentUser, logout } from "@/api/auth";
import { toast } from "sonner";

const fakeListing: Listing = {
  ID: 1,
  CreatedAt: "2025-01-01T00:00:00Z",
  UpdatedAt: "2025-01-01T00:00:00Z",
  DeletedAt: null,
  title: "Calculus Textbook",
  description: "Includes notes and practice pages",
  price: 30,
  category: "Digital Product",
  condition: "Like new",
  user_id: 42,
  status: "available",
};

const soldListing: Listing = {
  ...fakeListing,
  ID: 2,
  title: "Old Bike",
  description: "Vintage road bike",
  price: 100,
  category: "Sports",
  condition: "Used",
  status: "sold",
};

const waitForListings = () =>
  waitFor(() => {
    expect(screen.getByText("Includes notes and practice pages")).toBeInTheDocument();
  });

const renderListings = (initialEntries = ["/"]) =>
  render(
    <MemoryRouter initialEntries={initialEntries}>
      <ListingsPage />
    </MemoryRouter>,
  );

describe("ListingsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    vi.mocked(listListings).mockResolvedValue([fakeListing]);
    vi.mocked(createListing).mockResolvedValue(fakeListing);
    vi.mocked(isAuthenticated).mockReturnValue(false);
    vi.mocked(getCurrentUser).mockRejectedValue(new Error("not logged in"));
  });

  it("shows loading state initially", () => {
    vi.mocked(listListings).mockReturnValue(new Promise(() => {}));
    renderListings();

    expect(screen.getByText("Loading marketplace listings...")).toBeInTheDocument();
  });

  it("renders listings after fetch", async () => {
    renderListings();

    await waitForListings();

    expect(screen.getByAltText("Calculus Textbook")).toBeInTheDocument();
    expect(screen.getByText("$30")).toBeInTheDocument();
    expect(screen.getByText("Available")).toBeInTheDocument();
    expect(screen.getByText("Condition: Like new")).toBeInTheDocument();
  });

  it("renders the page header and navigation", async () => {
    renderListings();

    expect(screen.getByText("SwampSwap Market")).toBeInTheDocument();
    expect(screen.getByText("Campus second-hand listings")).toBeInTheDocument();
    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.queryByText("Saved")).not.toBeInTheDocument();

    await waitForListings();
  });

  it("renders category navigation buttons", async () => {
    renderListings();

    expect(screen.getByText("All")).toBeInTheDocument();
    expect(screen.getByText("Digital Product")).toBeInTheDocument();
    expect(screen.getByText("Furniture")).toBeInTheDocument();
    expect(screen.getByText("Cooking")).toBeInTheDocument();
    expect(screen.getByText("Clothing")).toBeInTheDocument();
    expect(screen.getByText("Sports")).toBeInTheDocument();
    expect(screen.getByText("Cars")).toBeInTheDocument();

    await waitForListings();
  });

  it("filters listings by the selected category tag", async () => {
    vi.mocked(listListings).mockResolvedValue([fakeListing, soldListing]);
    const user = userEvent.setup();
    renderListings();

    await waitFor(() => {
      expect(screen.getByText("Vintage road bike")).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: "Sports" }));

    await waitFor(() => {
      expect(screen.getByText("Vintage road bike")).toBeInTheDocument();
      expect(
        screen.queryByText("Includes notes and practice pages"),
      ).not.toBeInTheDocument();
    });
  });

  it("clears the category filter when All is selected", async () => {
    vi.mocked(listListings).mockResolvedValue([fakeListing, soldListing]);
    const user = userEvent.setup();
    renderListings();

    await waitFor(() => {
      expect(screen.getByText("Vintage road bike")).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: "Sports" }));
    await waitFor(() => {
      expect(
        screen.queryByText("Includes notes and practice pages"),
      ).not.toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: "All" }));

    await waitFor(() => {
      expect(screen.getByText("Vintage road bike")).toBeInTheDocument();
      expect(screen.getByText("Includes notes and practice pages")).toBeInTheDocument();
    });
  });

  it("shows error message when fetch fails", async () => {
    vi.mocked(listListings).mockRejectedValue(new Error("Network error"));
    renderListings();

    await waitFor(() => {
      expect(screen.getByText("Network error")).toBeInTheDocument();
    });

    expect(screen.getByRole("button", { name: /try again/i })).toBeInTheDocument();
  });

  it("shows empty state when no listings match", async () => {
    vi.mocked(listListings).mockResolvedValue([]);
    renderListings();

    await waitFor(() => {
      expect(screen.getByText("No items match these filters.")).toBeInTheDocument();
    });
  });

  it('shows "Log In" button when user is not authenticated', async () => {
    renderListings();

    await waitForListings();

    expect(screen.getByRole("button", { name: /log in/i })).toBeInTheDocument();
  });

  it("shows user menu actions when authenticated", async () => {
    vi.mocked(isAuthenticated).mockReturnValue(true);
    vi.mocked(getCurrentUser).mockResolvedValue({ id: 1, username: "albert" });

    const user = userEvent.setup();
    renderListings();

    await waitFor(() => {
      expect(screen.getByText("albert")).toBeInTheDocument();
    });

    expect(screen.queryByRole("button", { name: /log out/i })).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /open user menu/i }));

    expect(screen.getByRole("menuitem", { name: /saved listings/i })).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: /view profile/i })).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: /log out/i })).toBeInTheDocument();
  });

  it("navigates from the user menu", async () => {
    vi.mocked(isAuthenticated).mockReturnValue(true);
    vi.mocked(getCurrentUser).mockResolvedValue({ id: 1, username: "albert" });

    const user = userEvent.setup();
    renderListings();

    await waitFor(() => {
      expect(screen.getByText("albert")).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: /open user menu/i }));
    await user.click(screen.getByRole("menuitem", { name: /view profile/i }));

    expect(mockNavigate).toHaveBeenCalledWith("/user-info");

    await user.click(screen.getByRole("button", { name: /open user menu/i }));
    await user.click(screen.getByRole("menuitem", { name: /saved listings/i }));

    expect(mockNavigate).toHaveBeenCalledWith("/favorites");
  });

  it("logs out authenticated user", async () => {
    vi.mocked(isAuthenticated).mockReturnValue(true);
    vi.mocked(getCurrentUser).mockResolvedValue({ id: 1, username: "albert" });

    const user = userEvent.setup();
    renderListings();

    await waitFor(() => {
      expect(screen.getByText("albert")).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: /open user menu/i }));
    await user.click(screen.getByRole("menuitem", { name: /log out/i }));

    expect(logout).toHaveBeenCalled();
    expect(toast.success).toHaveBeenCalledWith("Logged out successfully");
    expect(mockNavigate).toHaveBeenCalledWith("/login");
  });

  it("navigates to /login when Log In button is clicked", async () => {
    const user = userEvent.setup();
    renderListings();

    await waitForListings();

    await user.click(screen.getByRole("button", { name: /log in/i }));
    expect(mockNavigate).toHaveBeenCalledWith("/login");
  });

  it("renders sold listing with Sold badge and no Buy button", async () => {
    vi.mocked(listListings).mockResolvedValue([soldListing]);
    renderListings();

    await waitFor(() => {
      expect(screen.getByText("Vintage road bike")).toBeInTheDocument();
    });

    expect(screen.getByText("Sold")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /^buy$/i })).not.toBeInTheDocument();
  });

  it("renders Buy button for available listings", async () => {
    renderListings();

    await waitForListings();

    expect(screen.getByRole("button", { name: /^buy$/i })).toBeInTheDocument();
  });

  it("saves and unsaves a listing from a marketplace card", async () => {
    const user = userEvent.setup();
    renderListings();

    await waitForListings();

    await user.click(screen.getByRole("button", { name: "Save Calculus Textbook" }));

    expect(localStorage.getItem(FAVORITE_LISTINGS_STORAGE_KEY)).toBe("[1]");
    expect(
      screen.getByRole("button", {
        name: "Remove Calculus Textbook from saved listings",
      }),
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", {
        name: "Remove Calculus Textbook from saved listings",
      }),
    );

    expect(localStorage.getItem(FAVORITE_LISTINGS_STORAGE_KEY)).toBe("[]");
    expect(
      screen.getByRole("button", { name: "Save Calculus Textbook" }),
    ).toBeInTheDocument();
  });

  it("redirects to login when unauthenticated user clicks Buy", async () => {
    vi.mocked(isAuthenticated).mockReturnValue(false);
    const user = userEvent.setup();
    renderListings();

    await waitForListings();

    await user.click(screen.getByRole("button", { name: /^buy$/i }));

    expect(toast.error).toHaveBeenCalledWith("Please log in before buying an item.");
    expect(mockNavigate).toHaveBeenCalledWith("/login");
  });

  it("navigates to chat when authenticated user buys", async () => {
    vi.mocked(isAuthenticated).mockReturnValue(true);
    vi.mocked(getCurrentUser).mockResolvedValue({ id: 1, username: "albert" });

    const user = userEvent.setup();
    renderListings();

    await waitForListings();

    await user.click(screen.getByRole("button", { name: /^buy$/i }));

    expect(mockNavigate).toHaveBeenCalledWith(
      expect.stringMatching(/^\/chat\?/),
    );
    expect(mockNavigate).toHaveBeenCalledWith(
      expect.stringContaining("userId=42"),
    );
  });

  it("prevents user from buying their own listing", async () => {
    vi.mocked(isAuthenticated).mockReturnValue(true);
    vi.mocked(getCurrentUser).mockResolvedValue({ id: 42, username: "seller" });

    renderListings();

    await waitForListings();

    expect(screen.getByRole("button", { name: /your listing/i })).toBeDisabled();
  });

  it("renders the Sell an Item button", async () => {
    renderListings();

    expect(screen.getByRole("button", { name: /sell an item/i })).toBeInTheDocument();

    await waitForListings();
  });

  it("submits category and condition when creating a listing", async () => {
    vi.mocked(isAuthenticated).mockReturnValue(true);
    vi.mocked(getCurrentUser).mockResolvedValue({ id: 1, username: "albert" });

    const user = userEvent.setup();
    renderListings();

    await waitForListings();

    await user.click(screen.getByRole("button", { name: /sell an item/i }));
    await user.type(screen.getByLabelText(/item title/i), "Desk lamp");
    await user.selectOptions(screen.getByLabelText(/category/i), "Furniture");
    await user.type(
      screen.getByLabelText(/description/i),
      "Solid lamp for late-night study sessions.",
    );
    await user.selectOptions(screen.getByLabelText(/condition/i), "Gently used");
    await user.type(screen.getByLabelText(/price/i), "25");
    await user.click(screen.getByRole("button", { name: /post listing/i }));

    await waitFor(() => {
      expect(createListing).toHaveBeenCalledWith({
        title: "Desk lamp",
        category: "Furniture",
        description: "Solid lamp for late-night study sessions.",
        condition: "Gently used",
        price: 25,
      });
    });
  });

  it("submits selected photos when creating a listing", async () => {
    vi.mocked(isAuthenticated).mockReturnValue(true);
    vi.mocked(getCurrentUser).mockResolvedValue({ id: 1, username: "albert" });

    const user = userEvent.setup();
    const listingPhoto = new File(["lamp photo"], "lamp.jpg", {
      type: "image/jpeg",
    });
    renderListings();

    await waitForListings();

    await user.click(screen.getByRole("button", { name: /sell an item/i }));
    await user.type(screen.getByLabelText(/item title/i), "Desk lamp");
    await user.selectOptions(screen.getByLabelText(/category/i), "Furniture");
    await user.type(
      screen.getByLabelText(/description/i),
      "Solid lamp for late-night study sessions.",
    );
    await user.selectOptions(screen.getByLabelText(/condition/i), "Gently used");
    await user.type(screen.getByLabelText(/price/i), "25");
    await user.upload(screen.getByLabelText(/photos/i), listingPhoto);
    await user.click(screen.getByRole("button", { name: /post listing/i }));

    await waitFor(() => {
      expect(createListing).toHaveBeenCalledWith({
        title: "Desk lamp",
        category: "Furniture",
        description: "Solid lamp for late-night study sessions.",
        condition: "Gently used",
        price: 25,
        images: [listingPhoto],
      });
    });
  });

  it("renders View Details link for each listing", async () => {
    renderListings();

    await waitForListings();

    expect(screen.getByRole("button", { name: /view details/i })).toBeInTheDocument();
  });

  it("renders the Reset filter button", async () => {
    renderListings();

    expect(screen.getByRole("button", { name: /reset/i })).toBeInTheDocument();

    await waitForListings();
  });

  it("renders search input with placeholder", async () => {
    renderListings();

    expect(
      screen.getByPlaceholderText("Search by title or description"),
    ).toBeInTheDocument();

    await waitForListings();
  });
});
