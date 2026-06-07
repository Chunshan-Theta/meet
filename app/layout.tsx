import type { Metadata } from "next";
import "./globals.css";
import Header from "../components/ui/header";
import Footer from "../components/ui/footer";

export const metadata: Metadata = {
  title: "Academic Scheduler MVP",
  description: "Minimal academic scheduling app",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-Hant">
      <body className="bg-slate-50 text-slate-900">
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-1 container mx-auto px-4 py-6">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
