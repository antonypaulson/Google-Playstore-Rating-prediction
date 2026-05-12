import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Investment Command Center | 2028 Growth Portfolio",
  description: "Personal AI infrastructure investment tracker and opportunity scanner",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full antialiased">{children}</body>
    </html>
  );
}
