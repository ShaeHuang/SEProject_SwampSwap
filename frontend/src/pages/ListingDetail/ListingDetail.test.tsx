import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";

import ListingDetailPage from "./index";
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
  getListingById: vi.fn(),
  isAuthenticated: vi.fn(),
}));

vi.mock("@/api/auth", () => ({
  getCurrentUser: vi.fn(),
}));

vi.mock("sonner", () => ({
  toast: { error: vi.fn() },
}));

import { getCurrentUser } from "@/api/auth";
import { getListingById, isAuthenticated } from "@/api/listings";

const detailListing: Listing = {
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
  seller_name: "Taylor",
};

const renderDetail = () =>
  render(
    <MemoryRouter initialEntries={["/listings/1"]}>
      <Routes>
        <Route path="/listings/:id" element={<ListingDetailPage />} />
      </Routes>
    </MemoryRouter>,
  );

describe("ListingDetailPage favorites", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    vi.mocked(getListingById).mockResolvedValue(detailListing);
    vi.mocked(isAuthenticated).mockReturnValue(false);
    vi.mocked(getCurrentUser).mockRejectedValue(new Error("not logged in"));
  });

  it("saves and unsaves the current listing", async () => {
    const user = userEvent.setup();
    renderDetail();

    await waitFor(() => {
      expect(screen.getByText("Includes notes and practice pages")).toBeInTheDocument();
    });

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
  });
});
