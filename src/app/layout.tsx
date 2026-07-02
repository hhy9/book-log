import type { Metadata } from "next";
import { QueryProvider } from "@/components/query-provider";
import { AuthProvider } from "@/features/auth/auth-provider";
import { Nav } from "@/components/nav";
import "./globals.css";

export const metadata: Metadata = {
  title: "책장",
  description: "내가 읽은/읽을 책을 기록하고 통계로 보는 독서 기록 앱",
};

// 첫 페인트 전에 테마 클래스를 적용해 다크모드 깜빡임(FOUC)을 방지한다.
const themeScript = `(function(){try{var t=localStorage.getItem('theme');var d=t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme: dark)').matches);if(d)document.documentElement.classList.add('dark');}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        {/* 폰트: Pretendard(본문) + Noto Serif KR(제목) */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@400;500;600;700;900&display=swap"
        />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <QueryProvider>
          <AuthProvider>
            <Nav />
            {children}
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
