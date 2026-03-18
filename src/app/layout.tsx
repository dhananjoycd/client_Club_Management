import type { Metadata } from "next";
import { Manrope, Space_Grotesk } from "next/font/google";
import { Suspense } from "react";
import { RouteProgressBar } from "@/components/feedback/route-progress-bar";
import { GlobalErrorProvider } from "@/providers/global-error-provider";
import { QueryProvider } from "@/providers/query-provider";
import { ToasterProvider } from "@/providers/toaster-provider";
import "./globals.css";

const bodyFont = Manrope({
  variable: "--font-body",
  subsets: ["latin"],
});

const displayFont = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "XYZ Tech Club",
  description: "Modern club and district association management frontend for XYZ Tech Club.",
};

type RootLayoutProps = Readonly<{
  children: React.ReactNode;
}>;

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${bodyFont.variable} ${displayFont.variable}`}>
        <QueryProvider>
          <GlobalErrorProvider>
            <Suspense fallback={null}>
              <RouteProgressBar />
            </Suspense>
            {children}
            <ToasterProvider />
          </GlobalErrorProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
