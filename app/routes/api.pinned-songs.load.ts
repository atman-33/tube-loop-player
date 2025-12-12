import { getAuth } from "~/lib/auth/auth.server";
import { loadPinnedSongs } from "~/lib/pinned-songs.server";
import type { Route } from "../+types/root";

export async function loader({ request, context }: Route.LoaderArgs) {
  try {
    const auth = getAuth(context);
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user) {
      return new Response("Unauthorized", { status: 401 });
    }

    const pinnedData = await loadPinnedSongs(session.user.id, context);

    return new Response(JSON.stringify(pinnedData), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Load pinned songs error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
