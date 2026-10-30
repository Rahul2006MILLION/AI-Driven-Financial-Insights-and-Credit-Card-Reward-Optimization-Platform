import type { Metadata } from "next";
import "./globals.css";
import { LanguageProvider } from "@/lib/i18n";
import { Navbar } from "@/components/Navbar";

export const metadata: Metadata = {
  title: "CLIQ — Money Made Simple. In Your Language.",
  description: "AI-Powered Financial Intelligence & Credit Card Reward Optimization Platform. Smarter decisions, Brighter futures. For everyone.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-cliq-bg text-cliq-textPrimary mountain-backdrop min-h-screen flex flex-col antialiased">
        <LanguageProvider>
          <Navbar />
          <div className="flex-1 flex flex-col">{children}</div>
        </LanguageProvider>
      </body>
    </html>
  );
}
