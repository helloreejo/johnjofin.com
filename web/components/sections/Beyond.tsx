import type { SiteContent } from "@/lib/content";
import SectionHead from "./SectionHead";

export default function Beyond({ beyond }: { beyond: SiteContent["beyond"] }) {
  return (
    <section id="beyond" className="section bg-paper">
      <div className="wrap">
        <SectionHead head={beyond} />

        <div className="grid gap-6 md:grid-cols-2">
          {beyond.cards.map((c, i) => (
            <a
              key={c.href}
              href={c.href}
              target="_blank"
              rel="noopener"
              className="card group reveal flex flex-col overflow-hidden"
              style={
                i
                  ? ({ "--d": `${i * 100}ms` } as React.CSSProperties)
                  : undefined
              }
            >
              <figure className="media relative w-full rounded-b-none pb-[58%]">
                {c.image && (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={c.image.src}
                    width={c.image.width ?? undefined}
                    height={c.image.height ?? undefined}
                    alt={c.image.alt}
                    className="absolute inset-0 h-full w-full object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                )}
              </figure>
              <div className="flex flex-1 flex-col p-8 lg:p-10">
                <span className="font-display text-[14px] font-semibold tracking-[.02em] text-lime-dark">
                  {c.eyebrow}
                </span>
                <h3
                  className="mt-4 text-[24px] font-medium text-ink md:text-[30px]"
                  dangerouslySetInnerHTML={{ __html: c.title }}
                />
                <p
                  className="body-t mt-4 flex-1 text-ink/70"
                  dangerouslySetInnerHTML={{ __html: c.body }}
                />
                <span className="mt-8 inline-flex items-center gap-2.5 font-display text-[16px] font-semibold text-ink">
                  {c.cta_label}
                  <svg className="icon icon-sm arrow">
                    <use href="#i-arrow-up-right" />
                  </svg>
                </span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
