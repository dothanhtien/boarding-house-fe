import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import SignInForm from "./SignInForm";
import { authApi } from "../api";

vi.mock("../api", () => ({
  authApi: {
    login: vi.fn(),
  },
}));

const replaceMock = vi.fn();
const searchParams = new URLSearchParams();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: replaceMock }),
  useSearchParams: () => searchParams,
}));

const loginMock = vi.mocked(authApi.login);

function renderSignInForm() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <SignInForm />
    </QueryClientProvider>,
  );
}

async function fillAndSubmit(identifier?: string, password?: string) {
  const user = userEvent.setup();

  if (identifier !== undefined) {
    await user.type(
      screen.getByPlaceholderText("Email or phone number"),
      identifier,
    );
  }
  if (password !== undefined) {
    await user.type(
      screen.getByPlaceholderText("Enter your password"),
      password,
    );
  }

  await user.click(screen.getByRole("button", { name: /sign in/i }));
}

describe("SignInForm", () => {
  beforeEach(() => {
    loginMock.mockReset();
    replaceMock.mockReset();
    for (const key of [...searchParams.keys()]) {
      searchParams.delete(key);
    }
  });

  it("renders identifier and password fields", () => {
    renderSignInForm();

    expect(
      screen.getByPlaceholderText("Email or phone number"),
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Enter your password"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /sign in/i }),
    ).toBeInTheDocument();
  });

  it("toggles password visibility", async () => {
    const user = userEvent.setup();
    renderSignInForm();

    const passwordInput = screen.getByPlaceholderText(
      "Enter your password",
    ) as HTMLInputElement;
    expect(passwordInput.type).toBe("password");

    const outerWrapper = passwordInput.parentElement!.parentElement!;
    const toggle = outerWrapper.querySelector("span")!;
    await user.click(toggle);
    expect(passwordInput.type).toBe("text");
  });

  it("shows an error and does not call login when identifier is missing", async () => {
    renderSignInForm();

    await fillAndSubmit(undefined, "password123");

    expect(
      await screen.findByText("Email or phone is required"),
    ).toBeInTheDocument();
    expect(loginMock).not.toHaveBeenCalled();
  });

  it("shows an error and does not call login when password is missing", async () => {
    renderSignInForm();

    await fillAndSubmit("user@example.com", undefined);

    expect(await screen.findByText("Password is required")).toBeInTheDocument();
    expect(loginMock).not.toHaveBeenCalled();
  });

  it("calls login with trimmed credentials and redirects on success", async () => {
    loginMock.mockResolvedValueOnce({
      id: "1",
      email: "user@example.com",
      emailVerifiedAt: null,
      phone: null,
      fullName: "Test User",
      lastLoginAt: null,
      isActive: true,
      createdAt: "",
      updatedAt: "",
      platformRole: null,
      organizations: [],
    });

    renderSignInForm();

    await fillAndSubmit("  user@example.com  ", "  password123  ");

    await waitFor(() => {
      expect(loginMock).toHaveBeenCalledWith({
        identifier: "user@example.com",
        password: "password123",
      });
    });
    await waitFor(() => expect(replaceMock).toHaveBeenCalledWith("/"));
  });

  it("calls login with a phone number as the identifier", async () => {
    loginMock.mockResolvedValueOnce({
      id: "1",
      email: "user@example.com",
      emailVerifiedAt: null,
      phone: "0901234567",
      fullName: "Test User",
      lastLoginAt: null,
      isActive: true,
      createdAt: "",
      updatedAt: "",
      platformRole: null,
      organizations: [],
    });

    renderSignInForm();

    await fillAndSubmit("0901234567", "password123");

    await waitFor(() => {
      expect(loginMock).toHaveBeenCalledWith({
        identifier: "0901234567",
        password: "password123",
      });
    });
  });

  it("redirects to the `redirect` query param on success when present", async () => {
    searchParams.set("redirect", "/profile");
    loginMock.mockResolvedValueOnce({
      id: "1",
      email: "user@example.com",
      emailVerifiedAt: null,
      phone: null,
      fullName: "Test User",
      lastLoginAt: null,
      isActive: true,
      createdAt: "",
      updatedAt: "",
      platformRole: null,
      organizations: [],
    });

    renderSignInForm();

    await fillAndSubmit("user@example.com", "password123");

    await waitFor(() => expect(replaceMock).toHaveBeenCalledWith("/profile"));
  });

  it("shows the API error message when login fails", async () => {
    loginMock.mockRejectedValueOnce({
      status: 401,
      message: "Invalid credentials",
    });

    renderSignInForm();

    await fillAndSubmit("user@example.com", "wrongpassword");

    expect(await screen.findByText("Invalid credentials")).toBeInTheDocument();
    expect(replaceMock).not.toHaveBeenCalled();
  });

  it("shows a fallback error message when login fails without a message", async () => {
    loginMock.mockRejectedValueOnce({});

    renderSignInForm();

    await fillAndSubmit("user@example.com", "wrongpassword");

    expect(
      await screen.findByText("An error occurred when signing in"),
    ).toBeInTheDocument();
  });
});
