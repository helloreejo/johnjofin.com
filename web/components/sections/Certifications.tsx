import type { SiteContent } from "@/lib/content";
import Icon from "@/components/Icon";
import SectionHead from "./SectionHead";

export default function Certifications({
  certifications,
}: {
  certifications: SiteContent["certifications"];
}) {
  return (
    <section id="certifications" className="section bg-paper">
      <div className="wrap">
        <SectionHead head={certifications} />

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {certifications.items.map((c, i) => (
            <div
              key={c.title}
              className="card reveal flex items-start gap-4 p-7"
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
                <b
                  className="block text-[17px] font-medium text-ink"
                  dangerouslySetInnerHTML={{ __html: c.title }}
                />
                <span className="mt-2 block text-[14px] text-ink/55">
                  {c.meta}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
