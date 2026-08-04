"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { Playlist } from "@/lib/spotify";
import { getProfile } from "@/lib/profile";
import {
  getWorkouts,
  saveWorkout,
  setCurrentWorkout,
  type Workout,
} from "@/lib/workouts";

type SetupFormProps = {
  playlists: Playlist[];
  loadError: boolean;
};

export default function SetupForm({ playlists, loadError }: SetupFormProps) {
  const router = useRouter();
  const [workoutName, setWorkoutName] = useState("");
  const [playlistId, setPlaylistId] = useState("");
  const [savedWorkouts, setSavedWorkouts] = useState<Workout[]>([]);
  const [error, setError] = useState("");

  // 나이(최대심박수)가 없으면 온보딩으로 되돌린다 — DESIGN.md 라우팅 규칙
  useEffect(() => {
    if (!getProfile()) {
      router.replace("/onboarding");
      return;
    }
    // localStorage(외부 저장소)를 마운트 시 한 번 읽어와 상태로 옮기는 용도
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSavedWorkouts(getWorkouts());
  }, [router]);

  function handlePick(workout: Workout) {
    setWorkoutName(workout.name);
    setPlaylistId(workout.playlistId);
  }

  function handleStart(e: React.FormEvent) {
    e.preventDefault();
    const name = workoutName.trim();
    const playlist = playlists.find((p) => p.id === playlistId);
    if (!name || !playlist) {
      setError("운동 이름과 플레이리스트를 모두 입력해주세요");
      return;
    }
    saveWorkout({ name, playlistId: playlist.id, playlistName: playlist.name });
    setCurrentWorkout(name);
    router.push("/workout");
  }

  return (
    <>
      {savedWorkouts.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-sm text-foreground/60">최근 운동</p>
          <div className="flex flex-wrap gap-2">
            {savedWorkouts.map((workout) => (
              <button
                key={workout.name}
                type="button"
                onClick={() => handlePick(workout)}
                className="rounded-full border border-foreground/20 px-3 py-1 text-sm"
              >
                {workout.name}
              </button>
            ))}
          </div>
        </div>
      )}

      <form onSubmit={handleStart} className="flex flex-col gap-8">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">운동 이름을 입력하세요</label>
          <input
            type="text"
            placeholder="예: 러닝"
            value={workoutName}
            onChange={(e) => setWorkoutName(e.target.value)}
            className="w-full rounded-lg border border-foreground/20 px-4 py-3"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">
            이 운동에 쓸 플레이리스트
          </label>
          {loadError ? (
            <p className="text-sm text-foreground/60">
              플레이리스트를 불러오지 못했어요. 잠시 후 다시 시도해주세요.
            </p>
          ) : playlists.length === 0 ? (
            <p className="text-sm text-foreground/60">
              Spotify 계정에 플레이리스트가 없어요. 먼저 Spotify에서 하나
              만들어주세요.
            </p>
          ) : (
            <select
              required
              value={playlistId}
              onChange={(e) => setPlaylistId(e.target.value)}
              className="w-full rounded-lg border border-foreground/20 px-4 py-3"
            >
              <option value="" disabled>
                플레이리스트 선택
              </option>
              {playlists.map((playlist) => (
                <option key={playlist.id} value={playlist.id}>
                  {playlist.name}
                </option>
              ))}
            </select>
          )}
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <button
          type="submit"
          disabled={loadError || playlists.length === 0}
          className="w-full rounded-full bg-foreground py-3 font-medium text-background disabled:opacity-40"
        >
          운동 시작
        </button>
      </form>

      <a href="/onboarding" className="text-center text-sm underline text-foreground/60">
        나이 다시 입력
      </a>
    </>
  );
}
