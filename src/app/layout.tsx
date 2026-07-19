import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ServiceWorkerRegistrar } from "@/components/ServiceWorkerRegistrar";

export const metadata: Metadata = {
  title: "Bible in a Year",
  description:
    "A 52-week reading plan through the Law, History, Psalms, Poetry, Prophecy, Gospels, and Epistles.",
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  themeColor: "#233a33",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ServiceWorkerRegistrar />
        {children}
      </body>
    </html>
  );
}
