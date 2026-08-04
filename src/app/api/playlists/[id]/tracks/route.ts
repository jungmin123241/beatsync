import { NextResponse } from "next/server";
import { auth } from "@/auth";

// DESIGN.md 5번: POST /api/playlists/[id]/tracks — 지정 플레이리스트에 트랙 추가
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.accessToken) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const { id: playlistId } = await params;
  const body = await request.json().catch(() => null);
  const spotifyTrackId = body?.spotifyTrackId;
  if (typeof spotifyTrackId !== "string" || !spotifyTrackId) {
    return NextResponse.json({ error: "INVALID_REQUEST" }, { status: 400 });
  }

  const res = await fetch(
    `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ uris: [`spotify:track:${spotifyTrackId}`] }),
    },
  );

  if (!res.ok) {
    return NextResponse.json({ error: "SAVE_FAILED" }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
