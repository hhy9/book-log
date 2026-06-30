import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { QueryProvider } from "@/components/query-provider";
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
          <QueryProvider>
            <Nav />
            {children}
          </QueryProvider>
        </body>
    </html>
  );
}
