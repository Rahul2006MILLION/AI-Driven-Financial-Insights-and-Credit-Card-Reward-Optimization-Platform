import type { Metadata } from "next";
import "./globals.css";
import { LanguageProvider } from "@/lib/i18n";
import { AuthProvider } from "@/lib/auth";
import { Navbar } from "@/components/Navbar";
import { MotionProvider } from "@/components/motion/MotionProvider";

const LANGUAGE_BOOT_SCRIPT = `try{var l=localStorage.getItem("cliq_preferred_language");if(l==="hi"||l==="kn"){var d=document.documentElement;d.lang=l;d.setAttribute("data-lang-pending","");setTimeout(function(){d.removeAttribute("data-lang-pending")},2000)}}catch(e){}`;

export const metadata: Metadata = {
  title: "CLIQ — Money Made Simple. In Your Language.",
  description: "AI-Powered Financial Intelligence & Credit Card Reward Optimization Platform. Smarter decisions, Brighter futures. For everyone.",
  // Mark cropped 1:1 from the original /cliq-logo.png asset
  icons: {
    icon: [{ url: "/cliq-mark.png", type: "image/png" }],
    shortcut: "/cliq-mark.png",
    apple: "/cliq-mark.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Hide the English server render for Hindi/Kannada users until LanguageProvider
            applies the saved language (removed in lib/i18n.tsx; 2s fail-safe). */}
        <script dangerouslySetInnerHTML={{ __html: LANGUAGE_BOOT_SCRIPT }} />
      </head>
      <body className="bg-cliq-bg text-cliq-textPrimary mountain-backdrop min-h-screen flex flex-col antialiased">
        <LanguageProvider>
          <AuthProvider>
            <MotionProvider>
              <Navbar />
              <div className="flex-1 flex flex-col">{children}</div>
            </MotionProvider>
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
