import type { SiteContent } from "@/lib/content";
import Icon from "@/components/Icon";
import SectionHead from "./SectionHead";

export default function Expertise({
  expertise,
}: {
  expertise: SiteContent["expertise"];
}) {
  return (
    <section id="expertise" className="section bg-paper">
      <div className="wrap">
        <SectionHead head={expertise} />

        <div className="grid gap-6 md:grid-cols-2">
          {expertise.cards.map((c, i) => (
            <article
              key={c.title}
              className="card reveal flex items-start gap-5 p-7 lg:p-8"
              style={
                i
                  ? ({ "--d": `${i * 70}ms` } as React.CSSProperties)
                  : undefined
              }
            >
              <span className="c-ic flex-none">
                <Icon name={c.icon} />
              </span>
              <div>
                <h3
                  className="text-[20px] font-medium text-ink"
                  dangerouslySetInnerHTML={{ __html: c.title }}
                />
                <p
                  className="mt-2 text-[15px] leading-[1.6] text-ink/65"
                  dangerouslySetInnerHTML={{ __html: c.body }}
                />
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
