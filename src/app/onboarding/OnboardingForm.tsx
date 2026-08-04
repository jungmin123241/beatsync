"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { saveProfile } from "@/lib/profile";

export default function OnboardingForm() {
  const router = useRouter();
  const [age, setAge] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsedAge = Number(age);
    if (!Number.isInteger(parsedAge) || parsedAge < 1 || parsedAge > 120) {
      setError("나이를 1~120 사이 숫자로 입력해주세요");
      return;
    }
    saveProfile(parsedAge);
    router.push("/setup");
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full flex-col gap-6">
      <input
        type="number"
        inputMode="numeric"
        placeholder="나이"
        value={age}
        onChange={(e) => setAge(e.target.value)}
        className="w-full rounded-lg border border-foreground/20 px-4 py-3 text-center text-lg"
      />

      {error && <p className="text-center text-sm text-red-500">{error}</p>}

      <button
        type="submit"
        className="w-full rounded-full bg-accent py-3 font-medium text-accent-foreground"
      >
        다음
      </button>
    </form>
  );
}
