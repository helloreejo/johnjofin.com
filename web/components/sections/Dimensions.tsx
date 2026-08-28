import type { SiteContent } from "@/lib/content";
import Icon from "@/components/Icon";
import SectionHead from "./SectionHead";

export default function Dimensions({
  dimensions,
}: {
  dimensions: SiteContent["dimensions"];
}) {
  return (
    <section id="dimensions" className="section bg-white">
      <div className="wrap">
        <SectionHead head={dimensions} />

        <div className="grid gap-6 md:grid-cols-3">
          {dimensions.cards.map((c, i) => (
            <article
              key={c.number || c.title}
              className="card reveal p-8 lg:p-10"
              style={
                i
                  ? ({ "--d": `${i * 100}ms` } as React.CSSProperties)
                  : undefined
              }
            >
              <div className="flex items-center justify-between">
                <span className="font-display text-[14px] font-semibold tracking-[.02em] text-ink/35">
                  {c.number}
                </span>
                <span className="c-ic">
                  <Icon name={c.icon} />
                </span>
              </div>
              <h3
                className="h3 mt-7 text-ink"
                dangerouslySetInnerHTML={{ __html: c.title }}
              />
              <p
                className="body-t mt-4 text-ink/70"
                dangerouslySetInnerHTML={{ __html: c.body }}
              />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
