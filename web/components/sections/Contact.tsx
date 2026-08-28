"use client";

import { useState, type FormEvent } from "react";
import type { ContactField, SiteContent } from "@/lib/content";

/* Ported from js/main.js:273-384. The original had no endpoint wired up and
   always fell through to an "isn't connected yet" notice; this posts to the
   WordPress REST route, which validates again server-side and mails it on. */

type Status = { kind: "ok" | "err"; html: string } | null;

function Field({
  field,
  invalid,
  onInput,
}: {
  field: ContactField;
  invalid: boolean;
  onInput: () => void;
}) {
  const described = field.error ? `${field.id}-err` : undefined;
  const shared = {
    className: "field",
    id: field.id,
    name: field.name,
    required: field.required,
    "aria-describedby": described,
    "aria-invalid": invalid ? ("true" as const) : ("false" as const),
    onInput,
    onChange: onInput,
  };

  return (
    <div>
      <label
        className="field-label"
        htmlFor={field.id}
        dangerouslySetInnerHTML={{ __html: field.label }}
      />
      {field.type === "textarea" ? (
        <textarea {...shared} rows={5} placeholder={field.placeholder} />
      ) : field.type === "select" ? (
        <select {...shared}>
          {field.options.map((o) => (
            <option key={o}>{o}</option>
          ))}
        </select>
      ) : (
        <input
          {...shared}
          type={field.type}
          autoComplete={field.autocomplete || undefined}
          placeholder={field.placeholder}
        />
      )}
      {field.error && (
        <span
          className={`field-err${invalid ? " show" : ""}`}
          id={`${field.id}-err`}
        >
          {field.error}
        </span>
      )}
    </div>
  );
}

export default function Contact({
  contact,
}: {
  contact: SiteContent["contact"];
}) {
  const [bad, setBad] = useState<Record<string, boolean>>({});
  const [status, setStatus] = useState<Status>(null);
  const [sending, setSending] = useState(false);

  const clear = (id: string) =>
    setBad((b) => (b[id] ? { ...b, [id]: false } : b));

  /* the honeypot is rendered but visually hidden; a person never fills it */
  const honeypot = contact.fields.find((f) => f.name === "website");
  const visible = contact.fields.filter((f) => f.name !== "website");
  const grid = visible.filter((f) => f.type !== "textarea");
  const long = visible.filter((f) => f.type === "textarea");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);

    const errs: Record<string, boolean> = {};
    const val = (n: string) => String(data.get(n) ?? "").trim();

    if (!val("name")) errs["cf-name"] = true;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(val("email")))
      errs["cf-email"] = true;
    if (val("message").length < 5) errs["cf-message"] = true;
    if (!data.get("consent")) errs["cf-consent"] = true;

    setBad(errs);
    if (Object.keys(errs).length) {
      const first = Object.keys(errs)[0];
      document.getElementById(first)?.focus();
      return;
    }
    if (val("website")) return; /* bot */

    setSending(true);
    setStatus({ kind: "ok", html: "Sending your message…" });

    try {
      const res = await fetch(contact.endpoint, {
        method: "POST",
        body: data,
        headers: { Accept: "application/json" },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      form.reset();
      setStatus({
        kind: "ok",
        html: "Thank you — your message has been sent. I’ll reply personally.",
      });
    } catch {
      setStatus({
        kind: "err",
        html:
          "Sorry, the message could not be sent. Please try again, or reach me on " +
          '<a class="ulink font-semibold" href="https://wa.me/18255266099" target="_blank" rel="noopener">WhatsApp</a>.',
      });
    } finally {
      setSending(false);
    }
  }

  return (
    <section
      id="contact"
      className="on-dark section relative overflow-hidden bg-forest-800"
    >
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(55% 50% at 12% 0%, rgba(96, 170, 255, 0.16), transparent 70%), radial-gradient(50% 60% at 100% 100%, rgba(11, 103, 175, 0.85), transparent 72%)",
        }}
      />

      <div className="wrap relative">
        <div className="contact-shell">
          <header className="contact-head">
            <h2
              className="reveal h2 text-white"
              style={{ "--d": "80ms" } as React.CSSProperties}
              dangerouslySetInnerHTML={{ __html: contact.heading }}
            />
            <p
              className="reveal lead contact-lead text-haze"
              style={{ "--d": "140ms" } as React.CSSProperties}
              dangerouslySetInnerHTML={{ __html: contact.lead }}
            />
          </header>

          <div
            className="card reveal contact-card"
            style={{ "--d": "200ms" } as React.CSSProperties}
          >
            <p className="contact-note-req">{contact.required_note}</p>

            <form
              id="contactForm"
              className="contact-form"
              noValidate
              onSubmit={onSubmit}
            >
              {honeypot && (
                <p className="hp" aria-hidden="true">
                  <label htmlFor={honeypot.id}>{honeypot.label}</label>
                  <input
                    type="text"
                    id={honeypot.id}
                    name={honeypot.name}
                    tabIndex={-1}
                    autoComplete="off"
                  />
                </p>
              )}

              <div className="grid gap-6 sm:grid-cols-2">
                {grid.map((f) => (
                  <Field
                    key={f.id}
                    field={f}
                    invalid={!!bad[f.id]}
                    onInput={() => clear(f.id)}
                  />
                ))}
              </div>

              {long.map((f) => (
                <div className="mt-6" key={f.id}>
                  <Field
                    field={f}
                    invalid={!!bad[f.id]}
                    onInput={() => clear(f.id)}
                  />
                </div>
              ))}

              <div className="mt-6">
                <label className="flex items-start gap-3 text-[14px] leading-[1.6] text-ink/70">
                  <input
                    type="checkbox"
                    name="consent"
                    id="cf-consent"
                    required
                    className="mt-1 h-4 w-4 flex-none accent-lime"
                    aria-describedby="cf-consent-err"
                    onChange={() => clear("cf-consent")}
                  />
                  <span
                    dangerouslySetInnerHTML={{ __html: contact.consent.label }}
                  />
                </label>
                <span
                  className={`field-err${bad["cf-consent"] ? " show" : ""}`}
                  id="cf-consent-err"
                >
                  {contact.consent.error}
                </span>
              </div>

              <div className="mt-9 flex flex-wrap items-center gap-4">
                <button
                  type="submit"
                  className="btn btn-primary"
                  id="cf-submit"
                  disabled={sending}
                  style={sending ? { opacity: 0.65 } : undefined}
                >
                  {contact.submit}
                  <svg className="icon icon-sm">
                    <use href="#i-send" />
                  </svg>
                </button>
                <p className="text-[14px] text-ink/55">{contact.submit_note}</p>
              </div>

              <div
                className={`mt-6${status ? "" : " hidden"}`}
                id="cf-status"
                role="status"
                aria-live="polite"
              >
                {status && (
                  <span
                    className={`form-note ${status.kind}`}
                    dangerouslySetInnerHTML={{ __html: status.html }}
                  />
                )}
              </div>
            </form>
          </div>

          <p
            className="reveal contact-alt"
            style={{ "--d": "260ms" } as React.CSSProperties}
          >
            {contact.alt.text}{" "}
            <a
              className="contact-link"
              href={contact.alt.link_href}
              target="_blank"
              rel="noopener"
            >
              {contact.alt.link_label}
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
