import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";
import Providers from "./providers";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { getGravatarUrl } from "@/lib/constants";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

const siteUrl = "https://amrabed.com";
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Amr Abed | Blog",
    template: "%s | Amr Abed",
  },
  description:
    "Technical articles and insights on Artificial Intelligence, Cloud Architecture, Serverless Systems, and Home Automation by Amr Abed.",
  keywords: [
    "Amr Abed",
    "Blog",
    "Artificial Intelligence",
    "Machine Learning",
    "Cloud Architecture",
    "AWS",
    "Serverless",
    "Home Assistant",
  ],
  authors: [{ name: "Amr Abed", url: "https://amrabed.com" }],
  creator: "Amr Abed",
  robots: "index, follow",
  icons: {
    icon: [
      {
        url: `${basePath}/icon-light.svg`,
        type: "image/svg+xml",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: `${basePath}/icon-dark.svg`,
        type: "image/svg+xml",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: `${basePath}/icon.svg`,
        type: "image/svg+xml",
      },
      {
        url: `${basePath}/favicon.ico`,
        sizes: "any",
      },
    ],
    apple: [
      {
        url: `${basePath}/apple-touch-icon.png`,
        sizes: "180x180",
        type: "image/png",
      },
    ],
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: `${siteUrl}${basePath}`,
    title: "Amr Abed | Blog",
    description:
      "Technical articles and insights on Artificial Intelligence, Cloud Architecture, Serverless Systems, and Home Automation.",
    siteName: "Amr Abed's Blog",
    images: [
      {
        url: getGravatarUrl(800),
        width: 800,
        height: 600,
        alt: "Amr Abed",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Amr Abed | Blog",
    description:
      "Technical articles and insights on Artificial Intelligence, Cloud Architecture, Serverless Systems, and Home Automation.",
    creator: "@amr_abed",
    images: [getGravatarUrl(800)],
  },
  alternates: {
    types: {
      "application/rss+xml": `${basePath}/rss.xml`,
    },
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.className} antialiased min-h-screen flex flex-col transition-colors duration-500`}
      >
        <Providers>
          <Header />
          <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-10">
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
      <GoogleAnalytics gaId="G-JKPDWZ2PLD" />
    </html>
  );
}
