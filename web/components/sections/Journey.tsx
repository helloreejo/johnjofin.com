import type { SiteContent } from "@/lib/content";
import Icon from "@/components/Icon";
import SectionHead from "./SectionHead";

export default function Journey({
  journey,
}: {
  journey: SiteContent["journey"];
}) {
  return (
    <section id="journey" className="section bg-white">
      <div className="wrap">
        <SectionHead head={journey} />

        <div className="mb-14 grid gap-6 md:mb-20 lg:grid-cols-12">
          <blockquote className="card reveal p-7 md:p-9 lg:col-span-8">
            <p
              className="body-t text-ink/75"
              dangerouslySetInnerHTML={{ __html: journey.summary }}
            />
          </blockquote>

          <div
            className="card reveal flex flex-col justify-between gap-6 bg-forest-900 p-7 md:p-9 lg:col-span-4"
            style={{ "--d": "100ms" } as React.CSSProperties}
          >
            <div>
              <span className="c-ic">
                <Icon name={journey.resume.icon} />
              </span>
              <h3 className="mt-4 text-[20px] font-medium text-white">
                {journey.resume.title}
              </h3>
              <p className="mt-2 text-[15px] leading-[1.6] text-haze">
                {journey.resume.body}
              </p>
            </div>
            <a
              href={journey.resume.file}
              target="_blank"
              rel="noopener"
              download
              className="btn btn-primary btn-block"
            >
              {journey.resume.cta_label}
              <svg className="icon icon-sm">
                <use href="#i-download" />
              </svg>
            </a>
          </div>
        </div>

        <div>
          {journey.items.map((it, i) => {
            /* the final entry closes the timeline: the spine becomes a short
               stub, the dot is hollow, and there is no trailing padding */
            const last = i === journey.items.length - 1;
            return (
              <article
                key={`${it.period}-${it.role}`}
                className="tl-item reveal grid grid-cols-[1.5rem_1fr] gap-x-5 md:grid-cols-[11rem_2rem_1fr] md:gap-x-0"
              >
                <div className="hidden pt-0.5 text-right md:block">
                  <span className="block font-display text-[15px] font-medium tracking-[.02em] text-ink">
                    {it.period}
                  </span>
                  <span className="mt-2 inline-flex items-center gap-1.5 text-[14px] text-ink/50">
                    <svg className="icon icon-sm">
                      <use href="#i-pin" />
                    </svg>
                    {it.location}
                  </span>
                </div>

                <div className="relative flex justify-center">
                  {last ? (
                    <span
                      className="absolute left-1/2 top-0 h-2 w-px -translate-x-1/2 bg-line"
                      aria-hidden="true"
                    />
                  ) : (
                    <>
                      <span
                        className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-line"
                        aria-hidden="true"
                      />
                      <span
                        className="tl-fill absolute inset-y-0 left-[calc(50%-0.5px)] w-px bg-lime"
                        aria-hidden="true"
                      />
                    </>
                  )}
                  <span
                    className={
                      last
                        ? "tl-dot relative mt-1.5 block h-[10px] w-[10px] rounded-full border-2 border-lime bg-white ring-4 ring-white"
                        : "tl-dot relative mt-1.5 block h-[10px] w-[10px] rounded-full bg-lime ring-4 ring-white"
                    }
                    aria-hidden="true"
                  />
                </div>

                <div className={last ? undefined : "pb-14 md:pb-20"}>
                  <p className="mb-3 font-display text-[14px] font-medium tracking-[.02em] text-lime-dark md:hidden">
                    {it.period} · {it.location}
                  </p>
                  <div className="flex items-start gap-3">
                    <span className="c-ic mt-0.5">
                      <Icon name={it.icon} />
                    </span>
                    <div>
                      <h3
                        className="text-[22px] font-medium text-ink md:text-[26px]"
                        dangerouslySetInnerHTML={{ __html: it.role }}
                      />
                      <p
                        className="mt-1.5 font-display text-[16px] font-medium text-lime-dark"
                        dangerouslySetInnerHTML={{ __html: it.org }}
                      />
                    </div>
                  </div>
                  <ul
                    className={
                      it.two_col
                        ? "mt-5 grid gap-x-10 gap-y-3 sm:grid-cols-2"
                        : "mt-5 space-y-3"
                    }
                  >
                    {it.bullets.map((b, i) => (
                      <li key={i} className="body-t relative pl-6 text-ink/75">
                        <span className="absolute left-0 top-[10px] block h-1.5 w-1.5 rounded-full bg-lime" />
                        <span dangerouslySetInnerHTML={{ __html: b }} />
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
