import { Suspense } from "react";
import { Plus_Jakarta_Sans, Noto_Sans_Devanagari, Mukta } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { LanguageProvider } from "@/components/language-provider";
import { AuthProvider } from "@/components/auth-provider";
import { PWARegister } from "@/components/pwa-register";
import { NotificationPermissionPrompt } from "@/components/notification-permission-prompt";
import { NavigationProgress } from "@/components/navigation-progress";
import { ReactQueryProvider } from "@/components/query-provider";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
});

const notoDevanagari = Noto_Sans_Devanagari({
  subsets: ["devanagari", "latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
  variable: "--font-marathi",
});

const mukta = Mukta({
  subsets: ["devanagari", "latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
  variable: "--font-mukta",
});

import { getBaseUrl } from "@/lib/base-url";

const baseUrl = getBaseUrl();

export const metadata = {
  metadataBase: new URL(baseUrl),
  title: "MahaExam — महाराष्ट्र स्पर्धा परीक्षा पोर्टल",
  description:
    "पोलीस भरती, MPSC, तलाठी, जिल्हा परिषद आणि सर्व सरकारी स्पर्धा परीक्षांसाठी TCS/IBPS पॅटर्न ऑनलाइन मॉक टेस्ट पोर्टल.",
  manifest: "/manifest.json",
  icons: {
    icon: "/icon-192.svg",
    apple: "/icon-192.svg",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#090d16" },
  ],
};

import { PublicLayoutWrapper } from "@/components/public-layout-wrapper";

export default function RootLayout({ children }) {
  return (
    <html
      lang="mr"
      suppressHydrationWarning
      className={`${jakarta.variable} ${notoDevanagari.variable} ${mukta.variable}`}
    >
      <body className="min-h-screen bg-slate-50 font-sans text-slate-900 antialiased selection:bg-blue-600 selection:text-white dark:bg-slate-950 dark:text-slate-100">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <LanguageProvider>
            <AuthProvider>
              <ReactQueryProvider>
                <PWARegister />
                <NotificationPermissionPrompt />
                <Analytics />
                <Suspense fallback={null}>
                  <NavigationProgress />
                </Suspense>
                <PublicLayoutWrapper>{children}</PublicLayoutWrapper>
              </ReactQueryProvider>
            </AuthProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
