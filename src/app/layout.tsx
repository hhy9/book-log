import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { QueryProvider } from "@/components/query-provider";
import { AuthProvider } from "@/features/auth/auth-provider";
import { Nav } from "@/components/nav";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

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
    <html lang="ko" suppressHydrationWarning className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
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
