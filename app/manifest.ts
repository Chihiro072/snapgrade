import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Ting Xie | Chinese handwriting practice",
    short_name: "Ting Xie",
    description:
      "Practice, scan, and improve Chinese handwriting with Ting Xie.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#f6f8f5",
    theme_color: "#2f7168",
    icons: [
      {
        src: "/logo-notext.png",
        sizes: "500x500",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
