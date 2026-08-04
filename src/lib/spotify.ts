// Spotify Web API 호출 헬퍼 — DESIGN.md 5번 API 명세 참고
// 모든 호출은 서버(API Route/서버 컴포넌트)에서만 수행한다 (토큰이 서버에만 있으므로)

export type Playlist = {
  id: string;
  name: string;
};

type SpotifyPlaylistsResponse = {
  items: {
    id: string;
    name: string;
    collaborative: boolean;
    owner: { id: string };
  }[];
};

type SpotifyMeResponse = {
  id: string;
};

// Spotify는 본인 소유이거나 공동 작업(collaborative) 설정된 플레이리스트에만
// 트랙 추가를 허용한다. 그 외 플레이리스트를 선택하면 저장 시 403이 나므로,
// 처음부터 저장 가능한 플레이리스트만 걸러서 보여준다.
export async function getUserPlaylists(
  accessToken: string,
): Promise<Playlist[]> {
  const headers = { Authorization: `Bearer ${accessToken}` };

  const [meRes, playlistsRes] = await Promise.all([
    fetch("https://api.spotify.com/v1/me", { headers, cache: "no-store" }),
    fetch("https://api.spotify.com/v1/me/playlists?limit=50", {
      headers,
      cache: "no-store",
    }),
  ]);

  if (!meRes.ok) {
    throw new Error(`Spotify 사용자 정보 조회 실패 (status: ${meRes.status})`);
  }
  if (!playlistsRes.ok) {
    throw new Error(
      `Spotify 플레이리스트 조회 실패 (status: ${playlistsRes.status})`,
    );
  }

  const me = (await meRes.json()) as SpotifyMeResponse;
  const data = (await playlistsRes.json()) as SpotifyPlaylistsResponse;

  return data.items
    .filter((item) => item.collaborative || item.owner.id === me.id)
    .map((item) => ({ id: item.id, name: item.name }));
}
