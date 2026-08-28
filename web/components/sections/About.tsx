import type { SiteContent } from "@/lib/content";
import SectionHead from "./SectionHead";

export default function About({ about }: { about: SiteContent["about"] }) {
  return (
    <section id="about" className="section bg-paper">
      <div className="wrap">
        <SectionHead head={about} />

        <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-7">
            {about.body.map((p, i) => (
              <p
                key={i}
                className={`reveal body-t text-ink/80${i ? " mt-6" : ""}`}
                style={{ "--d": `${120 + i * 80}ms` } as React.CSSProperties}
                dangerouslySetInnerHTML={{ __html: p }}
              />
            ))}
          </div>

          <aside className="lg:col-span-5">
            <figure
              className="reveal about-quote"
              style={{ "--d": "260ms" } as React.CSSProperties}
            >
              <span className="about-quote-mark" aria-hidden="true">
                &ldquo;
              </span>
              <blockquote
                dangerouslySetInnerHTML={{ __html: about.quote.text }}
              />
              <figcaption>
                <span className="about-quote-name">{about.quote.name}</span>
                <span className="about-quote-role">{about.quote.role}</span>
              </figcaption>
            </figure>
          </aside>
        </div>

        {/* credentials: mint band, one colour step away from the page */}
        <ul
          className="reveal about-creds"
          style={{ "--d": "120ms" } as React.CSSProperties}
        >
          {about.creds.map((c) => (
            <li key={c.key}>
              <span className="about-cred-k">{c.key}</span>
              <span className="about-cred-v">{c.value}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
