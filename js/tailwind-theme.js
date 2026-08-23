/* Tailwind Play CDN theme.
   Must load AFTER https://cdn.tailwindcss.com — the CDN reads this and
   rebuilds its stylesheet when the config changes. */

tailwind.config = {
  theme: {
    extend: {
      colors: {
        /* 900 is the signature band blue; 800 is the deeper tone the hero
           sits on, so it reads darker than 900 rather than lighter. */
        forest: {
          900: "#0052A4",
          800: "#003D7A",
          700: "#0B67AF",
          600: "#60AAFF",
        },
        /* DEFAULT = fills & plates, light = text on dark, dark = text on light */
        lime: { DEFAULT: "#0748C5", light: "#60AAFF", dark: "#0748C5" },
        mint: "#E1EAFF",
        paper: "#F2F6FA",
        line: "#C6D7E8",
        haze: "#C6D7E8",
        ink: "#0A0A0A",
      },
      fontFamily: {
        display: ['"DM Sans"', "system-ui", "sans-serif"],
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
      },
      borderRadius: { card: "8px", panel: "24px" },
      boxShadow: {
        card: "0 4px 13.9px 0 rgba(0,0,0,0.05)",
        lift: "0 14px 34px -12px rgba(0, 61, 122,0.16)",
      },
      maxWidth: { edge: "1260px" },
    },
  },
};
