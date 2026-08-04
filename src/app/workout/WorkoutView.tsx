"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { getProfile } from "@/lib/profile";
import { getCurrentWorkout, getWorkouts, type Workout } from "@/lib/workouts";
import { useMockHeartRate } from "@/hooks/useMockHeartRate";
import { SAMPLE_SONGS } from "@/lib/sampleSongs";
import { findNearestSong } from "@/lib/recommend";
import { isTrackSaved, markTrackSaved } from "@/lib/savedTracks";

type WorkoutContext = { maxHr: number; workout: Workout };

// 나이 정보가 없으면 온보딩으로, 지정한 운동이 없으면 설정 화면으로 되돌린다
// — DESIGN.md 라우팅 규칙
function useWorkoutContext(): WorkoutContext | null {
  const router = useRouter();
  const [ctx, setCtx] = useState<WorkoutContext | null>(null);

  useEffect(() => {
    const profile = getProfile();
    if (!profile) {
      router.replace("/onboarding");
      return;
    }
    const current = getCurrentWorkout();
    const workout = current
      ? getWorkouts().find((w) => w.name === current.name)
      : undefined;
    if (!workout) {
      router.replace("/setup");
      return;
    }
    // localStorage(외부 저장소)를 마운트 시 한 번 읽어와 상태로 옮기는 용도
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCtx({ maxHr: profile.maxHr, workout });
  }, [router]);

  return ctx;
}

export default function WorkoutView() {
  const ctx = useWorkoutContext();

  if (!ctx) {
    return (
      <>
        <section className="flex flex-col items-center gap-2">
          <p className="text-4xl font-bold">❤ -- bpm</p>
        </section>
        <section className="flex flex-col items-center gap-3 rounded-xl border border-foreground/10 p-5">
          <p className="text-xs text-foreground/60">🎵 추천 곡</p>
          <p className="font-medium">추천 곡이 여기에 표시됩니다</p>
          <button
            type="button"
            disabled
            className="w-full rounded-full bg-foreground py-3 font-medium text-background disabled:opacity-40"
          >
            저장
          </button>
        </section>
      </>
    );
  }

  return <WorkoutBody maxHr={ctx.maxHr} workout={ctx.workout} />;
}

function WorkoutBody({ maxHr, workout }: { maxHr: number; workout: Workout }) {
  const heartRate = useMockHeartRate(maxHr);
  const song = findNearestSong(heartRate, SAMPLE_SONGS);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(false);
  const [justSavedId, setJustSavedId] = useState<string | null>(null);

  // PRD 5-[must]2 규칙: 추천 곡이 직전과 달라지면 안내 메시지를 잠깐 보여준다
  const [showChangeNotice, setShowChangeNotice] = useState(false);
  const prevSongIdRef = useRef<string | null>(null);

  useEffect(() => {
    const prevSongId = prevSongIdRef.current;
    prevSongIdRef.current = song.spotifyTrackId;
    if (prevSongId === null || prevSongId === song.spotifyTrackId) {
      return;
    }
    setShowChangeNotice(true);
    const timer = setTimeout(() => setShowChangeNotice(false), 4000);
    return () => clearTimeout(timer);
  }, [song.spotifyTrackId]);

  const saved =
    justSavedId === song.spotifyTrackId ||
    isTrackSaved(workout.playlistId, song.spotifyTrackId);

  async function handleSave() {
    setSaving(true);
    setError(false);
    try {
      const res = await fetch(`/api/playlists/${workout.playlistId}/tracks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ spotifyTrackId: song.spotifyTrackId }),
      });
      if (!res.ok) throw new Error("저장 실패");
      markTrackSaved(workout.playlistId, song.spotifyTrackId);
      setJustSavedId(song.spotifyTrackId);
    } catch {
      setError(true);
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <section className="flex flex-col items-center gap-2">
        <p className="text-4xl font-bold text-accent">❤ {heartRate} bpm</p>
      </section>

      {showChangeNotice && (
        <div className="rounded-lg border border-accent px-4 py-2 text-center text-sm text-accent">
          ♪ 곡이 바뀌었어요
        </div>
      )}

      <section className="flex flex-col items-center gap-3 rounded-xl border border-foreground/10 p-5">
        <p className="text-xs text-foreground/60">
          🎵 추천 곡 · {workout.playlistName}
        </p>
        <p className="font-medium">
          {song.title} - {song.artist} ({song.bpm}bpm)
        </p>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving || saved}
          className="w-full rounded-full bg-accent py-3 font-medium text-accent-foreground disabled:opacity-40"
        >
          {saved ? "저장됨" : saving ? "저장 중..." : "저장"}
        </button>
        {error && (
          <p className="text-sm text-red-500">
            문제가 발생했어요, 다시 시도해주세요
          </p>
        )}
      </section>
    </>
  );
}
