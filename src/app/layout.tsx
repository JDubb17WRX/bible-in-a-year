import type { Metadata, Viewport } from "next";
import { Lora, Nunito } from "next/font/google";
import { cookies } from "next/headers";
import "./globals.css";
import { ServiceWorkerRegistrar } from "@/components/ServiceWorkerRegistrar";
import { THEME_COOKIE_NAME } from "@/lib/theme";

const lora = Lora({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-lora",
  display: "swap",
});

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  variable: "--font-nunito",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Bible in a Year",
  description:
    "A 52-week reading plan through the Law, History, Psalms, Poetry, Prophecy, Gospels, and Epistles.",
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  themeColor: "#4b6358",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const themeCookie = cookieStore.get(THEME_COOKIE_NAME)?.value;
  const dataTheme = themeCookie === "dark" || themeCookie === "light" ? themeCookie : undefined;

  return (
    <html lang="en" data-theme={dataTheme} className={`${lora.variable} ${nunito.variable}`}>
      <body>
        <ServiceWorkerRegistrar />
        {children}
      </body>
    </html>
  );
}
