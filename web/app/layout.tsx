/* Stylesheet order matters and is not the order in the old <head>.
   The Play CDN injected its <style> at the END of head, after styles.css, so
   Tailwind utilities won specificity ties. Measured on the live page:

     lenis.css → splide-core.min.css → styles.css → [tailwind injected]

   The imports below reproduce that, which is why tailwind.css comes last. */
import "lenis/dist/lenis.css";
import "@splidejs/splide/dist/css/splide-core.min.css";
import "./globals.css";
import "./tailwind.css";

import type { Metadata, Viewport } from "next";
import { DM_Sans, Inter } from "next/font/google";
import IconSprite from "@/components/IconSprite";
import { getSiteContent } from "@/lib/content";

/* self-hosted, so the page no longer blocks on fonts.googleapis.com.

   DM Sans must stay VARIABLE with the optical-size axis: the original asked
   for `opsz,wght@9..40,300..700`, and requesting static weights instead gives
   subtly different glyph widths — enough to re-wrap every display heading. */
const dmSans = DM_Sans({
  subsets: ["latin"],
  axes: ["opsz"],
  variable: "--font-display",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-sans",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const { seo } = await getSiteContent();

  return {
    title: seo.title,
    description: seo.description,
    authors: seo.author ? [{ name: seo.author }] : undefined,
    alternates: seo.canonical ? { canonical: seo.canonical } : undefined,
    robots: { index: true, follow: true },
    openGraph: {
      type: "profile",
      siteName: seo.og_site_name,
      title: seo.og_title,
      description: seo.og_description,
      url: seo.og_url,
      locale: seo.og_locale,
      images: seo.og_image
        ? [
            {
              url: seo.og_image.src,
              width: seo.og_image.width ?? undefined,
              height: seo.og_image.height ?? undefined,
            },
          ]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: seo.twitter_title,
      description: seo.twitter_description,
      images: seo.twitter_image ? [seo.twitter_image.src] : undefined,
    },
    icons: { icon: [{ url: "/favicon.svg", type: "image/svg+xml" }] },
  };
}

export async function generateViewport(): Promise<Viewport> {
  const { seo } = await getSiteContent();
  return {
    width: "device-width",
    initialScale: 1,
    themeColor: seo.theme_color || undefined,
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${dmSans.variable} ${inter.variable}`}>
      <body className="bg-white font-sans text-ink antialiased">
        <IconSprite />
        {children}
      </body>
    </html>
  );
}
