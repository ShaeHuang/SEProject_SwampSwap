import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import RegisterPage from "./index";

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>(
    "react-router-dom",
  );
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock("@/api/auth", () => ({
  register: vi.fn(),
}));

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

import { register } from "@/api/auth";
import { toast } from "sonner";

const renderRegister = () =>
  render(
    <MemoryRouter>
      <RegisterPage />
    </MemoryRouter>,
  );

const VALID_PASSWORD = "ValidPass1!";

describe("RegisterPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders all form fields", () => {
    renderRegister();

    expect(screen.getByLabelText(/user name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/location/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/phone number/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  it("renders the SwampSwap branding", () => {
    renderRegister();

    expect(screen.getByText("Swamp")).toBeInTheDocument();
    expect(screen.getByText("Swap")).toBeInTheDocument();
    expect(screen.getByText("The UF International Marketplace")).toBeInTheDocument();
  });

  it("renders the Create Account button", () => {
    renderRegister();

    expect(
      screen.getByRole("button", { name: /create account/i }),
    ).toBeInTheDocument();
  });

  it("shows email error when email is empty", async () => {
    const user = userEvent.setup();
    renderRegister();

    await user.type(screen.getByLabelText(/user name/i), "Albert");
    await user.type(screen.getByLabelText(/phone number/i), "3525551234");
    await user.type(screen.getByLabelText(/password/i), VALID_PASSWORD);
    await user.click(screen.getByRole("button", { name: /create account/i }));

    expect(screen.getByText("Email is required")).toBeInTheDocument();
    expect(register).not.toHaveBeenCalled();
  });

  it("shows email error for invalid email format", async () => {
    const user = userEvent.setup();
    renderRegister();

    await user.type(screen.getByLabelText(/email/i), "not-an-email");
    await user.type(screen.getByLabelText(/phone number/i), "3525551234");
    await user.type(screen.getByLabelText(/password/i), VALID_PASSWORD);
    await user.click(screen.getByRole("button", { name: /create account/i }));

    expect(screen.getByText("Please enter a valid email address")).toBeInTheDocument();
    expect(register).not.toHaveBeenCalled();
  });

  it("shows phone error when phone number is empty", async () => {
    const user = userEvent.setup();
    renderRegister();

    await user.type(screen.getByLabelText(/email/i), "albert@gmail.com");
    await user.type(screen.getByLabelText(/password/i), VALID_PASSWORD);
    await user.click(screen.getByRole("button", { name: /create account/i }));

    expect(screen.getByText("Phone number is required")).toBeInTheDocument();
    expect(register).not.toHaveBeenCalled();
  });

  it("shows phone error for invalid phone number", async () => {
    const user = userEvent.setup();
    renderRegister();

    await user.type(screen.getByLabelText(/email/i), "albert@gmail.com");
    await user.type(screen.getByLabelText(/phone number/i), "12345");
    await user.type(screen.getByLabelText(/password/i), VALID_PASSWORD);
    await user.click(screen.getByRole("button", { name: /create account/i }));

    expect(screen.getByText("Please enter a valid US phone number")).toBeInTheDocument();
    expect(register).not.toHaveBeenCalled();
  });

  it("shows password error when password is empty", async () => {
    const user = userEvent.setup();
    renderRegister();

    await user.type(screen.getByLabelText(/email/i), "albert@gmail.com");
    await user.type(screen.getByLabelText(/phone number/i), "3525551234");
    await user.click(screen.getByRole("button", { name: /create account/i }));

    expect(screen.getByText("Password is required")).toBeInTheDocument();
    expect(register).not.toHaveBeenCalled();
  });

  it("shows password error when password is too short", async () => {
    const user = userEvent.setup();
    renderRegister();

    await user.type(screen.getByLabelText(/email/i), "albert@gmail.com");
    await user.type(screen.getByLabelText(/phone number/i), "3525551234");
    await user.type(screen.getByLabelText(/password/i), "Ab1!");
    await user.click(screen.getByRole("button", { name: /create account/i }));

    expect(screen.getByText("Password must be at least 8 characters")).toBeInTheDocument();
  });

  it("shows password error when password lacks uppercase", async () => {
    const user = userEvent.setup();
    renderRegister();

    await user.type(screen.getByLabelText(/email/i), "albert@gmail.com");
    await user.type(screen.getByLabelText(/phone number/i), "3525551234");
    await user.type(screen.getByLabelText(/password/i), "abcdefg1!");
    await user.click(screen.getByRole("button", { name: /create account/i }));

    expect(
      screen.getByText("Password must contain at least one uppercase letter"),
    ).toBeInTheDocument();
  });

  it("shows password error when password lacks special character", async () => {
    const user = userEvent.setup();
    renderRegister();

    await user.type(screen.getByLabelText(/email/i), "albert@gmail.com");
    await user.type(screen.getByLabelText(/phone number/i), "3525551234");
    await user.type(screen.getByLabelText(/password/i), "Abcdefg12");
    await user.click(screen.getByRole("button", { name: /create account/i }));

    expect(
      screen.getByText("Password must contain at least one special character"),
    ).toBeInTheDocument();
  });

  it("shows multiple errors simultaneously", async () => {
    const user = userEvent.setup();
    renderRegister();

    await user.click(screen.getByRole("button", { name: /create account/i }));

    expect(screen.getByText("Email is required")).toBeInTheDocument();
    expect(screen.getByText("Phone number is required")).toBeInTheDocument();
    expect(screen.getByText("Password is required")).toBeInTheDocument();
  });

  it("calls register API and navigates to /login on success", async () => {
    vi.mocked(register).mockResolvedValue({
      message: "Register successful",
      user: {
        id: "1",
        userName: "Albert",
        email: "albert@gmail.com",
        location: "Gainesville, FL",
        phoneNumber: "3525551234",
      },
    });

    const user = userEvent.setup();
    renderRegister();

    await user.type(screen.getByLabelText(/user name/i), "Albert");
    await user.type(screen.getByLabelText(/email/i), "albert@gmail.com");
    await user.type(screen.getByLabelText(/location/i), "Gainesville, FL");
    await user.type(screen.getByLabelText(/phone number/i), "3525551234");
    await user.type(screen.getByLabelText(/password/i), VALID_PASSWORD);
    await user.click(screen.getByRole("button", { name: /create account/i }));

    expect(register).toHaveBeenCalledWith({
      userName: "Albert",
      email: "albert@gmail.com",
      location: "Gainesville, FL",
      phoneNumber: "3525551234",
      password: VALID_PASSWORD,
      avatar: expect.any(String),
    });
    expect(toast.success).toHaveBeenCalledWith("Registration successful");
    expect(mockNavigate).toHaveBeenCalledWith("/login");
  });

  it("shows toast error when register API rejects", async () => {
    vi.mocked(register).mockRejectedValue(new Error("Email already in use"));

    const user = userEvent.setup();
    renderRegister();

    await user.type(screen.getByLabelText(/user name/i), "Albert");
    await user.type(screen.getByLabelText(/email/i), "albert@gmail.com");
    await user.type(screen.getByLabelText(/location/i), "Gainesville, FL");
    await user.type(screen.getByLabelText(/phone number/i), "3525551234");
    await user.type(screen.getByLabelText(/password/i), VALID_PASSWORD);
    await user.click(screen.getByRole("button", { name: /create account/i }));

    expect(toast.error).toHaveBeenCalledWith("Email already in use");
  });

  it("navigates to /login when 'Log In' link is clicked", async () => {
    const user = userEvent.setup();
    renderRegister();

    await user.click(screen.getByRole("button", { name: /log in/i }));

    expect(mockNavigate).toHaveBeenCalledWith("/login");
  });

  it("renders the profile icon selector trigger", () => {
    renderRegister();

    expect(
      screen.getByRole("button", { name: /edit profile icon/i }),
    ).toBeInTheDocument();
  });
});
