import type { SiteContent } from "@/lib/content";

/* Markup only — the burger, solid-state and scroll-spy are driven imperatively
   by SiteEffects, which finds these by id exactly as the old main.js did. */
export default function Header({ header }: { header: SiteContent["header"] }) {
  return (
    <>
      <a
        href="#about"
        className="sr-only focus:not-sr-only focus:fixed focus:left-5 focus:top-5 focus:z-[120] focus:rounded-card focus:bg-forest-900 focus:px-5 focus:py-3 focus:text-sm focus:text-white"
      >
        {header.skip_label}
      </a>

      <header id="siteheader" className="fixed inset-x-0 top-0 z-[90]">
        <nav
          className="mx-auto flex h-full max-w-edge items-center justify-between px-5 lg:px-10"
          aria-label="Primary"
        >
          <a href="#top" data-scroll="" className="brand flex items-center">
            <span className="brand-name font-display text-[19px] font-medium">
              {header.brand}
            </span>
          </a>

          <div className="hidden items-center gap-8 lg:flex">
            {header.nav.map((item) => (
              <a
                key={item.href}
                href={item.href}
                data-scroll=""
                data-nav={item.nav_id}
                className="navlink font-display text-[15px] font-medium"
              >
                {item.label}
              </a>
            ))}
            <a
              href={header.cta.href}
              data-scroll=""
              className="btn btn-primary"
            >
              {header.cta.label}
            </a>
          </div>

          <button
            id="burger"
            className="burger relative z-[95] -mr-2 flex h-11 w-11 flex-col items-center justify-center gap-[5px] lg:hidden"
            aria-label="Open menu"
            aria-expanded="false"
            aria-controls="menu"
          >
            <span className="block h-px w-6" />
            <span className="block h-px w-6" />
            <span className="block h-px w-6" />
          </button>
        </nav>
      </header>

      <div
        id="menu"
        data-open="false"
        className="fixed inset-0 z-[85] bg-forest-900 lg:hidden"
        role="dialog"
        aria-modal="true"
        aria-label="Site menu"
      >
        <div className="flex h-full flex-col justify-between overflow-y-auto px-5 pb-10 pt-28">
          <ul>
            {header.menu_links.map((item, i) => (
              <li
                key={item.href}
                style={{ transitionDelay: `${60 + i * 45}ms` }}
              >
                <a
                  href={item.href}
                  data-scroll=""
                  className="block border-b border-white/10 py-4 font-display text-[26px] font-medium text-white"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
          <div
            className="mt-10 flex flex-col gap-3"
            style={{ transitionDelay: "380ms" }}
          >
            {header.menu_external.map((item) => (
              <a
                key={item.href}
                href={item.href}
                target="_blank"
                rel="noopener"
                className="inline-flex items-center gap-2 text-[15px] text-lime-light"
              >
                {item.label}
                <svg className="icon icon-sm">
                  <use href="#i-arrow-up-right" />
                </svg>
              </a>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
