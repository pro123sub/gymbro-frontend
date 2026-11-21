import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GYMBRO — Modern Fitness & Gym Management OS",
  description:
    "Professional gym management system with member profiles, trainer roles, simplified attendance, admin analytics, packages, and community feed.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans bg-[#F8FAFC] text-slate-900 antialiased">{children}</body>
    </html>
  );
}
