import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tri AI Chat",
  description: "5 columns AI chat with system prompts",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
