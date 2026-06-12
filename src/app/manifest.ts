import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Via-We Services Pvt. Ltd.",
    short_name: "Via-We",
    description:
      "A digital business consultation experience — brand building, business setup, franchising, recruitment and marketing.",
    start_url: "/",
    display: "standalone",
    background_color: "#050d17",
    theme_color: "#050d17",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
