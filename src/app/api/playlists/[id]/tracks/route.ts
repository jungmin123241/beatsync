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
    // 화면에는 일반 안내만 띄우므로(DESIGN.md 6번), 실패 원인은 서버 로그로 남긴다.
    // 403이면 곡 추가 권한이 없는 플레이리스트이거나 Spotify 계정 상태 문제다.
    const body = await res.text().catch(() => "");
    console.error("[playlists/tracks] Spotify 저장 실패", res.status, body);
    return NextResponse.json(
      { error: "SAVE_FAILED", spotifyStatus: res.status },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true });
}
