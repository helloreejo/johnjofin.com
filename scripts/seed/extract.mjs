/* Pull every editable string out of the current static index.html into a
   structured JSON payload — the shape the WP REST endpoint will return.
   Parsing the real DOM beats hand-transcribing 2381 lines of markup. */
import puppeteer from "puppeteer-core";
import { writeFileSync } from "node:fs";

const b = await puppeteer.launch({
  executablePath:
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: true,
  args: ["--disable-gpu"],
});
const p = await b.newPage();
await p.setViewport({ width: 1440, height: 900 });
await p.goto("http://localhost:8777/index.html", { waitUntil: "networkidle0" });

const data = await p.evaluate(() => {
  const t = (el) => (el ? el.textContent.replace(/\s+/g, " ").trim() : null);
  const html = (el) => (el ? el.innerHTML.replace(/\s+/g, " ").trim() : null);
  const attr = (el, a) => (el ? el.getAttribute(a) : null);
  const icon = (el) => {
    const u = el && el.querySelector("use");
    return u ? u.getAttribute("href").replace("#", "") : null;
  };
  const img = (el) =>
    el
      ? {
          src: el.getAttribute("src"),
          alt: el.getAttribute("alt") || "",
          width: +el.getAttribute("width") || null,
          height: +el.getAttribute("height") || null,
        }
      : null;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  /* section header: h2 + eyebrow + optional lead */
  const head = (sec) => ({
    heading: html($(".sec-title-row h2", sec)),
    eyebrow: t($(".sec-meta", sec)),
    lead: html($(".sec-lead", sec)),
  });

  const meta = (n) =>
    attr($(`meta[name="${n}"], meta[property="${n}"]`), "content");

  return {
    seo: {
      title: document.title.replace(/\s+/g, " ").trim(),
      description: meta("description"),
      author: meta("author"),
      theme_color: meta("theme-color"),
      canonical: attr($('link[rel="canonical"]'), "href"),
      og_title: meta("og:title"),
      og_description: meta("og:description"),
      og_url: meta("og:url"),
      og_image: meta("og:image"),
      og_locale: meta("og:locale"),
      og_site_name: meta("og:site_name"),
      twitter_title: meta("twitter:title"),
      twitter_description: meta("twitter:description"),
      twitter_image: meta("twitter:image"),
      jsonld: $('script[type="application/ld+json"]')
        ? JSON.parse($('script[type="application/ld+json"]').textContent)
        : null,
    },

    header: {
      skip_label: t($('a[href="#about"].sr-only')),
      brand: t($(".brand-name")),
      nav: $$("#siteheader .navlink").map((a) => ({
        label: t(a),
        href: attr(a, "href"),
        nav_id: attr(a, "data-nav"),
      })),
      cta: {
        label: t($("#siteheader .btn")),
        href: attr($("#siteheader .btn"), "href"),
      },
      menu_links: $$("#menu ul a").map((a) => ({
        label: t(a),
        href: attr(a, "href"),
      })),
      menu_external: $$("#menu .mt-10 a").map((a) => ({
        label: t(a),
        href: attr(a, "href"),
      })),
    },

    hero: {
      greeting: t($(".hero-greet")),
      /* the h1 minus the greeting span */
      name: (() => {
        const h = $(".hero-name").cloneNode(true);
        const g = h.querySelector(".hero-greet");
        if (g) g.remove();
        return h.textContent.replace(/\s+/g, " ").trim();
      })(),
      tagline: html($(".hero-tag")),
      intro: html($(".hero-intro")),
      cta: $$(".hero-cta a").map((a) => ({
        label: t(a),
        href: attr(a, "href"),
        style: a.classList.contains("btn-primary") ? "primary" : "transparent",
      })),
      cue_label: t($(".hero-cue-label")),
      cue_aria: attr($(".hero-cue"), "aria-label"),
      image: img($(".hero-img")),
      creds: $$(".hero-creds li").map(t),
    },

    stats: $$('[aria-label="At a glance"] .grid > div').map((d) => ({
      value: t($("b", d)),
      label: t($("span", d)),
    })),

    about: {
      ...head($("#about")),
      body: $$("#about .lg\\:col-span-7 > p").map(html),
      quote: {
        text: html($("#about .about-quote blockquote")),
        name: t($("#about .about-quote-name")),
        role: t($("#about .about-quote-role")),
      },
      creds: $$("#about .about-creds li").map((li) => ({
        key: t($(".about-cred-k", li)),
        value: t($(".about-cred-v", li)),
      })),
    },

    dimensions: {
      ...head($("#dimensions")),
      cards: $$("#dimensions article.card").map((c) => ({
        number: t($("span.font-display", c)),
        icon: icon($(".c-ic", c)),
        title: html($("h3", c)),
        body: html($("p", c)),
      })),
    },

    faith: {
      ...head($("#faith")),
      quote: html($("#faith blockquote")),
      motto: t($("#faith .text-mint")),
      motto_note: t($("#faith .body-t.text-haze")),
      cards: $$("#faith article.card-dark").map((c) => ({
        icon: icon($(".c-ic", c)),
        title: html($("h3", c)),
        body: html($("p", c)),
      })),
    },

    spiritual: {
      eyebrow: t($("#spiritual .label")),
      heading: html($("#spiritual h2")),
      subtitle: t($("#spiritual .text-mint")),
      quote: t($("#spiritual .max-w-\\[36ch\\]")),
      cta: {
        label: t($("#spiritual .btn")),
        href: attr($("#spiritual .btn"), "href"),
      },
      image: img($("#spiritual .plx img")),
    },

    journey: {
      ...head($("#journey")),
      summary: html($("#journey blockquote.card p")),
      resume: {
        icon: icon($("#journey .card.bg-forest-900 .c-ic")),
        title: t($("#journey .card.bg-forest-900 h3")),
        body: t($("#journey .card.bg-forest-900 p")),
        cta_label: t($("#journey .card.bg-forest-900 .btn")),
        file: attr($("#journey .card.bg-forest-900 .btn"), "href"),
      },
      items: $$("#journey .tl-item").map((it) => {
        const side = $(".hidden.pt-0\\.5", it);
        return {
          period: t($("span.block", side)),
          location: t($("span.mt-2", side)),
          icon: icon($(".c-ic", it)),
          role: html($("h3", it)),
          org: html($("h3", it).parentElement.querySelector("p")),
          /* the summary entry lays its roles out in two columns */
          two_col: !!$("ul", it)?.className.includes("grid-cols-2"),
          bullets: $$("ul li", it).map((li) => {
            const c = li.cloneNode(true);
            const dot = c.querySelector("span");
            if (dot) dot.remove();
            return c.innerHTML.replace(/\s+/g, " ").trim();
          }),
        };
      }),
    },

    expertise: {
      ...head($("#expertise")),
      cards: $$("#expertise article.card").map((c) => ({
        icon: icon($(".c-ic", c)),
        title: html($("h3", c)),
        body: html($("p", c)),
      })),
    },

    credentials: {
      ...head($("#credentials")),
      /* "<b>6</b> qualifications · <b>2004 — 2019</b>" — the two emphasised
         values and the word between them are separate, so keep them apart */
      meta: (() => {
        const el = $("#credentials .edu-meta");
        if (!el) return { count: "", label: "", range: "" };
        const ks = $$(".edu-meta-k", el);
        const label = [...el.childNodes]
          .filter((n) => n.nodeType === 3)
          .map((n) => n.textContent)
          .join(" ")
          .replace(/\s+/g, " ")
          .trim();
        return { count: t(ks[0]) || "", label, range: t(ks[1]) || "" };
      })(),
      items: $$("#credentials .edu-item").map((e) => ({
        year: t($(".edu-year", e)),
        title: html($(".edu-title", e)),
        institution: html($(".edu-inst", e)),
      })),
      /* academic distinctions: one featured dark card with an outbound link,
         then smaller cards beneath it */
      feature: (() => {
        const c = $("#credentials .card.bg-forest-900");
        if (!c) return null;
        const a = $("a", c);
        return {
          icon: icon($(".c-ic", c)),
          title: html($("h3", c)),
          body: html($("p", c)),
          link_label: t(a),
          link_href: attr(a, "href"),
        };
      })(),
      distinctions: $$("#credentials article.card:not(.bg-forest-900)").map(
        (c) => ({
          icon: icon($(".c-ic", c)),
          title: html($("h3", c)),
          body: html($("p", c)),
        }),
      ),
    },

    certifications: {
      ...head($("#certifications")),
      items: $$("#certifications .card").map((c) => ({
        icon: icon($(".c-ic", c)),
        title: html($("b", c)),
        meta: t($("span.mt-2", c)),
      })),
    },

    references: {
      ...head($("#references")),
      items: $$("#references .splide__slide").map((s) => ({
        quote: t($(".q-text", s)),
        name: t($(".q-by b", s)),
        role: t($(".q-by .text-lime-dark", s)),
        known: t($(".q-by .text-ink\\/45", s)),
        avatar_image: img($(".q-avatar img", s)),
        avatar_initials: $(".q-avatar img", s) ? null : t($(".q-avatar", s)),
      })),
      tabs: $$("#references .q-tab").map(t),
    },

    beyond: {
      ...head($("#beyond")),
      cards: $$("#beyond a.card").map((c) => ({
        href: attr(c, "href"),
        image: img($("img", c)),
        eyebrow: t($("span.font-display", c)),
        title: html($("h3", c)),
        body: html($("p", c)),
        cta_label: t($("span.mt-8", c)),
      })),
    },

    contact: {
      heading: html($("#contact .contact-head h2")),
      lead: html($("#contact .contact-lead")),
      required_note: t($("#contact .contact-note-req")),
      /* every input/select/textarea with its label, placeholder and error */
      fields: $$("#contact .contact-form .field, #contact .hp input").map(
        (f) => {
          const id = f.id;
          const lab = $(`label[for="${id}"]`);
          const err = $(`#${id}-err`);
          return {
            id,
            name: attr(f, "name"),
            type:
              f.tagName === "TEXTAREA"
                ? "textarea"
                : f.tagName === "SELECT"
                  ? "select"
                  : attr(f, "type"),
            label: html(lab),
            placeholder: attr(f, "placeholder"),
            required: f.hasAttribute("required"),
            autocomplete: attr(f, "autocomplete"),
            rows: attr(f, "rows"),
            options: f.tagName === "SELECT" ? $$("option", f).map(t) : null,
            error: err ? t(err) : null,
          };
        },
      ),
      consent: {
        label:
          t($('label[for="cf-consent"] span, #cf-consent ~ span')) ||
          t($("#cf-consent").closest("label").querySelector("span")),
        error: t($("#cf-consent-err")),
      },
      submit: t($("#cf-submit")),
      submit_note: t($("#cf-submit").parentElement.querySelector("p")),
      alt: {
        text: $(".contact-alt")
          ? $(".contact-alt")
              .childNodes[0].textContent.replace(/\s+/g, " ")
              .trim()
          : null,
        link_label: t($(".contact-alt .contact-link")),
        link_href: attr($(".contact-alt .contact-link"), "href"),
      },
    },

    footer: {
      brand: t($("footer .foot-name")),
      nav: $$("footer .foot-nav a").map((a) => ({
        label: t(a),
        href: attr(a, "href"),
        external: attr(a, "target") === "_blank",
        download: a.hasAttribute("download"),
      })),
      social: $$("footer .foot-social a").map((a) => ({
        label: attr(a, "aria-label"),
        href: attr(a, "href"),
        icon: icon(a),
      })),
      base: $$("footer .foot-base span").map(t),
    },
  };
});

writeFileSync("content.json", JSON.stringify(data, null, 2));
console.log("sections:", Object.keys(data).join(" "));
console.log(
  "counts: stats",
  data.stats.length,
  "| roles",
  data.dimensions.cards.length,
  "| faith",
  data.faith.cards.length,
  "| journey",
  data.journey.items.length,
  "| expertise",
  data.expertise.cards.length,
  "| education",
  data.credentials.items.length,
  "| certs",
  data.certifications.items.length,
  "| refs",
  data.references.items.length,
  "| beyond",
  data.beyond.cards.length,
);
await b.close();
