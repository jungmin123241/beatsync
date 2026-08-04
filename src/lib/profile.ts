// 나이·최대심박수를 localStorage에 저장/조회 — DESIGN.md 4번 데이터 모델 참고
const PROFILE_KEY = "beatsync.profile";

export type Profile = {
  age: number;
  maxHr: number;
};

export function saveProfile(age: number): Profile {
  const profile: Profile = { age, maxHr: 220 - age };
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  return profile;
}

export function getProfile(): Profile | null {
  const raw = localStorage.getItem(PROFILE_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw);
    if (typeof parsed.age === "number" && typeof parsed.maxHr === "number") {
      return parsed as Profile;
    }
    return null;
  } catch {
    return null;
  }
}
