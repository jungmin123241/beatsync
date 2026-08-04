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
    const responseBody = await res.text().catch(() => "");
    // Spotify는 스코프 부족 등 인가 관련 403일 때 WWW-Authenticate 헤더에
    // 구체적인 이유(error="insufficient_scope" 등)를 담아 보내는 경우가 있다.
    const wwwAuthenticate = res.headers.get("www-authenticate");
    // 지금 이 토큰이 실제로 어느 계정으로 인식되는지도 함께 확인해,
    // 세션 토큰이 예상 계정과 다른 계정으로 새는 상황인지 가려낸다.
    const meRes = await fetch("https://api.spotify.com/v1/me", {
      headers: { Authorization: `Bearer ${session.accessToken}` },
    }).catch(() => null);
    const me = meRes?.ok ? await meRes.json().catch(() => null) : null;
    console.error(
      "[playlists/tracks] Spotify 저장 실패",
      JSON.stringify({
        status: res.status,
        wwwAuthenticate,
        body: responseBody,
        playlistId,
        trackUri: `spotify:track:${spotifyTrackId}`,
        actingUserId: me?.id ?? `조회 실패(${meRes?.status})`,
        actingUserProduct: me?.product ?? null, // "premium" | "free" 등
      }),
    );
    return NextResponse.json(
      { error: "SAVE_FAILED", spotifyStatus: res.status },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true });
}
