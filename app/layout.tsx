import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Academic Scheduler MVP",
  description: "Minimal academic scheduling app",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-Hant">
      <body className="bg-slate-50 text-slate-900">{children}</body>
    </html>
  );
}
