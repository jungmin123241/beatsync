import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getUserPlaylists } from "@/lib/spotify";

// DESIGN.md 5번: GET /api/playlists — 로그인한 사용자의 플레이리스트 목록 조회
export async function GET() {
  const session = await auth();
  if (!session?.accessToken) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  try {
    const playlists = await getUserPlaylists(session.accessToken);
    return NextResponse.json({ playlists });
  } catch {
    return NextResponse.json({ error: "FETCH_FAILED" }, { status: 502 });
  }
}
