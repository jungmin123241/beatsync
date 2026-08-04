"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getProfile } from "@/lib/profile";
import { useMockHeartRate } from "@/hooks/useMockHeartRate";

// 나이(최대심박수)가 없으면 온보딩으로 되돌린다 — DESIGN.md 라우팅 규칙
function useMaxHr(): number | null {
  const router = useRouter();
  const [maxHr, setMaxHr] = useState<number | null>(null);

  useEffect(() => {
    const profile = getProfile();
    if (!profile) {
      router.replace("/onboarding");
      return;
    }
    // localStorage(외부 저장소)를 마운트 시 한 번 읽어와 상태로 옮기는 용도
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMaxHr(profile.maxHr);
  }, [router]);

  return maxHr;
}

export default function HeartRateDisplay() {
  const maxHr = useMaxHr();

  if (maxHr === null) {
    return <p className="text-4xl font-bold">❤ -- bpm</p>;
  }

  return <HeartRateValue maxHr={maxHr} />;
}

function HeartRateValue({ maxHr }: { maxHr: number }) {
  const heartRate = useMockHeartRate(maxHr);
  return <p className="text-4xl font-bold">❤ {heartRate} bpm</p>;
}
