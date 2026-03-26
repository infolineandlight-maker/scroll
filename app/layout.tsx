import type { Metadata, Viewport } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_URL || "http://localhost:3000"
  ),
  title: "WEBGi Camera Landing Page Demo",
  description:
    "Three.js demo landing page for product visualization using WEBGi",
  keywords: ["WebGi", "Three.js", "3D", "Camera", "Product Visualization"],
  authors: [{ name: "Neotix", url: "https://neotix.com.br" }],
  openGraph: {
    title: "WEBGi Camera Landing Page Demo",
    description:
      "Three.js demo landing page for product visualization using WEBGi",
    type: "website",
    images: ["/assets/images/imageSocial.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "WEBGi Camera Landing Page Demo",
    description:
      "Three.js demo landing page for product visualization using WEBGi",
    images: ["/assets/images/imageSocial.jpg"],
  },
};

export const viewport: Viewport = {
  themeColor: "#d50f0fc3",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${dmSans.variable} font-sans antialiased`}
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
