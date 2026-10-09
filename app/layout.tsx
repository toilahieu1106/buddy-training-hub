import type { Metadata } from "next";
import { Lexend, Space_Mono } from "next/font/google";
import "./globals.css";

const lexend = Lexend({
  weight: ["300", "400", "500", "600", "700", "800"],
  subsets: ["vietnamese", "latin"],
  variable: "--font-lexend",
  display: "swap",
});

const spaceMono = Space_Mono({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-space-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Buddy Training Hub | Bệnh viện Phương Đông",
  description: "Hệ thống Điểm danh & Nộp bài tập - Đào tạo Quản lý Cấp trung & Cấp cao",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={`${lexend.variable} ${spaceMono.variable}`}>
      <body className="min-h-screen antialiased text-slate-900 bg-slate-50 font-sans selection:bg-slate-800 selection:text-white">
        {children}
      </body>
    </html>
  );
}
