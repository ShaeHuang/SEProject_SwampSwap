import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import LoginPage from "./index";

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>(
    "react-router-dom",
  );
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock("@/api/auth", () => ({
  login: vi.fn(),
}));

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

import { login } from "@/api/auth";
import { toast } from "sonner";

const renderLogin = () =>
  render(
    <MemoryRouter>
      <LoginPage />
    </MemoryRouter>,
  );

describe("LoginPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the login form with identifier and password fields", () => {
    renderLogin();

    expect(screen.getByLabelText(/username or email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument();
  });

  it("renders the SwampSwap branding", () => {
    renderLogin();

    expect(screen.getByText("Swamp")).toBeInTheDocument();
    expect(screen.getByText("Swap")).toBeInTheDocument();
    expect(screen.getByText("The UF International Marketplace")).toBeInTheDocument();
  });

  it("shows an error when identifier is empty", async () => {
    const user = userEvent.setup();
    renderLogin();

    await user.click(screen.getByRole("button", { name: /sign in/i }));

    expect(screen.getByText("Username or email is required")).toBeInTheDocument();
    expect(login).not.toHaveBeenCalled();
  });

  it("shows an error when password is empty", async () => {
    const user = userEvent.setup();
    renderLogin();

    await user.type(screen.getByLabelText(/username or email/i), "testuser");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    expect(screen.getByText("Password is required")).toBeInTheDocument();
    expect(login).not.toHaveBeenCalled();
  });

  it("shows an error when password is too short", async () => {
    const user = userEvent.setup();
    renderLogin();

    await user.type(screen.getByLabelText(/username or email/i), "testuser");
    await user.type(screen.getByLabelText(/password/i), "Ab1!");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    expect(screen.getByText("Password must be at least 8 characters")).toBeInTheDocument();
    expect(login).not.toHaveBeenCalled();
  });

  it("shows an error when password lacks uppercase", async () => {
    const user = userEvent.setup();
    renderLogin();

    await user.type(screen.getByLabelText(/username or email/i), "testuser");
    await user.type(screen.getByLabelText(/password/i), "abcdefg1!");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    expect(
      screen.getByText("Password must contain at least one uppercase letter"),
    ).toBeInTheDocument();
  });

  it("shows an error when password lacks special character", async () => {
    const user = userEvent.setup();
    renderLogin();

    await user.type(screen.getByLabelText(/username or email/i), "testuser");
    await user.type(screen.getByLabelText(/password/i), "Abcdefg12");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    expect(
      screen.getByText("Password must contain at least one special character"),
    ).toBeInTheDocument();
  });

  it("calls login API and navigates on success", async () => {
    vi.mocked(login).mockResolvedValue({
      message: "Login successful",
      token: "abc123",
    });

    const user = userEvent.setup();
    renderLogin();

    await user.type(screen.getByLabelText(/username or email/i), "testuser");
    await user.type(screen.getByLabelText(/password/i), "ValidPass1!");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    expect(login).toHaveBeenCalledWith({
      identifier: "testuser",
      password: "ValidPass1!",
    });
    expect(toast.success).toHaveBeenCalledWith("Login successful");
    expect(mockNavigate).toHaveBeenCalledWith("/");
  });

  it("shows toast error when login API rejects", async () => {
    vi.mocked(login).mockRejectedValue(new Error("Invalid credentials"));

    const user = userEvent.setup();
    renderLogin();

    await user.type(screen.getByLabelText(/username or email/i), "testuser");
    await user.type(screen.getByLabelText(/password/i), "ValidPass1!");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    expect(toast.error).toHaveBeenCalledWith("Invalid credentials");
  });

  it("navigates to /register when 'Create an Account' is clicked", async () => {
    const user = userEvent.setup();
    renderLogin();

    await user.click(screen.getByText("Create an Account"));

    expect(mockNavigate).toHaveBeenCalledWith("/register");
  });

  it("trims whitespace from identifier before validation", async () => {
    vi.mocked(login).mockResolvedValue({
      message: "Login successful",
      token: "abc123",
    });

    const user = userEvent.setup();
    renderLogin();

    await user.type(screen.getByLabelText(/username or email/i), "  testuser  ");
    await user.type(screen.getByLabelText(/password/i), "ValidPass1!");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    expect(login).toHaveBeenCalledWith({
      identifier: "testuser",
      password: "ValidPass1!",
    });
  });
});
