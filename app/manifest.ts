import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

// Required for `output: "export"` — emit a static manifest.webmanifest.
export const dynamic = "force-static";

/**
 * Web app manifest. Colors match the dark theme tokens in `app/globals.css`
 * (--background: #07060a) so the install splash blends into the site.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE.name,
    short_name: SITE.shortName,
    description: SITE.description,
    start_url: "/",
    display: "standalone",
    background_color: "#07060a",
    theme_color: "#07060a",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/apple-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}
