import type { SiteContent } from "@/lib/content";

export default function Stats({ stats }: { stats: SiteContent["stats"] }) {
  return (
    <section className="section-band bg-forest-900" aria-label="At a glance">
      <div className="wrap">
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-4">
          {stats.map((s, i) => (
            <div
              key={s.label}
              className="reveal border-l border-white/15 pl-5 md:pl-6"
              style={
                i
                  ? ({ "--d": `${i * 90}ms` } as React.CSSProperties)
                  : undefined
              }
            >
              <b className="block font-display text-[34px] font-medium leading-none text-white md:text-[44px]">
                {s.value}
              </b>
              <span className="mt-3 block text-[14px] text-haze">
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
