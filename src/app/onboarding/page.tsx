import { redirect } from "next/navigation";
import { auth } from "@/auth";
import OnboardingForm from "./OnboardingForm";

// ② 온보딩 화면 (나이 입력, 최초 1회) — DESIGN.md "1. 화면 구성 - ②", "라우팅 규칙" 참고
// 로그인 안 된 상태로 접근하면 로그인 화면으로 되돌린다
export default async function OnboardingPage() {
  const session = await auth();
  if (!session) {
    redirect("/");
  }

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-8 px-6 text-center">
      <h1 className="text-xl font-bold">나이를 알려주세요</h1>
      <OnboardingForm />
    </main>
  );
}
