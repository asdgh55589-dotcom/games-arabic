import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";
import { SmoothScrollProvider } from "@/components/smooth-scroll-provider";
import { SeoUpdater } from "@/components/seo-updater";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ألعاب بالعربي — GAMES ARABIC",
  description: "منصة تعريب وأرشفة الألعاب العربية — حمّل أحدث التعريبات لألعابك المفضلة على PC و NS و PS1-PS4.",
  keywords: ["تعريب", "ألعاب", "arabic", "games", "PC", "NS", "PS4", "PS3", "PS2", "PS1", "ترجمة"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <SeoUpdater />
          <SmoothScrollProvider>
            {children}
          </SmoothScrollProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
