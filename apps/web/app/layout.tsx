import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "OzPulse Dashboard",
  description: "Live Australian national dashboard - energy, housing, safety, demographics, infrastructure",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
