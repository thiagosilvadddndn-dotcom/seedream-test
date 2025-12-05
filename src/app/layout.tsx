import type { Metadata } from "next";
import "./globals.css";
import { siteConfig } from "@/config/site.config";

export const metadata: Metadata = {
  title: {
    template: '%s | Seedream 4.5',
    default: 'Seedream 4.5 Free Online | The Next Gen AI Image Generator'
  },
  description: "Experience Seedream 4.5 online. We are building the most intuitive interface for ByteDance's latest image generation model. Sign up for early access.",
  // metadataBase: 使用配置的网站URL，用于生成Open Graph、Twitter卡片等的完整URL
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://www.seedream4-5.cc'),
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' }
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
