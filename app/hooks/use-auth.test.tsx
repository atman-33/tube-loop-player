import { act, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useAuth } from "./use-auth";

const mockUseRouteLoaderData = vi.fn();
const mockUseLocation = vi.fn();
const mockGetAuthClient = vi.fn();

vi.mock("react-router", () => ({
  useRouteLoaderData: (routeId: string) => mockUseRouteLoaderData(routeId),
  useLocation: () => mockUseLocation(),
}));

vi.mock("~/lib/auth/auth-client", () => ({
  getAuthClient: (options: { baseURL?: string }) => mockGetAuthClient(options),
}));

const renderHook = (onRender: (value: ReturnType<typeof useAuth>) => void) => {
  const TestComponent = () => {
    const auth = useAuth();
    onRender(auth);
    return null;
  };

  render(<TestComponent />);
};

afterEach(() => {
  vi.clearAllMocks();
});

describe("useAuth", () => {
  it("uses loader data from routes/_app when available", () => {
    const user = { id: "1", name: "User", email: "user@example.com" };

    mockUseRouteLoaderData.mockImplementation((routeId: string) => {
      if (routeId === "routes/_app") {
        return { baseURL: "https://app.example", user };
      }

      return null;
    });
    mockUseLocation.mockReturnValue({ pathname: "/" });

    const authClient = {
      signIn: { social: vi.fn().mockResolvedValue(undefined) },
      signOut: vi.fn().mockResolvedValue(undefined),
    };
    mockGetAuthClient.mockReturnValue(authClient);

    const onRender = vi.fn();
    renderHook(onRender);

    const auth = onRender.mock.calls[0][0];
    expect(auth.user).toEqual(user);
    expect(auth.isAuthenticated).toBe(true);
    expect(mockGetAuthClient).toHaveBeenCalledWith({ baseURL: "https://app.example" });
  });

  it("falls back to routes/clean loader data when _app is unavailable", () => {
    const user = { id: "2", name: "Clean", email: "clean@example.com" };

    mockUseRouteLoaderData.mockImplementation((routeId: string) => {
      if (routeId === "routes/clean") {
        return { baseURL: "https://clean.example", user };
      }

      return null;
    });
    mockUseLocation.mockReturnValue({ pathname: "/clean" });

    const authClient = {
      signIn: { social: vi.fn().mockResolvedValue(undefined) },
      signOut: vi.fn().mockResolvedValue(undefined),
    };
    mockGetAuthClient.mockReturnValue(authClient);

    const onRender = vi.fn();
    renderHook(onRender);

    const auth = onRender.mock.calls[0][0];
    expect(auth.user).toEqual(user);
    expect(auth.isAuthenticated).toBe(true);
    expect(mockGetAuthClient).toHaveBeenCalledWith({ baseURL: "https://clean.example" });
  });

  it("uses clean callback URL when signing in from clean mode", async () => {
    mockUseRouteLoaderData.mockImplementation((routeId: string) => {
      if (routeId === "routes/clean") {
        return { baseURL: "https://clean.example", user: undefined };
      }

      return null;
    });
    mockUseLocation.mockReturnValue({ pathname: "/clean" });

    const authClient = {
      signIn: { social: vi.fn().mockResolvedValue(undefined) },
      signOut: vi.fn().mockResolvedValue(undefined),
    };
    mockGetAuthClient.mockReturnValue(authClient);

    const onRender = vi.fn();
    renderHook(onRender);

    const auth = onRender.mock.calls[0][0];

    await act(async () => {
      await auth.signIn("google");
    });

    expect(authClient.signIn.social).toHaveBeenCalledWith({
      provider: "google",
      callbackURL: "/clean",
    });
  });
});
