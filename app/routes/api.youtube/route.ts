import type { LoaderFunctionArgs } from "react-router";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const videoId = url.searchParams.get("videoId");

  if (!videoId) {
    return new Response(JSON.stringify({ error: "videoId is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;

  try {
    const response = await fetch(oembedUrl);
    if (!response.ok) {
      throw new Error("Failed to fetch video information from oEmbed API.");
    }
    const data = (await response.json()) as { title: string };
    return new Response(JSON.stringify({ title: data.title }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("oEmbed fetch error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch video title" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
};
