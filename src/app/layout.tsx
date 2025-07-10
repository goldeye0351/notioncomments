import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "基于 Notion 数据库的简单评论组件系统",
  description: "基于 Notion 数据库的简单评论组件系统",
  generator: 'goldeye0351',
  applicationName: 'notioncomments.51xMI.com',
  referrer: 'origin-when-cross-origin',
  authors: [{ name: 'goldeye0351' }, { name: 'goldeye0351', url: 'https://github.com/goldeye0351/' }],
  creator: 'goldeye0351',
  publisher: 'vercel',
  openGraph: {
    title: '基于 Notion 数据库的简单评论组件系统',
    description:"基于 Notion 数据库的简单评论组件系统",
    url: 'https://notioncomments.51xmi.com',
    siteName: 'notioncomments.51xMI.com',
    images: [
      {
        url: 'https://r2.51xmi.com/pichub/notioncomments.png/1752120306301/notioncomments.png', // Must be an absolute URL
        width: 84,
        height: 84,
        alt: 'notioncomments.51xMI.com',
      },
    ],
    //locale: 'en_US',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
