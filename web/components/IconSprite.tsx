/* The 25-icon sprite, lifted verbatim from the original index.html.
   Rendered once in the layout so every <use href="#i-…"/> in the section
   components resolves exactly as it did before. Icon ids are also the choices
   offered in the WordPress admin — see wp-plugin/jj-content/inc/icons.php. */

export default function IconSprite() {
  return (
    <svg
      width="0"
      height="0"
      style={{ position: "absolute" }}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <symbol id="i-arrow-right" viewBox="0 0 24 24">
          <path d="M5 12h14M12 5l7 7-7 7" />
        </symbol>
        <symbol id="i-arrow-up-right" viewBox="0 0 24 24">
          <path d="M7 17 17 7M7 7h10v10" />
        </symbol>
        <symbol id="i-calculator" viewBox="0 0 24 24">
          <rect x="4" y="2" width="16" height="20" rx="2" />
          <path d="M8 6h8M8 10h.01M12 10h.01M16 10h.01M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01" />
        </symbol>
        <symbol id="i-globe" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" />
          <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10Z" />
        </symbol>
        <symbol id="i-church" viewBox="0 0 24 24">
          <path d="M10 9h4M12 7v5M14 22v-4a2 2 0 0 0-4 0v4M18 22V5.6a1 1 0 0 0-.55-.9l-4.55-2.3a2 2 0 0 0-1.8 0L6.55 4.7a1 1 0 0 0-.55.9V22M3 22h18" />
        </symbol>
        <symbol id="i-sun" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
        </symbol>
        <symbol id="i-rosary" viewBox="0 0 24 24">
          <circle cx="12" cy="9" r="6" />
          <path d="M12 15v6M9.5 18.2h5" />
        </symbol>
        <symbol id="i-flame" viewBox="0 0 24 24">
          <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.4-.5-2-1-3-1.07-2.14-.22-4.05 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.15.43-2.29 1-3a2.5 2.5 0 0 0 2.5 2.5Z" />
        </symbol>
        <symbol id="i-briefcase" viewBox="0 0 24 24">
          <rect x="2" y="7" width="20" height="14" rx="2" />
          <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
        </symbol>
        <symbol id="i-trending" viewBox="0 0 24 24">
          <path d="M22 7l-8.5 8.5-5-5L2 17M16 7h6v6" />
        </symbol>
        <symbol id="i-chart" viewBox="0 0 24 24">
          <path d="M3 3v18h18M7 16v-5M12 16V8M17 16v-3" />
        </symbol>
        <symbol id="i-users" viewBox="0 0 24 24">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
        </symbol>
        <symbol id="i-cap" viewBox="0 0 24 24">
          <path d="M22 10 12 5 2 10l10 5 10-5Z" />
          <path d="M6 12v5c3 2.5 9 2.5 12 0v-5M22 10v6" />
        </symbol>
        <symbol id="i-award" viewBox="0 0 24 24">
          <circle cx="12" cy="8" r="6" />
          <path d="M15.5 12.9 17 22l-5-3-5 3 1.5-9.1" />
        </symbol>
        <symbol id="i-pin" viewBox="0 0 24 24">
          <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
          <circle cx="12" cy="10" r="3" />
        </symbol>
        <symbol id="i-send" viewBox="0 0 24 24">
          <path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7Z" />
        </symbol>
        <symbol id="i-file" viewBox="0 0 24 24">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
          <path d="M14 2v6h6M9 13h6M9 17h6" />
        </symbol>
        <symbol id="i-download" viewBox="0 0 24 24">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
        </symbol>
        <symbol id="i-target" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="9" />
          <circle cx="12" cy="12" r="5" />
          <circle cx="12" cy="12" r="1.4" />
        </symbol>
        <symbol id="i-compass" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" />
          <path d="m16.2 7.8-2.9 6.4-6.4 2.9 2.9-6.4 6.4-2.9Z" />
        </symbol>
        <symbol id="i-medal" viewBox="0 0 24 24">
          <path d="M7.2 3h9.6l-3 6.6M7.2 3l3 6.6M4.5 3h3l3.2 7" />
          <circle cx="12" cy="15" r="6" />
          <path d="m12 12.6.9 1.9 2.1.3-1.5 1.5.4 2.1-1.9-1-1.9 1 .4-2.1-1.5-1.5 2.1-.3.9-1.9Z" />
        </symbol>
        <symbol id="i-linkedin" viewBox="0 0 24 24">
          <path d="M4.98 3.5A2.5 2.5 0 0 0 2.5 6 2.5 2.5 0 0 0 5 8.5 2.5 2.5 0 0 0 7.5 6 2.5 2.5 0 0 0 4.98 3.5zM3 9h4v12H3zM9 9h3.8v1.7h.1c.5-1 1.8-2 3.7-2 4 0 4.7 2.6 4.7 6V21h-4v-5.3c0-1.3 0-2.9-1.8-2.9s-2 1.4-2 2.8V21H9z" />
        </symbol>
        <symbol id="i-facebook" viewBox="0 0 24 24">
          <path d="M13 22v-9h3l1-4h-4V7c0-1.1.3-2 2-2h2V1.4C18.3 1.3 17 1 15.6 1 12.7 1 11 2.7 11 5.7V9H7v4h4v9h2z" />
        </symbol>
        <symbol id="i-instagram" viewBox="0 0 24 24">
          <path d="M12 2c2.7 0 3 0 4.1.1 1 0 1.7.2 2.3.5.6.2 1.1.5 1.6 1s.8 1 1 1.6c.3.6.5 1.3.5 2.3C22 8.7 22 9 22 12s0 3.3-.1 4.4c0 1-.2 1.7-.5 2.3-.2.6-.5 1.1-1 1.6s-1 .8-1.6 1c-.6.3-1.3.5-2.3.5C15 22 14.7 22 12 22s-3 0-4.1-.1c-1 0-1.7-.2-2.3-.5-.6-.2-1.1-.5-1.6-1s-.8-1-1-1.6c-.3-.6-.5-1.3-.5-2.3C2 15.3 2 15 2 12s0-3.3.1-4.4c0-1 .2-1.7.5-2.3.2-.6.5-1.1 1-1.6s1-.8 1.6-1c.6-.3 1.3-.5 2.3-.5C9 2 9.3 2 12 2zm0 5a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm0 8.2a3.2 3.2 0 1 1 0-6.4 3.2 3.2 0 0 1 0 6.4zM17.8 7a1.2 1.2 0 1 0 0-2.4 1.2 1.2 0 0 0 0 2.4z" />
        </symbol>
        <symbol id="i-whatsapp" viewBox="0 0 24 24">
          <g transform="translate(1.7 1.7) scale(.858)">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
          </g>
        </symbol>
      </defs>
    </svg>
  );
}
