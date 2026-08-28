import type { SectionHead as Head } from "@/lib/content";

/* The heading block every section shares: h2, hairline rule, eyebrow, and an
   optional intro line. `tone` switches the text colour for the dark bands. */
export default function SectionHead({
  head,
  tone = "light",
  className = "sec-head",
}: {
  head: Head;
  tone?: "light" | "dark";
  className?: string;
}) {
  const onDark = tone === "dark";
  return (
    <header className={className}>
      <div
        className={`reveal sec-title-row ${onDark ? "text-white" : "text-ink"}`}
        style={{ "--d": "80ms" } as React.CSSProperties}
      >
        <h2
          className={`h2 ${onDark ? "text-white" : "text-ink"}`}
          dangerouslySetInnerHTML={{ __html: head.heading }}
        />
        <span className="sec-rule" />
        <span className="sec-meta">{head.eyebrow}</span>
      </div>
      {head.lead && (
        <p
          className={`reveal lead sec-lead ${onDark ? "text-haze" : "text-ink/70"}`}
          style={{ "--d": "140ms" } as React.CSSProperties}
          dangerouslySetInnerHTML={{ __html: head.lead }}
        />
      )}
    </header>
  );
}
