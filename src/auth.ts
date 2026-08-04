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

// 액세스 토큰(1시간 만료)을 리프레시 토큰으로 재발급받는다 — DESIGN.md 6번 "토큰 만료" 처리
async function refreshSpotifyAccessToken(refreshToken: string) {
  const basicAuth = Buffer.from(
    `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`,
  ).toString("base64");

  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${basicAuth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  });

  if (!res.ok) {
    throw new Error("REFRESH_FAILED");
  }

  return (await res.json()) as {
    access_token: string;
    expires_in: number;
    refresh_token?: string;
  };
}

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
        // show_dialog: 이전에 좁은 권한으로 승인한 기록이 남아 있으면 Spotify가
        // 동의 화면을 건너뛰고 옛 권한을 그대로 재발급한다. 매번 동의 화면을
        // 띄워 위 3가지 권한을 확실히 다시 받도록 강제한다.
        params: { scope: SPOTIFY_SCOPES, show_dialog: "true" },
      },
      // 시크릿 키를 가진 서버 앱이므로 PKCE 대신 표준 state 검증을 쓴다.
      checks: ["state"],
    }),
  ],
  callbacks: {
    // Spotify 액세스 토큰을 서버 세션(JWT, httpOnly 쿠키)에만 보관.
    // DESIGN.md C4 결정: 브라우저(localStorage)에는 토큰을 두지 않는다.
    async jwt({ token, account }) {
      // 최초 로그인: Spotify가 내려준 토큰 3종을 그대로 저장
      if (account) {
        // 저장(쓰기) 권한이 실제로 부여됐는지 확인하기 위한 진단용 로깅
        console.log("[auth] Spotify가 부여한 권한 범위:", account.scope);
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.accessTokenExpires = (account.expires_at ?? 0) * 1000;
        return token;
      }

      // 액세스 토큰이 아직 유효하면 그대로 사용
      if (
        typeof token.accessTokenExpires === "number" &&
        Date.now() < token.accessTokenExpires
      ) {
        return token;
      }

      // 만료됐으면 리프레시 토큰으로 재발급 시도
      if (!token.refreshToken) {
        token.error = "RefreshAccessTokenError";
        return token;
      }
      try {
        const refreshed = await refreshSpotifyAccessToken(
          token.refreshToken as string,
        );
        token.accessToken = refreshed.access_token;
        token.accessTokenExpires = Date.now() + refreshed.expires_in * 1000;
        if (refreshed.refresh_token) {
          token.refreshToken = refreshed.refresh_token;
        }
        delete token.error;
      } catch {
        token.error = "RefreshAccessTokenError";
      }
      return token;
    },
    async session({ session, token }) {
      // 갱신 실패 시 세션에 토큰을 내려주지 않아 API 라우트가 401로 처리하게 한다
      session.accessToken = token.error
        ? undefined
        : (token.accessToken as string | undefined);
      return session;
    },
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
