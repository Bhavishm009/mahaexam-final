import { Suspense } from "react";
import {
  Plus_Jakarta_Sans,
  Noto_Sans_Devanagari,
  Mukta,
  Baloo_2,
  Tiro_Devanagari_Marathi,
} from "next/font/google";
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

const baloo2 = Baloo_2({
  subsets: ["devanagari", "latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
  variable: "--font-baloo",
});

const tiroMarathi = Tiro_Devanagari_Marathi({
  subsets: ["devanagari", "latin"],
  weight: ["400"],
  display: "swap",
  variable: "--font-tiro",
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
      className={`${jakarta.variable} ${notoDevanagari.variable} ${mukta.variable} ${baloo2.variable} ${tiroMarathi.variable}`}
      data-scroll-behavior="smooth"
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@400;500;600;700;800&family=Hind:wght@400;500;600;700&family=Mukta:wght@400;500;600;700;800&family=Noto+Sans+Devanagari:wght@400;500;600;700;800;900&family=Roboto:ital,wght@0,400;0,500;0,700;1,400;1,500;1,700&family=Tiro+Devanagari+Marathi:ital@0;1&display=swap"
        />
      </head>
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
