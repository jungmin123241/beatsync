"use client";

import { useEffect, useState } from "react";

// PRD 5-[must]0 규칙: 최대심박수의 약 40~90% 범위에서 5초마다 값이 바뀌는 가상 심박수
const MIN_RATIO = 0.4;
const MAX_RATIO = 0.9;
const UPDATE_INTERVAL_MS = 5000;
const MAX_STEP_BPM = 8; // 한 번에 너무 크게 튀지 않도록 이전 값 기준 소폭 변동

export function useMockHeartRate(maxHr: number): number {
  const min = Math.round(maxHr * MIN_RATIO);
  const max = Math.round(maxHr * MAX_RATIO);

  const [heartRate, setHeartRate] = useState(() =>
    Math.round((min + max) / 2),
  );

  useEffect(() => {
    const id = setInterval(() => {
      setHeartRate((prev) => {
        const delta = Math.round((Math.random() * 2 - 1) * MAX_STEP_BPM);
        return Math.min(max, Math.max(min, prev + delta));
      });
    }, UPDATE_INTERVAL_MS);

    return () => clearInterval(id);
  }, [min, max]);

  return heartRate;
}
