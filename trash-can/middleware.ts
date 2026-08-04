import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Spotify는 보안 정책상 redirect URI로 localhost라는 이름을 허용하지 않고
// 127.0.0.1만 허용한다. 그래서 브라우저가 localhost:3000으로 접속하면
// 인증 시작 주소(127.0.0.1)와 토큰 교환 주소(localhost)가 어긋나
// "Invalid redirect URI" 오류가 난다.
// 어떤 주소로 들어오든 127.0.0.1로 통일시켜 이 문제를 원천 차단한다.
export function middleware(request: NextRequest) {
  if (request.nextUrl.hostname === "localhost") {
    const target = new URL(request.nextUrl.href);
    target.hostname = "127.0.0.1";
    console.log("[디버그] 미들웨어 리다이렉트:", request.nextUrl.href, "->", target.href);
    return NextResponse.redirect(target.href, 307);
  }
  return NextResponse.next();
}

export const config = {
  // 정적 파일(_next 등)을 제외한 모든 경로에 적용
  matcher: "/((?!_next/static|_next/image|favicon.ico).*)",
};
