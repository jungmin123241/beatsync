"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
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
      <div className="flex flex-col items-center gap-3">
        <p className="text-8xl leading-none font-extrabold tabular-nums text-foreground/20">
          --
        </p>
        <p className="text-xs tracking-[0.3em] text-foreground/30">BPM</p>
      </div>
    );
  }

  return <WorkoutBody maxHr={ctx.maxHr} workout={ctx.workout} />;
}

// 숫자가 바뀔 때 즉시 갱신하지 않고, 이전 값에서 새 값까지 부드럽게 흘러가듯
// 보여준다(예: 142 → 142.5 → 143). ease-out이라 도착 직전에 자연스럽게 감속한다.
const NUMBER_TWEEN_DURATION_MS = 600;

function useAnimatedNumber(target: number): number {
  const [display, setDisplay] = useState(target);
  const fromRef = useRef(target);

  useEffect(() => {
    const from = fromRef.current;
    if (from === target) return;

    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let frameId: number;
    const startTime = performance.now();

    function tick(now: number) {
      // reduced-motion이면 트윈 없이 첫 프레임에 바로 최종값으로 보여준다
      const progress = prefersReducedMotion
        ? 1
        : Math.min(1, (now - startTime) / NUMBER_TWEEN_DURATION_MS);
      const eased = 1 - (1 - progress) ** 3; // ease-out cubic, 바운스 없음
      const value = from + (target - from) * eased;

      if (progress < 1) {
        setDisplay(Math.round(value * 10) / 10);
        frameId = requestAnimationFrame(tick);
      } else {
        setDisplay(target);
        fromRef.current = target;
      }
    }

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [target]);

  return display;
}

// 펄스 링·ECG 스크롤 속도를 이 사용자의 실제 가상 심박수 범위(useMockHeartRate와
// 동일한 40~90% of maxHr) 안에서 "지금이 상대적으로 낮은/높은 심박수인지"에 맞춰
// slowMs~fastMs 사이로 보간한다. 두 애니메이션 모두 같은 공식을 쓰되 속도 구간만 다르다.
function bpmToDurationMs(
  heartRate: number,
  minHeartRate: number,
  maxHeartRate: number,
  slowMs: number,
  fastMs: number,
): number {
  if (maxHeartRate <= minHeartRate) return slowMs;
  const ratio = (heartRate - minHeartRate) / (maxHeartRate - minHeartRate);
  const clamped = Math.min(1, Math.max(0, ratio));
  return slowMs - clamped * (slowMs - fastMs);
}

// 펄스 링: 가장 낮은 심박수에서도 화면이 죽어 보이지 않도록 전체적으로 빠르게 당겼다
const PULSE_DURATION_SLOW_MS = 1100;
const PULSE_DURATION_FAST_MS = 500;

// ECG 스크롤: 예전엔 항상 3.2초 고정이라 실제 심박수와 무관하게 흘러 "정적"으로
// 느껴졌다. 이제 펄스 링과 같은 방식으로 심박수에 직접 연결한다.
const ECG_DURATION_SLOW_MS = 2400;
const ECG_DURATION_FAST_MS = 1000;

type Trend = "up" | "down" | "flat";

function WorkoutBody({ maxHr, workout }: { maxHr: number; workout: Workout }) {
  const heartRate = useMockHeartRate(maxHr);
  const displayedHeartRate = useAnimatedNumber(heartRate);
  const song = findNearestSong(heartRate, SAMPLE_SONGS);

  // useMockHeartRate와 동일한 계산 — 애니메이션 속도를 이 사용자의 실제 가능 범위에 맞추기 위함
  const minHeartRate = Math.round(maxHr * 0.4);
  const maxHeartRate = Math.round(maxHr * 0.9);
  const pulseMs = bpmToDurationMs(
    heartRate,
    minHeartRate,
    maxHeartRate,
    PULSE_DURATION_SLOW_MS,
    PULSE_DURATION_FAST_MS,
  );
  const ecgMs = bpmToDurationMs(
    heartRate,
    minHeartRate,
    maxHeartRate,
    ECG_DURATION_SLOW_MS,
    ECG_DURATION_FAST_MS,
  );

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
    // 이전 곡의 저장 실패 문구가 새 곡 아래에 남아 오해를 주지 않도록 지운다
    setError(false);
    setShowChangeNotice(true);
    const timer = setTimeout(() => setShowChangeNotice(false), 4000);
    return () => clearTimeout(timer);
  }, [song.spotifyTrackId]);

  // 심박수가 직전보다 올랐는지/내렸는지만 본다 — Zone 같은 구간 분류는 아니다
  // (CLAUDE.md 비범위 규칙에 따라 강도 구간 분류 기능은 만들지 않는다)
  const [trend, setTrend] = useState<Trend>("flat");
  const prevHeartRateRef = useRef<number | null>(null);
  useEffect(() => {
    const prev = prevHeartRateRef.current;
    prevHeartRateRef.current = heartRate;
    if (prev === null || prev === heartRate) return;
    setTrend(heartRate > prev ? "up" : "down");
  }, [heartRate]);

  const syncStatusText =
    trend === "up"
      ? "Increasing energy"
      : trend === "down"
        ? "Recovery mode"
        : "Syncing with your pace";

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
    <div className="flex flex-col items-center gap-10">
      {/* 상단: 작은 상태 표시 */}
      <div className="flex items-center gap-2 text-xs font-medium tracking-wide text-foreground/50">
        <span className="h-1.5 w-1.5 rounded-full bg-accent" />
        Monitoring Heart Rate
      </div>

      {/* 중앙: 큰 심박수 + 펄스 링 + ECG */}
      <div className="relative flex flex-col items-center gap-1">
        <PulseRing durationMs={pulseMs} />
        <p className="relative text-8xl leading-none font-extrabold tabular-nums text-foreground">
          {Number.isInteger(displayedHeartRate)
            ? displayedHeartRate
            : displayedHeartRate.toFixed(1)}
        </p>
        <p className="relative text-xs font-medium tracking-[0.3em] text-foreground/40">
          BPM
        </p>
        <HeartRateEcg durationMs={ecgMs} />
      </div>

      {/* Music Sync 상태 + 추천 곡 · 저장 (카드 없이 미니멀한 한 줄) */}
      <div className="flex w-full flex-col items-center gap-3 px-4 text-center">
        <div
          className={`text-sm text-accent transition-opacity duration-300 ${
            showChangeNotice ? "opacity-100" : "opacity-0"
          }`}
        >
          ♪ 곡이 바뀌었어요
        </div>

        <p className="text-sm font-medium text-accent">🎵 {syncStatusText}</p>

        <div className="flex max-w-full items-center gap-3">
          <p className="max-w-[12rem] truncate text-sm text-foreground/60">
            {song.title} · {song.artist}
          </p>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || saved}
            className="shrink-0 rounded-full bg-accent px-4 py-1.5 text-xs font-semibold text-accent-foreground transition-opacity disabled:opacity-50"
          >
            {saved ? "Saved" : saving ? "Saving…" : "Save"}
          </button>
        </div>

        {error && (
          <p className="text-xs text-red-400">
            문제가 발생했어요, 다시 시도해주세요
          </p>
        )}
      </div>
    </div>
  );
}

// 심박수 중심에서 은은하게 숨쉬듯 커졌다 작아지는 원형 펄스 두 겹.
// 안쪽 링은 작고 빠르게, 바깥쪽 링은 조금 더 크고 반 박자 늦게 시작해서
// 단조로운 단일 블롭 대신 겹쳐 울리는 느낌을 준다. scale/opacity만 사용해
// GPU 합성으로 처리되고, absolute + inset으로 숫자 뒤에 겹쳐 놓는다.
function PulseRing({ durationMs }: { durationMs: number }) {
  const style = { "--workout-pulse-duration": `${durationMs}ms` } as CSSProperties;
  return (
    <>
      <span
        aria-hidden
        className="motion-safe:animate-workout-pulse pointer-events-none absolute -inset-6 -z-10 rounded-full bg-accent blur-xl motion-reduce:opacity-10"
        style={style}
      />
      <span
        aria-hidden
        className="motion-safe:animate-workout-pulse-secondary pointer-events-none absolute -inset-12 -z-10 rounded-full bg-accent blur-2xl motion-reduce:hidden"
        style={style}
      />
    </>
  );
}

// 왼쪽에서 오른쪽으로 끊김없이 흐르는 ECG 라인. 서로 살짝 다른 두 파형(A·B)을
// 번갈아 이어붙여 완전히 똑같은 모양이 반복되지 않게 하고, 그 한 쌍의 폭만큼
// translateX로 반복 이동시켜 무한 스크롤처럼 보이게 한다. 속도는 심박수에 연결된다.
function HeartRateEcg({ durationMs }: { durationMs: number }) {
  const tileA = "M0,20 L40,20 L50,6 L58,34 L65,14 L72,20 L200,20";
  const tileB = "M0,20 L36,20 L47,11 L56,31 L64,17 L72,20 L200,20";
  const offsets = [0, 200, 400, 600];
  return (
    <div className="relative mt-2 h-8 w-48 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_15%,black_85%,transparent)]">
      <svg
        aria-hidden
        viewBox="0 0 800 40"
        className="motion-safe:animate-workout-ecg-scroll absolute inset-y-0 left-0 h-full w-[800px]"
        style={{ "--workout-ecg-duration": `${durationMs}ms` } as CSSProperties}
      >
        {offsets.map((x, i) => (
          <path
            key={x}
            d={i % 2 === 0 ? tileA : tileB}
            transform={`translate(${x},0)`}
            fill="none"
            stroke="var(--accent)"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={0.8}
          />
        ))}
      </svg>
    </div>
  );
}
