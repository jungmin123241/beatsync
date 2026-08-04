import type { DefaultSession } from "next-auth";

// session.accessToken 필드를 타입에 추가 (src/auth.ts의 session 콜백과 짝)
declare module "next-auth" {
  interface Session {
    accessToken?: string;
    user?: DefaultSession["user"];
  }
}

// jwt 콜백에서 액세스 토큰 갱신에 쓰는 필드들을 타입에 추가 (src/auth.ts와 짝)
declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    refreshToken?: string;
    accessTokenExpires?: number;
    error?: string;
  }
}
