import type { SiteContent } from "@/lib/content";

export default function Spiritual({
  spiritual,
}: {
  spiritual: SiteContent["spiritual"];
}) {
  return (
    <section
      id="spiritual"
      className="relative flex flex-col justify-end overflow-hidden bg-forest-800 py-20 md:py-24"
    >
      {/* inset-x-0 with only vertical bleed: the parallax translates Y, so
          bleeding horizontally would crop the shrine out of frame */}
      <div
        className="plx absolute inset-x-0 -inset-y-[10%] z-0"
        data-parallax="0.1"
      >
        {spiritual.image && (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={spiritual.image.src}
            width={spiritual.image.width ?? undefined}
            height={spiritual.image.height ?? undefined}
            alt={spiritual.image.alt}
            className="h-full w-full object-cover"
            loading="lazy"
            decoding="async"
          />
        )}
      </div>
      <div className="spir-scrim absolute inset-0 z-[1]" aria-hidden="true" />

      <div className="wrap relative z-[2]">
        <div className="max-w-[38rem] text-white">
          <p className="reveal label text-lime-light">{spiritual.eyebrow}</p>
          <h2
            className="reveal mt-6 text-[32px] font-medium text-white md:text-[42px] lg:text-[52px]"
            style={{ "--d": "80ms" } as React.CSSProperties}
            dangerouslySetInnerHTML={{ __html: spiritual.heading }}
          />
          <p
            className="reveal mt-3 font-display text-[16px] font-medium tracking-[.02em] text-mint"
            style={{ "--d": "150ms" } as React.CSSProperties}
          >
            {spiritual.subtitle}
          </p>
          <p
            className="reveal mt-6 max-w-[36ch] font-display text-[20px] font-normal leading-[1.35] text-white/90 md:text-[24px]"
            style={{ "--d": "220ms" } as React.CSSProperties}
          >
            {spiritual.quote}
          </p>
          <a
            href={spiritual.cta.href}
            target="_blank"
            rel="noopener"
            className="btn btn-primary reveal mt-9"
            style={{ "--d": "300ms" } as React.CSSProperties}
          >
            {spiritual.cta.label}
            <svg className="icon icon-sm">
              <use href="#i-arrow-up-right" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}
