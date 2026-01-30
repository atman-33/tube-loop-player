import { useLocation, useRouteLoaderData } from "react-router";
import { getAuthClient } from "~/lib/auth/auth-client";

export interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
}

export function useAuth() {
  const appLoaderData = useRouteLoaderData("routes/_app") as {
    baseURL: string;
    user?: User;
  } | null;
  const cleanLoaderData = useRouteLoaderData("routes/clean") as {
    baseURL: string;
    user?: User;
  } | null;
  const loaderData = appLoaderData ?? cleanLoaderData;
  const location = useLocation();

  const user = loaderData?.user || null;
  const baseURL = loaderData?.baseURL || "";
  const callbackURL = location.pathname.startsWith("/clean") ? "/clean" : "/";

  const authClient = getAuthClient({ baseURL });

  const signIn = async (provider: "google" | "github") => {
    try {
      await authClient.signIn.social({
        provider,
        callbackURL,
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
