import { getAuth } from "~/lib/auth/auth.server";
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
      return new Response(JSON.stringify(userData), {
        headers: { "Content-Type": "application/json" },
      });
    } else {
      return new Response(
        JSON.stringify({
          playlists: [],
          activePlaylistId: "",
          loopMode: "all",
          isShuffle: false,
        }),
        {
          headers: { "Content-Type": "application/json" },
        },
      );
    }
  } catch (error) {
    console.error("Load error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
