"use client";

import { useEffect, useRef, useState } from "react";
import Splide from "@splidejs/splide";
import type { SiteContent } from "@/lib/content";
import SectionHead from "./SectionHead";

/* Splide (MIT) runs the carousel — auto-advance, crossfade, swipe and the
   screen-reader plumbing. The arrows, counter and name tabs stay ours; they
   just drive Splide instead of hand-rolled state.

   Ported from js/main.js:216-271. */
export default function References({
  references,
}: {
  references: SiteContent["references"];
}) {
  const root = useRef<HTMLDivElement>(null);
  const splide = useRef<Splide | null>(null);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!root.current) return;

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const instance = new Splide(root.current, {
      type: "fade",
      rewind: true,
      perPage: 1,
      speed: 450,
      easing: "ease",
      autoplay: true,
      interval: 7000,
      pauseOnHover: true,
      pauseOnFocus: true,
      arrows: false /* the .q-arrow buttons below stand in */,
      pagination: false /* the .q-tab strip stands in */,
      keyboard: false /* arrow keys belong to the page, not the carousel */,
      drag: !reduced,
      i18n: { carousel: "references", slide: "reference" },
    });

    instance.on("move", (i: number) => setIndex(i));
    instance.mount();
    splide.current = instance;

    return () => {
      instance.destroy();
      splide.current = null;
    };
  }, []);

  const go = (target: string | number) => splide.current?.go(target);
  const total = references.items.length;
  const pad = (n: number) => `0${n}`.slice(-2);

  return (
    <section id="references" className="on-dark section bg-forest-900">
      <div className="wrap">
        <SectionHead head={references} tone="dark" />

        <div className="reveal q-wrap splide" id="refCarousel" ref={root}>
          <div className="q-card">
            <div className="splide__track">
              <div className="splide__list q-stage">
                {references.items.map((r) => (
                  <figure key={r.name} className="splide__slide q-slide">
                    <span className="q-mark" aria-hidden="true">
                      &ldquo;
                    </span>
                    <blockquote className="q-text">{r.quote}</blockquote>
                    <figcaption className="q-by">
                      {r.avatar_image ? (
                        <span className="q-avatar">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={r.avatar_image.src}
                            width={r.avatar_image.width ?? undefined}
                            height={r.avatar_image.height ?? undefined}
                            alt=""
                            loading="lazy"
                            decoding="async"
                          />
                        </span>
                      ) : (
                        <span className="q-avatar" aria-hidden="true">
                          {r.avatar_initials}
                        </span>
                      )}
                      <span className="q-by-text">
                        <b className="block font-display text-[19px] font-medium text-ink md:text-[21px]">
                          {r.name}
                        </b>
                        <span className="mt-1.5 block text-[15px] text-lime-dark">
                          {r.role}
                        </span>
                        <span className="block text-[13px] text-ink/45">
                          {r.known}
                        </span>
                      </span>
                    </figcaption>
                  </figure>
                ))}
              </div>
            </div>

            <div className="q-controls">
              <button
                type="button"
                className="q-arrow"
                id="qPrev"
                aria-label="Previous reference"
                onClick={() => go("<")}
              >
                <svg className="icon q-flip">
                  <use href="#i-arrow-right" />
                </svg>
              </button>
              <p className="q-count">
                <span id="qNow">{pad(index + 1)}</span>
                <span className="text-ink/25"> / </span>
                <span className="text-ink/45">{pad(total)}</span>
              </p>
              <button
                type="button"
                className="q-arrow"
                id="qNext"
                aria-label="Next reference"
                onClick={() => go(">")}
              >
                <svg className="icon">
                  <use href="#i-arrow-right" />
                </svg>
              </button>
            </div>
          </div>

          <div className="q-tabs" role="group" aria-label="Choose a reference">
            {references.items.map((r, i) => (
              <button
                key={r.tab}
                type="button"
                className={`q-tab${i === index ? " is-active" : ""}`}
                id={`q-tab-${i}`}
                aria-current={i === index ? "true" : undefined}
                data-i={i}
                onClick={() => go(i)}
              >
                {r.tab}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
