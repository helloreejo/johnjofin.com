import type { SiteContent } from "@/lib/content";
import Icon from "@/components/Icon";
import SectionHead from "./SectionHead";

export default function Faith({ faith }: { faith: SiteContent["faith"] }) {
  return (
    <section
      id="faith"
      className="on-dark section relative overflow-hidden bg-forest-900"
    >
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(60% 45% at 50% 0%, rgba(96, 170, 255, 0.16), transparent 70%), radial-gradient(65% 50% at 12% 100%, rgba(11, 103, 175, 0.9), transparent 72%)",
        }}
      />

      <div className="wrap relative">
        <SectionHead head={faith} tone="dark" />

        <div className="mb-14 md:mb-20">
          <blockquote
            className="reveal max-w-[38ch] font-display text-[22px] font-normal leading-[1.4] text-white md:max-w-[65ch] md:text-[22px] lg:text-[26px]"
            style={{ "--d": "120ms" } as React.CSSProperties}
            dangerouslySetInnerHTML={{ __html: faith.quote }}
          />
          <div
            className="reveal mt-8 flex flex-wrap items-center gap-x-8 gap-y-4"
            style={{ "--d": "200ms" } as React.CSSProperties}
          >
            <span className="font-display text-[15px] font-medium tracking-[.02em] text-mint">
              {faith.motto}
            </span>
            <span className="hidden h-4 w-px bg-white/20 md:block" />
            <span
              className="body-t text-haze"
              dangerouslySetInnerHTML={{ __html: faith.motto_note }}
            />
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {faith.cards.map((c, i) => (
            <article
              key={c.title}
              className="card-dark reveal p-8 lg:p-10"
              style={
                i
                  ? ({ "--d": `${i * 100}ms` } as React.CSSProperties)
                  : undefined
              }
            >
              <span className="c-ic">
                <Icon name={c.icon} />
              </span>
              <h3
                className="h3 mt-6 text-white"
                dangerouslySetInnerHTML={{ __html: c.title }}
              />
              <p
                className="body-t mt-4 text-haze"
                dangerouslySetInnerHTML={{ __html: c.body }}
              />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
