import NextAuth from "next-auth";
import type { NextAuthConfig } from "next-auth";
import Spotify from "next-auth/providers/spotify";

// PRD 5-[must]0 규칙: Spotify 계정 연동으로만 가입·로그인 (자체 회원가입 없음)
// DESIGN.md 5번 권한 범위: 플레이리스트 조회·추가에 필요한 3가지 scope
const SPOTIFY_SCOPES = [
  "playlist-read-private",
  "playlist-modify-public",
  "playlist-modify-private",
].join(" ");

export const authConfig: NextAuthConfig = {
  // 배포 환경(Vercel 등)에서 요청 호스트를 신뢰해 콜백 주소를 구성하도록 허용
  trustHost: true,
  basePath: "/api/auth",
  secret: process.env.AUTH_SECRET,
  providers: [
    Spotify({
      clientId: process.env.SPOTIFY_CLIENT_ID,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
      authorization: {
        url: "https://accounts.spotify.com/authorize",
        params: { scope: SPOTIFY_SCOPES },
      },
      // 시크릿 키를 가진 서버 앱이므로 PKCE 대신 표준 state 검증을 쓴다.
      checks: ["state"],
    }),
  ],
  callbacks: {
    // Spotify 액세스 토큰을 서버 세션(JWT, httpOnly 쿠키)에만 보관.
    // DESIGN.md C4 결정: 브라우저(localStorage)에는 토큰을 두지 않는다.
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token;
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken as string | undefined;
      return session;
    },
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
