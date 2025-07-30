import { getAuth } from "~/lib/auth/auth.server";
import { calculateDataHash } from "~/lib/data-hash";
import { PlaylistService } from "~/lib/playlist.server";
import type { Route } from "../+types/root";

export async function loader({ request, context }: Route.LoaderArgs) {
  try {
    const auth = getAuth(context);
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user) {
      return new Response("Unauthorized", { status: 401 });
    }

    const playlistService = new PlaylistService(context);
    const userData = await playlistService.getUserPlaylists(session.user.id);

    if (userData) {
      // Calculate hash for the server data
      const dataHash = calculateDataHash(userData);
      const responseData = {
        ...userData,
        dataHash,
      };

      return new Response(JSON.stringify(responseData), {
        headers: { "Content-Type": "application/json" },
      });
    } else {
      const emptyData = {
        playlists: [],
        activePlaylistId: "",
        loopMode: "all" as const,
        isShuffle: false,
      };
      const dataHash = calculateDataHash(emptyData);
      const responseData = {
        ...emptyData,
        dataHash,
      };

      return new Response(JSON.stringify(responseData), {
        headers: { "Content-Type": "application/json" },
      });
    }
  } catch (error) {
    console.error("Load error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
