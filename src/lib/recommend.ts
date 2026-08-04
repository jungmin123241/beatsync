import type { SampleSong } from "./sampleSongs";

// PRD 5-[must]1 규칙: 현재 심박수와 BPM이 가장 가까운 곡 1개를 추천한다
export function findNearestSong(
  heartRate: number,
  songs: SampleSong[],
): SampleSong {
  return songs.reduce((closest, song) =>
    Math.abs(song.bpm - heartRate) < Math.abs(closest.bpm - heartRate)
      ? song
      : closest,
  );
}
