import { Suspense } from "react";
import { Plus_Jakarta_Sans, Mukta } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { LanguageProvider } from "@/components/language-provider";
import { AuthProvider } from "@/components/auth-provider";
import { NavigationProgress } from "@/components/navigation-progress";
import { GlobalToaster } from "@/components/global-toaster";
import { DeferredClientModules } from "@/components/deferred-client-modules";
import { PublicLayoutWrapper } from "@/components/public-layout-wrapper";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
  variable: "--font-sans",
  preload: false,
});

const mukta = Mukta({
  subsets: ["devanagari"],
  weight: ["400", "700"],
  display: "swap",
  variable: "--font-mukta",
  preload: true,
  fallback: ["system-ui", "-apple-system", "sans-serif"],
  adjustFontFallback: true,
});

import { getBaseUrl } from "@/lib/base-url";

const baseUrl = getBaseUrl();

export const metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "MahaExam — महाराष्ट्र स्पर्धा परीक्षा पोर्टल",
    template: "%s | MahaExam",
  },
  description:
    "पोलीस भरती, MPSC, तलाठी, जिल्हा परिषद आणि सर्व सरकारी स्पर्धा परीक्षांसाठी TCS/IBPS पॅटर्न ऑनलाइन मॉक टेस्ट पोर्टल.",
  manifest: "/manifest.json",
  icons: {
    icon: "/icon-192.svg",
    apple: "/icon-192.svg",
  },
  openGraph: {
    type: "website",
    locale: "mr_IN",
    siteName: "MahaExam",
    title: "MahaExam — महाराष्ट्र स्पर्धा परीक्षा पोर्टल",
    description:
      "पोलीस भरती, MPSC, तलाठी, जिल्हा परिषद आणि सर्व सरकारी स्पर्धा परीक्षांसाठी TCS/IBPS पॅटर्न ऑनलाइन मॉक टेस्ट पोर्टल.",
    url: baseUrl,
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "MahaExam — महाराष्ट्र स्पर्धा परीक्षा पोर्टल",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "MahaExam — महाराष्ट्र स्पर्धा परीक्षा पोर्टल",
    description:
      "पोलीस भरती, MPSC, तलाठी, जिल्हा परिषद आणि सर्व सरकारी स्पर्धा परीक्षांसाठी TCS/IBPS पॅटर्न ऑनलाइन मॉक टेस्ट पोर्टल.",
    images: ["/twitter-image"],
  },
  verification: {
    google: "AFLJikKCe3pGN_LvqX6a0Je8-zyg0l4oYqIw27KxiTU",
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

export default function RootLayout({ children }) {
  return (
    <html
      lang="mr"
      suppressHydrationWarning
      className={`${jakarta.variable} ${mukta.variable}`}
      data-scroll-behavior="smooth"
    >
      <body className="min-h-screen bg-slate-50 font-sans text-slate-900 antialiased selection:bg-blue-600 selection:text-white dark:bg-slate-950 dark:text-slate-100">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <LanguageProvider>
            <AuthProvider>
              <GlobalToaster />
              <DeferredClientModules />
              <Suspense fallback={null}>
                <NavigationProgress />
              </Suspense>
              <PublicLayoutWrapper>{children}</PublicLayoutWrapper>
            </AuthProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
