import type { Metadata } from "next";
import { siteUrl } from "@/lib/sites";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: "Mihrab",
  description: "Prayer times & community directory for masjids across Ahmedabad.",
  icons: {
    icon: [
      { url: "/logo-emblem.svg", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/logo-emblem.svg" },
    ],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="gu">
      <head>
        <link rel="icon" href="/logo-emblem.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/logo-emblem.svg" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Hind+Vadodara:wght@400;500;600;700&family=Outfit:wght@500;600;700;800;900&display=swap"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
