import { useRouteLoaderData } from "react-router";
import { getAuthClient } from "~/lib/auth/auth-client";

export interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
}

export function useAuth() {
  const loaderData = useRouteLoaderData("routes/_app") as {
    baseURL: string;
    user?: User;
  } | null;

  const user = loaderData?.user || null;
  const baseURL = loaderData?.baseURL || "";

  const authClient = getAuthClient({ baseURL });

  const signIn = async (provider: "google" | "github") => {
    try {
      await authClient.signIn.social({
        provider,
        callbackURL: "/",
      });
    } catch (error) {
      console.error("Sign in failed:", error);
    }
  };

  const signOut = async () => {
    try {
      await authClient.signOut();
      // Reload the page to refresh the session
      window.location.reload();
    } catch (error) {
      console.error("Sign out failed:", error);
    }
  };

  return {
    user,
    isLoading: false,
    isAuthenticated: !!user,
    signIn,
    signOut,
  };
}
