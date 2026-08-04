// Spotify Web API 호출 헬퍼 — DESIGN.md 5번 API 명세 참고
// 모든 호출은 서버(API Route/서버 컴포넌트)에서만 수행한다 (토큰이 서버에만 있으므로)

export type Playlist = {
  id: string;
  name: string;
};

type SpotifyPlaylistsResponse = {
  items: { id: string; name: string }[];
};

export async function getUserPlaylists(
  accessToken: string,
): Promise<Playlist[]> {
  const res = await fetch(
    "https://api.spotify.com/v1/me/playlists?limit=50",
    {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    },
  );

  if (!res.ok) {
    throw new Error(`Spotify 플레이리스트 조회 실패 (status: ${res.status})`);
  }

  const data = (await res.json()) as SpotifyPlaylistsResponse;
  return data.items.map((item) => ({ id: item.id, name: item.name }));
}
