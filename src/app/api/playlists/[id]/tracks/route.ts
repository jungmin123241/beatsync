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

  // Spotify가 2026-02-11에 트랙 추가 API를 이 경로로 옮기고 옛 경로(.../tracks)는
  // 폐기했다. 옛 경로로는 스코프·소유권이 다 맞아도 403 Forbidden이 돌아온다.
  const res = await fetch(
    `https://api.spotify.com/v1/playlists/${playlistId}/items`,
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
    const responseBody = await res.text().catch(() => "");
    console.error("[playlists/tracks] Spotify 저장 실패", res.status, responseBody);
    return NextResponse.json(
      { error: "SAVE_FAILED", spotifyStatus: res.status },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true });
}
