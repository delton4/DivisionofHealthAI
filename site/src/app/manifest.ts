import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Division of Health AI | Northwell Health",
    short_name: "Health AI",
    description:
      "Advancing healthcare through artificial intelligence at Northwell Health.",
    start_url: "/",
    display: "browser",
    background_color: "#141211",
    theme_color: "#141211",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
    ],
  };
}
