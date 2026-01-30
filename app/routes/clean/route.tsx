import { Outlet } from "react-router";
import type { ReactElement } from "react";
import type { Route } from "./+types/route";
import { getAuth } from "~/lib/auth/auth.server";
import AppLayoutShell from "~/components/app-layout-shell";

/**
 * Clean Mode Layout
 *
 * This layout provides an ad-free experience of the application.
 * It mirrors the main `_app` layout but explicitly excludes ad components.
 * It also includes SEO protection (noindex) to prevent public indexing.
 */

export const handle = {
  hideAds: true,
};

export const meta: Route.MetaFunction = () => [
  { name: "robots", content: "noindex, nofollow" },
];

export const loader = async ({ context, request }: Route.LoaderArgs) => {
  const auth = getAuth(context);
  const session = await auth.api.getSession({ headers: request.headers });

  const contactEmail = context.cloudflare.env.CONTACT_EMAIL;
  const baseURL = context.cloudflare.env.BETTER_AUTH_URL;

  return {
    contactEmail,
    baseURL,
    user: session?.user,
  };
};

const CleanLayout = ({ loaderData }: Route.ComponentProps): ReactElement => {
  const { contactEmail } = loaderData;

  return (
    <AppLayoutShell contactEmail={contactEmail}>
      <Outlet />
    </AppLayoutShell>
  );
};

export default CleanLayout;
