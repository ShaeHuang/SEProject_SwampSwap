import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";

import UserPage from "./index";
import type { Listing } from "@/types/listing";
import type { CurrentUserProfile } from "@/types/user";

const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>(
    "react-router-dom",
  );
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock("@/api/user", () => ({
  getCurrentUserProfile: vi.fn(),
  getCurrentUserListings: vi.fn(),
  updateCurrentUserProfile: vi.fn(),
  uploadCurrentUserAvatar: vi.fn(),
}));

vi.mock("@/api/auth", () => ({
  logout: vi.fn(),
}));

vi.mock("@/api/listings", () => ({
  createListing: vi.fn(),
  isAuthenticated: vi.fn(),
  updateListing: vi.fn(),
  deleteListing: vi.fn(),
}));

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

import {
  getCurrentUserListings,
  getCurrentUserProfile,
  updateCurrentUserProfile,
} from "@/api/user";
import { logout } from "@/api/auth";
import {
  createListing,
  deleteListing,
  isAuthenticated,
  updateListing,
} from "@/api/listings";
import { toast } from "sonner";

const fakeProfile: CurrentUserProfile = {
  id: 1,
  username: "swamper",
  email: "swamper@ufl.edu",
  avatar: "https://example.com/avatar.png",
  bio: "Campus seller",
  joinedAt: "2025-01-01T00:00:00Z",
};

const fakeListings: Listing[] = [
  {
    ID: 1,
    CreatedAt: "2025-01-10T00:00:00Z",
    UpdatedAt: "2025-01-10T00:00:00Z",
    DeletedAt: null,
    title: "Desk Lamp",
    description: "Warm light for study nights",
    price: 25,
    category: "Furniture",
    condition: "Gently used",
    user_id: 1,
    status: "available",
  },
  {
    ID: 2,
    CreatedAt: "2025-01-09T00:00:00Z",
    UpdatedAt: "2025-01-09T00:00:00Z",
    DeletedAt: null,
    title: "Monitor Stand",
    description: "Compact wood stand",
    price: 15,
    category: "Furniture",
    condition: "Used",
    user_id: 1,
    status: "sold",
  },
];

const renderPage = () =>
  render(
    <MemoryRouter>
      <UserPage />
    </MemoryRouter>,
  );

describe("UserPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(isAuthenticated).mockReturnValue(true);
    vi.mocked(createListing).mockResolvedValue(fakeListings[0]);
    vi.mocked(getCurrentUserProfile).mockResolvedValue(fakeProfile);
    vi.mocked(getCurrentUserListings).mockResolvedValue(fakeListings);
  });

  it("loads the current user profile and posted listings", async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByText("swamper")).toBeInTheDocument();
    });

    expect(screen.getByText("Campus seller")).toBeInTheDocument();
    expect(screen.getByText("swamper@ufl.edu")).toBeInTheDocument();
    expect(screen.getByText("Desk Lamp")).toBeInTheDocument();
    expect(screen.getByText("Condition: Gently used")).toBeInTheDocument();
    expect(screen.getByText("Monitor Stand")).toBeInTheDocument();
  });

  it("updates the profile photo", async () => {
    vi.mocked(updateCurrentUserProfile).mockResolvedValue({
      ...fakeProfile,
      avatar: "/assets/image/icon_black.png",
    });

    const user = userEvent.setup();
    renderPage();

    await waitFor(() => {
      expect(screen.getByText("swamper")).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: /^edit profile$/i }));
    const dialog = await screen.findByRole("dialog");
    await user.click(within(dialog).getByRole("button", { name: /select black icon/i }));
    await user.click(within(dialog).getByRole("button", { name: /confirm/i }));

    await waitFor(() => {
      expect(updateCurrentUserProfile).toHaveBeenCalledWith({
        avatar: expect.stringContaining("icon_black"),
      });
    });

    expect(toast.success).toHaveBeenCalledWith("Profile photo updated.");
  });

  it("updates a posted listing", async () => {
    vi.mocked(updateListing).mockResolvedValue({
      ...fakeListings[0],
      title: "Desk Lamp Pro",
      price: 30,
    });

    const user = userEvent.setup();
    renderPage();

    await waitFor(() => {
      expect(screen.getByText("Desk Lamp")).toBeInTheDocument();
    });

    await user.click(screen.getAllByRole("button", { name: /^edit$/i })[0]);
    const dialog = await screen.findByRole("dialog");
    const titleInput = within(dialog).getByDisplayValue("Desk Lamp");
    const priceInput = within(dialog).getByDisplayValue("25");

    await user.clear(titleInput);
    await user.type(titleInput, "Desk Lamp Pro");
    await user.clear(priceInput);
    await user.type(priceInput, "30");
    await user.click(within(dialog).getByRole("button", { name: /save changes/i }));

    await waitFor(() => {
      expect(updateListing).toHaveBeenCalledWith(1, {
        title: "Desk Lamp Pro",
        description: "Warm light for study nights",
        price: 30,
        category: "Furniture",
        condition: "Gently used",
      });
    });

    expect(toast.success).toHaveBeenCalledWith("Listing updated.");
  });

  it("opens the same post item form and creates a listing from user info", async () => {
    vi.mocked(getCurrentUserListings).mockResolvedValue([]);
    vi.mocked(createListing).mockResolvedValue(fakeListings[0]);

    const user = userEvent.setup();
    renderPage();

    await waitFor(() => {
      expect(screen.getByText("You have not posted any items yet.")).toBeInTheDocument();
    });

    await user.click(screen.getAllByRole("button", { name: /post an item/i })[0]);

    const dialog = await screen.findByRole("dialog");
    await user.type(within(dialog).getByLabelText(/item title/i), "Desk Lamp");
    await user.selectOptions(within(dialog).getByLabelText(/category/i), "Furniture");
    await user.type(
      within(dialog).getByLabelText(/description/i),
      "Warm light for study nights",
    );
    await user.selectOptions(
      within(dialog).getByLabelText(/condition/i),
      "Gently used",
    );
    await user.type(within(dialog).getByLabelText(/price/i), "25");
    await user.click(within(dialog).getByRole("button", { name: /post listing/i }));

    await waitFor(() => {
      expect(createListing).toHaveBeenCalledWith({
        title: "Desk Lamp",
        description: "Warm light for study nights",
        price: 25,
        category: "Furniture",
        condition: "Gently used",
      });
    });

    expect(toast.success).toHaveBeenCalledWith("Your item is now live.");
  });

  it("deletes a posted listing", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);
    vi.mocked(deleteListing).mockResolvedValue();

    const user = userEvent.setup();
    renderPage();

    await waitFor(() => {
      expect(screen.getByText("Desk Lamp")).toBeInTheDocument();
    });

    await user.click(screen.getAllByRole("button", { name: /delete/i })[0]);

    await waitFor(() => {
      expect(deleteListing).toHaveBeenCalledWith(1);
    });

    expect(toast.success).toHaveBeenCalledWith("Listing deleted.");
  });

  it("logs out from the profile page", async () => {
    const user = userEvent.setup();
    renderPage();

    await waitFor(() => {
      expect(screen.getByText("swamper")).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: /log out/i }));

    expect(logout).toHaveBeenCalled();
    expect(toast.success).toHaveBeenCalledWith("Logged out successfully.");
    expect(mockNavigate).toHaveBeenCalledWith("/login");
  });
});
