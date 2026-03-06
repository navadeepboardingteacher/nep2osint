import type { Metadata } from "next";
import "./globals.css";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Nepal Election OSINT Dashboard | निर्वाचन 2082",
  description: "Real-time Nepal Election Intelligence Dashboard - Live vote counting, RSS news aggregation, and social media monitoring for Nepal Election 2082",
  keywords: ["Nepal Election", "निर्वाचन 2082", "Election Results", "Vote Counting", "मतगणना", "OSINT"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={cn("min-h-screen bg-background font-sans antialiased")}>
        {children}
      </body>
    </html>
  );
}
