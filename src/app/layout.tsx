import type { Metadata } from "next";
import { Noto_Sans_Thai } from "next/font/google";
import "./globals.css";

const notoSansThai = Noto_Sans_Thai({
  subsets: ["thai", "latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Family Finance | การเงินครอบครัว",
  description: "Smart family finance dashboard — แดชบอร์ดการเงินครอบครัว",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" suppressHydrationWarning className="h-full">
      <body className={`${notoSansThai.className} antialiased h-full`}>{children}</body>
    </html>
  );
}
