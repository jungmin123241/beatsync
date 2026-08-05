import { signIn } from "@/auth";
import IntroScreen from "./IntroScreen";

// ① 로그인 화면 — DESIGN.md "1. 화면 구성 - ①" 참고
// 화면 자체는 IntroScreen(클라이언트 컴포넌트)이 그리고, 이 서버 컴포넌트는
// Spotify 로그인 서버 액션만 만들어서 넘긴다.
async function handleGetStarted() {
  "use server";
  await signIn("spotify", { redirectTo: "/setup" });
}

export default function LoginPage() {
  return <IntroScreen onGetStarted={handleGetStarted} />;
}
