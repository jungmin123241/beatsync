// 플레이리스트별 저장한 트랙 ID 기록 — DESIGN.md 4번 데이터 모델(beatsync.savedTracks) 참고
// 중복 저장 방지에 사용 (실제 플레이리스트 재조회 대신 이 기록으로 판단)
const SAVED_TRACKS_KEY = "beatsync.savedTracks";

type SavedTracksMap = Record<string, string[]>;

function readAll(): SavedTracksMap {
  const raw = localStorage.getItem(SAVED_TRACKS_KEY);
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export function isTrackSaved(playlistId: string, trackId: string): boolean {
  const all = readAll();
  return (all[playlistId] ?? []).includes(trackId);
}

export function markTrackSaved(playlistId: string, trackId: string): void {
  const all = readAll();
  const list = all[playlistId] ?? [];
  if (!list.includes(trackId)) {
    all[playlistId] = [...list, trackId];
    localStorage.setItem(SAVED_TRACKS_KEY, JSON.stringify(all));
  }
}
