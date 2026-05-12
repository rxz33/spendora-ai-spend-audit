import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Spendora - AI Spend Audit",
  description: "Identify wasted AI spend and find optimized alternatives for your team.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
