// 샘플 곡 목록 — PRD 5-[must]1 규칙: 추천 후보곡은 이 목록에서만 고른다
// 트랙 ID는 실제 Spotify에 존재하는 곡의 ID라서, 검색 없이 바로 플레이리스트에 저장할 수 있다
//
// 주의 1: BPM 값은 서로 겹치지 않게 유지할 것.
// 추천은 "가장 가까운 BPM 1곡"을 고르는데, 같은 BPM이 둘이면 앞의 곡만 뽑히고
// 뒤의 곡은 영영 추천되지 않는다. 곡을 추가할 때 기존 BPM과 중복되면 ±1 조정한다.
//
// 주의 2: BPM 오름차순으로 정렬해 둘 것. 값 사이가 크게 벌어진 구간은
// 그 근처 곡 하나가 넓은 심박수 범위를 독차지해 계속 같은 곡만 추천된다.
// 정렬해 두면 어디가 비었는지 바로 보인다.

export type SampleSong = {
  title: string;
  artist: string;
  bpm: number;
  spotifyTrackId: string;
};

export const SAMPLE_SONGS: SampleSong[] = [
  { title: "Roar", artist: "Katy Perry", bpm: 86, spotifyTrackId: "6F5c58TMEs1byxUstkzVeM" },
  { title: "Cheap Thrills", artist: "Sia ft. Sean Paul", bpm: 90, spotifyTrackId: "378iszndTZAR4dH8kwsLC6" },
  { title: "Perfect", artist: "Ed Sheeran", bpm: 94, spotifyTrackId: "0tgVpDi06FyKpA1z0VMD4v" },
  { title: "Watermelon Sugar", artist: "Harry Styles", bpm: 95, spotifyTrackId: "6UelLqGlWMcVH1E5c4H7lY" },
  { title: "Shape of You", artist: "Ed Sheeran", bpm: 96, spotifyTrackId: "7qiZfU4dY1lWllzX7mPBI3" },
  { title: "Sorry", artist: "Justin Bieber", bpm: 100, spotifyTrackId: "09CtPGIpYB4BrO8qb1RGsF" },
  { title: "Levitating", artist: "Dua Lipa", bpm: 103, spotifyTrackId: "39LLxExYz6ewLAcYrzQQyP" },
  { title: "Stronger", artist: "Kanye West", bpm: 104, spotifyTrackId: "0j2T0R9dR9qdJYsB7ciXhf" },
  { title: "The Middle", artist: "Zedd, Maren Morris & Grey", bpm: 107, spotifyTrackId: "09IStsImFySgyp0pIQdqAc" },
  { title: "Can't Stop the Feeling!", artist: "Justin Timberlake", bpm: 113, spotifyTrackId: "6JV2JOEocMgcZxYSZelKcc" },
  { title: "Uptown Funk", artist: "Mark Ronson ft. Bruno Mars", bpm: 115, spotifyTrackId: "32OlwWuMpZ6b0aN2RZOeMS" },
  { title: "Sugar", artist: "Maroon 5", bpm: 120, spotifyTrackId: "5d6Mjuu2uCGRPYpFjGpCX5" },
  { title: "Don't Start Now", artist: "Dua Lipa", bpm: 123, spotifyTrackId: "3PfIrDoz19wz7qK7tYeu62" },
  { title: "Firework", artist: "Katy Perry", bpm: 124, spotifyTrackId: "1mXuMM6zjPgjL4asbBsgnt" },
  { title: "Believer", artist: "Imagine Dragons", bpm: 125, spotifyTrackId: "0pqnGHJpmpxLKifKRmU6WP" },
  { title: "Levels", artist: "Avicii", bpm: 126, spotifyTrackId: "1OEGfToF7QbjUgyxMAnGXg" },
  { title: "Titanium", artist: "David Guetta ft. Sia", bpm: 127, spotifyTrackId: "0TDLuuLlV54CkRRUOahJb4" },
  { title: "Break Free", artist: "Ariana Grande ft. Zedd", bpm: 130, spotifyTrackId: "12KUFSHFgT0XCoiSlvdQi4" },
  { title: "bad guy", artist: "Billie Eilish", bpm: 135, spotifyTrackId: "2Fxmhks0bxGSBdJ92vM42m" },
  { title: "Viva La Vida", artist: "Coldplay", bpm: 138, spotifyTrackId: "1mea3bSkSGXuIRvnydlB5b" },
  { title: "Physical", artist: "Dua Lipa", bpm: 146, spotifyTrackId: "3AzjcOeAmA57TIOr9zF1ZW" },
  { title: "Don't Stop Me Now", artist: "Queen", bpm: 156, spotifyTrackId: "1NHWG8zxSEypSRF3UufrnO" },
  { title: "Happy", artist: "Pharrell Williams", bpm: 160, spotifyTrackId: "60nZcImufyMA1MKQY3dcCH" },
  { title: "Thunder", artist: "Imagine Dragons", bpm: 168, spotifyTrackId: "1zB4vmk8tFRmM9UULNzbLB" },
  { title: "Blinding Lights", artist: "The Weeknd", bpm: 171, spotifyTrackId: "0VjIjW4GlUZAMYd2vXMi3b" },
];
