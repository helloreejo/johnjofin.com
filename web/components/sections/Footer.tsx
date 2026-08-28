import type { SiteContent } from "@/lib/content";
import Icon from "@/components/Icon";

export default function Footer({ footer }: { footer: SiteContent["footer"] }) {
  return (
    /* simple footer: the contact block above already carries the detail */
    <footer className="bg-paper py-10">
      <div className="wrap">
        <div className="foot-row">
          <a href="#top" data-scroll="" className="foot-brand">
            <span className="foot-name">{footer.brand}</span>
          </a>

          <nav className="foot-nav" aria-label="Footer">
            {footer.nav.map((l) => (
              <a
                key={l.href + l.label}
                href={l.href}
                {...(l.external
                  ? { target: "_blank", rel: "noopener" }
                  : { "data-scroll": "" })}
                {...(l.download ? { download: true } : {})}
              >
                {l.label}
              </a>
            ))}
          </nav>
        </div>

        <ul className="foot-social">
          {footer.social.map((s) => (
            <li key={s.href}>
              <a
                href={s.href}
                target="_blank"
                rel="noopener"
                className="social-dot"
                aria-label={s.label}
              >
                <Icon name={s.icon} className="icon icon-sm icon-fill" />
              </a>
            </li>
          ))}
        </ul>

        <div className="foot-base">
          {footer.base.map((t) => (
            <span key={t}>{t}</span>
          ))}
        </div>
      </div>
    </footer>
  );
}
