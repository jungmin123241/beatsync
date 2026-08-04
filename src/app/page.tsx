import { signIn } from "@/auth";

// ① 로그인 화면 — DESIGN.md "1. 화면 구성 - ①" 참고
// Spotify 로그인은 서버 액션으로 처리 (버튼 클릭 → Auth.js가 Spotify 인증 화면으로 이동)
export default function LoginPage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-10 px-6 text-center">
      <h1 className="text-3xl font-bold tracking-tight">BeatSync</h1>

      <form
        action={async () => {
          "use server";
          await signIn("spotify", { redirectTo: "/setup" });
        }}
        className="w-full"
      >
        <button
          type="submit"
          className="w-full rounded-full bg-accent py-3 font-medium text-accent-foreground"
        >
          Spotify로 시작하기
        </button>
      </form>
    </main>
  );
}
