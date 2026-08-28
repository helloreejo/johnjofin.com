import ReactDOM from "react-dom";
import type { SiteContent } from "@/lib/content";

/* The decorative vector field is pure design — a ledger grid and orbit arcs
   masked by a radial fade. It carries no content, so it stays in the component
   rather than becoming an editable field. */
function HeroVector() {
  return (
    <svg
      className="hero-vec"
      viewBox="0 0 820 940"
      preserveAspectRatio="xMinYMax slice"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <pattern
          id="heroGrid"
          width="46"
          height="46"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M46 0H0v46"
            fill="none"
            stroke="#ffffff"
            strokeOpacity="0.06"
            strokeWidth="1"
          />
        </pattern>
        <radialGradient id="heroFade" cx="14%" cy="86%" r="86%">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.85" />
          <stop offset="60%" stopColor="#fff" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
        <mask id="heroMask">
          <rect width="820" height="940" fill="url(#heroFade)" />
        </mask>
      </defs>

      <rect
        width="820"
        height="940"
        fill="url(#heroGrid)"
        mask="url(#heroMask)"
      />

      <g
        fill="none"
        stroke="#60aaff"
        strokeOpacity="0.17"
        mask="url(#heroMask)"
      >
        <circle cx="52" cy="928" r="196" />
        <circle cx="52" cy="928" r="322" />
        <circle cx="52" cy="928" r="452" />
        <circle cx="52" cy="928" r="596" />
      </g>

      <line
        x1="0"
        y1="742"
        x2="240"
        y2="742"
        stroke="#60aaff"
        strokeOpacity="0.22"
        strokeWidth="1"
      />
      <circle cx="240" cy="742" r="3.5" fill="#60aaff" fillOpacity="0.5" />
    </svg>
  );
}

export default function Hero({ hero }: { hero: SiteContent["hero"] }) {
  /* The old page preloaded images/hero.jpg while the hero actually rendered
     images/john-jofin.jpg — a high-priority fetch for an image never shown.
     preload() emits one <link> in <head> for the image really used; rendering
     a <link> in the tree instead gets hoisted AND replayed, emitting it twice. */
  if (hero.image) {
    ReactDOM.preload(hero.image.src, { as: "image", fetchPriority: "high" });
  }

  return (
    <section id="top" className="hero-split">
      {/* type panel */}
      <div className="hero-type order-2 lg:order-1">
        <HeroVector />

        <div className="hero-type-inner">
          <h1
            className="hero-name hero-step"
            style={{ "--d": "480ms" } as React.CSSProperties}
          >
            <span className="hero-greet">{hero.greeting}</span>
            {hero.name}
          </h1>

          <span
            className="hero-underline hero-step"
            style={{ "--d": "620ms" } as React.CSSProperties}
            aria-hidden="true"
          />

          <p
            className="hero-tag hero-step"
            style={{ "--d": "700ms" } as React.CSSProperties}
            dangerouslySetInnerHTML={{ __html: hero.tagline }}
          />

          <p
            className="hero-intro hero-step"
            style={{ "--d": "840ms" } as React.CSSProperties}
            dangerouslySetInnerHTML={{ __html: hero.intro }}
          />

          <div
            className="hero-cta hero-step"
            style={{ "--d": "1080ms" } as React.CSSProperties}
          >
            {hero.cta.map((b) => (
              <a
                key={b.href}
                href={b.href}
                data-scroll=""
                className={`btn btn-${b.style}`}
              >
                {b.label}
                <svg className="icon icon-sm">
                  <use href="#i-arrow-right" />
                </svg>
              </a>
            ))}
          </div>

          <a
            href="#about"
            data-scroll=""
            className="hero-cue hero-step"
            style={{ "--d": "1200ms" } as React.CSSProperties}
            aria-label={hero.cue_aria}
          >
            <span className="hero-cue-ring" aria-hidden="true">
              <svg className="icon icon-sm hero-cue-arrow">
                <use href="#i-arrow-right" />
              </svg>
            </span>
            <span className="hero-cue-label">{hero.cue_label}</span>
          </a>
        </div>
      </div>

      {/* portrait panel — no scrim, the photograph reads at full colour */}
      <div className="hero-media order-1 lg:order-2">
        {hero.image && (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={hero.image.src}
            width={hero.image.width ?? undefined}
            height={hero.image.height ?? undefined}
            alt={hero.image.alt}
            className="hero-img"
            fetchPriority="high"
            decoding="async"
          />
        )}

        <ul
          className="hero-creds hero-step"
          style={{ "--d": "960ms" } as React.CSSProperties}
        >
          {hero.creds.map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}
