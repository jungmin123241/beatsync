// 운동 종류·플레이리스트 지정을 localStorage에 저장/조회 — DESIGN.md 4번 데이터 모델 참고
const WORKOUTS_KEY = "beatsync.workouts";
const CURRENT_WORKOUT_KEY = "beatsync.currentWorkout";

export type Workout = {
  name: string;
  playlistId: string;
  playlistName: string;
};

export function getWorkouts(): Workout[] {
  const raw = localStorage.getItem(WORKOUTS_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

// 같은 이름의 운동이 이미 있으면 플레이리스트 지정을 덮어쓰고, 없으면 새로 추가한다
export function saveWorkout(workout: Workout): void {
  const workouts = getWorkouts();
  const index = workouts.findIndex((w) => w.name === workout.name);
  if (index >= 0) {
    workouts[index] = workout;
  } else {
    workouts.push(workout);
  }
  localStorage.setItem(WORKOUTS_KEY, JSON.stringify(workouts));
}

export function setCurrentWorkout(name: string): void {
  localStorage.setItem(CURRENT_WORKOUT_KEY, JSON.stringify({ name }));
}

export function getCurrentWorkout(): { name: string } | null {
  const raw = localStorage.getItem(CURRENT_WORKOUT_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
