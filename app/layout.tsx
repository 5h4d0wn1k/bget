import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "@/app/globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import RevealInit from "@/components/RevealInit";
import { SITE } from "@/lib/site";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: "BGET — a global community of builders, scientists, makers",
    template: "%s | BGET",
  },
  description: SITE.description,
  applicationName: SITE.name,
  icons: { icon: "/assets/favicon.png", apple: "/assets/favicon.png" },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    siteName: SITE.name,
    locale: "en_US",
    url: SITE.url,
    title: "BGET — a global community of builders, scientists, makers",
    description: SITE.description,
    images: [{ url: SITE.ogImage, width: 1200, height: 630, alt: "BGET — Build. Grow. Evolve. Together." }],
  },
  twitter: {
    card: "summary_large_image",
    title: "BGET — a global community of builders, scientists, makers",
    description: SITE.description,
    images: [SITE.ogImage],
  },
  robots: {
    index: true,
    follow: true,
    "max-image-preview": "large",
    "max-snippet": -1,
    "max-video-preview": -1,
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  width: "device-width",
  initialScale: 1,
};

const orgJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE.name,
  url: SITE.url,
  logo: `${SITE.url}/assets/bgetlogo.png`,
  description: SITE.description,
  email: SITE.email,
  sameAs: [SITE.github],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        {/*
          Add the `js` gate before first paint so `.reveal` never flashes
          visible→hidden. Also arm a fail-safe: if RevealInit never mounts
          (hydration blocked/stalled), drop the `js` gate after a few seconds
          so content is ALWAYS visible — the reveal is decorative, never a
          gate on content.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: `document.documentElement.classList.add('js');window.__bgetRevealFailsafe=setTimeout(function(){document.documentElement.classList.remove('js');},4000);`,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
        <RevealInit />
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <Header />
        <main id="main">{children}</main>
        <Footer />
      </body>
    </html>
  );
}