import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "비트싱크",
  description: "심박수에 맞춰 음악을 추천해주는 서비스",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        {/*
          Spotify는 redirect URI로 localhost라는 이름을 허용하지 않고 127.0.0.1만 허용한다.
          localhost로 접속하면 로그인 쿠키와 콜백 주소가 어긋나 인증이 실패하므로,
          화면이 그려지기 전에 127.0.0.1로 옮겨준다. (개발 환경 전용)
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: `if(location.hostname==="localhost"){location.replace("http://127.0.0.1:"+location.port+location.pathname+location.search);}`,
          }}
        />
      </head>
      {/* 모바일 세로 화면 전용: 콘텐츠를 화면 중앙의 좁은 폭 안에만 표시 */}
      <body className="min-h-full flex flex-col items-center bg-background text-foreground">
        <div className="w-full max-w-sm min-h-screen flex flex-col">
          {children}
        </div>
      </body>
    </html>
  );
}
