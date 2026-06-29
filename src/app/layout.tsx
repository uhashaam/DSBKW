import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import LayoutShell from "@/components/LayoutShell";
import { getSettings } from "@/lib/data";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata({}: {}): Promise<Metadata> {
  const settings = await getSettings();
  // Default to Chinese; Next.js will use this for default language.
  return {
    title: settings.siteName_zh,
    description: settings.siteDescription_zh,
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getSettings();

  return (
    <html
      lang="zh-Hans"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <title>{settings.siteName_zh}</title>
        <meta name="description" content={settings.siteDescription_zh} />
      </head>
      <body className="min-h-full flex flex-col">
        <LayoutShell>{children}</LayoutShell>
      </body>
    </html>
  );
}

