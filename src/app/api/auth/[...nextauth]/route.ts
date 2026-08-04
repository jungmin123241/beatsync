import { Auth } from "@auth/core";
import { authConfig } from "@/auth";

// Spotify는 redirect URI로 localhost라는 이름을 허용하지 않고 127.0.0.1만 허용한다.
// 그런데 Next.js 개발 서버는 요청 주소를 항상 localhost로 보고하고,
// NextRequest로는 이 주소를 바꿀 수 없다(전달한 주소를 무시함).
// 그래서 next-auth의 기본 핸들러 대신 Auth.js를 직접 호출하면서,
// 표준 Request로 주소를 127.0.0.1로 맞춰 넘긴다.
// (이렇게 해야 인증 시작 주소와 토큰 교환 주소가 일치한다)
function handler(request: Request) {
  const url = new URL(request.url);
  if (url.hostname === "localhost") {
    url.hostname = "127.0.0.1";
    return Auth(new Request(url, request), authConfig);
  }
  return Auth(request, authConfig);
}

export { handler as GET, handler as POST };
