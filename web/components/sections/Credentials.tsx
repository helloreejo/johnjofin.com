import type { SiteContent } from "@/lib/content";
import Icon from "@/components/Icon";

export default function Credentials({
  credentials,
}: {
  credentials: SiteContent["credentials"];
}) {
  return (
    <section id="credentials" className="section bg-white">
      <div className="wrap">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
          {/* sticky heading column */}
          <div className="lg:sticky lg:top-[120px] lg:col-span-4 lg:self-start">
            <header className="sec-head lg:!mb-0">
              <div
                className="reveal sec-title-row text-ink"
                style={{ "--d": "80ms" } as React.CSSProperties}
              >
                <h2
                  className="h2 text-ink"
                  dangerouslySetInnerHTML={{ __html: credentials.heading }}
                />
                <span className="sec-rule" />
                <span className="sec-meta">{credentials.eyebrow}</span>
              </div>
              <p
                className="reveal lead sec-lead text-ink/70"
                style={{ "--d": "140ms" } as React.CSSProperties}
                dangerouslySetInnerHTML={{ __html: credentials.lead }}
              />
              <p
                className="reveal edu-meta"
                style={{ "--d": "200ms" } as React.CSSProperties}
              >
                <span className="edu-meta-k">{credentials.meta.count}</span>{" "}
                {credentials.meta.label}
                <span className="edu-meta-sep" />
                <span className="edu-meta-k">{credentials.meta.range}</span>
              </p>
            </header>
          </div>

          {/* scrolling timeline */}
          <div className="lg:col-span-8">
            <div className="edu-tl">
              {credentials.items.map((e, i) => (
                <article
                  key={`${e.year}-${e.title}`}
                  className="edu-item tl-item reveal"
                  style={
                    i
                      ? ({ "--d": `${i * 60}ms` } as React.CSSProperties)
                      : undefined
                  }
                >
                  <div className="edu-year">{e.year}</div>
                  <div className="edu-spine">
                    <span className="edu-line" />
                    <span className="edu-fill tl-fill" />
                    <span className="edu-dot tl-dot" />
                  </div>
                  <div className="edu-body">
                    <p className="edu-year-m">{e.year}</p>
                    <h3
                      className="edu-title"
                      dangerouslySetInnerHTML={{ __html: e.title }}
                    />
                    <p
                      className="edu-inst"
                      dangerouslySetInnerHTML={{ __html: e.institution }}
                    />
                  </div>
                </article>
              ))}
            </div>

            {/* academic distinctions */}
            <div className="mt-12 grid gap-6">
              <article className="card reveal bg-forest-900 p-8 lg:p-10">
                <span className="c-ic">
                  <Icon name={credentials.feature.icon} />
                </span>
                <h3
                  className="mt-5 text-[20px] font-medium text-white md:text-[24px]"
                  dangerouslySetInnerHTML={{
                    __html: credentials.feature.title,
                  }}
                />
                <p
                  className="body-t mt-4 text-haze"
                  dangerouslySetInnerHTML={{ __html: credentials.feature.body }}
                />
                <a
                  href={credentials.feature.link_href}
                  target="_blank"
                  rel="noopener"
                  className="group mt-7 inline-flex items-center gap-2.5 font-display text-[16px] font-semibold text-lime-light"
                >
                  {credentials.feature.link_label}
                  <svg className="icon icon-sm arrow">
                    <use href="#i-arrow-up-right" />
                  </svg>
                </a>
              </article>

              <div className="grid gap-6">
                {credentials.distinctions.map((d, i) => (
                  <article
                    key={d.title}
                    className="card reveal flex items-start gap-5 p-7"
                    style={
                      { "--d": `${(i + 1) * 80}ms` } as React.CSSProperties
                    }
                  >
                    <span className="c-ic flex-none">
                      <Icon name={d.icon} />
                    </span>
                    <div>
                      <h3
                        className="text-[17px] font-medium text-ink"
                        dangerouslySetInnerHTML={{ __html: d.title }}
                      />
                      <p
                        className="mt-2 text-[15px] leading-[1.6] text-ink/65"
                        dangerouslySetInnerHTML={{ __html: d.body }}
                      />
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
