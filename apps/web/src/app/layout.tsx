import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "OzPulse Dashboard",
  description: "Live Australian data dashboard — energy, housing, crime, demographics, infrastructure, mining, and leisure on one map.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-background text-foreground antialiased">
        {children}
      </body>
    </html>
  );
}
