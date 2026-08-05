import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import WorkoutView from "./WorkoutView";

// ④ 운동 화면 (메인) — DESIGN.md "1. 화면 구성 - ④", "라우팅 규칙" 참고
// 실제 로직은 PLAN.md 6~9번에서 순서대로 구현 예정:
// - 가상 심박수 발생, 5초마다 갱신 (6번, 완료)
// - 샘플 곡 목록 (7번, 완료)
// - BPM이 가장 가까운 곡 추천, 저장 (8번, 완료)
// - 곡이 바뀌면 안내 메시지 표시 (9번)
export default async function WorkoutPage() {
  const session = await auth();
  // accessToken이 없으면 토큰 갱신 실패 상태 — 저장이 계속 실패하므로 재로그인시킨다
  if (!session?.accessToken) {
    redirect("/");
  }

  return (
    <main className="flex flex-1 flex-col justify-center gap-8 px-6 py-8">
      <WorkoutView />

      <Link
        href="/setup"
        className="w-full rounded-full border border-foreground/15 py-3 text-center text-sm font-medium text-foreground/70 transition-colors active:border-foreground/30 active:text-foreground"
      >
        운동 종료
      </Link>
    </main>
  );
}
