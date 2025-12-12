import { getAuth } from "~/lib/auth/auth.server";
import {
  type PinnedSongsData,
  syncPinnedSongs,
} from "~/lib/pinned-songs.server";
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
    if (!isValidPinnedSongsData(rawData)) {
      return new Response(JSON.stringify({ error: "Invalid data format" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const syncedData = await syncPinnedSongs(session.user.id, rawData, context);

    return new Response(JSON.stringify(syncedData), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Sync pinned songs error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

function isValidPinnedSongsData(data: unknown): data is PinnedSongsData {
  if (!data || typeof data !== "object") return false;

  const obj = data as Record<string, unknown>;

  return (
    Array.isArray(obj.pinnedVideoIds) &&
    Array.isArray(obj.pinnedOrder) &&
    obj.pinnedVideoIds.every((id) => typeof id === "string") &&
    obj.pinnedOrder.every((id) => typeof id === "string")
  );
}
