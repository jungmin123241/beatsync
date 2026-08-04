import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getUserPlaylists } from "@/lib/spotify";
import SetupForm from "./SetupForm";

// ③ 운동 설정 화면 — DESIGN.md "1. 화면 구성 - ③", "라우팅 규칙" 참고
// 로그인 안 된 상태로 접근하면 로그인 화면으로 되돌린다
export default async function SetupPage() {
  const session = await auth();
  if (!session) {
    redirect("/");
  }

  // 로그인한 사용자의 실제 Spotify 플레이리스트 목록을 불러온다 (PLAN.md 4번)
  // 조회 실패 시에도 화면 자체는 뜨게 하고, 안내 문구로 대체한다 (DESIGN.md 6번 에러 처리)
  let playlists: Awaited<ReturnType<typeof getUserPlaylists>> = [];
  let loadError = false;
  try {
    playlists = await getUserPlaylists(session.accessToken!);
  } catch {
    loadError = true;
  }

  return (
    <main className="flex flex-1 flex-col justify-center gap-8 px-6">
      <SetupForm playlists={playlists} loadError={loadError} />
    </main>
  );
}
