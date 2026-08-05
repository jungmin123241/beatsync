"use client";

import { useState, useTransition } from "react";

// 오디오 웨이브폼 막대 높이(px, viewBox 기준 0~60 사이). 렌더마다 값이 바뀌면
// 서버-클라이언트 렌더링이 어긋나므로(hydration mismatch), 고정된 배열로 둔다.
const WAVEFORM_BAR_HEIGHTS = [
  10, 18, 28, 40, 52, 34, 46, 58, 42, 26, 36, 50, 60, 44, 30, 20, 38, 54, 48,
  32, 22, 14, 24, 12,
];

type IntroScreenProps = {
  onGetStarted: () => Promise<void>;
};

// ① 로그인 화면 — 애플 피트니스+에서 영감을 받은 프리미엄 인트로.
// BeatSync 정체성(블랙 & 그린)은 CLAUDE.md 디자인 규칙을 그대로 따른다.
// 진입 애니메이션 타이밍은 전부 globals.css의 --animate-intro-* 토큰 하나에
// 모여 있다 (이 파일에는 지연 시간 같은 매직 넘버가 없다).
export default function IntroScreen({ onGetStarted }: IntroScreenProps) {
  const [isLeaving, setIsLeaving] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleGetStarted() {
    if (isLeaving) return;
    setIsLeaving(true);
    // 버튼이 살짝 눌렸다가 화면이 페이드아웃되는 것을 보여준 뒤 실제 이동을 시작한다
    // (globals.css의 transition-opacity duration과 맞춘 값).
    window.setTimeout(() => {
      startTransition(() => {
        void onGetStarted();
      });
    }, 320);
  }

  return (
    <div
      className={`relative flex flex-1 flex-col overflow-hidden transition-opacity duration-300 ease-out ${
        isLeaving ? "opacity-0" : "opacity-100"
      }`}
    >
      <IntroBackground />

      <div className="relative flex flex-1 flex-col px-6 pt-[max(env(safe-area-inset-top),2rem)] pb-[max(env(safe-area-inset-bottom),1.5rem)]">
        {/* 상단: 로고 */}
        <div className="motion-safe:animate-intro-logo flex flex-col items-center gap-2 pt-4 motion-reduce:opacity-100">
          <div className="relative flex h-14 w-14 items-center justify-center">
            <span className="motion-safe:animate-intro-ring-pulse absolute inset-0 rounded-full bg-accent/40 blur-[2px] motion-reduce:hidden" />
            <span className="relative flex h-14 w-14 items-center justify-center rounded-full border border-accent/30 bg-accent/10 text-2xl">
              ❤
            </span>
          </div>
          <p className="text-sm font-semibold tracking-[0.2em] text-foreground/80">
            BEATSYNC
          </p>
        </div>

        {/* 중앙: 헤어라인 → 웨이브폼 → 헤드라인 → 설명 */}
        <div className="flex flex-1 flex-col items-center justify-center gap-8 text-center">
          <HeartbeatToWaveform />

          <div className="motion-safe:animate-intro-headline motion-reduce:opacity-100">
            <h1 className="text-5xl leading-[1.05] font-extrabold tracking-tight text-foreground">
              Move
              <br />
              with
              <br />
              <span className="text-accent">your Beat.</span>
            </h1>
          </div>

          <p className="motion-safe:animate-intro-description max-w-[22rem] text-base leading-relaxed text-zinc-400 motion-reduce:opacity-100">
            Your workout adapts to your rhythm.
            <br />
            Real-time music. Real-time motivation.
          </p>
        </div>

        {/* 하단: CTA */}
        <div className="motion-safe:animate-intro-cta pb-2 motion-reduce:opacity-100">
          <button
            type="button"
            onClick={handleGetStarted}
            disabled={isPending || isLeaving}
            className={`w-full rounded-full bg-accent py-4 text-lg font-semibold text-accent-foreground shadow-[0_0_32px_-8px_var(--accent)] transition-transform duration-200 ease-out disabled:opacity-60 ${
              isLeaving ? "scale-95" : "scale-100"
            }`}
          >
            Get Started →
          </button>
        </div>
      </div>
    </div>
  );
}

// 아주 느리게 움직이는 배경 그라디언트 + 은은한 그린 글로우 원 두 개.
// "숨쉬듯" 느껴지도록 24초 주기로 아주 살짝만 움직인다.
function IntroBackground() {
  return (
    <div
      aria-hidden
      className="motion-safe:animate-intro-bg-drift pointer-events-none absolute inset-0 -z-10"
      style={{
        backgroundImage:
          "radial-gradient(circle at 20% 20%, color-mix(in srgb, var(--accent) 18%, transparent), transparent 55%), radial-gradient(circle at 80% 80%, color-mix(in srgb, var(--accent) 12%, transparent), transparent 50%)",
        backgroundColor: "var(--background)",
        backgroundSize: "140% 140%, 140% 140%",
      }}
    />
  );
}

// 심박 그래프가 그려진 뒤 오디오 웨이브폼으로 크로스페이드되는 장식 요소.
// 완전한 SVG path morph는 별도 라이브러리가 필요해 이 프로젝트 규모에는
// 과하다고 판단, 두 그래픽을 겹쳐 두고 서로 페이드 교차시키는 방식으로
// "심박이 리듬이 된다"는 느낌을 낸다.
function HeartbeatToWaveform() {
  return (
    <div className="relative h-16 w-full max-w-[14rem]">
      <svg
        aria-hidden
        viewBox="0 0 200 60"
        className="motion-safe:animate-intro-ecg absolute inset-0 h-full w-full motion-reduce:hidden"
      >
        <path
          d="M0,30 L60,30 L75,8 L88,52 L98,18 L108,30 L200,30"
          fill="none"
          stroke="var(--accent)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          pathLength={1}
          style={{ strokeDasharray: 1 }}
        />
      </svg>

      <svg
        aria-hidden
        viewBox="0 0 200 60"
        className="motion-safe:animate-intro-waveform-in absolute inset-0 h-full w-full opacity-0 motion-reduce:opacity-100"
      >
        <g className="motion-safe:animate-intro-waveform-pulse origin-center">
          {WAVEFORM_BAR_HEIGHTS.map((height, i) => {
            const x = (i / (WAVEFORM_BAR_HEIGHTS.length - 1)) * 196 + 2;
            return (
              <line
                key={x}
                x1={x}
                x2={x}
                y1={30 - height / 2}
                y2={30 + height / 2}
                stroke="var(--accent)"
                strokeWidth="3"
                strokeLinecap="round"
                opacity={0.55 + (height / 60) * 0.45}
              />
            );
          })}
        </g>
      </svg>
    </div>
  );
}
