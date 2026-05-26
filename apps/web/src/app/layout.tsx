import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";

const inter = Inter({ subsets: ["latin"] });


export const metadata: Metadata = {
  metadataBase: new URL("https://snappdf.shop"),
  title: {
    default: "SnapPDF | Free Client-Side PDF Tools",
    template: "%s | SnapPDF",
  },
  description: "Free, fast, and secure browser-based PDF tools. Merge, split, compress, rotate, watermark, and manipulate PDFs directly in your browser without uploading files to any server.",
  keywords: ["pdf tools", "free pdf", "merge pdf", "compress pdf", "split pdf", "watermark pdf", "rotate pdf", "client-side pdf", "secure pdf processing"],
  openGraph: {
    title: "SnapPDF | Free Client-Side PDF Tools",
    description: "Free, fast, and secure browser-based PDF tools. Manipulate PDFs directly in your browser.",
    url: "https://snappdf.shop",
    siteName: "SnapPDF",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "SnapPDF",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SnapPDF | Free Client-Side PDF Tools",
    description: "Free, fast, and secure browser-based PDF tools. Manipulate PDFs directly in your browser.",
    images: ["/og-image.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          {children}
          <SpeedInsights />
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  );
}
