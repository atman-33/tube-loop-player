import { getAuth } from "~/lib/auth/auth.server";
import { PlaylistService, type UserPlaylistData } from "~/lib/playlist.server";
import type { Route } from "../+types/root";

export async function action({ request, context }: Route.ActionArgs) {
  if (request.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const auth = getAuth(context);
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user) {
      return new Response("Unauthorized", { status: 401 });
    }

    const rawData = await request.json();

    // Validate the data structure
    if (!isValidUserPlaylistData(rawData)) {
      return new Response(JSON.stringify({ error: "Invalid data format" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const playlistService = new PlaylistService(context);
    const savedData = await playlistService.saveUserPlaylists(
      session.user.id,
      rawData,
    );

    if (savedData) {
      return new Response(JSON.stringify({ success: true, data: savedData }), {
        headers: { "Content-Type": "application/json" },
      });
    } else {
      return new Response(
        JSON.stringify({ error: "Failed to save playlists" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      );
    }
  } catch (error) {
    console.error("Sync error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

function isValidUserPlaylistData(data: unknown): data is UserPlaylistData {
  if (!data || typeof data !== "object") return false;

  const obj = data as Record<string, unknown>;

  return (
    Array.isArray(obj.playlists) &&
    typeof obj.activePlaylistId === "string" &&
    (obj.loopMode === "all" || obj.loopMode === "one") &&
    typeof obj.isShuffle === "boolean" &&
    obj.playlists.every((playlist: unknown) => {
      if (!playlist || typeof playlist !== "object") return false;
      const p = playlist as Record<string, unknown>;
      return (
        typeof p.id === "string" &&
        typeof p.name === "string" &&
        Array.isArray(p.items) &&
        p.items.every((item: unknown) => {
          if (!item || typeof item !== "object") return false;
          const i = item as Record<string, unknown>;
          return (
            typeof i.id === "string" &&
            (i.title === undefined || typeof i.title === "string")
          );
        })
      );
    })
  );
}
