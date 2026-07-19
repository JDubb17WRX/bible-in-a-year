import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Bible in a Year",
    short_name: "Bible in a Year",
    description:
      "A 52-week reading plan through the Law, History, Psalms, Poetry, Prophecy, Gospels, and Epistles.",
    id: "/",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "any",
    background_color: "#f7f3ea",
    theme_color: "#4b6358",
    categories: ["lifestyle", "education", "books"],
    icons: [
      { src: "/app-icons/bible-icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/app-icons/bible-icon-512.png", sizes: "512x512", type: "image/png" },
      {
        src: "/app-icons/bible-icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      { src: "/app-icons/bible-apple-touch-180.png", sizes: "180x180", type: "image/png" },
    ],
  };
}
