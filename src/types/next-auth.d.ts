import type { DefaultSession } from "next-auth";

// session.accessToken 필드를 타입에 추가 (src/auth.ts의 session 콜백과 짝)
declare module "next-auth" {
  interface Session {
    accessToken?: string;
    user?: DefaultSession["user"];
  }
}
