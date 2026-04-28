import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";

import FavoritesPage from "./index";
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
  isAuthenticated: vi.fn(),
}));

vi.mock("@/api/auth", () => ({
  getCurrentUser: vi.fn(),
}));

vi.mock("sonner", () => ({
  toast: { error: vi.fn() },
}));

import { getCurrentUser } from "@/api/auth";
import { isAuthenticated, listListings } from "@/api/listings";
import { toast } from "sonner";

const savedListing: Listing = {
  ID: 1,
  CreatedAt: "2025-01-10T00:00:00Z",
  UpdatedAt: "2025-01-10T00:00:00Z",
  DeletedAt: null,
  title: "Desk Lamp",
  description: "Warm light for study nights",
  price: 25,
  category: "Furniture",
  condition: "Gently used",
  user_id: 7,
  status: "available",
  seller_name: "Maya",
};

const soldSavedListing: Listing = {
  ...savedListing,
  ID: 2,
  title: "Road Bike",
  description: "Ready for campus commuting",
  price: 120,
  category: "Sports",
  condition: "Used",
  status: "sold",
};

const unsavedListing: Listing = {
  ...savedListing,
  ID: 3,
  title: "Rice Cooker",
  description: "Compact dorm cooker",
  price: 20,
  category: "Cooking",
};

const renderPage = () =>
  render(
    <MemoryRouter>
      <FavoritesPage />
    </MemoryRouter>,
  );

describe("FavoritesPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    vi.mocked(listListings).mockResolvedValue([
      savedListing,
      soldSavedListing,
      unsavedListing,
    ]);
    vi.mocked(isAuthenticated).mockReturnValue(false);
    vi.mocked(getCurrentUser).mockRejectedValue(new Error("not logged in"));
  });

  it("shows an empty state when no saved listings match", async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByText("No saved listings yet.")).toBeInTheDocument();
    });

    expect(screen.getByRole("button", { name: /browse listings/i })).toBeInTheDocument();
  });

  it("renders saved listings and preserves sold state", async () => {
    localStorage.setItem(FAVORITE_LISTINGS_STORAGE_KEY, JSON.stringify([2, 1, 99]));

    renderPage();

    await waitFor(() => {
      expect(screen.getByText("Road Bike")).toBeInTheDocument();
    });

    expect(screen.getByText("Desk Lamp")).toBeInTheDocument();
    expect(screen.queryByText("Rice Cooker")).not.toBeInTheDocument();
    expect(screen.getByText("Available")).toBeInTheDocument();
    expect(screen.getAllByText("Sold")).not.toHaveLength(0);
  });

  it("removes a listing from saved listings", async () => {
    localStorage.setItem(FAVORITE_LISTINGS_STORAGE_KEY, JSON.stringify([1]));
    const user = userEvent.setup();

    renderPage();

    await waitFor(() => {
      expect(screen.getByText("Desk Lamp")).toBeInTheDocument();
    });

    await user.click(
      screen.getByRole("button", {
        name: "Remove Desk Lamp from saved listings",
      }),
    );

    await waitFor(() => {
      expect(screen.queryByText("Desk Lamp")).not.toBeInTheDocument();
    });
    expect(localStorage.getItem(FAVORITE_LISTINGS_STORAGE_KEY)).toBe("[]");
  });

  it("requires login before messaging a seller", async () => {
    localStorage.setItem(FAVORITE_LISTINGS_STORAGE_KEY, JSON.stringify([1]));
    const user = userEvent.setup();

    renderPage();

    await waitFor(() => {
      expect(screen.getByText("Desk Lamp")).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: /message seller/i }));

    expect(toast.error).toHaveBeenCalledWith(
      "Please log in before messaging a seller.",
    );
    expect(mockNavigate).toHaveBeenCalledWith("/login");
  });
});
