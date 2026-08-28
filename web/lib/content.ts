import { cache } from "react";

/* The shape of GET /wp-json/jj/v1/site, mirrored from
   wp-plugin/jj-content/inc/rest-site.php. Fetched once at build time —
   the published site never talks to WordPress except to post the contact form. */

export type Img = {
  src: string;
  alt: string;
  width: number | null;
  height: number | null;
} | null;

export type Link = { label: string; href: string };

export type SectionHead = {
  heading: string;
  eyebrow: string;
  lead: string;
};

export type IconCard = { icon: string; title: string; body: string };

export interface SiteContent {
  seo: {
    title: string;
    description: string;
    author: string;
    theme_color: string;
    canonical: string;
    og_title: string;
    og_description: string;
    og_url: string;
    og_image: Img;
    og_locale: string;
    og_site_name: string;
    twitter_title: string;
    twitter_description: string;
    twitter_image: Img;
    jsonld: Record<string, unknown> | null;
  };
  header: {
    skip_label: string;
    brand: string;
    nav: (Link & { nav_id: string })[];
    cta: Link;
    menu_links: Link[];
    menu_external: Link[];
  };
  hero: {
    greeting: string;
    name: string;
    tagline: string;
    intro: string;
    cta: (Link & { style: "primary" | "transparent" })[];
    cue_label: string;
    cue_aria: string;
    image: Img;
    creds: string[];
  };
  stats: { value: string; label: string }[];
  about: SectionHead & {
    body: string[];
    quote: { text: string; name: string; role: string };
    creds: { key: string; value: string }[];
  };
  dimensions: SectionHead & {
    cards: (IconCard & { number: string })[];
  };
  faith: SectionHead & {
    quote: string;
    motto: string;
    motto_note: string;
    cards: IconCard[];
  };
  spiritual: {
    eyebrow: string;
    heading: string;
    subtitle: string;
    quote: string;
    cta: Link;
    image: Img;
  };
  journey: SectionHead & {
    summary: string;
    resume: {
      icon: string;
      title: string;
      body: string;
      cta_label: string;
      file: string;
    };
    items: {
      period: string;
      location: string;
      icon: string;
      role: string;
      org: string;
      two_col: boolean;
      bullets: string[];
    }[];
  };
  expertise: SectionHead & { cards: IconCard[] };
  credentials: SectionHead & {
    meta: { count: string; label: string; range: string };
    items: { year: string; title: string; institution: string }[];
    feature: {
      icon: string;
      title: string;
      body: string;
      link_label: string;
      link_href: string;
    };
    distinctions: IconCard[];
  };
  certifications: SectionHead & {
    items: (Omit<IconCard, "body"> & { meta: string })[];
  };
  references: SectionHead & {
    items: {
      quote: string;
      name: string;
      role: string;
      known: string;
      tab: string;
      avatar_image: Img;
      avatar_initials: string;
    }[];
  };
  beyond: SectionHead & {
    cards: {
      href: string;
      image: Img;
      eyebrow: string;
      title: string;
      body: string;
      cta_label: string;
    }[];
  };
  contact: {
    heading: string;
    lead: string;
    required_note: string;
    submit: string;
    submit_note: string;
    consent: { label: string; error: string };
    fields: ContactField[];
    alt: { text: string; link_label: string; link_href: string };
    endpoint: string;
  };
  footer: {
    brand: string;
    nav: (Link & { external: boolean; download: boolean })[];
    social: (Link & { icon: string })[];
    base: string[];
  };
}

export type ContactField = {
  id: string;
  name: string;
  type: "text" | "email" | "tel" | "select" | "textarea";
  label: string;
  placeholder: string;
  required: boolean;
  autocomplete: string;
  error: string;
  options: string[];
};

const WP_URL = (process.env.WP_URL ?? "http://johnjofin.local").replace(
  /\/$/,
  "",
);

/* `force-cache`, not `no-store`: an uncached fetch makes the route dynamic,
   which `output: "export"` cannot render. The content is read once per build
   instead, and `npm run build` clears .next/cache first so a build never
   publishes yesterday's content. */
export const getSiteContent = cache(
  async function getSiteContent(): Promise<SiteContent> {
    const url = `${WP_URL}/wp-json/jj/v1/site`;
    const res = await fetch(url, { cache: "force-cache" });

    if (!res.ok) {
      /* fail the build rather than publish a page with sections missing */
      throw new Error(
        `Could not read content from WordPress (${res.status} ${res.statusText}) at ${url}. ` +
          `Is the site running, and is the jj-content plugin active?`,
      );
    }
    return (await res.json()) as SiteContent;
  },
);
