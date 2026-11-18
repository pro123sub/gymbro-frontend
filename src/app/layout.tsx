import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GYMFLOW — Crush Lifestyle Fitness Studio Admin",
  description:
    "Prompt-first Gym Management, Google Sheets Sync & n8n Automation Admin Panel for Crush Lifestyle Fitness Studio.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans bg-canvas text-slate-900 antialiased">{children}</body>
    </html>
  );
}
